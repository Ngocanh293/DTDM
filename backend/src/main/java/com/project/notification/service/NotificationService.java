package com.project.notification.service;

import com.project.auth.entity.User;
import com.project.notification.dto.NotificationResponse;
import com.project.notification.entity.Notification;
import com.project.notification.entity.NotificationStatus;
import com.project.notification.entity.NotificationType;
import com.project.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.context.MessageSource;
import com.project.notification.repository.NotificationPreferenceRepository;
import com.project.auth.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class NotificationService {

    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final NotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final MessageSource messageSource;

    public NotificationService(NotificationRepository notificationRepository, 
                               NotificationPreferenceRepository preferenceRepository,
                               UserRepository userRepository,
                               EmailService emailService,
                               MessageSource messageSource) {
        this.notificationRepository = notificationRepository;
        this.preferenceRepository = preferenceRepository;
        this.userRepository = userRepository;
        this.emailService = emailService;
        this.messageSource = messageSource;
    }

    public List<NotificationResponse> getUserNotifications(User user) {
        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(n -> new NotificationResponse(n.getId(), n.getType(), n.getContent(), n.getStatus(), n.isRead(), n.getCreatedAt()))
                .toList();
    }

    @Transactional
    public void sendVerification(User user, String token, Locale locale) {
        sendIfEnabled(user, NotificationType.EMAIL_VERIFICATION, () -> {
            String content = messageSource.getMessage("notification.verification.content", null, locale);
            Notification notif = new Notification(user, NotificationType.EMAIL_VERIFICATION, content);
            notif = notificationRepository.save(notif);
            emailService.sendVerificationEmail(user.getEmail(), token, locale, notif.getId());
        });
    }

    @Transactional
    public void sendEmailChangeVerification(User user, String newEmail, String token, Locale locale) {
        sendIfEnabled(user, NotificationType.EMAIL_CHANGE, () -> {
            String content = messageSource.getMessage("notification.email_change.content", new Object[]{newEmail}, locale);
            Notification notif = new Notification(user, NotificationType.EMAIL_CHANGE, content);
            notif = notificationRepository.save(notif);
            emailService.sendEmailChangeEmail(newEmail, token, locale, notif.getId());
        });
    }

    @Transactional
    public void sendPasswordReset(User user, String token, Locale locale) {
        sendIfEnabled(user, NotificationType.PASSWORD_RESET, () -> {
            String content = messageSource.getMessage("notification.pwd_reset.content", null, locale);
            Notification notif = new Notification(user, NotificationType.PASSWORD_RESET, content);
            notif = notificationRepository.save(notif);
            emailService.sendPasswordResetEmail(user.getEmail(), token, locale, notif.getId());
        });
    }

    @Transactional
    public void sendPasswordChangeOtp(User user, String otpCode, Locale locale) {
        sendIfEnabled(user, NotificationType.PASSWORD_RESET, () -> {
            String content = messageSource.getMessage("notification.pwd_change_otp.content", null, locale);
            Notification notif = new Notification(user, NotificationType.PASSWORD_RESET, content);
            notif = notificationRepository.save(notif);
            emailService.sendPasswordChangeOtpEmail(user.getEmail(), otpCode, locale, notif.getId());
        });
    }

    @Transactional
    public void sendOrderConfirmation(User user, String orderId, String totalAmount, Locale locale) {
        sendIfEnabled(user, NotificationType.ORDER_CONFIRMATION, () -> {
            String content = messageSource.getMessage("notification.order_confirm.content", new Object[]{orderId}, locale);
            Notification notif = new Notification(user, NotificationType.ORDER_CONFIRMATION, content);
            notif = notificationRepository.save(notif);
            String username = user.getFullName() != null ? user.getFullName() : user.getEmail();
            emailService.sendOrderConfirmationEmail(user.getEmail(), username, orderId, totalAmount, locale, notif.getId());
        });
    }

    @Transactional
    public void sendOrderStatusUpdate(User user, String orderId, String status, Locale locale) {
        sendIfEnabled(user, NotificationType.ORDER_STATUS_UPDATE, () -> {
            String content = messageSource.getMessage("notification.order_status.content", new Object[]{orderId, status}, locale);
            Notification notif = new Notification(user, NotificationType.ORDER_STATUS_UPDATE, content);
            notif = notificationRepository.save(notif);
            String username = user.getFullName() != null ? user.getFullName() : user.getEmail();
            emailService.sendOrderStatusUpdateEmail(user.getEmail(), username, orderId, status, locale, notif.getId());
        });
    }

    private void sendIfEnabled(User user, NotificationType type, Runnable sendAction) {
        boolean isEnabled = preferenceRepository.findByUserAndType(user, type)
                .map(com.project.notification.entity.NotificationPreference::isEnabled)
                .orElse(true); // Mặc định là bật nếu chưa cấu hình

        if (isEnabled) {
            sendAction.run();
        } else {
            logger.info("[NOTIFICATION] Bỏ qua gửi thông báo loại {} cho User: {} (Tùy chọn: Disabled)", type, user.getEmail());
        }
    }

    @Transactional
    public void updatePreference(User user, com.project.notification.dto.NotificationPreferenceRequest request) {
        com.project.notification.entity.NotificationPreference pref = preferenceRepository.findByUserAndType(user, request.getType())
                .orElse(new com.project.notification.entity.NotificationPreference(user, request.getType(), true));
        
        pref.setEnabled(request.isEnabled());
        preferenceRepository.save(pref);
    }

    @Transactional
    public void updatePreferencesBulk(User user, java.util.Map<String, Boolean> prefs) {
        prefs.forEach((key, value) -> {
            NotificationType type = null;
            if ("orderUpdatesEmail".equals(key)) type = NotificationType.ORDER_CONFIRMATION;
            else if ("orderUpdatesWeb".equals(key)) type = NotificationType.ORDER_STATUS_UPDATE;
            else if ("promotionsEmail".equals(key)) type = NotificationType.PROMOTIONS;
            else if ("securityAlertsEmail".equals(key)) type = NotificationType.SYSTEM_ALERT;
                
            if (type != null) {
                com.project.notification.entity.NotificationPreference pref = preferenceRepository.findByUserAndType(user, type)
                        .orElse(new com.project.notification.entity.NotificationPreference(user, type, true));
                pref.setEnabled(value);
                preferenceRepository.save(pref);
            }
        });
    }

    public java.util.List<com.project.notification.entity.NotificationPreference> getPreferences(User user) {
        return preferenceRepository.findByUser(user);
    }

    @Transactional
    public void sendNotificationToAdmins(String subject, String content) {
        java.util.List<User> admins = userRepository.findByRole(com.project.auth.entity.UserRole.ADMIN);
        
        for (User admin : admins) {
            sendIfEnabled(admin, NotificationType.SYSTEM_ALERT, () -> {
                Notification notif = new Notification(admin, NotificationType.SYSTEM_ALERT, content);
                notif = notificationRepository.save(notif);
                emailService.sendRawEmailSync(admin.getEmail(), subject, content);
                notif.setStatus(com.project.notification.entity.NotificationStatus.SENT);
                notif.setSentAt(LocalDateTime.now());
                notificationRepository.save(notif);
            });
        }
    }

    @Transactional
    public void broadcast(String subject, String content, NotificationType type) {
        // Lấy tất cả User đang hoạt động
        java.util.List<User> activeUsers = userRepository.findAll();
        
        for (User user : activeUsers) {
            sendIfEnabled(user, type, () -> {
                Notification notif = new Notification(user, type, content);
                notif = notificationRepository.save(notif);
                emailService.sendRawEmailSync(user.getEmail(), subject, content); // Sync for bulk? or Async?? Let's use Sync or custom batch
                notif.setStatus(com.project.notification.entity.NotificationStatus.SENT);
                notif.setSentAt(LocalDateTime.now());
                notificationRepository.save(notif);
            });
        }
    }

    @Transactional
    public void markAsSent(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setStatus(NotificationStatus.SENT);
            n.setSentAt(LocalDateTime.now());
            notificationRepository.save(n);
            logger.info("[NOTIFICATION] Mail gửi thành công ID: {}", notifId);
        });
    }

    @Transactional
    public void markAsFailed(Long notifId) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            n.setStatus(NotificationStatus.FAILED);
            notificationRepository.save(n);
            logger.error("[NOTIFICATION] Mail gửi THẤT BẠI ID: {}", notifId);
        });
    }

    @Transactional
    public void markAsRead(Long notifId, User user) {
        notificationRepository.findById(notifId).ifPresent(n -> {
            if (n.getUser().getId().equals(user.getId())) {
                n.setRead(true);
                notificationRepository.save(n);
                logger.info("[NOTIFICATION] Đã đánh dấu ĐÃ ĐỌC cho ID: {}", notifId);
            }
        });
    }

    @Transactional
    public void markAllAsRead(User user) {
        List<Notification> unread = notificationRepository.findByUserAndIsRead(user, false);
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
        logger.info("[NOTIFICATION] Đã đánh dấu TOÀN BỘ ĐÃ ĐỌC cho User: {}", user.getEmail());
    }

    // Auto-Cleaning Housekeeping
    @Scheduled(cron = "0 0 3 * * SUN") // Chạy vào 3:00 AM Chủ Nhật hàng tuần
    @Transactional
    public void cleanupOldNotifications() {
        LocalDateTime sixMonthsAgo = LocalDateTime.now().minusMonths(6);
        long deletedCount = notificationRepository.deleteByCreatedAtBefore(sixMonthsAgo);
        if (deletedCount > 0) {
            logger.warn("[HOUSEKEEPING] Đã dọn dẹp {} thông báo cũ hơn 6 tháng.", deletedCount);
        }
    }

    // Auto-Healing System Alert
    @Scheduled(cron = "0 0 2 * * ?") // Mỗi ngày 02:00 AM quyét những thư lag hỏng
    public void sweepFailedNotifications() {
        List<Notification> failedNotifs = notificationRepository.findByStatus(NotificationStatus.FAILED);
        if (failedNotifs.isEmpty()) {
            return;
        }
        logger.warn("[AUTO-HEALING] Phát hiện {} thư thất bại trong DB. Bắt đầu khôi phục...", failedNotifs.size());
        
        for (Notification n : failedNotifs) {
            try {
                String fallbackHtml = "<div style=\"font-family: Arial, sans-serif; padding: 20px;\"><h3 style=\"color: #e53935;\">Thông báo quan trọng / Important Notice</h3><p>" 
                        + n.getContent() 
                        + "</p><hr/><p style=\"font-size: 12px; color: #999;\">PCeStore Automated Fallback System</p></div>";
                emailService.sendRawEmailSync(n.getUser().getEmail(), "PCeStore Notification Fallback", fallbackHtml);
                
                n.setStatus(NotificationStatus.SENT);
                n.setSentAt(LocalDateTime.now());
                notificationRepository.save(n);
                logger.info("[AUTO-HEALING] Đã phục hồi và gửi thành công thư ID: {}", n.getId());
            } catch (Exception e) {
                logger.error("[AUTO-HEALING] Không thể khôi phục thư ID: {} - Lỗi: {}", n.getId(), e.getMessage());
            }
        }
    }
}
