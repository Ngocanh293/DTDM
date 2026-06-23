package com.project.inventory.event;

import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.service.InventoryService;
import com.project.product.event.ProductCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe các sự kiện cross-module để thực thi hành động tương ứng.
 * Giải quyết logic khởi tạo kho tự động trước đây nằm ở module Product nhưng bị xóa
 * để đảm bảo Loose Coupling.
 */
@Component
public class InventoryEventListener {

    private static final Logger log = LoggerFactory.getLogger(InventoryEventListener.class);
    private final InventoryService inventoryService;

    public InventoryEventListener(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    /**
     * Bắt sự kiện khi một sản phẩm mới được chèn vào DB từ module product.
     * Khởi tạo ngay kho ban đầu cho sản phẩm đó.
     */
    @EventListener
    public void handleProductCreatedEvent(ProductCreatedEvent event) {
        log.info("Bắt được sự kiện ProductCreatedEvent. Khởi tạo kho cho ProductID: {}, Stock: {}", 
                 event.getProductId(), event.getInitialStock());
        
        InventoryRequest request = new InventoryRequest(
                event.getProductId(), 
                event.getInitialStock() != null ? event.getInitialStock() : 0,
                "INIT-" + event.getProductId()
        );
        
        try {
            inventoryService.updateStock(request);
        } catch (Exception e) {
            log.error("Lỗi khi tạo kho tự động cho ProductID {}: {}", event.getProductId(), e.getMessage());
            // Việc mất dữ liệu sẽ được bù đắp (healing) thông qua Backfill Job (ProductInventorySyncJob)
            // Có thể định tuyến sang Dead Letter Queue (DLQ) nếu sử dụng RabbitMQ hoặc Kafka
        }
    }
}
