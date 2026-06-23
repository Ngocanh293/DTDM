package com.project.payment.service;

import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;

import java.math.BigDecimal;

import java.util.Map;
import com.project.payment.dto.SePayIpnRequest;

public interface PaymentService {
    Payment createPayment(Long orderId, BigDecimal amount, String paymentMethod);
    Payment processPayment(Long paymentId);
    Payment getPaymentByOrderId(Long orderId);
    Payment getPaymentByOrderId(Long orderId, Long userId);
    Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId);

    Payment getPaymentById(Long id);
    Map<String, String> initiateSePayCheckout(Long paymentId);
    void processSePayIpn(SePayIpnRequest request);

    /**
     * Synchronizes local payments with SePay transaction history.
     */
    void syncWithSePay();

    /**
     * Reconciles a specific order against SePay transactions.
     */
    void reconcileOrder(Long orderId);
}
