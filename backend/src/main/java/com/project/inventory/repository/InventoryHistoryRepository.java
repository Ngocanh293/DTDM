package com.project.inventory.repository;

import com.project.inventory.entity.InventoryHistory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository quản lý lịch sử biến động kho.
 */
@Repository
public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Long> {
    
    /**
     * Tìm kiếm lịch sử kho theo Product ID (Phân trang).
     */
    Page<InventoryHistory> findByProductIdOrderByCreatedAtDesc(Long productId, Pageable pageable);

    /**
     * Kiểm tra xem một mã giao dịch (referenceId) đã tồn tại hay chưa để tránh trùng lặp.
     */
    boolean existsByReferenceId(String referenceId);

    /**
     * Kiểm tra xem một mã giao dịch (referenceId) và loại thao tác đã tồn tại hay chưa.
     * Hỗ trợ Idempotency chi tiết hơn (ví dụ: cho phép 1 order có 1 bản ghi RESERVE và 1 bản ghi CONFIRM).
     */
    boolean existsByReferenceIdAndType(String referenceId, InventoryHistory.HistoryType type);

    /**
     * Tìm các bản ghi giữ hàng (RESERVE) đã quá hạn mà chưa được xử lý.
     * Cơ chế: Tìm RESERVE có expireAt < CURRENT_TIMESTAMP mà không có CONFIRM_ORDER hoặc CANCEL_RESERVE cùng referenceId.
     */
    @Query("SELECT h FROM InventoryHistory h WHERE h.type = com.project.inventory.entity.InventoryHistory$HistoryType.RESERVE " +
           "AND h.expireAt < CURRENT_TIMESTAMP " +
           "AND NOT EXISTS (SELECT 1 FROM InventoryHistory h2 WHERE h2.referenceId = h.referenceId " +
           "AND h2.type IN (com.project.inventory.entity.InventoryHistory$HistoryType.CONFIRM_ORDER, com.project.inventory.entity.InventoryHistory$HistoryType.CANCEL_RESERVE))")
    List<InventoryHistory> findExpiredReservations();
}
