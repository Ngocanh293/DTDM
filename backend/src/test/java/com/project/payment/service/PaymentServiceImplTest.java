package com.project.payment.service;

import com.project.order.entity.OrderStatus;
import com.project.order.service.OrderService;
import com.project.payment.dto.SePayIpnRequest;
import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;
import com.project.payment.repository.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceImplTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private OrderService orderService;

    private PaymentServiceImpl paymentService;

    @BeforeEach
    void setUp() {
        paymentService = new PaymentServiceImpl(paymentRepository, orderService);
        ReflectionTestUtils.setField(paymentService, "merchantId", "SP-LIVE-TEST");
        ReflectionTestUtils.setField(paymentService, "secretKey", "test-secret");
        ReflectionTestUtils.setField(paymentService, "frontendUrl", "https://pcestore.com/");
    }

    @Test
    void initiateSePayCheckoutUsesProductionReturnUrls() {
        Payment payment = Payment.builder()
                .id(7L)
                .orderId(42L)
                .amount(new BigDecimal("100000"))
                .paymentMethod("BANK_TRANSFER")
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findById(7L)).thenReturn(Optional.of(payment));

        Map<String, String> fields = paymentService.initiateSePayCheckout(7L);

        assertEquals("https://pcestore.com/order-success/42?status=success", fields.get("success_url"));
        assertEquals("https://pcestore.com/payment/42?status=error", fields.get("error_url"));
        assertEquals("https://pcestore.com/checkout?status=cancel", fields.get("cancel_url"));
        assertFalse(fields.get("success_url").contains("localhost"));
        assertNotNull(fields.get("signature"));
    }

    @Test
    void initiateSePayCheckoutIgnoresLocalhostFrontendUrl() {
        ReflectionTestUtils.setField(paymentService, "frontendUrl", "http://localhost:3000");
        Payment payment = Payment.builder()
                .id(7L)
                .orderId(42L)
                .amount(new BigDecimal("100000"))
                .paymentMethod("BANK_TRANSFER")
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findById(7L)).thenReturn(Optional.of(payment));

        Map<String, String> fields = paymentService.initiateSePayCheckout(7L);

        assertEquals("https://pcestore.com/order-success/42?status=success", fields.get("success_url"));
        assertEquals("https://pcestore.com/payment/42?status=error", fields.get("error_url"));
        assertEquals("https://pcestore.com/checkout?status=cancel", fields.get("cancel_url"));
    }

    @Test
    void processSePayIpnMarksPaymentAndOrderPaid() {
        Payment payment = Payment.builder()
                .id(7L)
                .orderId(42L)
                .amount(new BigDecimal("100000"))
                .paymentMethod("BANK_TRANSFER")
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findByOrderId(42L)).thenReturn(Optional.of(payment));

        paymentService.processSePayIpn(createPaidIpn("INV-42-123456789", null, "TXN-123", "100000.00"));

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        assertEquals("TXN-123", payment.getTransactionId());
        assertNotNull(payment.getPaymentDate());
        verify(paymentRepository).save(payment);
        verify(orderService).updateOrderStatus(42L, OrderStatus.PAID);
    }

    @Test
    void processSePayIpnFallsBackToCustomerIdForOrderResolution() {
        Payment payment = Payment.builder()
                .id(8L)
                .orderId(43L)
                .amount(new BigDecimal("50000"))
                .paymentMethod("BANK_TRANSFER")
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findByOrderId(43L)).thenReturn(Optional.of(payment));

        paymentService.processSePayIpn(createPaidIpn("UNEXPECTED-43", "CUST-43", "TXN-456", "50000"));

        assertEquals(PaymentStatus.COMPLETED, payment.getStatus());
        verify(orderService).updateOrderStatus(43L, OrderStatus.PAID);
    }

    @Test
    void processSePayIpnDoesNotCompletePaymentWhenAmountIsTooLow() {
        Payment payment = Payment.builder()
                .id(9L)
                .orderId(44L)
                .amount(new BigDecimal("100000"))
                .paymentMethod("BANK_TRANSFER")
                .status(PaymentStatus.PENDING)
                .build();
        when(paymentRepository.findByOrderId(44L)).thenReturn(Optional.of(payment));

        paymentService.processSePayIpn(createPaidIpn("INV-44-123456789", null, "TXN-789", "50000"));

        assertEquals(PaymentStatus.PENDING, payment.getStatus());
        verify(paymentRepository, never()).save(payment);
        verify(orderService, never()).updateOrderStatus(44L, OrderStatus.PAID);
    }

    private SePayIpnRequest createPaidIpn(String invoiceNumber, String customerId, String transactionId, String amount) {
        SePayIpnRequest request = new SePayIpnRequest();
        request.setNotificationType("ORDER_PAID");

        SePayIpnRequest.OrderData order = new SePayIpnRequest.OrderData();
        order.setOrderInvoiceNumber(invoiceNumber);
        order.setOrderAmount(amount);
        request.setOrder(order);

        SePayIpnRequest.TransactionData transaction = new SePayIpnRequest.TransactionData();
        transaction.setTransactionId(transactionId);
        transaction.setTransactionAmount(amount);
        request.setTransaction(transaction);

        if (customerId != null) {
            SePayIpnRequest.CustomerData customer = new SePayIpnRequest.CustomerData();
            customer.setCustomerId(customerId);
            request.setCustomer(customer);
        }

        return request;
    }
}
