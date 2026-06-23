package com.project.auth.dto;

public class MfaSetupResponse {
    private String secret;
    private String qrCodeImage;

    public MfaSetupResponse(String secret, String qrCodeImage) {
        this.secret = secret;
        this.qrCodeImage = qrCodeImage;
    }

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public String getQrCodeImage() {
        return qrCodeImage;
    }

    public void setQrCodeImage(String qrCodeImage) {
        this.qrCodeImage = qrCodeImage;
    }
}
