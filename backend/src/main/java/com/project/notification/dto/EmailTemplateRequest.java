package com.project.notification.dto;

import com.project.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class EmailTemplateRequest {

    @NotNull(message = "{validation.notification.type_empty}")
    private NotificationType type;

    @NotBlank(message = "{validation.notification.locale_empty}")
    private String locale;

    @NotBlank(message = "{validation.notification.subject_empty}")
    private String subject;

    @NotBlank(message = "{validation.notification.content_empty}")
    private String content;

    public EmailTemplateRequest() {
        // Required for JSON deserialization
    }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }
    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }
    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
}
