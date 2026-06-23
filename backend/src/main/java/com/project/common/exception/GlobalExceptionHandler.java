package com.project.common.exception;

import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private final MessageSource messageSource;

    public GlobalExceptionHandler(MessageSource messageSource) {
        this.messageSource = messageSource;
    }

    private String translate(String key, Object[] args) {
        try {
            return messageSource.getMessage(key, args, LocaleContextHolder.getLocale());
        } catch (org.springframework.context.NoSuchMessageException ex) {
            return key; // Không tìm thấy trong kho từ điển thì nén String gốc ra luôn
        }
    }

    private String translate(String key) {
        return translate(key, null);
    }

    // Bắt lỗi Validation từ các tham số @Valid trong Controller
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            // Validation Message đã được LocalValidatorFactoryBean dịch tự động tại mức DTO!
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    // Bắt các lỗi xác thực (Auth Failures)
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<String> handleAuthenticationExceptions(AuthenticationException ex) {
        String messageKey = ex.getMessage();
        String translatedMessage;

        if (ex instanceof BadCredentialsException) {
            // Bao bọc lỗi đăng nhập thất bại với prefix "Sai thông tin đăng nhập: {0}"
            translatedMessage = translate("error.auth.login_failed", new Object[]{translate(messageKey)});
        } else if (ex instanceof LockedException) {
            translatedMessage = translate("error.auth.account_locked");
        } else {
            translatedMessage = translate(messageKey);
        }

        return new ResponseEntity<>(translatedMessage, HttpStatus.UNAUTHORIZED);
    }

    // Bắt các RuntimeException tùy chỉnh khác
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleRuntimeExceptions(RuntimeException ex) {
        ex.printStackTrace(); // DEBUG
        return new ResponseEntity<>(translate(ex.getMessage()), HttpStatus.BAD_REQUEST);
    }
    
    // Auto bắt Exception Security AccessDenied
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<String> handleAccessDeniedExceptions(org.springframework.security.access.AccessDeniedException ex) {
        return new ResponseEntity<>(translate(ex.getMessage()), HttpStatus.FORBIDDEN);
    }

    // Bắt riêng nhánh lỗi chứng thực (Auto-healing báo cho FE biết 401 Expired Token)
    @ExceptionHandler(io.jsonwebtoken.JwtException.class)
    public ResponseEntity<String> handleJwtExceptions(io.jsonwebtoken.JwtException ex) {
        String baseMsg = translate("error.jwt.invalid");
        return new ResponseEntity<>(baseMsg.replace("{0}", ex.getMessage()), HttpStatus.UNAUTHORIZED);
    }
}
