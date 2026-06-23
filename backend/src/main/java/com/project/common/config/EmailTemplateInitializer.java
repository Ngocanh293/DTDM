package com.project.common.config;

import com.project.notification.entity.EmailTemplate;
import com.project.notification.entity.NotificationType;
import com.project.notification.repository.EmailTemplateRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.util.StreamUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Configuration
public class EmailTemplateInitializer {

    private static final Logger logger = LoggerFactory.getLogger(EmailTemplateInitializer.class);

    @Bean
    public CommandLineRunner initEmailTemplates(EmailTemplateRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                logger.info("Bắt đầu khởi tạo mẫu Email vào Database...");
                
                try {
                    // Auth Templates
                    saveTemplate(repository, NotificationType.EMAIL_VERIFICATION, "vi", "Xác Nhận Tài Khoản PCeStore", "templates/email/verify-email-vi.html");
                    saveTemplate(repository, NotificationType.EMAIL_VERIFICATION, "en", "Activate Your PCeStore Account", "templates/email/verify-email-en.html");
                    
                    saveTemplate(repository, NotificationType.PASSWORD_RESET, "vi", "Đặt Lại Mật Khẩu PCeStore", "templates/email/reset-password-vi.html");
                    saveTemplate(repository, NotificationType.PASSWORD_RESET, "en", "Reset Your PCeStore Password", "templates/email/reset-password-en.html");
                    
                    // User Templates
                    saveTemplate(repository, NotificationType.EMAIL_CHANGE, "vi", "Xác Thực Thay Đổi Email - PCeStore", "templates/email/email-change-vi.html");
                    saveTemplate(repository, NotificationType.EMAIL_CHANGE, "en", "Verify Your Email Change - PCeStore", "templates/email/email-change-en.html");
                    
                    // Order Templates
                    saveTemplate(repository, NotificationType.ORDER_CONFIRMATION, "vi", "Xác Nhận Đơn Hàng #{{orderId}}", "templates/email/order-confirm-vi.html");
                    saveTemplate(repository, NotificationType.ORDER_CONFIRMATION, "en", "Order Confirmation #{{orderId}}", "templates/email/order-confirm-en.html");
                    
                    saveTemplate(repository, NotificationType.ORDER_STATUS_UPDATE, "vi", "Cập Nhật Trạng Thái Đơn Hàng #{{orderId}}", "templates/email/order-status-vi.html");
                    saveTemplate(repository, NotificationType.ORDER_STATUS_UPDATE, "en", "Order Status Updated #{{orderId}}", "templates/email/order-status-en.html");
                    
                    logger.info("✅ Đã khởi tạo 10 mẫu Email thành công!");
                } catch (IOException e) {
                    logger.error("❌ Lỗi khi đọc file template tĩnh để nạp vào DB: {}", e.getMessage());
                }
            } else {
                logger.info("Mẫu Email đã tồn tại trong Database, bỏ qua khởi tạo.");
            }
        };
    }

    private void saveTemplate(EmailTemplateRepository repository, NotificationType type, String locale, String subject, String path) throws IOException {
        String content = StreamUtils.copyToString(new ClassPathResource(path).getInputStream(), StandardCharsets.UTF_8);
        repository.save(new EmailTemplate(type, locale, subject, content));
    }
}
