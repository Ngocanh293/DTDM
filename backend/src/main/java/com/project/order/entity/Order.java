package com.project.order.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@SQLRestriction("is_deleted = false")
public class Order extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private com.project.auth.entity.User user;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToOne(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private com.project.shipping.entity.Shipping shipping;

    // --- Helpers ---
    public com.project.auth.entity.User getUser() {
        return user;
    }

    public void setUser(com.project.auth.entity.User user) {
        this.user = user;
    }

    public Order() {
    }

    /**
     * Constructor internally used by the manual builder pattern.
     * java:S107: Constructor has 8 parameters, which is greater than 7 authorized.
     */
    @SuppressWarnings("java:S107")
    public Order(Long id, Long userId, OrderStatus status, BigDecimal totalAmount, String shippingAddress, LocalDateTime orderDate, List<OrderItem> orderItems, com.project.shipping.entity.Shipping shipping) {
        this.id = id;
        this.userId = userId;
        this.status = status;
        this.totalAmount = totalAmount;
        this.shippingAddress = shippingAddress;
        this.orderDate = orderDate;
        this.orderItems = orderItems != null ? orderItems : new ArrayList<>();
        this.shipping = shipping;
    }

    public void addOrderItem(OrderItem orderItem) {
        orderItems.add(orderItem);
        orderItem.setOrder(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }

    public LocalDateTime getOrderDate() {
        return orderDate;
    }

    public void setOrderDate(LocalDateTime orderDate) {
        this.orderDate = orderDate;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }

    public com.project.shipping.entity.Shipping getShipping() {
        return shipping;
    }

    public void setShipping(com.project.shipping.entity.Shipping shipping) {
        this.shipping = shipping;
    }

    public static OrderBuilder builder() {
        return new OrderBuilder();
    }

    public static class OrderBuilder {
        private Long id;
        private Long userId;
        private OrderStatus status;
        private BigDecimal totalAmount;
        private String shippingAddress;
        private LocalDateTime orderDate;
        private List<OrderItem> orderItems = new ArrayList<>();
        private com.project.shipping.entity.Shipping shipping;

        OrderBuilder() {}

        public OrderBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OrderBuilder userId(Long userId) {
            this.userId = userId;
            return this;
        }

        public OrderBuilder status(OrderStatus status) {
            this.status = status;
            return this;
        }

        public OrderBuilder totalAmount(BigDecimal totalAmount) {
            this.totalAmount = totalAmount;
            return this;
        }

        public OrderBuilder shippingAddress(String shippingAddress) {
            this.shippingAddress = shippingAddress;
            return this;
        }

        public OrderBuilder orderDate(LocalDateTime orderDate) {
            this.orderDate = orderDate;
            return this;
        }

        public OrderBuilder orderItems(List<OrderItem> orderItems) {
            this.orderItems = orderItems;
            return this;
        }

        public OrderBuilder shipping(com.project.shipping.entity.Shipping shipping) {
            this.shipping = shipping;
            return this;
        }

        public Order build() {
            return new Order(id, userId, status, totalAmount, shippingAddress, orderDate, orderItems, shipping);
        }
    }
}
