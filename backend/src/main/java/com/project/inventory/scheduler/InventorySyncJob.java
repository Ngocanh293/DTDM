package com.project.inventory.scheduler;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Job tự động kiểm tra và sửa lỗi logic dữ liệu tồn kho.
 * Chạy định kỳ để đảm bảo tính toàn vẹn dữ liệu.
 *
 * <p>Khác biệt so với phiên bản cũ:
 * <ul>
 *   <li>Chỉ load đúng các bản ghi <em>vi phạm điều kiện</em> thay vì toàn bộ bảng (tránh OOM)</li>
 *   <li>Đặt đúng package {@code scheduler} thay vì {@code service}</li>
 * </ul>
 */
@Component
public class InventorySyncJob {

    private static final Logger log = LoggerFactory.getLogger(InventorySyncJob.class);

    private final InventoryRepository inventoryRepository;

    public InventorySyncJob(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Quét các bản ghi tồn kho có lỗi logic:
     * - reserved âm (< 0)
     * - reserved vượt quá tổng số hàng hiện có (> quantity)
     *
     * <p>Chỉ load đúng các bản ghi vi phạm qua {@code findAllWithInconsistentData()},
     * không load toàn bảng. Chạy mỗi giờ một lần.
     */
    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void auditAndFixInventoryConsistency() {
        log.info("Bắt đầu Job Audit Inventory Consistency...");

        List<Inventory> inconsistentList = inventoryRepository.findAllWithInconsistentData();

        if (inconsistentList.isEmpty()) {
            log.info("Hoàn tất Job Audit. Không phát hiện lỗi logic dữ liệu.");
            return;
        }

        int fixCount = 0;

        for (Inventory inv : inconsistentList) {

            // Lỗi 1: Reserved âm
            if (inv.getReserved() < 0) {
                log.warn("Phát hiện reserved âm cho Product ID: {}. Đang reset về 0.", inv.getProductId());
                inv.setReserved(0);
            }

            // Lỗi 2: Reserved vượt quá tổng số hàng hiện có
            if (inv.getReserved() > inv.getQuantity()) {
                log.error("Lỗi nghiêm trọng: Reserved ({}) > Quantity ({}) tại Product ID: {}. Đang cân bằng lại.",
                          inv.getReserved(), inv.getQuantity(), inv.getProductId());
                inv.setReserved(inv.getQuantity());
            }

            inventoryRepository.save(inv);
            fixCount++;
        }

        log.info("Hoàn tất Job Audit. Đã sửa lỗi cho {} bản ghi.", fixCount);
    }
}
