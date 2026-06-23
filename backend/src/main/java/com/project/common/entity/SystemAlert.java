package com.project.common.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_alerts")
public class SystemAlert extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String module;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private com.project.common.entity.SystemLogSeverity severity;

    @Column(nullable = false, length = 1000)
    private String message;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "is_resolved", nullable = false)
    private boolean resolved = false;

    private LocalDateTime resolvedAt;

    public SystemAlert() {
    }

    public SystemAlert(String module, com.project.common.entity.SystemLogSeverity severity, String message, String details) {
        this.module = module;
        this.severity = severity;
        this.message = message;
        this.details = details;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getModule() {
        return module;
    }

    public void setModule(String module) {
        this.module = module;
    }

    public com.project.common.entity.SystemLogSeverity getSeverity() {
        return severity;
    }

    public void setSeverity(com.project.common.entity.SystemLogSeverity severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public boolean isResolved() {
        return resolved;
    }

    public void setResolved(boolean resolved) {
        this.resolved = resolved;
    }

    public LocalDateTime getResolvedAt() {
        return resolvedAt;
    }

    public void setResolvedAt(LocalDateTime resolvedAt) {
        this.resolvedAt = resolvedAt;
    }
}
