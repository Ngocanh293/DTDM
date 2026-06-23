package com.project.common.repository;

import com.project.common.entity.SystemAlert;
import com.project.common.entity.SystemLogSeverity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {
    List<SystemAlert> findByModule(String module);
    List<SystemAlert> findBySeverity(SystemLogSeverity severity);
    List<SystemAlert> findByResolved(boolean resolved);
}
