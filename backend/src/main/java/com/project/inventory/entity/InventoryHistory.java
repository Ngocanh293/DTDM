package com.project.inventory.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Lưu vết mọi biến động trong kho hàng (Audit Trail).
 */
@Entity
@Table(name = "inventory_history", indexes = {
    @Index(name = "idx_history_product", columnList = "product_id"),
    @Index(name = "uk_reference_type", columnList = "reference_id, type", unique = true)
})
public class InventoryHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private Integer changeAmount;

    @Column(name = "reference_id")
    private String referenceId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private HistoryType type;

    private String reason;

    private LocalDateTime expireAt;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    // --- Enum Định nghĩa loại biến động ---
    public enum HistoryType {
        REPLENISH,       // Nhập hàng (Tăng quantity)
        DECREASE,        // Xuất hàng trực tiếp (Giảm quantity)
        RESERVE,         // Giữ hàng (Tăng reserved)
        CONFIRM_ORDER,   // Xác nhận đơn (Giảm quantity & Giảm reserved)
        CANCEL_RESERVE,  // Huỷ giữ hàng (Giảm reserved)
        UPDATE           // Cập nhập thủ công (Overwrite)
    }

    // --- Constructors ---
    public InventoryHistory() {}

    public InventoryHistory(Long productId, Integer changeAmount, HistoryType type, String reason, String referenceId, LocalDateTime expireAt) {
        this.productId = productId;
        this.changeAmount = changeAmount;
        this.type = type;
        this.reason = reason;
        this.referenceId = referenceId;
        this.expireAt = expireAt;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getChangeAmount() { return changeAmount; }
    public void setChangeAmount(Integer changeAmount) { this.changeAmount = changeAmount; }

    public HistoryType getType() { return type; }
    public void setType(HistoryType type) { this.type = type; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getExpireAt() { return expireAt; }
    public void setExpireAt(LocalDateTime expireAt) { this.expireAt = expireAt; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // --- Manual Builder ---
    public static InventoryHistoryBuilder builder() {
        return new InventoryHistoryBuilder();
    }

    public static class InventoryHistoryBuilder {
        private Long productId;
        private Integer changeAmount;
        private HistoryType type;
        private String reason;
        private String referenceId;
        private LocalDateTime expireAt;

        public InventoryHistoryBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryHistoryBuilder changeAmount(Integer changeAmount) { this.changeAmount = changeAmount; return this; }
        public InventoryHistoryBuilder type(HistoryType type) { this.type = type; return this; }
        public InventoryHistoryBuilder reason(String reason) { this.reason = reason; return this; }
        public InventoryHistoryBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public InventoryHistoryBuilder expireAt(LocalDateTime expireAt) { this.expireAt = expireAt; return this; }

        public InventoryHistory build() {
            return new InventoryHistory(productId, changeAmount, type, reason, referenceId, expireAt);
        }
    }
}
