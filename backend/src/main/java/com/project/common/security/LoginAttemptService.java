package com.project.common.security;

import com.project.auth.entity.LoginLog;
import com.project.auth.repository.LoginLogRepository;
import com.project.auth.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

import org.springframework.transaction.annotation.Propagation;

@Service
public class LoginAttemptService {

    private static final Logger logger = LoggerFactory.getLogger(LoginAttemptService.class);
    private static final int MAX_ATTEMPT = 5;
    private static final int LOCK_DURATION_MINUTES = 15;

    private final UserRepository userRepository;
    private final LoginLogRepository loginLogRepository;

    public LoginAttemptService(UserRepository userRepository, LoginLogRepository loginLogRepository) {
        this.userRepository = userRepository;
        this.loginLogRepository = loginLogRepository;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void logLoginAudit(String email, String ipAddress, boolean isSuccess, String reason) {
        LoginLog log = new LoginLog(email, ipAddress, isSuccess ? "SUCCESS" : "FAILED", reason);
        loginLogRepository.save(log);
    }

    @Transactional
    public void loginSucceeded(String email, String ipAddress) {
        userRepository.findByEmail(email).ifPresent(user -> {
            user.setFailedAttempts(0);
            user.setLockTime(null);
            user.setAccountNonLocked(true);
            userRepository.save(user);
        });

        // Ghi Audit
        logLoginAudit(email, ipAddress, true, "success.auth.login");
    }

    @Transactional
    public void loginFailed(String email, String ipAddress, String reason) {
        userRepository.findByEmail(email).ifPresent(user -> {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);

            if (attempts >= MAX_ATTEMPT) {
                user.setAccountNonLocked(false);
                user.setLockTime(LocalDateTime.now());
                logger.warn("[SECURITY] Tài khoản {} đã bị khóa do đăng nhập sai quá {} lần.", email, MAX_ATTEMPT);
            }
            userRepository.save(user);
        });

        // Ghi Audit
        logLoginAudit(email, ipAddress, false, reason);
    }

    @Transactional
    public boolean isAccountLocked(String email) {
        return userRepository.findByEmail(email).map(user -> {
            if (!user.isAccountNonLocked()) {
                if (user.getLockTime() != null && user.getLockTime().plusMinutes(LOCK_DURATION_MINUTES).isBefore(LocalDateTime.now())) {
                    // Auto-healing: Hết hạn khóa, tự động mở
                    user.setAccountNonLocked(true);
                    user.setLockTime(null);
                    user.setFailedAttempts(0);
                    userRepository.save(user);
                    logger.info("[AUTO-HEALING] Gỡ khóa chống dò mật khẩu cho tài khoản: {}", email);
                    return false;
                }
                return true;
            }
            return false;
        }).orElse(false);
    }

}
