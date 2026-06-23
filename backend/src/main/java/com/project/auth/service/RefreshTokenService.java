package com.project.auth.service;

import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import com.project.auth.repository.RefreshTokenRepository;
import com.project.auth.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class RefreshTokenService {

    // Số thiết bị tối đa được phép đăng nhập đồng thời — session cũ nhất sẽ bị dọn
    private static final int MAX_ACTIVE_SESSIONS = 5;

    @Value("${application.security.jwt.refresh-token.expiration}")
    private long refreshTokenDurationMs;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;

    public RefreshTokenService(RefreshTokenRepository refreshTokenRepository, UserRepository userRepository) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
    }

    public Optional<RefreshToken> findByToken(String token) {
        return refreshTokenRepository.findByToken(token);
    }

    @Transactional
    public RefreshToken createRefreshToken(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));

        // [FIX] Kiểm soát số thiết bị: nếu vượt giới hạn, xóa session cũ nhất
        int activeSessions = refreshTokenRepository.countByUser(user);
        if (activeSessions >= MAX_ACTIVE_SESSIONS) {
            refreshTokenRepository.deleteOldestByUser(user);
        }

        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusSeconds(refreshTokenDurationMs / 1000);
        RefreshToken refreshToken = new RefreshToken(user, token, expiryDate);
        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyExpiration(RefreshToken token) {
        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new IllegalArgumentException("error.auth.refresh_expired");
        }
        return token;
    }

    @Transactional
    public void deleteToken(RefreshToken token) {
        refreshTokenRepository.delete(token);
    }

    @Transactional
    public int deleteByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("error.auth.user_not_found"));
        return refreshTokenRepository.deleteByUser(user);
    }

    // [FIX] Xóa TẤT CẢ refresh token của user theo email (dùng cho logout-all)
    @Transactional
    public int deleteAllByEmail(String email) {
        return userRepository.findByEmail(email)
                .map(refreshTokenRepository::deleteByUser)
                .orElse(0);
    }

    // Tương thích ngược — tìm token đầu tiên theo email (logout thiết bị hiện tại)
    public Optional<RefreshToken> findFirstByUserEmail(String email) {
        return userRepository.findByEmail(email)
                .flatMap(refreshTokenRepository::findFirstByUserOrderByExpiryDateAsc);
    }
}
