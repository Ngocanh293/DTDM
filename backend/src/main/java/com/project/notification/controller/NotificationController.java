package com.project.notification.controller;

import com.project.common.security.CustomUserDetails;
import com.project.notification.dto.NotificationResponse;
import com.project.notification.service.NotificationService;
import com.project.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final EmailService emailService;

    public NotificationController(NotificationService notificationService, EmailService emailService) {
        this.notificationService = notificationService;
        this.emailService = emailService;
    }

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(notificationService.getUserNotifications(userDetails.getUser()));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        notificationService.markAsRead(id, userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal CustomUserDetails userDetails) {
        notificationService.markAllAsRead(userDetails.getUser());
        return ResponseEntity.ok().build();
    }

    // --- Quản lý Tùy chọn (Preferences) ---
    @GetMapping("/preferences")
    public ResponseEntity<java.util.List<com.project.notification.dto.NotificationPreferenceResponse>> getPreferences(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        java.util.List<com.project.notification.dto.NotificationPreferenceResponse> responses = notificationService.getPreferences(userDetails.getUser())
                .stream()
                .map(p -> new com.project.notification.dto.NotificationPreferenceResponse(p.getType(), p.isEnabled()))
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/preferences")
    public ResponseEntity<Void> updatePreference(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody com.project.notification.dto.NotificationPreferenceRequest request) {
        notificationService.updatePreference(userDetails.getUser(), request);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/preferences/bulk")
    public ResponseEntity<Void> bulkUpdatePreferences(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody java.util.Map<String, Boolean> request) {
        notificationService.updatePreferencesBulk(userDetails.getUser(), request);
        return ResponseEntity.ok().build();
    }

    // --- Gửi hàng loạt (Chỉ Admin) ---
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/broadcast")
    public ResponseEntity<String> broadcast(
            @RequestParam String subject,
            @RequestParam String content,
            @RequestParam com.project.notification.entity.NotificationType type) {
        notificationService.broadcast(subject, content, type);
        return ResponseEntity.ok("Đã bắt đầu gửi thông báo hàng loạt.");
    }

    // --- Quản lý Mẫu Email (Chỉ Admin) ---
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/templates")
    public ResponseEntity<List<com.project.notification.entity.EmailTemplate>> getAllTemplates() {
        return ResponseEntity.ok(emailService.getAllTemplates());
    }

    @org.springframework.security.access.prepost.PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/templates")
    public ResponseEntity<Void> updateTemplate(@RequestBody @jakarta.validation.Valid com.project.notification.dto.EmailTemplateRequest request) {
        emailService.updateTemplate(request);
        return ResponseEntity.ok().build();
    }
}
