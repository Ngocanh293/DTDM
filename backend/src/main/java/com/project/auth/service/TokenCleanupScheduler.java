package com.project.auth.service;

import com.project.auth.repository.JwtBlacklistRepository;
import com.project.auth.repository.RefreshTokenRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class TokenCleanupScheduler {

    private static final Logger logger = LoggerFactory.getLogger(TokenCleanupScheduler.class);

    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtBlacklistRepository jwtBlacklistRepository;

    public TokenCleanupScheduler(RefreshTokenRepository refreshTokenRepository,
                                 JwtBlacklistRepository jwtBlacklistRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.jwtBlacklistRepository = jwtBlacklistRepository;
    }

    /**
     * Cron = mỗi ngày lúc 00:00:00.
     * Dọn sạch Refresh Token hết hạn và JWT Blacklist entries hết hạn.
     */
    @Scheduled(cron = "0 0 0 * * *")
    @Transactional
    public void scheduleExpiredTokenCleanup() {
        LocalDateTime now = LocalDateTime.now();

        int deletedRefresh = refreshTokenRepository.deleteByExpiryDateBefore(now);
        logger.info("[CRON] Giải phóng {} refresh token hết hạn.", deletedRefresh);

        // [MỚI] Dọn JWT blacklist entries hết hạn — không còn cần thiết trong DB
        int deletedBlacklist = jwtBlacklistRepository.deleteByExpiresAtBefore(now);
        logger.info("[CRON] Giải phóng {} JWT blacklist entry hết hạn.", deletedBlacklist);
    }
}
