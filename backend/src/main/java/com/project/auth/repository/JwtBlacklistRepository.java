package com.project.auth.repository;

import com.project.auth.entity.JwtBlacklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface JwtBlacklistRepository extends JpaRepository<JwtBlacklist, Long> {

    // Kiểm tra token_hash có trong blacklist không (dùng hash để tránh lưu token raw)
    boolean existsByTokenHash(String tokenHash);

    // Dọn dẹp các entry đã qua hạn — gọi bởi scheduler hàng đêm
    @Modifying
    @Query("DELETE FROM JwtBlacklist j WHERE j.expiresAt < :now")
    int deleteByExpiresAtBefore(@Param("now") LocalDateTime now);
}
