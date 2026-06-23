# 🖥️ PC Components eCommerce System

## 📌 Giới thiệu
PC Components eStore là hệ thống thương mại điện tử chuyên cung cấp các linh kiện máy tính như CPU, GPU, RAM, SSD và các thiết bị phần cứng khác.

Hệ thống hỗ trợ đầy đủ quy trình mua sắm online:
- Duyệt sản phẩm
- Thêm vào giỏ hàng
- Thanh toán
- Giao hàng
- Đánh giá sản phẩm

---

## 🎯 Mục tiêu hệ thống
- Xây dựng nền tảng bán linh kiện PC trực tuyến
- Tối ưu trải nghiệm người dùng
- Đảm bảo tính toàn vẹn và chính xác dữ liệu
- Có khả năng mở rộng lên kiến trúc microservices

---

## ⚙️ Công nghệ sử dụng

### Backend
- Java (Spring Boot)
- RESTful API
- Spring Security + JWT

### Frontend
- ReactJS
- Axios
- Context API / Redux

### Database
- PostgreSQL

---

## 🏗️ Kiến trúc hệ thống

Hệ thống sử dụng:

> **Modular Monolithic Architecture**

Các module được tách biệt logic, có thể dễ dàng migrate sang microservices trong tương lai.

---

## 📦 Các module chính

### 1. Authentication Module
- Đăng nhập (Local & Google OAuth2) / Đăng ký
- JWT Authentication & Refresh Token Rotation (Xóa token cũ cấp token mới)
- Phân quyền (Admin / Employee / Customer)
- **Bảo mật nâng cao (IDS):** Chống rà quét Brute-force (Tự động khóa tài khoản sau 5 lần đăng nhập sai, Auto-healing mở khóa sau 15 phút).
- **Hệ thống Mail thông minh:** Quản lý mẫu thư Xác thực & Reset Password chuẩn thẻ HTML siêu nhẹ. Tác vụ gửi Mail được bóc tách sang thiết kế Non-Blocking (`@Async`).
- **Hệ thống Đa ngôn ngữ (i18n):** Hệ thống thông báo lỗi, Validation DTO, và cả giao diện Email đều tự động chuyển đổi Đa ngôn ngữ (EN / VI) thông qua Session ngầm định.

---

### 2. User Module
- Quản lý thông tin người dùng
- Địa chỉ giao hàng
- Lịch sử hoạt động

---

### 3. Product Module
- Quản lý sản phẩm (CPU, GPU, RAM…)
- Danh mục sản phẩm
- Thông số kỹ thuật
- Hình ảnh sản phẩm

---

### 4. Inventory Module (Kho)
- Quản lý số lượng tồn kho
- Cập nhật khi đặt hàng
- Tránh overselling

---

### 5. Cart Module
- Thêm / xóa / cập nhật sản phẩm
- Tính tổng tiền

---

### 6. Order Module
- Tạo đơn hàng
- Hủy đơn hàng
- Lịch sử đơn hàng
- Trạng thái đơn (pending, shipped, completed)

---

### 7. Payment Module
- Xử lý thanh toán (mock / VNPay / PayPal)
- Trạng thái thanh toán
- Lưu lịch sử giao dịch

---

### 8. Shipping Module
- Địa chỉ giao hàng
- Tính phí vận chuyển
- Theo dõi trạng thái giao hàng

---

### 9. Review Module
- Đánh giá sản phẩm (rating 1–5 sao)
- Bình luận
- Gắn với user + product

---

### 10. Notification Module (Optional)
- Gửi email xác nhận đơn hàng
- Thông báo trạng thái đơn

---

## 📂 Cấu trúc thư mục

## 🔹 Backend (Spring Boot)

```
backend/
├── src/main/java/com/project/
│   ├── auth/                # Xác thực & phân quyền
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── user/                # Quản lý người dùng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── product/             # Quản lý sản phẩm
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── inventory/           # Quản lý tồn kho
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── cart/                # Giỏ hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── order/               # Đơn hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── payment/             # Thanh toán
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── shipping/            # Giao hàng
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── review/              # Đánh giá sản phẩm
│   │   ├── controller/
│   │   ├── service/
│   │   ├── repository/
│   │   └── entity/
│   │
│   ├── notification/        # Thông báo (optional)
│   │   ├── service/
│   │   └── utils/
│   │
│   ├── common/              # Dùng chung toàn hệ thống
│   │   ├── config/          # Cấu hình (CORS, Swagger...)
│   │   ├── security/        # JWT filter, auth config
│   │   ├── exception/       # Global exception handler
│   │   ├── utils/           # Helper functions
│   │   └── constant/        # Enum, constant
│   │
│   └── Application.java
│
├── src/main/resources/
│   ├── application.yml
│   ├── data.sql
│   └── schema.sql
│
└── pom.xml
```

### 🔹 Frontend (ReactJS)

```
frontend/
├── src/
│   ├── components/          # UI components (Button, Card...)
│   ├── pages/               # Các trang chính
│   │   ├── Home/
│   │   ├── Product/
│   │   ├── Cart/
│   │   ├── Login/
│   │   └── Profile/
│   │
│   ├── services/            # Gọi API (Axios)
│   ├── store/               # State management
│   ├── hooks/               # Custom hooks
│   ├── utils/               # Helper functions
│   └── App.jsx
│
├── public/
└── package.json
```

---

## 🚀 Chức năng hệ thống

### 👤 Guest
- Xem sản phẩm
- Tìm kiếm, lọc
- Xem chi tiết sản phẩm
- Đăng ký tài khoản

---

### 🧑‍💻 Customer
- Quản lý giỏ hàng
- Đặt hàng
- Thanh toán
- Theo dõi đơn hàng
- Đánh giá sản phẩm

---

### 🛠️ Admin
- Quản lý sản phẩm
- Quản lý người dùng
- Quản lý đơn hàng
- Thống kê báo cáo

---

### 👨‍🔧 Employee
- Xử lý đơn hàng
- Cập nhật trạng thái giao hàng

---

## 🔐 Yêu cầu phi chức năng

### Performance (High-Level Optimized)
- API siêu tốc < 0.1s: Xử lý I/O dồn dập (như gửi Email) bằng Background Thread (`@Async`), triệt tiêu độ trễ HTTP Blocking.
- Tối ưu CSDL tuyệt đối: Triệt tận gốc lỗi N+1 Hibernate bằng mô hình `FetchType.LAZY` kết hợp `@EntityGraph` (Chỉ dùng 1 `LEFT JOIN` duy nhất).
- Tối thiểu hóa giao dịch Delete O(N) xuống một nhát chém duy nhất O(1) bằng native `@Modifying @Query`.
- In-Memory Caching (HashMap / Caffeine) để nạp trước giao diện Email và theo dõi IP đăng nhập nhằm giảm gánh nặng ổ cứng.

### Security & Fault Tolerance
- JWT authentication + Bcrypt hashing.
- Role-based access control.
- Theo dõi lịch sử xâm nhập (Audit Login Logging).
- Auto-Healing System: Cron Job (`@Scheduled`) dọn dẹp hàng miên man Token hết hạn lúc 0h sáng. Có cơ chế tự động thử kết nối `@Retryable(Backoff)` khi bị rớt Database.

### Code Quality
- Clean Architecture - Đáp ứng chuẩn 100% (Zero-Warnings) thang quy tắc của SonarLint/SonarQube.

---


## 👥 Phân công

| Thành viên | Module |
|-----------|--------|
| Nguyễn Viết Đạt | Auth + User |
| Nguyễn Đăng Thịnh | Product + Inventory |
| Hoàng Hữu Nghĩa | Order + Payment |
| Võ Trần Ngọc Anh | UI |
| Đặng Ngọc Anh Đức | Integration |

---

## 🔮 Hướng phát triển
- Tích hợp thanh toán thật (VNPay, PayPal)
- Recommendation system
- Microservices architecture
- Mobile app

---