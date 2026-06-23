package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.UserProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {

    // Tìm profile bởi object User (có xét SQLRestriction is_deleted = false)
    Optional<UserProfile> findByUser(User user);

    // Tìm profile bởi User ID
    @org.springframework.data.jpa.repository.Query("SELECT p FROM UserProfile p WHERE p.user.id = :userId")
    Optional<UserProfile> findByUserId(@org.springframework.data.repository.query.Param("userId") Long userId);

    // Bỏ qua SQLRestriction, tìm profile ẩn (soft-deleted) để khôi phục
    @org.springframework.data.jpa.repository.Query(value = "SELECT * FROM user_profiles WHERE user_id = :userId LIMIT 1", nativeQuery = true)
    Optional<UserProfile> findByUserIdIncludingDeleted(@org.springframework.data.repository.query.Param("userId") Long userId);
}
