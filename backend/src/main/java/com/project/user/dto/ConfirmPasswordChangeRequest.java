package com.project.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ConfirmPasswordChangeRequest {

    @NotBlank(message = "{validation.otp.empty}")
    @Size(min = 6, max = 6, message = "{validation.otp.invalid_length}")
    private String otpCode;

    public ConfirmPasswordChangeRequest() {
    }

    public ConfirmPasswordChangeRequest(String otpCode) {
        this.otpCode = otpCode;
    }

    public String getOtpCode() {
        return otpCode;
    }

    public void setOtpCode(String otpCode) {
        this.otpCode = otpCode;
    }
}
