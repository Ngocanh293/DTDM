package com.project.inventory.repository;

import org.springframework.data.jpa.repository.Modifying;

import com.project.inventory.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

/**
 * Repository quản lý các thao tác Database liên quan đến tồn kho.
 */
@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {

    // Tìm kiếm thông tin kho thông thường dựa trên Product ID.
    Optional<Inventory> findByProductId(Long productId);

    // Kiểm tra xem sản phẩm đã có inventory hay chưa
    boolean existsByProductId(Long productId);

    /**
     * Tìm kiếm thông tin kho và áp dụng PESSIMISTIC_WRITE lock.
     * Lock này ngăn chặn các transaction khác đọc/ghi vào dòng này cho đến khi transaction hiện tại kết thúc.
     * Đây là cơ chế then chốt để chống bán vượt mức (overselling).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT i FROM Inventory i WHERE i.productId = :productId")
    Optional<Inventory> findByProductIdWithLock(@Param("productId") Long productId);

    // Tìm kiếm thông tin kho bất kể trạng thái sản phẩm bị xóa mềm hay chưa (Dùng cho Admin)
    @Query(value = "SELECT * FROM inventories WHERE product_id = :productId", nativeQuery = true)
    Optional<Inventory> findByProductIdIncludingDeleted(@Param("productId") Long productId);

    // Batch load tồn kho cho nhiều sản phẩm cùng lúc — tránh N+1 query khi dùng trong mapToResponse
    List<Inventory> findAllByProductIdIn(Collection<Long> productIds);

    // Tìm product_id chưa có inventory — dùng cho syncMissingInventories() tránh full-table scan
    @Query("SELECT p.id FROM Product p WHERE p.id NOT IN (SELECT i.productId FROM Inventory i)")
    List<Long> findProductIdsWithNoInventory();

    /**
     * Chỉ lấy các bản ghi có lỗi logic:
     * - reserved < 0 (âm tuyệt đối)
     * - reserved > quantity (vượt quá tổng)
     * Dùng cho InventorySyncJob thay thế findAll() để tránh full-table scan và OOM.
     */
    @Query("SELECT i FROM Inventory i WHERE i.reserved < 0 OR i.reserved > i.quantity")
    List<Inventory> findAllWithInconsistentData();

    /**
     * Khởi tạo bản ghi kho trống một cách an toàn.
     * Sử dụng ON CONFLICT DO NOTHING để chống lỗi DuplicateKeyException khi nhiều request cùng xử lý 1 sản phẩm mới.
     */
    @Modifying
    @Query(value = "INSERT INTO inventories (product_id, quantity, reserved, is_deleted, created_at, updated_at) " +
                   "VALUES (:productId, 0, 0, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) ON CONFLICT (product_id) DO NOTHING", nativeQuery = true)
    void initInventorySafe(@Param("productId") Long productId);
}

