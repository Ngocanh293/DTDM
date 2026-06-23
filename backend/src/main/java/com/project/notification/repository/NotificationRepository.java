package com.project.notification.repository;

import com.project.auth.entity.User;
import com.project.notification.entity.Notification;
import com.project.notification.entity.NotificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    // Lấy thông báo của user (Mặc định lọc is_deleted = false)
    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    // Lấy thông báo theo trạng thái
    List<Notification> findByStatus(NotificationStatus status);

    List<Notification> findByUserAndIsRead(User user, boolean isRead);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    long deleteByCreatedAtBefore(java.time.LocalDateTime date);

    // Tìm kiếm thông báo bất kể trạng thái xóa
    @Query(value = "SELECT * FROM notifications WHERE id = :id", nativeQuery = true)
    Optional<Notification> findByIdIncludingDeleted(@Param("id") Long id);
}
