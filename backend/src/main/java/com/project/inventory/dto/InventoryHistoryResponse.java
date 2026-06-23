package com.project.inventory.dto;

import com.project.inventory.entity.InventoryHistory.HistoryType;

import java.time.LocalDateTime;

/**
 * DTO trả về thông tin lịch sử biến động kho.
 * Thay thế việc trả Entity thô (InventoryHistory) ra ngoài tầng Service.
 */
public class InventoryHistoryResponse {

    private Long id;
    private Long productId;
    private Integer changeAmount;
    private String referenceId;
    private HistoryType type;
    private String reason;
    private LocalDateTime createdAt;

    // --- Constructors ---
    public InventoryHistoryResponse() {}

    public InventoryHistoryResponse(Long id, Long productId, Integer changeAmount,
                                    String referenceId, HistoryType type,
                                    String reason, LocalDateTime createdAt) {
        this.id = id;
        this.productId = productId;
        this.changeAmount = changeAmount;
        this.referenceId = referenceId;
        this.type = type;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getChangeAmount() { return changeAmount; }
    public void setChangeAmount(Integer changeAmount) { this.changeAmount = changeAmount; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    public HistoryType getType() { return type; }
    public void setType(HistoryType type) { this.type = type; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    // --- Manual Builder ---
    public static InventoryHistoryResponseBuilder builder() {
        return new InventoryHistoryResponseBuilder();
    }

    public static class InventoryHistoryResponseBuilder {
        private Long id;
        private Long productId;
        private Integer changeAmount;
        private String referenceId;
        private HistoryType type;
        private String reason;
        private LocalDateTime createdAt;

        public InventoryHistoryResponseBuilder id(Long id) { this.id = id; return this; }
        public InventoryHistoryResponseBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryHistoryResponseBuilder changeAmount(Integer changeAmount) { this.changeAmount = changeAmount; return this; }
        public InventoryHistoryResponseBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }
        public InventoryHistoryResponseBuilder type(HistoryType type) { this.type = type; return this; }
        public InventoryHistoryResponseBuilder reason(String reason) { this.reason = reason; return this; }
        public InventoryHistoryResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public InventoryHistoryResponse build() {
            return new InventoryHistoryResponse(id, productId, changeAmount, referenceId, type, reason, createdAt);
        }
    }
}
