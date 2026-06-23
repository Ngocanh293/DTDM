package com.project.user.dto;

import java.time.LocalDateTime;

public class SessionResponse {

    private Long id;
    private LocalDateTime createdAt;
    private LocalDateTime expiryDate;
    private boolean expired;

    public SessionResponse() {
    }

    public SessionResponse(Long id, LocalDateTime createdAt, LocalDateTime expiryDate) {
        this.id = id;
        this.createdAt = createdAt;
        this.expiryDate = expiryDate;
        this.expired = expiryDate.isBefore(LocalDateTime.now());
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public boolean isExpired() { return expired; }
    public void setExpired(boolean expired) { this.expired = expired; }
}
