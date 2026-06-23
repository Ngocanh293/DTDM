package com.project.auth.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public class EnableMfaRequest {
    @Min(100000)
    @Max(999999)
    private int otp;

    public int getOtp() {
        return otp;
    }

    public void setOtp(int otp) {
        this.otp = otp;
    }
}
