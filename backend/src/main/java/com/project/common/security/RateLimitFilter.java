package com.project.common.security;

import com.project.common.util.IpAddressUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter áp dụng Rate Limiting theo IP cho các endpoint nhạy cảm.
 * Trả về HTTP 429 Too Many Requests khi vượt ngưỡng.
 */
@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final RateLimitService rateLimitService;

    public RateLimitFilter(RateLimitService rateLimitService) {
        this.rateLimitService = rateLimitService;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String ip = IpAddressUtil.getClientIpAddress(request);

        // Chỉ áp dụng cho POST requests đến các endpoint nhạy cảm
        if ("POST".equalsIgnoreCase(method)) {
            boolean allowed = checkRateLimit(path, ip);
            if (!allowed) {
                sendTooManyRequestsResponse(response);
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private boolean checkRateLimit(String path, String ip) {
        if (path.endsWith("/api/auth/login")) {
            return rateLimitService.tryConsumeLogin(ip);
        }
        if (path.endsWith("/api/auth/forgot-password")) {
            return rateLimitService.tryConsumeForgotPassword(ip);
        }
        if (path.endsWith("/api/auth/resend-verification")) {
            return rateLimitService.tryConsumeResendVerify(ip);
        }
        if (path.endsWith("/api/auth/reset-password")) {
            return rateLimitService.tryConsumeResetPassword(ip);
        }
        return true; // Không giới hạn các endpoint khác
    }

    private void sendTooManyRequestsResponse(HttpServletResponse response) throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("{\"error\": \"error.auth.rate_limit_exceeded\"}");
    }
}
