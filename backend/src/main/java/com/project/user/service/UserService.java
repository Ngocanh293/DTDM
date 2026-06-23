package com.project.user.service;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.user.dto.AdminUserResponse;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.entity.UserProfile;
import com.project.user.repository.UserProfileRepository;
import com.project.user.entity.UserAuditLog;
import com.project.user.entity.UserAction;
import com.project.user.repository.UserAuditLogRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

@Service
public class UserService {

    private static final String AUDIT_PROFILE_UPDATED = "Profile updated for: ";
    private static final String AUDIT_PASSWORD_OTP_SENT = "Password change OTP requested";
    private static final String AUDIT_PASSWORD_CHANGED = "Password changed successfully";
    private static final String AUDIT_AVATAR_UPDATED = "Avatar updated: ";
    private static final String AUDIT_DEACTIVATED = "User self-deactivated";
    private static final String AUDIT_EMAIL_CHANGE_REQUESTED = "Email change requested to: ";
    private static final String AUDIT_EMAIL_CHANGED = "Email changed from: ";
    private static final String ERROR_SELF_DELETE = "error.admin.denied_self_delete";

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserAuditLogRepository auditLogRepository;
    private final com.project.user.repository.EmailChangeTokenRepository emailChangeTokenRepository;
    private final com.project.user.repository.PasswordChangeTokenRepository passwordChangeTokenRepository;
    private final com.project.notification.service.NotificationService notificationService;
    private final com.project.common.service.FileStorageService fileStorageService;
    private final com.project.auth.repository.RefreshTokenRepository refreshTokenRepository;
    private final com.project.auth.repository.LoginLogRepository loginLogRepository;

    @PersistenceContext
    private EntityManager entityManager;

    public UserService(UserRepository userRepository,
                       UserProfileRepository userProfileRepository,
                       PasswordEncoder passwordEncoder,
                       UserAuditLogRepository auditLogRepository,
                       com.project.user.repository.EmailChangeTokenRepository emailChangeTokenRepository,
                       com.project.user.repository.PasswordChangeTokenRepository passwordChangeTokenRepository,
                       com.project.notification.service.NotificationService notificationService,
                       com.project.common.service.FileStorageService fileStorageService,
                       com.project.auth.repository.RefreshTokenRepository refreshTokenRepository,
                       com.project.auth.repository.LoginLogRepository loginLogRepository) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogRepository = auditLogRepository;
        this.emailChangeTokenRepository = emailChangeTokenRepository;
        this.passwordChangeTokenRepository = passwordChangeTokenRepository;
        this.notificationService = notificationService;
        this.fileStorageService = fileStorageService;
        this.refreshTokenRepository = refreshTokenRepository;
        this.loginLogRepository = loginLogRepository;
    }

    // --- User Self-Management ---

    public UserProfileResponse getProfile(User user) {
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> {
                    // Check if a soft-deleted profile exists to prevent Unique Constraint violation
                    return userProfileRepository.findByUserIdIncludingDeleted(user.getId())
                            .map(deletedProfile -> {
                                deletedProfile.setDeleted(false);
                                return userProfileRepository.save(deletedProfile);
                            })
                            .orElseGet(() -> {
                                UserProfile newProfile = new UserProfile(user, null, null, null);
                                return userProfileRepository.save(newProfile);
                            });
                });
        
        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName() != null ? profile.getFullName() : user.getFullName(),
                profile.getPhone() != null ? profile.getPhone() : user.getPhone(),
                formatAvatarUrl(profile.getAvatarUrl())
        );
    }

    public UserProfileResponse updateProfile(User user, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findByUser(user)
                .orElseGet(() -> new UserProfile(user, null, null, null));
        
        profile.setFullName(request.getFullName());
        profile.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) {
            profile.setAvatarUrl(request.getAvatarUrl());
        }

        userProfileRepository.save(profile);
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, AUDIT_PROFILE_UPDATED + user.getEmail(), null));

        return new UserProfileResponse(
                profile.getId(),
                user.getEmail(),
                profile.getFullName(),
                profile.getPhone(),
                formatAvatarUrl(profile.getAvatarUrl())
        );
    }

    /**
     * Bước 1: Xác thực mật khẩu cũ, tạo OTP và gửi qua email.
     * Mật khẩu chưa được thay đổi cho đến khi xác nhận OTP ở bước 2.
     */
    @Transactional
    public void changePassword(User user, com.project.user.dto.ChangePasswordRequest request) {
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.old_password_incorrect");
        }
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("error.user.new_password_same");
        }

        // Xóa token cũ nếu đang tồn tại (tránh rác DB)
        passwordChangeTokenRepository.deleteByUser(user);

        // Tạo OTP 6 chữ số
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        String encodedNewPassword = passwordEncoder.encode(request.getNewPassword());

        com.project.user.entity.PasswordChangeToken token = new com.project.user.entity.PasswordChangeToken(
            user, encodedNewPassword, otp, java.time.LocalDateTime.now().plusMinutes(10)
        );
        passwordChangeTokenRepository.save(token);

        // Gửi OTP qua email
        notificationService.sendPasswordChangeOtp(user, otp, org.springframework.context.i18n.LocaleContextHolder.getLocale());
        auditLogRepository.save(new UserAuditLog(user, UserAction.CHANGE_PASSWORD, AUDIT_PASSWORD_OTP_SENT, null));
    }

    /**
     * Bước 2: Xác nhận OTP, áp dụng mật khẩu mới vào tài khoản.
     */
    @Transactional
    public void confirmPasswordChange(User user, String otpCode) {
        com.project.user.entity.PasswordChangeToken token = passwordChangeTokenRepository
            .findByUserAndOtpCode(user, otpCode)
            .orElseThrow(() -> new IllegalArgumentException("error.user.otp_invalid"));

        if (token.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            passwordChangeTokenRepository.delete(token);
            throw new IllegalArgumentException("error.user.otp_expired");
        }

        // Áp dụng mật khẩu mới
        user.setPassword(token.getEncodedNewPassword());
        userRepository.save(user);
        passwordChangeTokenRepository.delete(token);
        auditLogRepository.save(new UserAuditLog(user, UserAction.CHANGE_PASSWORD, AUDIT_PASSWORD_CHANGED, null));
    }

    @Transactional
    public void deactivateAccount(User user) {
        user.setDeleted(true);
        userRepository.save(user);
        auditLogRepository.save(new UserAuditLog(user, UserAction.ACCOUNT_DEACTIVATED, AUDIT_DEACTIVATED, null));
    }

    // --- User Session & Login History ---

    /**
     * Trả danh sách các session đang hoạt động (Refresh Token).
     * Mỗi session tương ứng 1 thiết bị đã đăng nhập.
     */
    @Transactional(readOnly = true)
    public java.util.List<com.project.user.dto.SessionResponse> getActiveSessions(User user) {
        return refreshTokenRepository.findAllByUser(user).stream()
            .map(rt -> new com.project.user.dto.SessionResponse(rt.getId(), rt.getUser().getCreatedAt(), rt.getExpiryDate()))
            .toList();
    }

    /**
     * Thu hồi toàn bộ session (buộc đăng xuất khỏi tất cả thiết bị).
     */
    @Transactional
    public void revokeAllSessions(User user) {
        refreshTokenRepository.deleteByUser(user);
        auditLogRepository.save(new UserAuditLog(user, UserAction.ACCOUNT_DEACTIVATED, "All sessions revoked", null));
    }

    /**
     * Trả lịch sử đăng nhập gần nhất của user (tối đa 50 bản ghi).
     */
    @Transactional(readOnly = true)
    public java.util.List<com.project.user.dto.LoginLogResponse> getLoginHistory(User user) {
        return loginLogRepository.findByEmailOrderByCreatedAtDesc(user.getEmail()).stream()
            .limit(50)
            .map(log -> new com.project.user.dto.LoginLogResponse(
                log.getId(), log.getIpAddress(), log.getStatus(), log.getReason(), log.getCreatedAt()))
            .toList();
    }

    // --- Admin Management ---

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAllIncludingDeleted(pageable).map(this::mapToAdminResponse);
    }

    @Transactional(readOnly = true)
    public Page<AdminUserResponse> searchUsers(String keyword, Pageable pageable) {
        return userRepository.searchUsersIncludingDeleted(keyword, pageable).map(this::mapToAdminResponse);
    }

    @Transactional
    public void updateUserRole(Long userId, UserRole role) {
        User user = userRepository.findByIdIncludingDeleted(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        user.setRole(role);
        userRepository.save(user);
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findByIdIncludingDeleted(userId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));
        user.setStatus(status);
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.ADMIN) && !currentUser.getId().equals(targetUserId)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_delete");
        }

        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(true);
        userRepository.save(targetUser);
    }

    @Transactional
    public void hardDeleteUser(User currentUser, Long targetUserId) {
        if (!currentUser.getRole().equals(UserRole.ADMIN)) {
            throw new org.springframework.security.access.AccessDeniedException("error.user.denied_delete");
        }
        if (currentUser.getId().equals(targetUserId)) {
            throw new IllegalArgumentException(ERROR_SELF_DELETE);
        }
        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        Long uId = targetUser.getId();

        // 1. Xóa LoginLog theo email (không có FK → phải xóa thủ công)
        entityManager.createQuery("DELETE FROM LoginLog l WHERE l.email = :email")
            .setParameter("email", targetUser.getEmail()).executeUpdate();

        // 2. Xóa Orders (cascade xóa OrderItem, Shipping, Payment qua JPA orphanRemoval)
        java.util.List<?> orders = entityManager.createQuery("SELECT o FROM Order o WHERE o.userId = :uid")
            .setParameter("uid", uId).getResultList();
        for (Object o : orders) {
            entityManager.remove(o);
        }
        entityManager.flush();

        // 3. Xóa UserProfile tham chiếu (không có @OnDelete CASCADE vì dùng soft-delete)
        userProfileRepository.findByUser(targetUser).ifPresent(userProfileRepository::delete);

        // 4. Xóa các bản ghi phụ thuộc (do DB schema có thể thiếu ON DELETE CASCADE trên foreign key)
        String[] dependentTables = {
            "refresh_tokens", "addresses", "email_verification_tokens", "password_reset_tokens",
            "email_change_tokens", "user_audit_logs", "password_change_tokens",
            "notifications", "notification_preferences", "cart_items", "reviews"
        };
        for (String table : dependentTables) {
            try {
                entityManager.createNativeQuery("DELETE FROM " + table + " WHERE user_id = :id")
                    .setParameter("id", uId)
                    .executeUpdate();
            } catch (Exception e) {
                // Bỏ qua nếu bảng không tồn tại hoặc lỗi (ví dụ thiếu cột user_id)
            }
        }

        // 5. Cuối cùng xóa User
        entityManager.createNativeQuery("DELETE FROM users WHERE id = :id")
            .setParameter("id", uId)
            .executeUpdate();
    }

    @Transactional
    public void restoreUser(Long targetUserId) {
        User targetUser = userRepository.findByIdIncludingDeleted(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("error.auth.user_not_found"));

        targetUser.setDeleted(false);
        userRepository.save(targetUser);
    }

    private AdminUserResponse mapToAdminResponse(User user) {
        return AdminUserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .isDeleted(user.isDeleted())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // --- Email Identity Flow ---

    @Transactional
    public void requestEmailChange(User user, String newEmail) {
        if (userRepository.existsByEmail(newEmail)) {
            throw new IllegalArgumentException("error.auth.email_used");
        }
        emailChangeTokenRepository.deleteByUser(user);
        String token2 = java.util.UUID.randomUUID().toString();
        com.project.user.entity.EmailChangeToken emailToken = new com.project.user.entity.EmailChangeToken(
            user, newEmail, token2, java.time.LocalDateTime.now().plusHours(24)
        );
        emailChangeTokenRepository.save(emailToken);
        notificationService.sendEmailChangeVerification(user, newEmail, token2, org.springframework.context.i18n.LocaleContextHolder.getLocale());
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, AUDIT_EMAIL_CHANGE_REQUESTED + newEmail, null));
    }

    @Transactional
    public void confirmEmailChange(String token) {
        com.project.user.entity.EmailChangeToken emailToken = emailChangeTokenRepository.findByToken(token)
            .orElseThrow(() -> new IllegalArgumentException("error.auth.token_not_found"));
        if (emailToken.getExpiryDate().isBefore(java.time.LocalDateTime.now())) {
            emailChangeTokenRepository.delete(emailToken);
            throw new IllegalArgumentException("error.auth.token_expired");
        }
        User user = emailToken.getUser();
        String oldEmail = user.getEmail();
        user.setEmail(emailToken.getNewEmail());
        userRepository.save(user);
        emailChangeTokenRepository.delete(emailToken);
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, AUDIT_EMAIL_CHANGED + oldEmail + " -> " + user.getEmail(), null));
    }

    @Transactional
    public String updateAvatar(User user, org.springframework.web.multipart.MultipartFile file) {
        UserProfile profile = userProfileRepository.findByUser(user)
            .orElseGet(() -> new UserProfile(user, null, null, null));
        if (profile.getAvatarUrl() != null && !profile.getAvatarUrl().startsWith("http")) {
            fileStorageService.deleteAvatar(profile.getAvatarUrl());
        }
        String fileName = fileStorageService.storeAvatar(file);
        profile.setAvatarUrl(fileName);
        userProfileRepository.save(profile);
        auditLogRepository.save(new UserAuditLog(user, UserAction.UPDATE_PROFILE, AUDIT_AVATAR_UPDATED + fileName, null));
        return fileName;
    }

    private String formatAvatarUrl(String avatar) {
        if (avatar == null || avatar.isEmpty()) return null;
        if (avatar.startsWith("http")) return avatar;
        if (avatar.startsWith("/uploads/avatars/")) return avatar;
        return "/uploads/avatars/" + avatar;
    }
}
