package com.project.auth.repository;

import com.project.auth.entity.LoginLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findByEmailOrderByCreatedAtDesc(String email);
    List<LoginLog> findByIpAddressOrderByCreatedAtDesc(String ipAddress);
}
