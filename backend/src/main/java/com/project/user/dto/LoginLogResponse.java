package com.project.user.dto;

import java.time.LocalDateTime;

public class LoginLogResponse {

    private Long id;
    private String ipAddress;
    private String status;   // SUCCESS | FAILED
    private String reason;
    private LocalDateTime createdAt;

    public LoginLogResponse() {
    }

    public LoginLogResponse(Long id, String ipAddress, String status, String reason, LocalDateTime createdAt) {
        this.id = id;
        this.ipAddress = ipAddress;
        this.status = status;
        this.reason = reason;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getIpAddress() { return ipAddress; }
    public void setIpAddress(String ipAddress) { this.ipAddress = ipAddress; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
