package com.project.common.service;

import com.project.common.entity.SystemAlert;
import com.project.common.entity.SystemLogSeverity;
import com.project.common.repository.SystemAlertRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class SystemAlertService {

    private static final Logger logger = LoggerFactory.getLogger(SystemAlertService.class);

    private final SystemAlertRepository alertRepository;

    public SystemAlertService(SystemAlertRepository alertRepository) {
        this.alertRepository = alertRepository;
    }

    /**
     * Ghi nhận một cảnh báo hệ thống mới.
     * Sử dụng REQUIRES_NEW để đảm bảo alert được lưu ngay cả khi giao dịch của module gọi bị rollback.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void createAlert(String module, SystemLogSeverity severity, String message, Exception ex) {
        String details = ex != null ? getBriefStackTrace(ex) : null;
        SystemAlert alert = new SystemAlert(module, severity, message, details);
        alertRepository.save(alert);
        
        logger.warn("[SYSTEM-ALERT] Module: {}, Severity: {}, Message: {}", module, severity, message);
    }

    @Transactional
    public void resolveAlert(Long alertId) {
        alertRepository.findById(alertId).ifPresent(alert -> {
            alert.setResolved(true);
            alert.setResolvedAt(LocalDateTime.now());
            alertRepository.save(alert);
        });
    }

    private String getBriefStackTrace(Throwable ex) {
        StringBuilder sb = new StringBuilder();
        sb.append(ex.toString()).append("\n");
        StackTraceElement[] elements = ex.getStackTrace();
        for (int i = 0; i < Math.min(elements.length, 10); i++) {
            sb.append("\tat ").append(elements[i].toString()).append("\n");
        }
        return sb.toString();
    }
}
