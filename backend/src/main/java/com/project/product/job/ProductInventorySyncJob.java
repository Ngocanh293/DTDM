package com.project.product.job;

import com.project.inventory.entity.Inventory;
import com.project.inventory.repository.InventoryRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Auto-healing job: đảm bảo mọi sản phẩm đều có bản ghi kho (Inventory).
 * Được gọi thủ công (manual trigger) khi cần repair data.
 * Dùng LEFT JOIN query thay vì findAll() + vòng for N+1 cũ.
 */
@Component
public class ProductInventorySyncJob {

    private static final Logger log = LoggerFactory.getLogger(ProductInventorySyncJob.class);

    private final InventoryRepository inventoryRepository;

    public ProductInventorySyncJob(InventoryRepository inventoryRepository) {
        this.inventoryRepository = inventoryRepository;
    }

    /**
     * Quét và tạo bản ghi Inventory cho mọi sản phẩm bị thiếu.
     * Dùng 1 LEFT JOIN query thay vì findAll() + N vòng for.
     */
    @Transactional
    public void syncMissingInventories() {
        log.info("[AutoHeal] Starting inventory backfill job...");

        List<Long> missingProductIds = inventoryRepository.findProductIdsWithNoInventory();

        if (missingProductIds.isEmpty()) {
            log.info("[AutoHeal] All products have inventory records. Nothing to fix.");
            return;
        }

        log.warn("[AutoHeal] Found {} products missing inventory. Creating records...", missingProductIds.size());

        for (Long productId : missingProductIds) {
            Inventory newInventory = new Inventory();
            newInventory.setProductId(productId);
            newInventory.setQuantity(0);
            newInventory.setReserved(0);
            inventoryRepository.save(newInventory);
            log.info("[AutoHeal] Created inventory record for productId={}", productId);
        }

        log.info("[AutoHeal] Backfill complete. Created {} new inventory records.", missingProductIds.size());
    }
}
