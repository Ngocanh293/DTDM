package com.project.user.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.common.security.CustomUserDetails;
import com.project.user.dto.AdminUserResponse;
import com.project.user.service.UserService;

@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Liệt kê toàn bộ người dùng (Phân trang)
     */
    @GetMapping
    public ResponseEntity<Page<AdminUserResponse>> getAllUsers(Pageable pageable) {
        return ResponseEntity.ok(userService.getAllUsers(pageable));
    }

    /**
     * Tìm kiếm người dùng theo Email hoặc Full Name
     */
    @GetMapping("/search")
    public ResponseEntity<Page<AdminUserResponse>> searchUsers(
            @RequestParam String keyword, 
            Pageable pageable) {
        return ResponseEntity.ok(userService.searchUsers(keyword, pageable));
    }

    /**
     * Cập nhật Role cho người dùng
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long id, 
            @RequestParam UserRole role) {
        userService.updateUserRole(id, role);
        return ResponseEntity.ok().build();
    }

    /**
     * Cập nhật trạng thái tài khoản (ACTIVE/INACTIVE)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<Void> updateUserStatus(
            @PathVariable Long id, 
            @RequestParam UserStatus status) {
        userService.updateUserStatus(id, status);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa mềm người dùng
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        userService.deleteUser(userDetails.getUser(), id);
        return ResponseEntity.ok().build();
    }

    /**
     * Xóa vĩnh viễn người dùng (Hủy hoàn toàn khỏi CSDL)
     */
    @DeleteMapping("/{id}/hard")
    public ResponseEntity<Void> hardDeleteUser(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @PathVariable Long id) {
        userService.hardDeleteUser(userDetails.getUser(), id);
        return ResponseEntity.ok().build();
    }

    /**
     * Khôi phục tài khoản đã bị xóa mềm
     */
    @PostMapping("/{id}/restore")
    public ResponseEntity<Void> restoreUser(@PathVariable Long id) {
        userService.restoreUser(id);
        return ResponseEntity.ok().build();
    }
}
