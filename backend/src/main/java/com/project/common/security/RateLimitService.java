package com.project.common.security;

import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.concurrent.TimeUnit;

/**
 * Dịch vụ Rate Limiting dùng Bucket4j (Token Bucket algorithm) + Caffeine.
 * Mỗi IP có một Bucket riêng cho từng loại endpoint.
 *
 * Chiến lược:
 * - Login:              10 req / phút
 * - Forgot password:    3  req / 15 phút
 * - Resend verify:      3  req / 15 phút
 * - Reset password:     5  req / 5 phút
 */
@Service
public class RateLimitService {

    // Cache riêng cho mỗi loại endpoint — tự động expire khi không dùng
    private final Cache<String, Bucket> loginBuckets;
    private final Cache<String, Bucket> forgotPasswordBuckets;
    private final Cache<String, Bucket> resendVerifyBuckets;
    private final Cache<String, Bucket> resetPasswordBuckets;

    public RateLimitService() {
        this.loginBuckets = Caffeine.newBuilder()
                .expireAfterAccess(1, TimeUnit.MINUTES)
                .maximumSize(10000)
                .build();

        this.forgotPasswordBuckets = Caffeine.newBuilder()
                .expireAfterAccess(15, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build();

        this.resendVerifyBuckets = Caffeine.newBuilder()
                .expireAfterAccess(15, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build();

        this.resetPasswordBuckets = Caffeine.newBuilder()
                .expireAfterAccess(5, TimeUnit.MINUTES)
                .maximumSize(5000)
                .build();
    }

    /** Kiểm tra rate limit cho login: 10 req/phút/IP */
    public boolean tryConsumeLogin(String ip) {
        return getBucket(loginBuckets, ip, 10, Duration.ofMinutes(1)).tryConsume(1);
    }

    /** Kiểm tra rate limit cho forgot-password: 3 req/15 phút/IP */
    public boolean tryConsumeForgotPassword(String ip) {
        return getBucket(forgotPasswordBuckets, ip, 3, Duration.ofMinutes(15)).tryConsume(1);
    }

    /** Kiểm tra rate limit cho resend-verification: 3 req/15 phút/IP */
    public boolean tryConsumeResendVerify(String ip) {
        return getBucket(resendVerifyBuckets, ip, 3, Duration.ofMinutes(15)).tryConsume(1);
    }

    /** Kiểm tra rate limit cho reset-password: 5 req/5 phút/IP */
    public boolean tryConsumeResetPassword(String ip) {
        return getBucket(resetPasswordBuckets, ip, 5, Duration.ofMinutes(5)).tryConsume(1);
    }

    private Bucket getBucket(Cache<String, Bucket> cache, String key, long capacity, Duration refillPeriod) {
        return cache.get(key, k -> {
            Bandwidth limit = Bandwidth.builder()
                    .capacity(capacity)
                    .refillGreedy(capacity, refillPeriod)
                    .build();
            return Bucket.builder().addLimit(limit).build();
        });
    }
}
