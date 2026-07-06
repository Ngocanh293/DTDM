package com.project.payment.service;

import com.project.payment.entity.Payment;
import com.project.payment.entity.PaymentStatus;
import com.project.payment.repository.PaymentRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.beans.factory.annotation.Value;
import com.project.payment.dto.SePayIpnRequest;
import com.project.payment.utils.SecurityUtils;
import com.project.order.service.OrderService;
import com.project.order.entity.OrderStatus;
import com.project.order.entity.Order;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.context.annotation.Lazy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import com.project.payment.dto.SePayTransactionResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.List;

@Service
public class PaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentServiceImpl.class);
    private final PaymentRepository paymentRepository;
    private final OrderService orderService;
    private final RestTemplate restTemplate = new RestTemplate();
    private static final String PAYMENT_NOT_FOUND_MSG = "Payment not found";
    private static final String DEFAULT_FRONTEND_URL = "https://pcestore.com";
    private static final Pattern INVOICE_ORDER_PATTERN = Pattern.compile("^INV-(\\d+)(?:-.+)?$");
    private static final Pattern CUSTOMER_ORDER_PATTERN = Pattern.compile("^CUST-(\\d+)$");

    @Autowired
    public PaymentServiceImpl(PaymentRepository paymentRepository, @Lazy OrderService orderService) {
        this.paymentRepository = paymentRepository;
        this.orderService = orderService;
    }

    @Value("${sepay.merchant-id}")
    private String merchantId;

    @Value("${sepay.secret-key}")
    private String secretKey;

    @Value("${custom.frontend.url}")
    private String frontendUrl;

    @Value("${sepay.api-token}")
    private String apiToken;

    @Override
    @Transactional
    public Payment createPayment(Long orderId, BigDecimal amount, String paymentMethod) {
        Payment payment = Payment.builder()
                .orderId(orderId)
                .amount(amount)
                .paymentMethod(paymentMethod)
                .status(PaymentStatus.PENDING)
                .build();
        return paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public Payment processPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));

        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setTransactionId(UUID.randomUUID().toString());
        payment.setPaymentDate(LocalDateTime.now());

        orderService.updateOrderStatus(payment.getOrderId(), OrderStatus.PAID);

        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG + " for Order ID: " + orderId));
    }

    @Override
    public Payment getPaymentByOrderId(Long orderId, Long userId) {
        Order order = orderService.getOrderById(orderId);
        if (order == null || !order.getUserId().equals(userId)) {
            throw new AccessDeniedException("You do not have permission to access this payment record");
        }
        return getPaymentByOrderId(orderId);
    }

    @Override
    @Transactional
    public Payment updatePaymentStatus(Long paymentId, PaymentStatus status, String transactionId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));
        payment.setStatus(status);
        if (transactionId != null) {
            payment.setTransactionId(transactionId);
        }
        if (status == PaymentStatus.COMPLETED) {
            payment.setPaymentDate(LocalDateTime.now());
        }
        return paymentRepository.save(payment);
    }

    @Override
    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));
    }

    @Override
    public Map<String, String> initiateSePayCheckout(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new IllegalArgumentException(PAYMENT_NOT_FOUND_MSG));

        Map<String, String> fields = new LinkedHashMap<>();
        fields.put("order_amount", payment.getAmount().setScale(0, java.math.RoundingMode.HALF_UP).toString());
        fields.put("merchant", merchantId);
        fields.put("currency", "VND");
        fields.put("operation", "PURCHASE");
        fields.put("order_description", "Thanh toan don hang DH-00" + payment.getOrderId());
        
        String uniqueInvoice = "INV-" + payment.getOrderId() + "-" + System.currentTimeMillis();
        fields.put("order_invoice_number", uniqueInvoice);
        
        fields.put("customer_id", "CUST-" + payment.getOrderId());
        fields.put("payment_method", "BANK_TRANSFER");
        fields.put("success_url", buildFrontendUrl("/order-success/" + payment.getOrderId() + "?status=success"));
        fields.put("error_url", buildFrontendUrl("/payment/" + payment.getOrderId() + "?status=error"));
        fields.put("cancel_url", buildFrontendUrl("/checkout?status=cancel"));

        String signature = SecurityUtils.generateSePaySignature(fields, secretKey);
        fields.put("signature", signature);

        return fields;
    }

    @Override
    @Transactional
    @Retryable(retryFor = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public void processSePayIpn(SePayIpnRequest request) {
        if (request == null || !"ORDER_PAID".equals(request.getNotificationType())) {
            log.info("Ignoring SePay IPN with notification_type={}",
                    request != null ? request.getNotificationType() : null);
            return;
        }

        Long orderId = resolveOrderId(request);
        if (orderId == null) {
            log.warn("Unable to resolve local order ID from SePay IPN payload");
            return;
        }

        paymentRepository.findByOrderId(orderId).ifPresentOrElse(payment -> {
            if (payment.getStatus() != PaymentStatus.PENDING) {
                log.info("Ignoring SePay IPN because order #{} payment is already {}", orderId, payment.getStatus());
                return;
            }

            BigDecimal paidAmount = resolvePaidAmount(request);
            if (paidAmount != null && paidAmount.compareTo(payment.getAmount()) < 0) {
                log.warn("Ignoring SePay IPN for order #{} because paid amount {} is less than expected {}",
                        orderId, paidAmount, payment.getAmount());
                return;
            }

            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setTransactionId(resolveTransactionId(request.getTransaction()));
            payment.setPaymentDate(LocalDateTime.now());
            paymentRepository.save(payment);
            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
            log.info("SePay IPN marked order #{} as PAID", orderId);
        }, () -> log.warn("SePay IPN resolved order #{} but no payment record was found", orderId));
    }

    @Override
    @Transactional
    public void syncWithSePay() {
        if (apiToken == null || apiToken.trim().isEmpty()) {
            log.warn("SePay API Token is not configured. Auto-reconciliation is disabled.");
            return;
        }

        try {
            log.info("Starting SePay transaction synchronization...");
            String url = "https://my.sepay.vn/userapi/transactions/list";
            
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + apiToken);
            HttpEntity<String> entity = new HttpEntity<>(headers);

            // Fetch as String first to log raw JSON
            String rawJson = restTemplate.exchange(url, HttpMethod.GET, entity, String.class).getBody();
            log.info("SePay API Raw Response: {}", rawJson);

            if (rawJson != null) {
                com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
                SePayTransactionResponse response = mapper.readValue(rawJson, SePayTransactionResponse.class);
                if (response != null && response.getTransactions() != null) {
                    processTransactions(response.getTransactions());
                }
            }
        } catch (Exception e) {
            log.error("Error during SePay sync: {}", e.getMessage());
            e.printStackTrace();
        }
    }

    @Override
    @Transactional
    public void reconcileOrder(Long orderId) {
        log.info("Manually reconciling order #{}", orderId);
        syncWithSePay();
    }

    private void processTransactions(List<SePayTransactionResponse.SePayTransactionDTO> transactions) {
        log.info("Processing {} transactions from SePay sync API", transactions.size());
        for (SePayTransactionResponse.SePayTransactionDTO tx : transactions) {
            String content = tx.getTransactionContent();
            if (content == null) {
                log.debug("Skipping transaction with null content (ID: {})", tx.getId());
                continue;
            }

            log.info("Analyzing SePay Transaction: Content='{}', Amount={}", content, tx.getAmountIn());

            Long orderId = extractOrderIdFromContent(content);
            if (orderId != null) {
                paymentRepository.findByOrderId(orderId).ifPresentOrElse(payment -> {
                    if (payment.getStatus() == PaymentStatus.PENDING) {
                        BigDecimal txAmount = new BigDecimal(tx.getAmountIn());
                        if (txAmount.compareTo(payment.getAmount()) >= 0) {
                            log.info("Reconciliation SUCCESS: Order #{} matched with amount {}. Updating to PAID.", orderId, txAmount);
                            payment.setStatus(PaymentStatus.COMPLETED);
                            payment.setTransactionId(tx.getReferenceNumber() != null ? tx.getReferenceNumber() : tx.getCode());
                            payment.setPaymentDate(LocalDateTime.now());
                            paymentRepository.save(payment);
                            orderService.updateOrderStatus(orderId, OrderStatus.PAID);
                        } else {
                            log.warn("Reconciliation FAILED for Order #{}: Amount {} is less than required {}.", orderId, txAmount, payment.getAmount());
                        }
                    } else {
                        log.info("Order #{} payment already has status: {}", orderId, payment.getStatus());
                    }
                }, () -> log.warn("Reconciliation FAILED: Order #{} extracted but no pending payment record found.", orderId));
            } else {
                log.debug("No Order ID found in content: '{}'", content);
            }
        }
    }

    private Long extractOrderIdFromContent(String content) {
        if (content == null) return null;
        content = content.toUpperCase();
        try {
            // Case 1: Broad prefix match (DH, INV, ORD, D)
            java.util.regex.Pattern p1 = java.util.regex.Pattern.compile("(?:DH|INV|ORD|D)[- ]*0*(\\d+)");
            java.util.regex.Matcher m1 = p1.matcher(content);
            if (m1.find()) {
                return Long.parseLong(m1.group(1));
            }
            
            // Case 2: Numeric fallback - find any number sequence of 1-6 digits not part of something else
            java.util.regex.Pattern p2 = java.util.regex.Pattern.compile("\\b(\\d{1,6})\\b");
            java.util.regex.Matcher m2 = p2.matcher(content);
            if (m2.find()) {
                return Long.parseLong(m2.group(1));
            }
        } catch (Exception e) {
            log.error("Error extracting order ID from content '{}': {}", content, e.getMessage());
        }
        return null;
    }

    private String buildFrontendUrl(String path) {
        String baseUrl = resolvePublicFrontendUrl();
        if (baseUrl.endsWith("/")) {
            baseUrl = baseUrl.substring(0, baseUrl.length() - 1);
        }
        return baseUrl + path;
    }

    private String resolvePublicFrontendUrl() {
        if (frontendUrl == null || frontendUrl.isBlank()) {
            return DEFAULT_FRONTEND_URL;
        }

        String configuredUrl = frontendUrl.trim();
        String lowerUrl = configuredUrl.toLowerCase(Locale.ROOT);
        if (lowerUrl.contains("localhost") || lowerUrl.contains("127.0.0.1") || lowerUrl.contains("0.0.0.0")) {
            log.warn("Ignoring non-public frontend URL '{}' for SePay return URLs", configuredUrl);
            return DEFAULT_FRONTEND_URL;
        }

        return configuredUrl;
    }

    private Long resolveOrderId(SePayIpnRequest request) {
        if (request.getOrder() != null) {
            Long orderId = parsePattern(request.getOrder().getOrderInvoiceNumber(), INVOICE_ORDER_PATTERN);
            if (orderId != null) {
                return orderId;
            }
        }

        if (request.getCustomer() != null) {
            return parsePattern(request.getCustomer().getCustomerId(), CUSTOMER_ORDER_PATTERN);
        }

        return null;
    }

    private Long parsePattern(String value, Pattern pattern) {
        if (value == null) {
            return null;
        }

        Matcher matcher = pattern.matcher(value.trim());
        if (!matcher.matches()) {
            return null;
        }

        try {
            return Long.valueOf(matcher.group(1));
        } catch (NumberFormatException ex) {
            log.warn("Unable to parse order ID from value '{}'", value);
            return null;
        }
    }

    private BigDecimal resolvePaidAmount(SePayIpnRequest request) {
        if (request.getTransaction() != null && request.getTransaction().getTransactionAmount() != null) {
            return parseAmount(request.getTransaction().getTransactionAmount());
        }
        if (request.getOrder() != null && request.getOrder().getOrderAmount() != null) {
            return parseAmount(request.getOrder().getOrderAmount());
        }
        return null;
    }

    private BigDecimal parseAmount(String amount) {
        try {
            return new BigDecimal(amount.trim());
        } catch (RuntimeException ex) {
            log.warn("Unable to parse SePay amount '{}'", amount);
            return null;
        }
    }

    private String resolveTransactionId(SePayIpnRequest.TransactionData transaction) {
        if (transaction == null) {
            return null;
        }
        if (transaction.getTransactionId() != null && !transaction.getTransactionId().isBlank()) {
            return transaction.getTransactionId();
        }
        return transaction.getId();
    }
}
