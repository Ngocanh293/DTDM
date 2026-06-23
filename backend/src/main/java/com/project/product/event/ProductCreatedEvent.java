package com.project.product.event;

public class ProductCreatedEvent {
    private final Long productId;
    private final Integer initialStock;

    public ProductCreatedEvent(Long productId, Integer initialStock) {
        this.productId = productId;
        this.initialStock = initialStock;
    }

    public Long getProductId() {
        return productId;
    }

    public Integer getInitialStock() {
        return initialStock;
    }
}
