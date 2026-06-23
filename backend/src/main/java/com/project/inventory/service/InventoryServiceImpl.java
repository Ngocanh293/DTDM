package com.project.inventory.service;

import com.project.inventory.dto.InventoryHistoryResponse;
import com.project.inventory.dto.InventoryRequest;
import com.project.inventory.dto.InventoryResponse;
import com.project.inventory.entity.Inventory;
import com.project.inventory.entity.InventoryConstants;
import com.project.inventory.entity.InventoryHistory;
import com.project.inventory.repository.InventoryHistoryRepository;
import com.project.inventory.repository.InventoryRepository;
import com.project.common.security.SecurityUtil;
import com.project.notification.service.NotificationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Cài đặt các nghiệp vụ quản lý tồn kho (Giai đoạn 3 - Advanced).
 * Các tính năng nâng cao:
 * - Local Cache (Caffeine) cho getStock.
 * - Cảnh báo tồn kho thấp qua NotificationService.
 * - Idempotency & Bulk operations.
 */
@Service
public class InventoryServiceImpl implements InventoryService {

    private static final Logger log = LoggerFactory.getLogger(InventoryServiceImpl.class);

    private final InventoryRepository inventoryRepository;
    private final InventoryHistoryRepository historyRepository;
    private final MessageSource messageSource;
    private final NotificationService notificationService;

    @Value("${inventory.low-stock-threshold:10}")
    private int lowStockThreshold;

    public InventoryServiceImpl(InventoryRepository inventoryRepository,
                                InventoryHistoryRepository historyRepository,
                                MessageSource messageSource,
                                NotificationService notificationService) {
        this.inventoryRepository = inventoryRepository;
        this.historyRepository = historyRepository;
        this.messageSource = messageSource;
        this.notificationService = notificationService;
    }

    // -------------------------------------------------------------------------
    // Helper: i18n
    // -------------------------------------------------------------------------

    private String getMessage(String key, Object... args) {
        return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
    }

    // -------------------------------------------------------------------------
    // Helper: Idempotency
    // -------------------------------------------------------------------------

    private void checkIdempotency(String referenceId, InventoryHistory.HistoryType type) {
        if (referenceId != null && !referenceId.trim().isEmpty()) {
            if (historyRepository.existsByReferenceIdAndType(referenceId, type)) {
                log.warn("Phát hiện giao dịch lặp lại: [ReferenceId: {}, Type: {}]", referenceId, type);
                throw new IllegalStateException(getMessage("error.inventory.duplicate_transaction"));
            }
        }
    }

    /**
     * Kiểm tra và gửi cảnh báo nếu tồn kho khả dụng thấp.
     */
    private void checkLowStockAndNotify(Inventory inventory) {
        int available = inventory.getQuantity() - inventory.getReserved();
        if (available < lowStockThreshold) {
            log.warn("CẢNH BÁO: Tồn kho thấp cho ProductID: {}. Hiện có: {}", inventory.getProductId(), available);
            
            String subject = getMessage("notification.inventory.low_stock.subject", inventory.getProductId());
            String body = getMessage("notification.inventory.low_stock.body", inventory.getProductId(), available);
            
            // Gửi thông báo bất đồng bộ qua NotificationService
            notificationService.sendNotificationToAdmins(subject, body);
        }
    }

    // -------------------------------------------------------------------------
    // API: Đọc
    // -------------------------------------------------------------------------

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "inventory", key = "#productId")
    public InventoryResponse getStock(Long productId) {
        log.debug("Lấy stock từ DB cho ProductID: {}", productId);
        return inventoryRepository.findByProductId(productId)
                .map(this::mapToResponse)
                .orElseGet(() -> emptyStockResponse(productId));
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.Map<Long, Integer> getStockBulk(java.util.List<Long> productIds) {
        if (productIds == null || productIds.isEmpty()) return java.util.Collections.emptyMap();
        return inventoryRepository.findAllByProductIdIn(productIds)
                .stream()
                .collect(java.util.stream.Collectors.toMap(com.project.inventory.entity.Inventory::getProductId, com.project.inventory.entity.Inventory::getQuantity));
    }

    // -------------------------------------------------------------------------
    // API: Ghi (Sản phẩm đơn)
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public InventoryResponse updateStock(InventoryRequest request) {
        String actor = SecurityUtil.getCurrentActorDescription();
        log.info("{} cập nhật kho: [ProductID: {}, Qty: {}]", actor, request.getProductId(), request.getQuantity());

        Inventory inventory = getInventoryWithLock(request.getProductId());
        inventory.setQuantity(request.getQuantity());

        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.UPDATE,
                    InventoryConstants.REASON_MANUAL_UPDATE + " (By " + actor + ")", request.getReferenceId(), null);

        Inventory saved = inventoryRepository.save(inventory);
        checkLowStockAndNotify(saved);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse decreaseStock(InventoryRequest request) {
        checkIdempotency(request.getReferenceId(), InventoryHistory.HistoryType.DECREASE);

        Inventory inventory = getInventoryWithLock(request.getProductId());
        if (inventory.getQuantity() < request.getQuantity()) {
            throw new IllegalStateException(getMessage("error.inventory.insufficient_stock"));
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.DECREASE,
                    InventoryConstants.REASON_DIRECT_DECREASE, request.getReferenceId(), null);

        Inventory saved = inventoryRepository.save(inventory);
        checkLowStockAndNotify(saved);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse increaseStock(InventoryRequest request) {
        checkIdempotency(request.getReferenceId(), InventoryHistory.HistoryType.REPLENISH);

        Inventory inventory = getInventoryWithLock(request.getProductId());
        inventory.setQuantity(inventory.getQuantity() + request.getQuantity());

        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.REPLENISH,
                    InventoryConstants.REASON_DIRECT_INCREASE, request.getReferenceId(), null);

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3)
    public InventoryResponse reserveStock(InventoryRequest request) {
        checkIdempotency(request.getReferenceId(), InventoryHistory.HistoryType.RESERVE);

        Inventory inventory = getInventoryWithLock(request.getProductId());
        int available = inventory.getQuantity() - inventory.getReserved();
        if (available < request.getQuantity()) {
            throw new IllegalStateException(getMessage("error.inventory.insufficient_available_stock"));
        }

        inventory.setReserved(inventory.getReserved() + request.getQuantity());

        LocalDateTime expireAt = LocalDateTime.now().plusMinutes(InventoryConstants.DEFAULT_RESERVATION_TTL_MINUTES);

        saveHistory(request.getProductId(), request.getQuantity(), InventoryHistory.HistoryType.RESERVE,
                    InventoryConstants.REASON_RESERVE_ORDER, request.getReferenceId(), expireAt);

        Inventory saved = inventoryRepository.save(inventory);
        checkLowStockAndNotify(saved);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse confirmStock(InventoryRequest request) {
        checkIdempotency(request.getReferenceId(), InventoryHistory.HistoryType.CONFIRM_ORDER);

        Inventory inventory = getInventoryWithLock(request.getProductId());
        if (inventory.getReserved() < request.getQuantity()) {
            throw new IllegalStateException(getMessage("error.inventory.confirm_exceeds_reserved"));
        }

        inventory.setQuantity(inventory.getQuantity() - request.getQuantity());
        inventory.setReserved(inventory.getReserved() - request.getQuantity());

        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CONFIRM_ORDER,
                    InventoryConstants.REASON_CONFIRM_PAYMENT, request.getReferenceId(), null);

        return mapToResponse(inventoryRepository.save(inventory));
    }

    @Override
    @Transactional
    @CacheEvict(value = "inventory", key = "#request.productId")
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 500))
    public InventoryResponse cancelReservation(InventoryRequest request) {
        checkIdempotency(request.getReferenceId(), InventoryHistory.HistoryType.CANCEL_RESERVE);

        Inventory inventory = getInventoryWithLock(request.getProductId());
        inventory.setReserved(Math.max(0, inventory.getReserved() - request.getQuantity()));

        saveHistory(request.getProductId(), -request.getQuantity(), InventoryHistory.HistoryType.CANCEL_RESERVE,
                    InventoryConstants.REASON_CANCEL_ORDER, request.getReferenceId(), null);

        Inventory saved = inventoryRepository.save(inventory);
        return mapToResponse(saved);
    }

    // -------------------------------------------------------------------------
    // API: Ghi hàng loạt (Bulk Operations)
    // -------------------------------------------------------------------------

    @Override
    @Transactional
    public List<InventoryResponse> reserveStockBulk(List<InventoryRequest> requests) {
        log.info("Bắt đầu xử lý giữ hàng hàng loạt cho {} sản phẩm", requests.size());
        return requests.stream().map(this::reserveStock).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<InventoryResponse> confirmStockBulk(List<InventoryRequest> requests) {
        log.info("Bắt đầu xác nhận kho hàng loạt cho {} sản phẩm", requests.size());
        return requests.stream().map(this::confirmStock).collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<InventoryResponse> cancelReservationBulk(List<InventoryRequest> requests) {
        log.info("Bắt đầu huỷ giữ kho hàng loạt cho {} sản phẩm", requests.size());
        return requests.stream().map(this::cancelReservation).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<InventoryHistoryResponse> getHistory(Long productId, Pageable pageable) {
        return historyRepository.findByProductIdOrderByCreatedAtDesc(productId, pageable)
                .map(this::mapToHistoryResponse);
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Inventory getInventoryWithLock(Long productId) {
        inventoryRepository.initInventorySafe(productId);
        return inventoryRepository.findByProductIdWithLock(productId)
                .orElseThrow(() -> new IllegalStateException("Không thể khởi tạo kho cho sản phẩm: " + productId));
    }

    private void saveHistory(Long productId, Integer amount, InventoryHistory.HistoryType type,
                             String reason, String referenceId, LocalDateTime expireAt) {
        InventoryHistory history = InventoryHistory.builder()
                .productId(productId)
                .changeAmount(amount)
                .type(type)
                .reason(reason)
                .referenceId(referenceId)
                .expireAt(expireAt)
                .build();
        historyRepository.save(history);
    }

    private InventoryResponse mapToResponse(Inventory inventory) {
        return InventoryResponse.builder()
                .id(inventory.getId())
                .productId(inventory.getProductId())
                .quantity(inventory.getQuantity())
                .reserved(inventory.getReserved())
                .availableStock(inventory.getQuantity() - inventory.getReserved())
                .updatedAt(inventory.getUpdatedAt())
                .build();
    }

    private InventoryResponse emptyStockResponse(Long productId) {
        return InventoryResponse.builder()
                .id(null)
                .productId(productId)
                .quantity(0)
                .reserved(0)
                .availableStock(0)
                .updatedAt(null)
                .build();
    }

    private InventoryHistoryResponse mapToHistoryResponse(InventoryHistory history) {
        return InventoryHistoryResponse.builder()
                .id(history.getId())
                .productId(history.getProductId())
                .changeAmount(history.getChangeAmount())
                .referenceId(history.getReferenceId())
                .type(history.getType())
                .reason(history.getReason())
                .createdAt(history.getCreatedAt())
                .build();
    }
}
