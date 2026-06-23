package com.project.auth.service;

import com.project.auth.entity.JwtBlacklist;
import com.project.auth.repository.JwtBlacklistRepository;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.Base64;

/**
 * Dịch vụ quản lý JWT Blacklist với 2 tầng:
 * - L1: Caffeine Cache (in-memory) — tra cứu cực nhanh
 * - L2: Database (jwt_blacklist) — bền vững qua restart server
 */
@Service
public class JwtBlacklistService {

    private static final String CACHE_NAME = "jwtBlacklist";

    private final CacheManager cacheManager;
    private final JwtBlacklistRepository blacklistRepository;
    private final JwtService jwtService;

    public JwtBlacklistService(CacheManager cacheManager,
                               JwtBlacklistRepository blacklistRepository,
                               JwtService jwtService) {
        this.cacheManager = cacheManager;
        this.blacklistRepository = blacklistRepository;
        this.jwtService = jwtService;
    }

    /**
     * Vô hiệu hoá JWT: lưu vào cả Caffeine (L1) và DB (L2).
     * Tự động trích xuất thời gian hết hạn từ JWT claims.
     */
    @Transactional
    public void blacklistToken(String token) {
        String hash = hashToken(token);

        // L1: Caffeine
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            cache.put(hash, Boolean.TRUE);
        }

        // L2: Database — chỉ insert nếu chưa tồn tại
        if (!blacklistRepository.existsByTokenHash(hash)) {
            // Lấy thời gian hết hạn từ JWT để biết khi nào có thể dọn dẹp DB
            LocalDateTime expiresAt = extractExpiry(token);
            blacklistRepository.save(new JwtBlacklist(hash, expiresAt));
        }
    }

    /**
     * Kiểm tra JWT có bị blacklist không.
     * Ưu tiên L1 (cache) → fallback L2 (DB) khi cache miss (ví dụ sau restart).
     */
    public boolean isBlacklisted(String token) {
        String hash = hashToken(token);

        // L1: Kiểm tra Caffeine trước
        Cache cache = cacheManager.getCache(CACHE_NAME);
        if (cache != null) {
            Cache.ValueWrapper value = cache.get(hash);
            if (value != null) {
                return Boolean.TRUE.equals(value.get());
            }
        }

        // L2: Cache miss → truy vấn DB (xảy ra sau restart server)
        boolean inDb = blacklistRepository.existsByTokenHash(hash);
        if (inDb && cache != null) {
            // Warm lại L1 để lần sau không cần vào DB
            cache.put(hash, Boolean.TRUE);
        }
        return inDb;
    }

    /**
     * Hash SHA-256 của token để không lưu raw token vào DB.
     */
    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashBytes = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hashBytes);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 luôn có sẵn trong JVM chuẩn
            throw new RuntimeException("error.auth.hash_failed", e);
        }
    }

    /**
     * Trích xuất thời gian hết hạn từ JWT claims.
     */
    private LocalDateTime extractExpiry(String token) {
        try {
            java.util.Date expiration = jwtService.extractClaim(token,
                    io.jsonwebtoken.Claims::getExpiration);
            return expiration.toInstant()
                    .atZone(java.time.ZoneId.systemDefault())
                    .toLocalDateTime();
        } catch (Exception e) {
            // Fallback: 1 ngày nếu không đọc được expiry
            return LocalDateTime.now().plusDays(1);
        }
    }
}
