package com.project.common.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.MessageSource;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
public class CustomAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private final MessageSource messageSource;

    public CustomAuthenticationEntryPoint(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    // Nơi cuối cùng hứng các request rớt uỷ quyền (Thiếu Token, Token hỏng bay từ Http Filter ra)
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        
        String localizedMessage = "Unauthorized";
        try {
            localizedMessage = messageSource.getMessage("error.auth.unauthorized", null, request.getLocale());
        } catch (org.springframework.context.NoSuchMessageException e) {
            // Nếu không tìm thấy key dịch, giữ nguyên message mặc định là Unauthorized
        }
        
        // Trả format chuẩn cho AXIOS
        String jsonFormat = String.format("{\"error\": \"Unauthorized\", \"message\": \"%s\"}", localizedMessage.replace("\"", "\\\""));
        response.getOutputStream().write(jsonFormat.getBytes(StandardCharsets.UTF_8));
    }
}
