package com.project.common.security;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Circuit Breaker tự triển khai cho các external service calls (Google OAuth2).
 * Không cần thêm Resilience4j dependency.
 *
 * Trạng thái:
 * - CLOSED  : Hoạt động bình thường, request được gửi đi
 * - OPEN    : Đã vượt ngưỡng lỗi, từ chối request ngay lập tức
 * - HALF_OPEN: Thử gửi 1 request để kiểm tra service đã phục hồi chưa
 *
 * Cấu hình:
 * - failureThreshold: 5 lần lỗi liên tiếp → mở Circuit
 * - resetTimeoutMs:   30 giây → chuyển sang HALF_OPEN để thử lại
 */
@Service
public class CircuitBreakerService {

    private static final Logger logger = LoggerFactory.getLogger(CircuitBreakerService.class);

    private static final int FAILURE_THRESHOLD = 5;
    private static final long RESET_TIMEOUT_MS = 30_000L;

    public enum State { CLOSED, OPEN, HALF_OPEN }

    private final AtomicReference<State> state = new AtomicReference<>(State.CLOSED);
    private final AtomicInteger failureCount = new AtomicInteger(0);
    private final AtomicLong lastFailureTime = new AtomicLong(0);

    /**
     * Kiểm tra Circuit Breaker có cho phép request qua không.
     *
     * @param serviceName Tên service — chỉ dùng cho logging
     * @return true nếu được phép, false nếu circuit đang OPEN
     */
    public boolean allowRequest(String serviceName) {
        State current = state.get();

        if (current == State.CLOSED) {
            return true;
        }

        if (current == State.OPEN) {
            long timeSinceLastFailure = System.currentTimeMillis() - lastFailureTime.get();
            if (timeSinceLastFailure >= RESET_TIMEOUT_MS) {
                // Chuyển sang HALF_OPEN để thử 1 request
                if (state.compareAndSet(State.OPEN, State.HALF_OPEN)) {
                    logger.info("[CIRCUIT BREAKER] {} → HALF_OPEN: Thử một request...", serviceName);
                }
                return true;
            }
            logger.warn("[CIRCUIT BREAKER] {} OPEN: Từ chối request.", serviceName);
            return false;
        }

        // HALF_OPEN: Cho phép 1 request thử
        return true;
    }

    /**
     * Ghi nhận request thành công — reset Circuit về CLOSED.
     */
    public void recordSuccess(String serviceName) {
        if (state.get() != State.CLOSED) {
            logger.info("[CIRCUIT BREAKER] {} → CLOSED: Service đã phục hồi.", serviceName);
        }
        state.set(State.CLOSED);
        failureCount.set(0);
    }

    /**
     * Ghi nhận request thất bại — tăng failure count và có thể mở Circuit.
     */
    public void recordFailure(String serviceName) {
        lastFailureTime.set(System.currentTimeMillis());
        int failures = failureCount.incrementAndGet();

        if (failures >= FAILURE_THRESHOLD) {
            if (state.compareAndSet(State.CLOSED, State.OPEN) ||
                state.compareAndSet(State.HALF_OPEN, State.OPEN)) {
                logger.error("[CIRCUIT BREAKER] {} → OPEN: {} lỗi liên tiếp. Tạm dừng 30 giây.",
                        serviceName, failures);
            }
        }
    }

    public State getState() {
        return state.get();
    }
}
