package com.project.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class VerifyMfaRequest {

    @NotBlank(message = "{validation.email.empty}")
    @Email(message = "{validation.email.invalid}")
    private String email;

    @Min(value = 100000, message = "{validation.mfa.code_invalid}")
    private int code;

    public VerifyMfaRequest() {
        // Required for JSON deserialization
    }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public int getCode() { return code; }
    public void setCode(int code) { this.code = code; }
}
