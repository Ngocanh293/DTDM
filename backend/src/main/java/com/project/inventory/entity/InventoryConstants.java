package com.project.inventory.entity;

/**
 * Định nghĩa các hằng số lý do (Reason) cho bản ghi lịch sử tồn kho.
 * Giúp chuẩn hóa dữ liệu audit và dễ dàng truy vấn/báo cáo.
 */
public final class InventoryConstants {

    private InventoryConstants() {}

    // --- Reasons ---
    public static final String REASON_MANUAL_UPDATE = "Manual stock update by admin";
    public static final String REASON_DIRECT_DECREASE = "Direct stock decrease";
    public static final String REASON_DIRECT_INCREASE = "Direct stock replenishment";
    public static final String REASON_RESERVE_ORDER = "Reservation for new order";
    public static final String REASON_CONFIRM_PAYMENT = "Order paid - permanent stock deduction";
    public static final String REASON_CANCEL_ORDER = "Order cancelled - stock returned";
    public static final String REASON_TTL_EXPIRED = "Reservation expired - auto-release";
    public static final String REASON_PRODUCT_INIT = "Initial stock setup on product creation";

    // --- TTL Config ---
    public static final int DEFAULT_RESERVATION_TTL_MINUTES = 15;
}
