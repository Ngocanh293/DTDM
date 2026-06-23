package com.project.notification.dto;

import com.project.notification.entity.NotificationStatus;
import com.project.notification.entity.NotificationType;

import java.time.LocalDateTime;

public class NotificationResponse {
    private final Long id;
    private final NotificationType type;
    private final String content;
    private final NotificationStatus status;
    private final boolean isRead;
    private final LocalDateTime createdAt;

    public NotificationResponse(Long id, NotificationType type, String content, NotificationStatus status, boolean isRead, LocalDateTime createdAt) {
        this.id = id;
        this.type = type;
        this.content = content;
        this.status = status;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public NotificationType getType() { return type; }
    public String getContent() { return content; }
    public NotificationStatus getStatus() { return status; }
    public boolean isRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
