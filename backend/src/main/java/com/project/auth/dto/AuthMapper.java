package com.project.auth.dto;

import com.project.auth.entity.RefreshToken;
import com.project.auth.entity.User;

/**
 * Mapper tập trung cho việc chuyển đổi giữa User entity và Auth DTO.
 * Tránh xây dựng AuthResponse rải rác nhiều nơi, giúp dễ bảo trì.
 */
public class AuthMapper {

    private AuthMapper() {
        // Lớp tiện ích — không khởi tạo
    }

    /**
     * Tạo AuthResponse đầy đủ từ User, JWT và Refresh Token.
     */
    public static AuthResponse toAuthResponse(User user, String accessToken, RefreshToken refreshToken) {
        return new AuthResponse(
                accessToken,
                refreshToken.getToken(),
                user.getRole().name(),
                user.getId()
        );
    }

    /**
     * Tạo AuthResponse yêu cầu bước MFA (chưa có token).
     */
    public static AuthResponse toMfaRequiredResponse() {
        AuthResponse response = new AuthResponse();
        response.setMfaRequired(true);
        return response;
    }
}
