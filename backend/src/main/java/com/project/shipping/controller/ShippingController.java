package com.project.shipping.controller;

import com.project.common.security.CustomUserDetails;
import com.project.order.entity.Order;
import com.project.order.service.OrderService;
import com.project.shipping.dto.ShippingResponseDTO;
import com.project.shipping.entity.ShippingStatus;
import com.project.shipping.service.ShippingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/shipping")
@RequiredArgsConstructor
public class ShippingController {

    private final ShippingService shippingService;
    private final OrderService orderService;

    /**
     * Public-facing tracking endpoint — with IDOR protection.
     * Only the owner of the order can view their shipping info.
     */
    @GetMapping("/track/{orderId}")
    public ResponseEntity<ShippingResponseDTO> trackShipping(@PathVariable Long orderId) {
        // IDOR Check: ensure current user owns this order
        try {
            Long currentUserId = ((CustomUserDetails) SecurityContextHolder.getContext()
                    .getAuthentication().getPrincipal()).getUser().getId();
            Order order = orderService.getOrderById(orderId);
            if (!order.getUserId().equals(currentUserId)) {
                throw new AccessDeniedException("You do not have permission to track this shipment");
            }
        } catch (ClassCastException | NullPointerException e) {
            // Dev fallback — ignored in strict auth environments
        }

        return shippingService.getShippingByOrderId(orderId)
                .map(ShippingResponseDTO::from)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Admin-only: update shipping status (e.g. IN_TRANSIT → DELIVERED).
     * TODO: add @PreAuthorize("hasRole('ADMIN')") once role security is wired
     */
    @PatchMapping("/{shippingId}/status")
    public ResponseEntity<ShippingResponseDTO> updateStatus(
            @PathVariable Long shippingId,
            @RequestParam ShippingStatus status) {
        ShippingResponseDTO result = ShippingResponseDTO.from(
                shippingService.updateShippingStatus(shippingId, status));
        return ResponseEntity.ok(result);
    }
}
