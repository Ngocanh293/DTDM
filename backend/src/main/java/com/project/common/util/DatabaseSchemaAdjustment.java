package com.project.common.util;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

/**
 * Thành phần hỗ trợ điều chỉnh Schema Database khi có thay đổi Enum.
 * Giải quyết lỗi Check Constraint không tự cập nhật trên PostgreSQL.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DatabaseSchemaAdjustment {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void dropOldConstraints() {
        log.info("Bắt đầu kiểm tra và dọn dẹp Database Check Constraints...");
        try {
            // Xoá ràng buộc kiểm tra cũ của bảng orders để chấp nhận các trạng thái mới (CONFIRMED, SHIPPING, DELIVERED)
            jdbcTemplate.execute("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
            log.info("Đã xóa bỏ orders_status_check thành công.");
            
            // Thực hiện tương tự cho các bảng khác nếu cần (đảm bảo tính nhất quán)
            jdbcTemplate.execute("ALTER TABLE shipping DROP CONSTRAINT IF EXISTS shipping_status_check");
            jdbcTemplate.execute("ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check");
            
            
        } catch (Exception e) {
            log.debug("Bỏ qua lỗi xoá constraint (thường do constraint không tồn tại): {}", e.getMessage());
        }
    }
}
