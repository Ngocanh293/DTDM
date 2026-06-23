package com.project.inventory.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

/**
 * DTO yêu cầu các thao tác về kho (Cập nhật, Trừ, Hoàn).
 */
public class InventoryRequest {

    @NotNull(message = "{validation.inventory.product_id.empty}")
    private Long productId;

    @NotNull(message = "{validation.inventory.quantity.empty}")
    @Min(value = 1, message = "{validation.inventory.quantity.min}")
    private Integer quantity;

    private String referenceId; // Idempotency key (ví dụ: orderId)

    // --- Constructors ---
    public InventoryRequest() {}

    public InventoryRequest(Long productId, Integer quantity, String referenceId) {
        this.productId = productId;
        this.quantity = quantity;
        this.referenceId = referenceId;
    }

    // --- Getters and Setters ---
    public Long getProductId() { return productId; }
    public void setProductId(Long productId) { this.productId = productId; }

    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }

    public String getReferenceId() { return referenceId; }
    public void setReferenceId(String referenceId) { this.referenceId = referenceId; }

    // --- Manual Builder ---
    public static InventoryRequestBuilder builder() {
        return new InventoryRequestBuilder();
    }

    public static class InventoryRequestBuilder {
        private Long productId;
        private Integer quantity;
        private String referenceId;

        public InventoryRequestBuilder productId(Long productId) { this.productId = productId; return this; }
        public InventoryRequestBuilder quantity(Integer quantity) { this.quantity = quantity; return this; }
        public InventoryRequestBuilder referenceId(String referenceId) { this.referenceId = referenceId; return this; }

        public InventoryRequest build() {
            return new InventoryRequest(productId, quantity, referenceId);
        }
    }
}

