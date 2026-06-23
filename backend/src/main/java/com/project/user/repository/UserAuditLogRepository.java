package com.project.user.repository;

import com.project.auth.entity.User;
import com.project.user.entity.UserAction;
import com.project.user.entity.UserAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserAuditLogRepository extends JpaRepository<UserAuditLog, Long> {
    List<UserAuditLog> findByUserOrderByCreatedAtDesc(User user);
    List<UserAuditLog> findByAction(UserAction action);
}
