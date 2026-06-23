package com.project.inventory.scheduler;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.entity.InventoryHistory;
import com.project.inventory.repository.InventoryHistoryRepository;
import com.project.inventory.service.InventoryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Job tự động dọn dẹp các yêu cầu giữ hàng (Stock Reservation) đã hết hạn.
 * Nếu đơn hàng chưa được thanh toán hoặc xác nhận trong thời gian quy định,
 * hệ thống sẽ tự động hoàn lại số lượng vào kho khả dụng.
 *
 * <p>Cơ chế: Quét các bản ghi RESERVE đã quá expiryAt mà chưa có CONFIRM hay CANCEL.
 */
@Component
public class InventoryReservationTTLJob {

    private static final Logger log = LoggerFactory.getLogger(InventoryReservationTTLJob.class);

    private final InventoryService inventoryService;
    private final InventoryHistoryRepository historyRepository;

    public InventoryReservationTTLJob(InventoryService inventoryService,
                                       InventoryHistoryRepository historyRepository) {
        this.inventoryService = inventoryService;
        this.historyRepository = historyRepository;
    }

    /**
     * Chạy mỗi 5 phút (300.000ms).
     */
    @Scheduled(fixedRate = 300000)
    public void autoReleaseExpiredReservations() {
        log.info("Bắt đầu Job giải phóng giữ hàng đã hết hạn (Stock Reservation TTL)...");

        List<InventoryHistory> expiredList = historyRepository.findExpiredReservations();

        if (expiredList.isEmpty()) {
            log.info("Hoàn tất Job TTL. Không tìm thấy giữ hàng nào hết hạn.");
            return;
        }

        log.info("Phát hiện {} bản ghi giữ hàng đã hết hạn. Đang tiến hành giải phóng...", expiredList.size());

        int successCount = 0;
        for (InventoryHistory reserveRecord : expiredList) {
            try {
                // Tạo request giả lập để gọi cancelReservation
                InventoryRequest releaseRequest = InventoryRequest.builder()
                        .productId(reserveRecord.getProductId())
                        .quantity(reserveRecord.getChangeAmount())
                        .referenceId(reserveRecord.getReferenceId())
                        .build();

                inventoryService.cancelReservation(releaseRequest);
                successCount++;
                
                log.info("Đã giải phóng tự động: [ProductID: {}, Qty: {}, Ref: {}]",
                         reserveRecord.getProductId(), reserveRecord.getChangeAmount(), reserveRecord.getReferenceId());
            } catch (Exception e) {
                log.error("Lỗi khi giải phóng giữ hàng Ref: {}. Lý do: {}", reserveRecord.getReferenceId(), e.getMessage());
            }
        }

        log.info("Hoàn tất Job TTL. Đã giải phóng thành công {}/{} bản ghi.", successCount, expiredList.size());
    }
}
