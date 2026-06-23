package com.project.auth.repository;

import com.project.auth.entity.EmailVerificationToken;
import com.project.auth.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    @EntityGraph(attributePaths = {"user"})
    Optional<EmailVerificationToken> findByToken(String token);
    
    Optional<EmailVerificationToken> findByUser(User user);
    
    @Modifying
    @Query("DELETE FROM EmailVerificationToken e WHERE e.user = :user")
    void deleteByUser(@Param("user") User user);

    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query("DELETE FROM EmailVerificationToken e WHERE e.token = :token")
    int deleteByToken(@Param("token") String token);
}
