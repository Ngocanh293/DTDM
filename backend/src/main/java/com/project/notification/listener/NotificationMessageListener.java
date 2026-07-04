package com.project.notification.listener;

import com.project.common.config.RabbitMQConfig;
import com.project.notification.dto.NotificationEmailEvent;
import com.project.notification.service.EmailService;
import com.project.notification.service.NotificationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.Locale;

@Component
public class NotificationMessageListener {

    private static final Logger logger = LoggerFactory.getLogger(NotificationMessageListener.class);

    private final EmailService emailService;
    private final NotificationService notificationService;

    public NotificationMessageListener(EmailService emailService, NotificationService notificationService) {
        this.emailService = emailService;
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = RabbitMQConfig.QUEUE_EMAIL)
    public void handleEmailNotification(NotificationEmailEvent event) {
        logger.info("[RABBITMQ-CONSUMER] Nhận được email notification event cho ID: {}, Type: {}", event.getNotifId(), event.getType());
        try {
            Locale locale = event.getLanguage() != null ? new Locale(event.getLanguage()) : Locale.getDefault();
            String type = event.getType();

            switch (type) {
                case "VERIFICATION":
                    emailService.sendVerificationEmail(event.getToEmail(), event.getToken(), locale, event.getNotifId());
                    break;
                case "EMAIL_CHANGE":
                    emailService.sendEmailChangeEmail(event.getToEmail(), event.getToken(), locale, event.getNotifId());
                    break;
                case "PASSWORD_RESET":
                    emailService.sendPasswordResetEmail(event.getToEmail(), event.getToken(), locale, event.getNotifId());
                    break;
                case "PASSWORD_CHANGE_OTP":
                    emailService.sendPasswordChangeOtpEmail(event.getToEmail(), event.getOtpCode(), locale, event.getNotifId());
                    break;
                case "ORDER_CONFIRM":
                    // Dùng tạm toEmail làm username nếu DTO không lưu username riêng biệt
                    emailService.sendOrderConfirmationEmail(event.getToEmail(), event.getToEmail(), event.getOrderId(), event.getTotalAmount(), locale, event.getNotifId());
                    break;
                case "ORDER_STATUS_UPDATE":
                    emailService.sendOrderStatusUpdateEmail(event.getToEmail(), event.getToEmail(), event.getOrderId(), event.getStatus(), locale, event.getNotifId());
                    break;
                case "RAW_EMAIL":
                    emailService.sendRawEmailSync(event.getToEmail(), event.getSubject(), event.getContent());
                    notificationService.markAsSent(event.getNotifId());
                    break;
                default:
                    logger.error("[RABBITMQ-CONSUMER] Không nhận diện được loại notification: {}", type);
            }
            logger.info("[RABBITMQ-CONSUMER] Xử lý thành công email notification ID: {}", event.getNotifId());
        } catch (Exception e) {
            logger.error("[RABBITMQ-CONSUMER] Lỗi xử lý email notification ID: {}", event.getNotifId(), e);
            // Ném lại lỗi để RabbitMQ thực hiện retry theo cấu hình
            throw new RuntimeException("Lỗi gửi mail qua RabbitMQ Consumer", e);
        }
    }
}
