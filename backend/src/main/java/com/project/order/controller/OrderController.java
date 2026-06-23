package com.project.order.controller;

import com.project.order.dto.OrderRequestDTO;
import com.project.order.entity.Order;
import com.project.order.service.OrderService;
import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import com.project.shipping.entity.ShippingStatus;
import com.project.shipping.service.ShippingService;
import com.project.cart.service.CartService;
import com.project.user.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import org.springframework.security.core.context.SecurityContextHolder;
import com.project.common.security.CustomUserDetails;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;
    private final ShippingService shippingService;
    private final CartService cartService;
    private final UserProfileRepository userProfileRepository;

    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createOrder(@jakarta.validation.Valid @RequestBody OrderRequestDTO requestDTO) {
        // Enforce secure user assignment if token exists
        try {
            Long userId = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser().getId();
            requestDTO.setUserId(userId);
        } catch (Exception e) {
            // Fallback for current mocked setup if unauthenticated (should be removed in harsh prod)
            if (requestDTO.getUserId() == null) requestDTO.setUserId(1L);
        }

        // 1. Create order
        Order order = orderService.createOrder(requestDTO);

        // 2. Create payment automatically based on total amount and payment method
        String paymentMethod = (requestDTO.getPaymentMethod() != null) ? requestDTO.getPaymentMethod() : "MOCK";
        Payment payment = paymentService.createPayment(order.getId(), order.getTotalAmount(), paymentMethod);

        Map<String, Object> response = new HashMap<>();
        response.put("orderId", order.getId());
        response.put("payment", payment);

        // 3. Clear customer cart after successful order creation
        try {
            com.project.auth.entity.User user = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser();
            cartService.clearCart(user);
        } catch (Exception e) {
            // Mock fallback if user is hardcoded to 1L
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getOrderById(@PathVariable Long id) {
        Order o = orderService.getOrderById(id);
        Map<String, Object> response = mapOrderToResponse(o);
        
        // Add items which are usually needed for details but not list
        java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
        for (com.project.order.entity.OrderItem item : o.getOrderItems()) {
            Map<String, Object> iMap = new HashMap<>();
            iMap.put("productName", item.getProduct().getName());
            iMap.put("imageUrl", item.getProduct().getImageUrl());
            iMap.put("quantity", item.getQuantity());
            iMap.put("price", item.getPrice());
            items.add(iMap);
        }
        response.put("items", items);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Map<String, Object>>> getOrderHistory() {
        Long userId = 1L; // Fallback mock
        try {
            userId = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser().getId();
        } catch (Exception e) {
           // ignored mock
        }
        
        List<Order> orders = orderService.getOrderHistory(userId);
        java.util.ArrayList<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Order o : orders) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", o.getId());
            map.put("totalAmount", o.getTotalAmount());
            map.put("status", o.getStatus());
            map.put("orderDate", o.getOrderDate());
            if (o.getShipping() != null) {
                com.project.shipping.entity.Shipping current = o.getShipping();
                Map<String, Object> sMap = new HashMap<>();
                sMap.put("status", current.getStatus());
                sMap.put("trackingCode", current.getTrackingCode());
                sMap.put("deliveryAddress", current.getDeliveryAddress());
                map.put("shipping", sMap);

                // CQS Fix: delegate status transition to ShippingService, not here
                if (current.getStatus() == ShippingStatus.IN_TRANSIT) {
                    shippingService.updateShippingStatus(current.getId(), ShippingStatus.DELIVERED);
                }
            }
            
            Payment payment = paymentService.getPaymentByOrderId(o.getId());
            if (payment != null) {
                map.put("paymentStatus", payment.getStatus());
                map.put("paymentMethod", payment.getPaymentMethod());
            }
            // Móc nối danh sách sản phẩm
            java.util.List<Map<String, Object>> items = new java.util.ArrayList<>();
            for (com.project.order.entity.OrderItem item : o.getOrderItems()) {
                Map<String, Object> iMap = new HashMap<>();
                iMap.put("productName", item.getProduct().getName());
                iMap.put("imageUrl", item.getProduct().getImageUrl());
                iMap.put("quantity", item.getQuantity());
                iMap.put("price", item.getPrice());
                items.add(iMap);
            }
            map.put("items", items);
            result.add(map);
        }
        return ResponseEntity.ok(result);
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<String> cancelOrder(@PathVariable Long id) {
        orderService.cancelOrder(id);
        return ResponseEntity.ok("Order cancelled successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.ok("Order deleted successfully");
    }

    @DeleteMapping("/history/all")
    public ResponseEntity<String> deleteAllOrders() {
        Long userId = 1L; // Fallback mock
        try {
            userId = ((CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal()).getUser().getId();
        } catch (Exception e) {
           // ignored mock
        }
        orderService.deleteAllOrders(userId);
        return ResponseEntity.ok("All orders deleted successfully");
    }

    // --- Admin Endpoints ---

    @GetMapping("/admin/all")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<List<Map<String, Object>>> getAllOrdersForAdmin() {
        List<Order> orders = orderService.getAllOrders();
        java.util.List<Map<String, Object>> result = new java.util.ArrayList<>();
        for (Order o : orders) {
            result.add(mapOrderToResponse(o));
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/admin/{orderId}/status")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, Object>> updateOrderStatus(
            @PathVariable Long orderId, 
            @RequestParam com.project.order.entity.OrderStatus status) {
        Order updated = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(mapOrderToResponse(updated));
    }

    private Map<String, Object> mapOrderToResponse(Order o) {
        Map<String, Object> map = new HashMap<>();
        map.put("id", o.getId());
        map.put("totalAmount", o.getTotalAmount());
        map.put("status", o.getStatus());
        map.put("orderDate", (o.getOrderDate() != null ? o.getOrderDate() : o.getCreatedAt()));
        
        // Customer info
        String name = "Khách hàng";
        String email = o.getCreatedBy();
        String phone = "Chưa cập nhật";
        
        if (o.getUser() != null) {
            name = o.getUser().getFullName() != null ? o.getUser().getFullName() : o.getUser().getEmail();
            email = o.getUser().getEmail();
            phone = o.getUser().getPhone();
            
            // Fallback to UserProfile if User.phone is null
            if (phone == null || phone.trim().isEmpty()) {
                userProfileRepository.findByUserId(o.getUser().getId())
                    .ifPresent(profile -> {
                        if (profile.getPhone() != null) {
                            o.getUser().setPhone(profile.getPhone()); // Carry over for this response
                        }
                    });
                phone = o.getUser().getPhone() != null ? o.getUser().getPhone() : "Chưa cập nhật";
            }
        } else if (o.getCreatedBy() != null && o.getCreatedBy().contains("@")) {
            name = o.getCreatedBy().split("@")[0];
        }
        
        map.put("customerName", name);
        map.put("customerEmail", email);
        map.put("customerPhone", phone);

        // Shipping Address object for frontend modal expectations
        Map<String, Object> addrMap = new HashMap<>();
        addrMap.put("fullName", name);
        addrMap.put("phone", phone);
        addrMap.put("street", (o.getShippingAddress() != null ? o.getShippingAddress() : ""));
        addrMap.put("city", ""); // Optional
        map.put("shippingAddress", addrMap);

        // Shipping status info
        if (o.getShipping() != null) {
            Map<String, Object> sMap = new HashMap<>();
            sMap.put("status", o.getShipping().getStatus());
            sMap.put("trackingCode", o.getShipping().getTrackingCode());
            sMap.put("deliveryAddress", o.getShipping().getDeliveryAddress());
            map.put("shipping", sMap);
        }

        // Payment info
        Payment p = paymentService.getPaymentByOrderId(o.getId());
        if (p != null) {
            map.put("paymentStatus", p.getStatus());
            map.put("paymentMethod", p.getPaymentMethod());
        }

        return map;
    }

    @GetMapping("/guest-track")
    public ResponseEntity<Map<String, Object>> guestTrack(
            @RequestParam String phone,
            @RequestParam String orderCode) {
        
        Long orderId;
        try {
            // Clean up code like "DH-001" to get numerical "1"
            String cleanId = orderCode.replaceAll("[^0-9]", "");
            orderId = Long.parseLong(cleanId);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }

        Order order = orderService.getOrderByGuest(orderId, phone);
        return ResponseEntity.ok(mapOrderToResponse(order));
    }

    @GetMapping("/payments/{paymentId}/sepay-fields")
    public ResponseEntity<Map<String, String>> getSePayFields(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.initiateSePayCheckout(paymentId));
    }
}
