package com.project.user.dto;

import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import java.time.LocalDateTime;

public class AdminUserResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private UserStatus status;
    private boolean isDeleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Long id, String email, String fullName, String phone, 
                            UserRole role, UserStatus status, boolean isDeleted, 
                            LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.phone = phone;
        this.role = role;
        this.status = status;
        this.isDeleted = isDeleted;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // --- Getters and Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }

    public boolean isDeleted() { return isDeleted; }
    public void setDeleted(boolean deleted) { isDeleted = deleted; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    // --- Manual Builder ---
    public static AdminUserResponseBuilder builder() {
        return new AdminUserResponseBuilder();
    }

    public static class AdminUserResponseBuilder {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private UserRole role;
        private UserStatus status;
        private boolean isDeleted;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        public AdminUserResponseBuilder id(Long id) { this.id = id; return this; }
        public AdminUserResponseBuilder email(String email) { this.email = email; return this; }
        public AdminUserResponseBuilder fullName(String fullName) { this.fullName = fullName; return this; }
        public AdminUserResponseBuilder phone(String phone) { this.phone = phone; return this; }
        public AdminUserResponseBuilder role(UserRole role) { this.role = role; return this; }
        public AdminUserResponseBuilder status(UserStatus status) { this.status = status; return this; }
        public AdminUserResponseBuilder isDeleted(boolean isDeleted) { this.isDeleted = isDeleted; return this; }
        public AdminUserResponseBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public AdminUserResponseBuilder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }

        public AdminUserResponse build() {
            return new AdminUserResponse(id, email, fullName, phone, role, status, isDeleted, createdAt, updatedAt);
        }
    }
}
