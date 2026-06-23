package com.project.auth.service;

import com.project.auth.dto.RegisterRequest;
import com.project.auth.entity.EmailVerificationToken;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.EmailVerificationTokenRepository;
import com.project.auth.repository.UserRepository;
import com.project.notification.service.NotificationService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserRegistrationService {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(UserRegistrationService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailVerificationTokenRepository emailTokenRepository;
    private final NotificationService notificationService;
    private final com.project.common.service.SystemAlertService alertService;

    public UserRegistrationService(UserRepository userRepository, 
                                   PasswordEncoder passwordEncoder, 
                                   EmailVerificationTokenRepository emailTokenRepository, 
                                   NotificationService notificationService,
                                   com.project.common.service.SystemAlertService alertService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailTokenRepository = emailTokenRepository;
        this.notificationService = notificationService;
        this.alertService = alertService;
    }

    @Retryable(retryFor = {SQLException.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("error.auth.email_used");
        }

        User user = new User(
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                UserRole.CUSTOMER,
                UserStatus.INACTIVE
        );
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        userRepository.save(user);

        // Tạo mã xác thực Email
        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        // Ghi nhận và Gửi thư
        try {
            notificationService.sendVerification(user, token, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            // Fallback ngay lập tức nếu notificationService ném lỗi đồng bộ (hiếm gặp vì gửi mail là Async)
            alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.WARNING, 
                "Đăng ký thành công nhưng gửi mail xác nhận thất bại (Đồng bộ): " + user.getEmail(), e);
        }
    }

    /**
     * Fallback cho phương thức register khi Retry thất bại 3 lần.
     */
    @org.springframework.retry.annotation.Recover
    public void recoverRegister(Exception e, RegisterRequest request) {
        alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.ERROR, 
            "Lỗi nghiêm trọng khi Đăng ký người dùng (Retry Exhausted): " + request.getEmail(), e);
        // Lưu ý: Không ném lại exception để tránh Rollback User đã được lưu (nếu đã lưu thành công trước đó)
    }

    @Transactional
    public void verifyEmail(String token) {
        // 1. Tìm token
        EmailVerificationToken verificationToken = emailTokenRepository.findByToken(token)
                .orElseThrow(() -> {
                    // Log cảnh báo để debug nếu cần
                    return new IllegalArgumentException("error.auth.token_not_found");
                });

        // 2. Kiểm tra hết hạn
        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            emailTokenRepository.delete(verificationToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }

        // 3. Nạp lại User bằng ID để lấy version mới nhất
        User user = userRepository.findById(verificationToken.getUser().getId())
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        
        // 4. Nếu đã ACTIVE (Idempotency), xoá token và kết thúc thành công
        if (user.getStatus() == UserStatus.ACTIVE) {
            emailTokenRepository.delete(verificationToken);
            return;
        }

        // 5. Cập nhật bằng Modifying Query để TRÁNH ném ngoại lệ OptimisticLockingFailure
        // query trả về 1 nếu thành công, 0 nếu version không khớp (đã bị luồng khác update)
        int rowsUpdated = userRepository.updateStatusByIdAndVersion(user.getId(), UserStatus.ACTIVE, user.getVersion());
        
        if (rowsUpdated > 0) {
            logger.info("Xác thực Email thành công (Query): {}", user.getEmail());
        } else {
            // Kiểm tra lại nếu bản ghi hiện tại đã là ACTIVE chưa
            User currentUser = userRepository.findById(user.getId()).orElse(null);
            if (currentUser != null && currentUser.getStatus() == UserStatus.ACTIVE) {
                logger.info("Xác thực Email (Concurrent-success): {}", user.getEmail());
            } else {
                // [FIX] Dùng i18n key thay vì chuỗi hardcode tiếng Việt
                throw new IllegalStateException("error.auth.concurrent_update");
            }
        }


        // 6. Xoá token sau khi xác thực thành công (Sử dụng Modifying Query cho an toàn tuyệt đối)
        emailTokenRepository.deleteByToken(token);
        logger.info("Xác thực Email và xoá Token thành công: {}", user.getEmail());
    }

    /**
     * [FIX] Thêm @Retryable để @Recover phía dưới thực sự được gọi khi retry cạn kiệt.
     */
    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    @Transactional
    public void resendVerificationEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        if (user.getStatus() == UserStatus.ACTIVE) {
            throw new IllegalArgumentException("error.auth.account_active");
        }

        emailTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        EmailVerificationToken verificationToken = new EmailVerificationToken(user, token, LocalDateTime.now().plusHours(24));
        emailTokenRepository.save(verificationToken);

        try {
            notificationService.sendVerification(user, token, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.WARNING, 
                "Gửi lại mail xác nhận thất bại: " + user.getEmail(), e);
        }
    }

    @org.springframework.retry.annotation.Recover
    public void recoverResend(Exception e, String email) {
        alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.ERROR, 
            "Cạn kiệt lần thử lại khi gửi lại mail xác nhận: " + email, e);
    }

    @Transactional
    public void deleteAccount(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        
        // Thực hiện soft-delete (nhờ @SQLDelete đã thêm vào User entity)
        userRepository.delete(user);
    }
}
