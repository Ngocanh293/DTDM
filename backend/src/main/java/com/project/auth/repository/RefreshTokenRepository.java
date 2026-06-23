package com.project.auth.repository;

import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

    // Tìm Refresh Token dựa trên chuỗi token
    Optional<RefreshToken> findByToken(String token);

    // [FIX] Trả về TẤT CẢ token của user — hỗ trợ đăng nhập đa thiết bị
    List<RefreshToken> findAllByUser(User user);

    // Tìm token duy nhất (backward compat, dùng nội bộ)
    Optional<RefreshToken> findFirstByUserOrderByExpiryDateAsc(User user);

    // Đếm số session đang hoạt động của user
    int countByUser(User user);

    // Xóa tất cả Refresh Token của một người dùng
    @Modifying
    int deleteByUser(User user);

    // Xóa token cũ nhất khi user đạt giới hạn thiết bị
    @Modifying
    @Query("DELETE FROM RefreshToken rt WHERE rt.id = " +
           "(SELECT MIN(r.id) FROM RefreshToken r WHERE r.user = :user)")
    void deleteOldestByUser(@Param("user") User user);

    // Xóa hàng loạt các Token đã quá hạn ngày (Dọn rác DB)
    @Modifying
    int deleteByExpiryDateBefore(java.time.LocalDateTime now);
}
