package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.PasswordChangeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PasswordChangeTokenRepository extends JpaRepository<PasswordChangeToken, Long> {

    Optional<PasswordChangeToken> findByUser(User user);

    Optional<PasswordChangeToken> findByUserAndOtpCode(User user, String otpCode);

    void deleteByUser(User user);
}
