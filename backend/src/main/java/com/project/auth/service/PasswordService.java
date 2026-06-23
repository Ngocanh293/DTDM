package com.project.auth.service;

import com.project.auth.entity.PasswordResetToken;
import com.project.auth.entity.User;
import com.project.auth.repository.PasswordResetTokenRepository;
import com.project.auth.repository.UserRepository;
import com.project.notification.service.NotificationService;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class PasswordService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final NotificationService notificationService;
    private final com.project.common.service.SystemAlertService alertService;
    private final TokenManagementService tokenManagementService;

    public PasswordService(UserRepository userRepository,
                           PasswordResetTokenRepository passwordResetTokenRepository,
                           NotificationService notificationService,
                           PasswordEncoder passwordEncoder,
                           com.project.common.service.SystemAlertService alertService,
                           TokenManagementService tokenManagementService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.notificationService = notificationService;
        this.passwordEncoder = passwordEncoder;
        this.alertService = alertService;
        this.tokenManagementService = tokenManagementService;
    }

    @Transactional
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        passwordResetTokenRepository.deleteByUser(user);

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = new PasswordResetToken(user, token, LocalDateTime.now().plusMinutes(15));
        passwordResetTokenRepository.save(resetToken);

        try {
            notificationService.sendPasswordReset(user, token, LocaleContextHolder.getLocale());
        } catch (Exception e) {
            alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.WARNING, 
                "Tạo token reset mật khẩu thành công nhưng gửi mail thất bại: " + user.getEmail(), e);
        }
    }

    @org.springframework.retry.annotation.Recover
    public void recoverForgot(Exception e, String email) {
        alertService.createAlert("AUTH", com.project.common.entity.SystemLogSeverity.ERROR, 
            "Lỗi nghiêm trọng khi Quên mật khẩu (Retry Exhausted): " + email, e);
    }

    @Transactional
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(token)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.reset_token_invalid"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }

        User user = resetToken.getUser();

        // [FIX] Kiểm tra mật khẩu mới không được trùng mật khẩu hiện tại
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("error.user.new_password_same");
        }

        user.setPassword(passwordEncoder.encode(newPassword));

        // Tăng tokenVersion — JWT cũ sẽ bị từ chối tại JwtAuthenticationFilter
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);

        // Xoá toàn bộ Refresh Token hiện tại — buộc đăng nhập lại tất cả thiết bị
        tokenManagementService.deleteRefreshTokensForUser(user.getId());

        passwordResetTokenRepository.delete(resetToken);
    }
}
