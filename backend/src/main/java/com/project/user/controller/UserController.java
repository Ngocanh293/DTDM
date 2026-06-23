package com.project.user.controller;

import com.project.common.security.CustomUserDetails;
import com.project.user.dto.AddressRequest;
import com.project.user.dto.AddressResponse;
import com.project.user.dto.ChangePasswordRequest;
import com.project.user.dto.UpdateProfileRequest;
import com.project.user.dto.UserProfileResponse;
import com.project.user.service.AddressService;
import com.project.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.context.MessageSource;
import org.springframework.context.i18n.LocaleContextHolder;
import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AddressService addressService;
    private final MessageSource messageSource;

    public UserController(UserService userService, AddressService addressService, MessageSource messageSource) {
        this.userService = userService;
        this.addressService = addressService;
        this.messageSource = messageSource;
    }

    private String translate(String key) {
        try {
            return messageSource.getMessage(key, null, LocaleContextHolder.getLocale());
        } catch (org.springframework.context.NoSuchMessageException e) {
            return key;
        }
    }

    // Lấy thông tin tài khoản người dùng
    @GetMapping("/profile")
    public ResponseEntity<UserProfileResponse> getProfile(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getProfile(userDetails.getUser()));
    }

    // Cập nhật Profile (Yêu cầu thoả mãn SDT Validator)
    @PutMapping("/profile")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        
        return ResponseEntity.ok(userService.updateProfile(userDetails.getUser(), request));
    }

    // Cập nhật ảnh đại diện (Tải file vật lý)
    @PostMapping("/profile/avatar")
    public ResponseEntity<String> updateAvatar(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        
        String fileName = userService.updateAvatar(userDetails.getUser(), file);
        return ResponseEntity.ok("/uploads/avatars/" + fileName);
    }

    // Bước 1: Yêu cầu đổi mật khẩu → gửi OTP qua email xác thực
    @PutMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody ChangePasswordRequest request) {
        
        userService.changePassword(userDetails.getUser(), request);
        return ResponseEntity.ok(translate("success.user.password_otp_sent"));
    }

    // Bước 2: Xác nhận OTP để hoàn tất đổi mật khẩu
    @PostMapping("/change-password/confirm")
    public ResponseEntity<String> confirmPasswordChange(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody com.project.user.dto.ConfirmPasswordChangeRequest request) {
        
        userService.confirmPasswordChange(userDetails.getUser(), request.getOtpCode());
        return ResponseEntity.ok(translate("success.user.password_changed"));
    }

    // Lấy danh sách địa chỉ giao hàng
    @GetMapping("/address")
    public ResponseEntity<List<AddressResponse>> getAddresses(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(addressService.getUserAddresses(userDetails.getUser()));
    }

    // Thêm địa chỉ mới
    @PostMapping("/address")
    public ResponseEntity<AddressResponse> addAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @Valid @RequestBody AddressRequest request) {
        
        return ResponseEntity.ok(addressService.addAddress(userDetails.getUser(), request));
    }

    // Chỉnh sửa thông tin một địa chỉ
    @PutMapping("/address/{id}")
    public ResponseEntity<String> updateAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        
        addressService.updateAddress(userDetails.getUser(), id, request);
        return ResponseEntity.ok(translate("success.address.updated"));
    }

    // Nâng địa chỉ lên làm Mặc định nhanh chóng
    @PutMapping("/address/{id}/default")
    public ResponseEntity<String> setDefaultAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        addressService.setDefaultAddress(userDetails.getUser(), id);
        return ResponseEntity.ok(translate("success.address.default_set"));
    }

    // Xoá địa chỉ thiết lập
    @DeleteMapping("/address/{id}")
    public ResponseEntity<String> deleteAddress(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        
        addressService.deleteAddress(userDetails.getUser(), id);
        return ResponseEntity.ok(translate("success.address.deleted"));
    }

    // Xem danh sách session đang hoạt động (các thiết bị đã đăng nhập)
    @GetMapping("/sessions")
    public ResponseEntity<java.util.List<com.project.user.dto.SessionResponse>> getActiveSessions(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getActiveSessions(userDetails.getUser()));
    }

    // Thu hồi toàn bộ session (đăng xuất khỏi tất cả thiết bị trừ phiên hiện tại)
    @DeleteMapping("/sessions")
    public ResponseEntity<String> revokeAllSessions(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.revokeAllSessions(userDetails.getUser());
        return ResponseEntity.ok(translate("success.user.sessions_revoked"));
    }

    // Xem lịch sử đăng nhập (tối đa 50 bản ghi gần nhất)
    @GetMapping("/login-history")
    public ResponseEntity<java.util.List<com.project.user.dto.LoginLogResponse>> getLoginHistory(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(userService.getLoginHistory(userDetails.getUser()));
    }

    // Người dùng tự vô hiệu hóa tài khoản
    @DeleteMapping("/deactivate")
    public ResponseEntity<String> deactivateAccount(@AuthenticationPrincipal CustomUserDetails userDetails) {
        userService.deactivateAccount(userDetails.getUser());
        return ResponseEntity.ok(translate("success.user.deactivated"));
    }

    // Yêu cầu đổi Email (Gửi code tới mail mới)
    @PostMapping("/email-change")
    public ResponseEntity<String> requestEmailChange(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam String newEmail) {
        
        userService.requestEmailChange(userDetails.getUser(), newEmail);
        return ResponseEntity.ok(translate("success.user.email_change_requested"));
    }

    // Xác nhận đổi Email
    @GetMapping("/email-change/confirm")
    public ResponseEntity<String> confirmEmailChange(@RequestParam String token) {
        userService.confirmEmailChange(token);
        return ResponseEntity.ok(translate("success.user.email_changed"));
    }
}
