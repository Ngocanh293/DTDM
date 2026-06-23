package com.project.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.auth.dto.LoginRequest;
import com.project.auth.dto.RegisterRequest;
import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.entity.UserStatus;
import com.project.auth.repository.UserRepository;
import com.project.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class AuthIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private NotificationService notificationService;

    @MockBean
    private com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier googleIdTokenVerifier;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
        // Giả lập việc gửi mail không làm gì cả
        doNothing().when(notificationService).sendVerification(any(), anyString(), any());
    }

    @Test
    @DisplayName("Đăng ký thành công - Trả về thông báo yêu cầu xác thực email")
    void register_Success() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test_new@example.com");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");
        request.setFullName("Test User");
        request.setPhone("0987654321");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string(containsString("check your email")));
    }

    @Test
    @DisplayName("Đăng ký thất bại - Email đã tồn tại")
    void register_Fail_EmailExists() throws Exception {
        User existingUser = new User("test@example.com", "p", UserRole.CUSTOMER, UserStatus.ACTIVE);
        userRepository.save(existingUser);

        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setPassword("StrongPass123!");
        request.setConfirmPassword("StrongPass123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Đăng nhập thành công - Trả về Access Token và Refresh Token")
    void login_Success() throws Exception {
        // Tạo user ACTIVE
        User user = new User("active@example.com", passwordEncoder.encode("password"), UserRole.CUSTOMER, UserStatus.ACTIVE);
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("active@example.com");
        loginRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists())
                .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    @DisplayName("Đăng nhập thất bại - Sai mật khẩu và Khóa tài khoản sau 5 lần")
    void login_Fail_BruteForce() throws Exception {
        User user = new User("target@example.com", passwordEncoder.encode("correct_pass"), UserRole.CUSTOMER, UserStatus.ACTIVE);
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("target@example.com");
        loginRequest.setPassword("wrong_pass");

        // Thử sai 5 lần
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                    .andExpect(status().isUnauthorized());
        }

        // Lần thứ 6 sẽ ném LockedException (trả về 401 hoặc lỗi tùy thuộc vào CustomAuthenticationEntryPoint)
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Truy cập API bảo vệ không có Token - Bị chặn 401")
    void accessProtected_NoToken_Fail() throws Exception {
        // Endpoint /api/products (POST) yêu cầu xác thực
        mockMvc.perform(post("/api/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Đăng ký thất bại - Mật khẩu không đủ mạnh")
    void register_Fail_WeakPassword() throws Exception {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("weak@example.com");
        request.setPassword("123"); // Quá ngắn và thiếu ký tự
        request.setConfirmPassword("123");
        request.setFullName("Weak User");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("Đăng nhập yêu cầu MFA - Khi người dùng đã bật MFA")
    void login_MfaRequired() throws Exception {
        User user = new User("mfa@example.com", passwordEncoder.encode("password"), UserRole.CUSTOMER, UserStatus.ACTIVE);
        user.setMfaEnabled(true);
        user.setMfaSecret("SECRET");
        userRepository.save(user);

        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("mfa@example.com");
        loginRequest.setPassword("password");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.mfaRequired").value(true));
    }

    @Test
    @DisplayName("Giới hạn tần suất đăng nhập (Rate Limiting) - Chặn sau 5 lần thử")
    void login_RateLimit() throws Exception {
        LoginRequest loginRequest = new LoginRequest();
        loginRequest.setEmail("rate@example.com");
        loginRequest.setPassword("any_password");

        // Thử 5 lần đầu (có thể sai mật khẩu nhưng không bị chặn bởi Bucket4j)
        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(loginRequest)))
                    .andExpect(status().isUnauthorized());
        }

        // Lần thứ 6 sẽ bị chặn bởi Bucket4j (HTTP 429 Too Many Requests)
        // Lưu ý: Bucket4j Starter mặc định trả về 429 nếu cấu hình đúng
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isTooManyRequests())
                .andExpect(jsonPath("$.error").value("Too Many Requests"));
    }

    @Test
    @DisplayName("Xóa tài khoản thành công - Soft delete")
    @org.springframework.security.test.context.support.WithMockUser(username = "delete@example.com")
    void deleteAccount_Success() throws Exception {
        User user = new User("delete@example.com", "pass", UserRole.CUSTOMER, UserStatus.ACTIVE);
        userRepository.save(user);

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/api/auth/account"))
                .andExpect(status().isOk());

        // Kiểm tra xem User còn tồn tại trong DB không (do SQLRestriction nên sẽ không tìm thấy)
        java.util.Optional<User> deletedUser = userRepository.findByEmail("delete@example.com");
        org.junit.jupiter.api.Assertions.assertTrue(deletedUser.isEmpty());
    }

    @Test
    @DisplayName("Google Login thành công - Trả về Token cho User mới")
    void googleLogin_Success() throws Exception {
        // Mock payload và idToken của Google bằng Mockito
        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken idToken = org.mockito.Mockito.mock(com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.class);
        com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload payload = org.mockito.Mockito.mock(com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload.class);
        
        org.mockito.Mockito.when(googleIdTokenVerifier.verify(anyString())).thenReturn(idToken);
        org.mockito.Mockito.when(idToken.getPayload()).thenReturn(payload);
        org.mockito.Mockito.when(payload.getEmail()).thenReturn("google_user@example.com");
        org.mockito.Mockito.when(payload.get("name")).thenReturn("Google User");

        com.project.auth.dto.GoogleLoginRequest googleRequest = new com.project.auth.dto.GoogleLoginRequest();
        googleRequest.setIdToken("mock-google-token");

        mockMvc.perform(post("/api/auth/google-login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(googleRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").exists());
    }
}
