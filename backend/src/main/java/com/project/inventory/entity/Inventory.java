package com.project.inventory.entity;

import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLRestriction;

import java.util.Objects;

/**
 * Thực thể quản lý kho của một sản phẩm.
 * Tách biệt khỏi bảng Product để tối ưu việc cập nhật số lượng và khóa dòng (locking).
 */
@Entity
@Table(name = "inventories", indexes = {
    @Index(name = "idx_inventory_product", columnList = "product_id")
})
@SQLRestriction("is_deleted = false")
public class Inventory extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Tham chiếu đến ID sản phẩm. Giúp decoupling khỏi Entity Product.
    @Column(name = "product_id", nullable = false, unique = true)
    private Long productId;

    // Tổng số lượng hàng vật lý đang có trong kho.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer quantity;

    // Số lượng đang được giữ (ví dụ: khách đã bỏ giỏ hàng hoặc đang thanh toán).
    // Available = quantity - reserved.
    @Column(nullable = false, columnDefinition = "integer default 0")
    private Integer reserved;

    public Inventory() {
    }

    public Inventory(Long id, Long productId, Integer quantity, Integer reserved) {
        this.id = id;
        this.productId = productId;
        this.quantity = quantity;
        this.reserved = reserved;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Integer getReserved() {
        return reserved;
    }

    public void setReserved(Integer reserved) {
        this.reserved = reserved;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Inventory inventory = (Inventory) o;
        return Objects.equals(id, inventory.id) && Objects.equals(productId, inventory.productId) && Objects.equals(quantity, inventory.quantity) && Objects.equals(reserved, inventory.reserved);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, productId, quantity, reserved);
    }

    public static InventoryBuilder builder() {
        return new InventoryBuilder();
    }

    public static class InventoryBuilder {
        private Long id;
        private Long productId;
        private Integer quantity;
        private Integer reserved;

        public InventoryBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public InventoryBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }

        public InventoryBuilder quantity(Integer quantity) {
            this.quantity = quantity;
            return this;
        }

        public InventoryBuilder reserved(Integer reserved) {
            this.reserved = reserved;
            return this;
        }

        public Inventory build() {
            return new Inventory(id, productId, quantity, reserved);
        }
    }
}
