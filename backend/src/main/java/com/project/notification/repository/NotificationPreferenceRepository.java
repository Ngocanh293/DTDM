package com.project.notification.repository;

import com.project.auth.entity.User;
import com.project.notification.entity.NotificationPreference;
import com.project.notification.entity.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationPreferenceRepository extends JpaRepository<NotificationPreference, Long> {
    List<NotificationPreference> findByUser(User user);
    Optional<NotificationPreference> findByUserAndType(User user, NotificationType type);
}
