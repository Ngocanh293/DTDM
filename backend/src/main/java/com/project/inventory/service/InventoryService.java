package com.project.inventory.service;

import com.project.inventory.dto.InventoryHistoryResponse;
import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Interface định nghĩa các nghiệp vụ quản lý tồn kho.
 */
public interface InventoryService {

    /**
     * Lấy trạng thái kho hiện tại của một sản phẩm.
     */
    InventoryResponse getStock(Long productId);

    /**
     * Lấy danh sách tồn kho của nhiều sản phẩm cùng lúc (Batch Fetching).
     */
    java.util.Map<Long, Integer> getStockBulk(java.util.List<Long> productIds);

    /**
     * Cập nhật (set) số lượng tồn kho mới. Thường dùng cho ADMIN.
     */
    InventoryResponse updateStock(InventoryRequest request);

    /**
     * Trừ kho trực tiếp.
     */
    InventoryResponse decreaseStock(InventoryRequest request);

    /**
     * Hoàn lại số lượng vào kho.
     */
    InventoryResponse increaseStock(InventoryRequest request);

    /**
     * Giữ hàng tạm thời (Tăng reserved).
     */
    InventoryResponse reserveStock(InventoryRequest request);

    /**
     * Giữ hàng hàng loạt cho nhiều sản phẩm (ví dụ: giỏ hàng).
     * Đảm bảo tính nguyên tử (Atomic).
     */
    List<InventoryResponse> reserveStockBulk(List<InventoryRequest> requests);

    /**
     * Xác nhận đơn hàng (Trừ quantity và trừ reserved).
     */
    InventoryResponse confirmStock(InventoryRequest request);

    /**
     * Xác nhận đơn hàng hàng loạt.
     */
    List<InventoryResponse> confirmStockBulk(List<InventoryRequest> requests);

    /**
     * Huỷ giữ hàng (Trừ reserved).
     */
    InventoryResponse cancelReservation(InventoryRequest request);

    /**
     * Huỷ giữ hàng hàng loạt.
     */
    List<InventoryResponse> cancelReservationBulk(List<InventoryRequest> requests);

    /**
     * Lấy lịch sử biến động kho của sản phẩm.
     */
    Page<InventoryHistoryResponse> getHistory(Long productId, Pageable pageable);
}
