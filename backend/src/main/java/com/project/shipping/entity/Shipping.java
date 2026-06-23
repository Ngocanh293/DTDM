package com.project.shipping.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.order.entity.Order;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "shippings")
public class Shipping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Quan hệ 1-1 với Order, Shipping là bên chịu trách nhiệm giữ khoá ngoại order_id
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    @JsonIgnore
    private Order order;

    @Column(nullable = false, length = 1000)
    private String deliveryAddress;

    @Column(nullable = false)
    private BigDecimal shippingCost;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ShippingStatus status;

    @Column(name = "tracking_code")
    private String trackingCode;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    public Shipping() {
    }

    /**
     * Constructor internally used by the manual builder pattern.
     * java:S107: Constructor has 8 parameters, which is greater than 7 authorized.
     */
    @SuppressWarnings("java:S107")
    public Shipping(Long id, Order order, String deliveryAddress, BigDecimal shippingCost, ShippingStatus status, String trackingCode, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.order = order;
        this.deliveryAddress = deliveryAddress;
        this.shippingCost = shippingCost;
        this.status = status;
        this.trackingCode = trackingCode;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Order getOrder() {
        return order;
    }

    public void setOrder(Order order) {
        this.order = order;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public BigDecimal getShippingCost() {
        return shippingCost;
    }

    public void setShippingCost(BigDecimal shippingCost) {
        this.shippingCost = shippingCost;
    }

    public ShippingStatus getStatus() {
        return status;
    }

    public void setStatus(ShippingStatus status) {
        this.status = status;
    }

    public String getTrackingCode() {
        return trackingCode;
    }

    public void setTrackingCode(String trackingCode) {
        this.trackingCode = trackingCode;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    // Manual Builder
    public static ShippingBuilder builder() {
        return new ShippingBuilder();
    }

    public static class ShippingBuilder {
        private Long id;
        private Order order;
        private String deliveryAddress;
        private BigDecimal shippingCost;
        private ShippingStatus status;
        private String trackingCode;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        ShippingBuilder() {}

        public ShippingBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public ShippingBuilder order(Order order) {
            this.order = order;
            return this;
        }

        public ShippingBuilder deliveryAddress(String deliveryAddress) {
            this.deliveryAddress = deliveryAddress;
            return this;
        }

        public ShippingBuilder shippingCost(BigDecimal shippingCost) {
            this.shippingCost = shippingCost;
            return this;
        }

        public ShippingBuilder status(ShippingStatus status) {
            this.status = status;
            return this;
        }

        public ShippingBuilder trackingCode(String trackingCode) {
            this.trackingCode = trackingCode;
            return this;
        }

        public ShippingBuilder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public ShippingBuilder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Shipping build() {
            return new Shipping(id, order, deliveryAddress, shippingCost, status, trackingCode, createdAt, updatedAt);
        }
    }
}
