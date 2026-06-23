package com.project.notification.service;

import org.springframework.beans.factory.annotation.Value;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.MailException;
import org.springframework.stereotype.Service;
import org.springframework.context.MessageSource;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.retry.annotation.Retryable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.context.annotation.Lazy;
import org.springframework.retry.annotation.Recover;
import com.project.notification.exception.NotificationException;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private static final String LOG_TAG_NOTIFICATION = "NOTIFICATION";
    private static final String PLACEHOLDER_LINK = "{{link}}";
    private static final String PLACEHOLDER_ORDER_ID = "{{orderId}}";
    private static final String PLACEHOLDER_TOKEN = "{{token}}";
    private static final String PLACEHOLDER_USERNAME = "{{username}}";

    private final JavaMailSender mailSender;

    @Value("${custom.mail.from:noreply@pcestore.com}")
    private String fromEmail;

    @Value("${custom.frontend.url:https://pc-e-store.vercel.app}")
    private String frontendUrl;

    private final MessageSource messageSource;
    private final NotificationService notificationService;
    private final com.project.common.service.SystemAlertService alertService;
    private final com.project.notification.repository.EmailTemplateRepository templateRepository;

    public EmailService(JavaMailSender mailSender, MessageSource messageSource, @Lazy NotificationService notificationService, com.project.common.service.SystemAlertService alertService, com.project.notification.repository.EmailTemplateRepository templateRepository) {
        this.mailSender = mailSender;
        this.messageSource = messageSource;
        this.notificationService = notificationService;
        this.alertService = alertService;
        this.templateRepository = templateRepository;
    }

    private EmailService self;

    @org.springframework.beans.factory.annotation.Autowired
    public void setSelf(@Lazy EmailService self) {
        this.self = self;
    }

    @org.springframework.cache.annotation.Cacheable(value = "emailTemplates", key = "#type + '-' + #locale")
    public com.project.notification.entity.EmailTemplate getTemplate(com.project.notification.entity.NotificationType type, String locale) {
        return templateRepository.findByTypeAndLocale(type, locale)
                .orElseGet(() -> templateRepository.findByTypeAndLocale(type, "en")
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mẫu Email cho loại: " + type)));
    }

    public java.util.List<com.project.notification.entity.EmailTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    @org.springframework.transaction.annotation.Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "emailTemplates", allEntries = true)
    public void updateTemplate(com.project.notification.dto.EmailTemplateRequest request) {
        com.project.notification.entity.EmailTemplate template = templateRepository.findByTypeAndLocale(request.getType(), request.getLocale())
                .orElse(new com.project.notification.entity.EmailTemplate(request.getType(), request.getLocale(), request.getSubject(), request.getContent()));
        
        template.setSubject(request.getSubject());
        template.setContent(request.getContent());
        templateRepository.save(template);
        logger.info("[{}] Đã cập nhật mẫu Email: {} - {}", LOG_TAG_NOTIFICATION, request.getType(), request.getLocale());
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendVerificationEmail(String toEmail, String token, Locale locale, Long notifId) {
        try {
            com.project.notification.entity.EmailTemplate template = self.getTemplate(com.project.notification.entity.NotificationType.EMAIL_VERIFICATION, locale.getLanguage());
            String subject = template.getSubject();
            String link = frontendUrl + "/verify-email?token=" + token;
            String html = template.getContent()
                    .replace(PLACEHOLDER_LINK, link)
                    .replace(PLACEHOLDER_TOKEN, token);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_verify", new Object[]{notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverVerificationEmail(NotificationException e, String toEmail, String token, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_verify", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL, 
            "Gửi mail xác thực thất bại hoàn toàn sau 3 lần thử: " + toEmail, e);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendPasswordResetEmail(String toEmail, String token, Locale locale, Long notifId) {
        try {
            com.project.notification.entity.EmailTemplate template = self.getTemplate(com.project.notification.entity.NotificationType.PASSWORD_RESET, locale.getLanguage());
            String subject = template.getSubject();
            String link = frontendUrl + "/reset-password?token=" + token;
            String html = template.getContent()
                    .replace(PLACEHOLDER_LINK, link);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_pwd_reset", new Object[]{notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverPasswordResetEmail(NotificationException e, String toEmail, String token, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_pwd_reset", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL, 
            "Gửi mail reset mật khẩu thất bại hoàn toàn sau 3 lần thử: " + toEmail, e);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendOrderConfirmationEmail(String toEmail, String username, String orderId, String totalAmount, Locale locale, Long notifId) {
        try {
            com.project.notification.entity.EmailTemplate template = self.getTemplate(com.project.notification.entity.NotificationType.ORDER_CONFIRMATION, locale.getLanguage());
            String subject = template.getSubject().replace(PLACEHOLDER_ORDER_ID, orderId);
            String html = template.getContent()
                    .replace(PLACEHOLDER_USERNAME, username)
                    .replace(PLACEHOLDER_ORDER_ID, orderId)
                    .replace("{{totalAmount}}", totalAmount);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_order_confirm", new Object[]{orderId, notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverOrderConfirmationEmail(NotificationException e, String toEmail, String username, String orderId, String totalAmount, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_order_confirm", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL, 
            "Gửi mail xác nhận đơn hàng thất bại: " + orderId + " (Notif: " + notifId + ")", e);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendOrderStatusUpdateEmail(String toEmail, String username, String orderId, String orderStatus, Locale locale, Long notifId) {
        try {
            com.project.notification.entity.EmailTemplate template = self.getTemplate(com.project.notification.entity.NotificationType.ORDER_STATUS_UPDATE, locale.getLanguage());
            String subject = template.getSubject().replace(PLACEHOLDER_ORDER_ID, orderId);
            String html = template.getContent()
                    .replace(PLACEHOLDER_USERNAME, username)
                    .replace(PLACEHOLDER_ORDER_ID, orderId)
                    .replace("{{orderStatus}}", orderStatus);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = messageSource.getMessage("notification.error.send_order_status", new Object[]{orderId, notifId}, locale);
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverOrderStatusUpdateEmail(NotificationException e, String toEmail, String username, String orderId, String orderStatus, Locale locale, Long notifId) {
        String logMsg = messageSource.getMessage("notification.error.exhausted_order_status", new Object[]{notifId}, locale);
        logger.error(logMsg);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL, 
            "Gửi mail cập nhật trạng thái đơn hàng thất bại: " + orderId + " (Status: " + orderStatus + ")", e);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendEmailChangeEmail(String toEmail, String token, Locale locale, Long notifId) {
        try {
            com.project.notification.entity.EmailTemplate template = self.getTemplate(com.project.notification.entity.NotificationType.EMAIL_CHANGE, locale.getLanguage());
            String subject = template.getSubject();
            String link = frontendUrl + "/confirm-email-change?token=" + token;
            String html = template.getContent()
                    .replace(PLACEHOLDER_LINK, link)
                    .replace(PLACEHOLDER_TOKEN, token);

            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException | org.springframework.context.NoSuchMessageException e) {
            String msg = "Lỗi gửi mail xác nhận đổi Email (Notif: " + notifId + ")";
            throw new NotificationException(msg, e);
        }
    }

    @Recover
    public void recoverEmailChangeEmail(NotificationException e, String toEmail, String token, Locale locale, Long notifId) {
        logger.error("Cạn kiệt lần thử lại gửi mail xác nhận đổi Email tới: {}", toEmail);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL, 
            "Gửi mail xác nhận đổi Email thất bại hoàn toàn tới: " + toEmail, e);
    }

    @Async
    @Retryable(retryFor = {NotificationException.class}, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void sendPasswordChangeOtpEmail(String toEmail, String otpCode, Locale locale, Long notifId) {
        try {
            String subject = messageSource.getMessage("email.pwd_change_otp.subject", null, locale);
            String html = "<div style=\"font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 32px; border-radius: 8px; background: #f9f9f9;\">"
                    + "<h2 style=\"color: #e53935;\">🔐 Xác nhận đổi mật khẩu</h2>"
                    + "<p>Chúng tôi nhận được yêu cầu đổi mật khẩu từ tài khoản của bạn.</p>"
                    + "<p>Mã OTP xác nhận của bạn là:</p>"
                    + "<div style=\"font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #e53935; text-align: center; padding: 16px; background: #fff; border-radius: 8px; border: 2px dashed #e53935;\">"
                    + otpCode
                    + "</div>"
                    + "<p style=\"margin-top: 16px;\">Mã này có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email này.</p>"
                    + "<hr style=\"margin-top: 24px;\"/>"
                    + "<p style=\"font-size: 12px; color: #999;\">PCeStore - Hệ thống gửi tự động, vui lòng không trả lời email này.</p>"
                    + "</div>";
            sendHtmlMail(toEmail, subject, html);
            notificationService.markAsSent(notifId);
        } catch (MailException | MessagingException e) {
            throw new NotificationException("Lỗi gửi OTP đổi mật khẩu (Notif: " + notifId + ")", e);
        }
    }

    @Recover
    public void recoverPasswordChangeOtpEmail(NotificationException e, String toEmail, String otpCode, Locale locale, Long notifId) {
        logger.error("[{}] Cạn kiệt lần thử gửi OTP đổi mật khẩu tới: {}", LOG_TAG_NOTIFICATION, toEmail);
        notificationService.markAsFailed(notifId);
        alertService.createAlert(LOG_TAG_NOTIFICATION, com.project.common.entity.SystemLogSeverity.CRITICAL,
            "Gửi OTP đổi mật khẩu thất bại hoàn toàn tới: " + toEmail, e);
    }

    public void sendRawEmailSync(String toEmail, String subject, String htmlContent) {
        try {
            sendHtmlMail(toEmail, subject, htmlContent);
        } catch (MessagingException e) {
            logger.error("Failed to send sync email to {}: {}", toEmail, e.getMessage());
        }
    }

    private void sendHtmlMail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
        helper.setFrom(fromEmail);
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true);
        mailSender.send(message);
    }
}
