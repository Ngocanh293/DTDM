package com.project.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class RegisterRequest {

    @NotBlank(message = "{validation.email.empty}")
    @Email(message = "{validation.email.invalid}")
    private String email;

    @NotBlank(message = "{validation.password.empty}")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$", 
             message = "{validation.password.invalid}")
    private String password;

    @NotBlank(message = "{validation.password.confirm_empty}")
    private String confirmPassword;

    private String fullName;

    @Pattern(regexp = "^(?:0|\\+84)[\\s.]?(?:3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\\d[\\s.]?\\d{3}[\\s.]?\\d{3}$", message = "{validation.phone.invalid}")
    private String phone;

    @jakarta.validation.constraints.AssertTrue(message = "{validation.password.mismatch}")
    public boolean isPasswordsMatch() {
        if (password == null || confirmPassword == null) {
            return false;
        }
        return password.equals(confirmPassword);
    }


    public RegisterRequest() {
    }

    public RegisterRequest(String email, String password, String confirmPassword, String fullName, String phone) {
        this.email = email;
        this.password = password;
        this.confirmPassword = confirmPassword;
        this.fullName = fullName;
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getConfirmPassword() {
        return confirmPassword;
    }

    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }
}

