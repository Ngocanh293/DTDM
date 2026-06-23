package com.project.order.entity;

/**
 * Trạng thái đơn hàng xuyên suốt hệ thống.
 */
public enum OrderStatus {
    PENDING,    // Đang chờ (Mặc định)
    PAID,       // Đã thanh toán (Chờ xác nhận kho)
    CONFIRMED,  // Đã xác nhận đơn hàng (Đang đóng gói)
    SHIPPING,   // Đang giao hàng
    DELIVERED,  // Giao hàng thành công
    CANCELLED   // Đã hủy
}
