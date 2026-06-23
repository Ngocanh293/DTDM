package com.project.common.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Tiện ích truy xuất thông tin người dùng hiện tại từ SecurityContext.
 * Tập trung logic tại một chỗ để tránh duplicate trên nhiều Service.
 */
public final class SecurityUtil {

    private static final Logger log = LoggerFactory.getLogger(SecurityUtil.class);

    private SecurityUtil() {
        // Utility class — không cho phép khởi tạo
    }

    /**
     * Trả về mô tả người thực hiện thao tác (role + email) để ghi audit log.
     * Trả về "System" nếu không thể xác định người dùng (ví dụ: gọi nội bộ qua job/event).
     *
     * @return chuỗi dạng "ADMIN (admin@example.com)" hoặc "System"
     */
    public static String getCurrentActorDescription() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                return "System";
            }

            Object principal = authentication.getPrincipal();
            if (principal instanceof CustomUserDetails userDetails) {
                String role = userDetails.getUser().getRole().name();
                String email = maskEmail(userDetails.getUser().getEmail());
                return role + " (" + email + ")";
            }
        } catch (Exception e) {
            log.warn("Không thể xác định người dùng hiện tại cho audit log: {}", e.getMessage());
        }
        return "System";
    }

    /**
     * Che giấu một phần email để tránh lộ thông tin nhạy cảm trong log và DB.
     * Ví dụ: "admin@example.com" → "ad***@example.com"
     */
    public static String maskEmail(String email) {
        if (email == null || !email.contains("@")) {
            return "***";
        }
        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];
        if (local.length() <= 2) {
            return "***@" + domain;
        }
        return local.substring(0, 2) + "***@" + domain;
    }
}
