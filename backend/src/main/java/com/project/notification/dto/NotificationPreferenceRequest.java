package com.project.notification.dto;

import com.project.notification.entity.NotificationType;
import jakarta.validation.constraints.NotNull;

public class NotificationPreferenceRequest {

    @NotNull(message = "{validation.notification.type_empty}")
    private NotificationType type;

    private boolean isEnabled;

    public NotificationPreferenceRequest() {
    }

    public NotificationPreferenceRequest(NotificationType type, boolean isEnabled) {
        this.type = type;
        this.isEnabled = isEnabled;
    }

    public NotificationType getType() {
        return type;
    }

    public void setType(NotificationType type) {
        this.type = type;
    }

    public boolean isEnabled() {
        return isEnabled;
    }

    public void setEnabled(boolean enabled) {
        isEnabled = enabled;
    }
}
