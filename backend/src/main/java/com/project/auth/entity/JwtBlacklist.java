package com.project.auth.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lưu trữ danh sách JWT đã bị vô hiệu hoá (blacklist) vào database.
 * Thay thế Caffeine in-memory đơn thuần — an toàn khi server restart.
 */
@Entity
@Table(name = "jwt_blacklist", indexes = {
        @Index(name = "idx_jwt_blacklist_token_hash", columnList = "token_hash", unique = true),
        @Index(name = "idx_jwt_blacklist_expiry", columnList = "expires_at")
})
public class JwtBlacklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // SHA-256 hash của token để tiết kiệm storage và tránh lưu token nhạy cảm
    @Column(name = "token_hash", nullable = false, unique = true, length = 64)
    private String tokenHash;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "blacklisted_at", nullable = false, updatable = false)
    private LocalDateTime blacklistedAt = LocalDateTime.now();

    public JwtBlacklist() {}

    public JwtBlacklist(String tokenHash, LocalDateTime expiresAt) {
        this.tokenHash = tokenHash;
        this.expiresAt = expiresAt;
        this.blacklistedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTokenHash() { return tokenHash; }
    public void setTokenHash(String tokenHash) { this.tokenHash = tokenHash; }

    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }

    public LocalDateTime getBlacklistedAt() { return blacklistedAt; }
    public void setBlacklistedAt(LocalDateTime blacklistedAt) { this.blacklistedAt = blacklistedAt; }
}
