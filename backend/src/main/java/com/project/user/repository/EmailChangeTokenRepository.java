package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.EmailChangeToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailChangeTokenRepository extends JpaRepository<EmailChangeToken, Long> {
    Optional<EmailChangeToken> findByToken(String token);
    Optional<EmailChangeToken> findByUser(User user);
    void deleteByUser(User user);
}
