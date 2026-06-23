package com.project.payment.controller;

import com.project.common.security.CustomUserDetails;
import com.project.payment.dto.SePayIpnRequest;
import com.project.payment.entity.Payment;
import com.project.payment.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

/**
 * Controller for handling payment-related requests.
 * Refactored to follow Clean Architecture principles with thin controller logic.
 */
@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @Value("${sepay.ipn-secret-key}")
    private String ipnSecretKey;

    /**
     * Creates a new payment record for an order.
     */
    @PostMapping("/create")
    public ResponseEntity<Payment> createPayment(
            @RequestParam Long orderId,
            @RequestParam BigDecimal amount,
            @RequestParam String paymentMethod) {
        Payment payment = paymentService.createPayment(orderId, amount, paymentMethod);
        return ResponseEntity.ok(payment);
    }

    /**
     * Initiates a checkout process with SePay gateway.
     */
    @PostMapping("/{paymentId}/sepay-checkout")
    public ResponseEntity<Map<String, String>> initiateSePayCheckout(@PathVariable Long paymentId) {
        return ResponseEntity.ok(paymentService.initiateSePayCheckout(paymentId));
    }

    /**
     * Handles Instant Payment Notification (IPN) from SePay.
     */
    @PostMapping("/ipn")
    public ResponseEntity<Map<String, Boolean>> processSePayIpn(
            @RequestHeader(value = "X-Secret-Key", required = false) String receivedSecretKey,
            @RequestBody SePayIpnRequest ipnRequest) {

        // Xác thực X-Secret-Key theo tài liệu SePay IPN
        if (receivedSecretKey == null || !receivedSecretKey.equals(ipnSecretKey)) {
            return ResponseEntity.status(403).body(Map.of("success", false));
        }

        paymentService.processSePayIpn(ipnRequest);
        // SePay yêu cầu HTTP 200 để xác nhận nhận IPN thành công
        return ResponseEntity.ok(Map.of("success", true));
    }

    /**
     * Manually triggers a synchronization with SePay for all pending payments.
     */
    @PostMapping("/sync")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, String>> syncPayments() {
        paymentService.syncWithSePay();
        return ResponseEntity.ok(Map.of("message", "Synchronization process started"));
    }

    /**
     * Triggers reconciliation for a specific order.
     */
    @PostMapping("/reconcile/{orderId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN') or hasRole('EMPLOYEE')")
    public ResponseEntity<Map<String, String>> reconcileOrder(@PathVariable Long orderId) {
        paymentService.reconcileOrder(orderId);
        return ResponseEntity.ok(Map.of("message", "Reconciliation triggered for order #" + orderId));
    }

    /**
     * Retrieves payment information by order ID with security ownership check.
     */
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Payment> getPaymentByOrderId(
            @PathVariable Long orderId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        // Use IDOR protection logic moved to the service layer
        Long userId = (userDetails != null) ? userDetails.getUser().getId() : 1L; // Fallback for dev/mock
        Payment payment = paymentService.getPaymentByOrderId(orderId, userId);
        return ResponseEntity.ok(payment);
    }
}
