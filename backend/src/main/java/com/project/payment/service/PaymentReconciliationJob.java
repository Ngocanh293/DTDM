package com.project.payment.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

/**
 * Scheduled job to periodically reconcile pending payments with SePay transaction history.
 */
@Service
@RequiredArgsConstructor
public class PaymentReconciliationJob {

    private static final Logger log = LoggerFactory.getLogger(PaymentReconciliationJob.class);
    private final PaymentService paymentService;

    /**
     * Executes every 2 minutes. 
     * Initial delay of 30 seconds to allow backend to warm up.
     */
    @Scheduled(fixedDelay = 120000, initialDelay = 30000)
    public void runReconciliation() {
        try {
            log.info("Cron: Starting periodic SePay payment reconciliation...");
            paymentService.syncWithSePay();
        } catch (Exception e) {
            log.error("Cron: Error during periodic reconciliation: {}", e.getMessage());
        }
    }
}
