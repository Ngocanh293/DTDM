package com.project.order.service;

import com.project.order.dto.OrderItemRequestDTO;
import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.entity.OrderItem;
import com.project.order.entity.OrderStatus;
import com.project.order.repository.OrderRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import com.project.shipping.service.ShippingService;
import com.project.shipping.entity.Shipping;
import com.project.inventory.service.InventoryService;
import com.project.inventory.dto.InventoryRequest;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final ShippingService shippingService;
    private final com.project.payment.repository.PaymentRepository paymentRepository;
    private final InventoryService inventoryService;

    /**
     * Danh sách mã giảm giá hợp lệ (giá trị = tỷ lệ phần trăm giảm, ví dụ 0.18 = 18%).
     * Phải đồng bộ với frontend/src/utils/discounts.js
     */
    private static final Map<String, BigDecimal> DISCOUNT_CODES = Map.ofEntries(
        Map.entry("KHOGABAMI",       new BigDecimal("0.18")),
        Map.entry("RAUMANIAN",       new BigDecimal("0.36")),
        Map.entry("CHUATAYDAU",      new BigDecimal("0.50")),
        Map.entry("TEAFROMHAND",     new BigDecimal("0.75")),
        Map.entry("PRISONNOW",       new BigDecimal("0.90")),
        Map.entry("BANMOITRAINGHIEM",new BigDecimal("0.99")),
        Map.entry("LGTV",            new BigDecimal("0.10")),
        Map.entry("LO",              new BigDecimal("0.29"))
    );

    /** Trả về tỷ lệ giảm giá (0 nếu mã không hợp lệ/null). */
    private BigDecimal resolveDiscountRate(String code) {
        if (code == null || code.isBlank()) return BigDecimal.ZERO;
        return DISCOUNT_CODES.getOrDefault(code.trim().toUpperCase(), BigDecimal.ZERO);
    }


    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public Order createOrder(OrderRequestDTO requestDTO) {
        Order order = Order.builder()
                .userId(requestDTO.getUserId())
                .status(OrderStatus.PENDING)
                .shippingAddress(requestDTO.getShippingAddress())
                .orderDate(LocalDateTime.now())
                .build();

        if (requestDTO.getItems() == null || requestDTO.getItems().isEmpty()) {
            throw new RuntimeException("error.order.empty_items");
        }

        BigDecimal subtotal = BigDecimal.ZERO;

        for (OrderItemRequestDTO itemDto : requestDTO.getItems()) {
            Product product = productRepository.findById(itemDto.getProductId())
                    .orElseThrow(() -> new RuntimeException("error.product.not_found"));

            com.project.inventory.dto.InventoryResponse inventory = inventoryService.getStock(product.getId());
            if (inventory == null || inventory.getAvailableStock() < itemDto.getQuantity()) {
                throw new RuntimeException("error.inventory.insufficient_stock");
            }

            OrderItem orderItem = OrderItem.builder()
                    .product(product)
                    .quantity(itemDto.getQuantity())
                    .price(product.getPrice())
                    .build();

            order.addOrderItem(orderItem);
            subtotal = subtotal.add(product.getPrice().multiply(BigDecimal.valueOf(itemDto.getQuantity())));
        }

        // Áp dụng mã giảm giá (nếu có)
        BigDecimal discountRate = resolveDiscountRate(requestDTO.getDiscountCode());
        BigDecimal discountAmount = subtotal.multiply(discountRate).setScale(0, RoundingMode.HALF_UP);
        BigDecimal discountedSubtotal = subtotal.subtract(discountAmount);

        // Đặt tạm để lưu (sẽ được cập nhật sau khi có phí ship)
        order.setTotalAmount(discountedSubtotal);

        // 1. Lưu Order trước để lấy ID dùng cho referenceId và Shipping
        Order savedOrder = orderRepository.saveAndFlush(order);
        
        // 2. Dự phòng (Reserve) kho với referenceId duy nhất cho từng sản phẩm trong đơn
        for (OrderItem item : savedOrder.getOrderItems()) {
            inventoryService.reserveStock(new InventoryRequest(
                item.getProduct().getId(), 
                item.getQuantity(), 
                "RESERVE-ORDER-" + savedOrder.getId() + "-ITEM-" + item.getId()
            ));
        }
        
        // 3. Tạo thông tin Shipping dựa trên Order đã có ID
        Shipping shipping = shippingService.createShippingForOrder(savedOrder, requestDTO.getShippingAddress());
        
        // Cập nhật lại tổng tiền = (subtotal - discount) + phí ship
        BigDecimal finalTotal = discountedSubtotal.add(shipping.getShippingCost());
        savedOrder.setTotalAmount(finalTotal);
        
        // 4. Thiết lập quan hệ 2 chiều
        savedOrder.setShipping(shipping);
        shipping.setOrder(savedOrder);

        // 5. Lưu lại toàn bộ (Cascade sẽ lưu Shipping)
        return orderRepository.save(savedOrder);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAllWithDetails();
    }

    @Override
    public List<Order> getOrderHistory(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public Order updateOrderStatus(Long orderId, OrderStatus status) {
        if (status == OrderStatus.CANCELLED) {
            cancelOrder(orderId);
            return getOrderById(orderId);
        }

        Order order = getOrderById(orderId);
        if (status == OrderStatus.PAID && order.getStatus() != OrderStatus.PAID) {
            for (OrderItem item : order.getOrderItems()) {
                inventoryService.confirmStock(new InventoryRequest(item.getProduct().getId(), item.getQuantity(), "CONFIRM-" + orderId + "-" + item.getId()));
            }
            paymentRepository.findByOrderId(orderId).ifPresent(p -> {
                p.setStatus(com.project.payment.entity.PaymentStatus.COMPLETED);
                paymentRepository.save(p);
            });
            if (order.getShipping() != null) {
                order.getShipping().setStatus(com.project.shipping.entity.ShippingStatus.IN_TRANSIT);
            }
        }
        order.setStatus(status);
        return orderRepository.save(order);
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() == OrderStatus.PAID || order.getStatus() == OrderStatus.SHIPPING || order.getStatus() == OrderStatus.DELIVERED) {
            throw new RuntimeException("error.order.cannot_cancel_status");
        }
        
        // Cancel reservation
        for(OrderItem item : order.getOrderItems()) {
            inventoryService.cancelReservation(new InventoryRequest(item.getProduct().getId(), item.getQuantity(), "CANCEL-" + orderId + "-" + item.getId()));
        }
        
        order.setStatus(OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void deleteOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
        
        order.setDeleted(true);
        // Soft delete items as well
        order.getOrderItems().forEach(item -> item.setDeleted(true));
        
        orderRepository.save(order);
    }

    @Override
    @Transactional
    public void restoreOrder(Long orderId) {
        Order order = orderRepository.findByIdIncludingDeleted(orderId)
                .orElseThrow(() -> new RuntimeException("error.order.not_found"));
        
        order.setDeleted(false);
        order.getOrderItems().forEach(item -> item.setDeleted(false));
        
        orderRepository.save(order);
    }

    @Override
    @Transactional(readOnly = true)
    public Order getOrderByGuest(Long orderId, String phone) {
        Order order = getOrderById(orderId);
        // Verify that the user associated with the order has the specified phone number
        if (order.getUser() != null && phone.equals(order.getUser().getPhone())) {
            return order;
        }
        throw new RuntimeException("error.order.not_found_or_unauthorized");
    }

    @Override
    @Transactional
    public void deleteAllOrders(Long userId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        for (Order o : orders) {
            paymentRepository.findByOrderId(o.getId()).ifPresent(p -> paymentRepository.delete(p));
            o.setDeleted(true);
            o.getOrderItems().forEach(item -> item.setDeleted(true));
            orderRepository.save(o);
        }
    }
}
