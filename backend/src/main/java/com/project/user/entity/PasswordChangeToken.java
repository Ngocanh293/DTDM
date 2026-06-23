package com.project.user.entity;

import com.project.auth.entity.User;
import com.project.common.entity.BaseEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Lưu trạng thái yêu cầu đổi mật khẩu đang chờ xác thực.
 * Mỗi User chỉ có tối đa 1 token tại một thời điểm (OneToOne).
 */
@Entity
@Table(name = "password_change_tokens")
public class PasswordChangeToken extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false, unique = true)
    @org.hibernate.annotations.OnDelete(action = org.hibernate.annotations.OnDeleteAction.CASCADE)
    private User user;

    /** Mật khẩu mới đã được mã hóa BCrypt (lưu tạm, áp dụng sau khi xác nhận OTP) */
    @Column(name = "encoded_new_password", nullable = false)
    private String encodedNewPassword;

    /** OTP 6 chữ số được gửi qua email */
    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    /** Thời điểm hết hạn (mặc định 10 phút) */
    @Column(name = "expiry_date", nullable = false)
    private LocalDateTime expiryDate;

    public PasswordChangeToken() {
    }

    public PasswordChangeToken(User user, String encodedNewPassword, String otpCode, LocalDateTime expiryDate) {
        this.user = user;
        this.encodedNewPassword = encodedNewPassword;
        this.otpCode = otpCode;
        this.expiryDate = expiryDate;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEncodedNewPassword() { return encodedNewPassword; }
    public void setEncodedNewPassword(String encodedNewPassword) { this.encodedNewPassword = encodedNewPassword; }

    public String getOtpCode() { return otpCode; }
    public void setOtpCode(String otpCode) { this.otpCode = otpCode; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}
