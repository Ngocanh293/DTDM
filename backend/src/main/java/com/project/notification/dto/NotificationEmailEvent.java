package com.project.notification.dto;

import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NotificationEmailEvent implements Serializable {
    private static final long serialVersionUID = 1L;

    private Long notifId;
    private String toEmail;
    private String type; // e.g. "VERIFICATION", "EMAIL_CHANGE", "PASSWORD_RESET", "PASSWORD_CHANGE_OTP", "ORDER_CONFIRM", "SHIPPING_UPDATE", "ORDER_STATUS_UPDATE", "RAW_EMAIL"
    private String token;
    private String otpCode;
    private String orderId;
    private String totalAmount;
    private String newEmail;
    private String status; // Order status
    private String subject; // For raw email
    private String content; // For raw email
    private String language; // e.g. "vi", "en"
}
