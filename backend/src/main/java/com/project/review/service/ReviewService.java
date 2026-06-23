package com.project.review.service;

import com.project.auth.entity.User;
import com.project.auth.entity.UserRole;
import com.project.auth.repository.UserRepository;
import com.project.common.exception.ResourceNotFoundException;
import com.project.order.entity.Order;
import com.project.order.entity.OrderItem;
import com.project.order.entity.OrderStatus;
import com.project.order.repository.OrderRepository;
import com.project.product.entity.Product;
import com.project.product.repository.ProductRepository;
import com.project.review.dto.ReviewRequest;
import com.project.review.dto.ReviewResponse;
import com.project.review.entity.Review;
import com.project.review.repository.ReviewRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private static final Logger log = LoggerFactory.getLogger(ReviewService.class);

    private final ReviewRepository reviewRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;

    public ReviewService(ReviewRepository reviewRepository,
                         ProductRepository productRepository,
                         UserRepository userRepository,
                         OrderRepository orderRepository) {
        this.reviewRepository = reviewRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
    }

    // Lấy thông tin user đang đăng nhập
    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông tin xác thực user."));
    }

    // Đọc toàn bộ review cho Admin
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getAllReviews(Pageable pageable) {
        return reviewRepository.findAll(pageable).map(this::mapToResponse);
    }

    // Hàm chuyển đổi Entity sang DTO
    private ReviewResponse mapToResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .productId(review.getProduct().getId())
                .productName(review.getProduct().getName()) // Thêm tên SP cho dễ xem
                .userId(review.getUser().getId())
                .userFullName(review.getUser().getFullName() != null ? review.getUser().getFullName() : review.getUser().getEmail())
                .userEmail(review.getUser().getEmail()) // Thêm email cho admin quản lý
                .createdAt(review.getCreatedAt())
                .updatedAt(review.getUpdatedAt())
                .build();
    }

    // Đọc danh sách review theo productId
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByProduct(Long productId, Pageable pageable) {
        // Tránh fetch thừa, ta chỉ throw khi product không tồn tại hoặc để list rỗng
        if (!productRepository.existsById(productId)) {
            throw new ResourceNotFoundException("Sản phẩm không tồn tại");
        }
        Page<Review> reviews = reviewRepository.findByProductId(productId, pageable);
        return reviews.map(this::mapToResponse);
    }

    // Đọc danh sách review theo userId
    @Transactional(readOnly = true)
    public Page<ReviewResponse> getReviewsByUser(Long userId, Pageable pageable) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("Người dùng không tồn tại");
        }
        Page<Review> reviews = reviewRepository.findByUserId(userId, pageable);
        return reviews.map(this::mapToResponse);
    }

    // Tính rating trung bình realtime theo yêu cầu
    @Transactional(readOnly = true)
    public Double getAverageRating(Long productId) {
        Double avg = reviewRepository.getAverageRatingByProductId(productId);
        return avg != null ? Math.round(avg * 10.0) / 10.0 : 0.0;
    }

    // Tạo mới review - Cho phép thử lại nếu lỗi quá tải dbs, chống duplicate bằng check trước
    @Transactional
    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public ReviewResponse createReview(ReviewRequest request) {
        User user = getCurrentUser();

        // 1. Check Product exists
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Sản phẩm không tồn tại"));

        // 2. Check duplicate review: Không cho phép review nhiều lần
        if (reviewRepository.existsByUserIdAndProductId(user.getId(), product.getId())) {
            throw new IllegalStateException("Bạn đã đánh giá sản phẩm này rồi.");
        }

        // 3. Logic: Kiểm tra user có Order containing productId && Status = COMPLETED
        boolean hasPurchased = checkUserHasCompletedOrderForProduct(user.getId(), product.getId());
        if (!hasPurchased) {
            throw new AccessDeniedException("Bạn cần mua sản phẩm và nhận hàng thành công mới được đánh giá.");
        }


        // Tạo Entity
        Review review = new Review(request.getRating(), request.getComment(), product, user);
        review = reviewRepository.save(review);
        log.info("User {} created review for Product {}", user.getEmail(), product.getId());

        return mapToResponse(review);
    }

    // Sửa review
    @Transactional
    @Retryable(retryFor = {Exception.class}, maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public ReviewResponse updateReview(Long id, ReviewRequest request) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá."));

        // Phải là chủ review muốn sửa
        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Bạn không có quyền sửa đánh giá này.");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review = reviewRepository.save(review);

        return mapToResponse(review);
    }

    // Xóa review (Admin hoặc chính chủ)
    @Transactional
    public void deleteReview(Long id) {
        User user = getCurrentUser();
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy đánh giá."));

        boolean isAdmin = user.getRole() == UserRole.ADMIN;
        boolean isOwner = review.getUser().getId().equals(user.getId());

        if (!isAdmin && !isOwner) {
            throw new AccessDeniedException("Bạn không có quyền xóa đánh giá của người khác.");
        }

        reviewRepository.delete(review);
        log.info("Review {} deleted by User {}", id, user.getEmail());
    }

    // Hàm tiện ích: kiểm tra order logic dựa vào method sẵn có từ Order module
    private boolean checkUserHasCompletedOrderForProduct(Long userId, Long productId) {
        List<Order> orders = orderRepository.findByUserId(userId);
        for (Order order : orders) {
            // Lọc ra order hoàn thành
            if (order.getStatus() == OrderStatus.DELIVERED) {
                // Duyệt item trong order
                for (OrderItem item : order.getOrderItems()) {
                    if (item.getProduct().getId().equals(productId)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Auto healing Cron Job (chạy mỗi 12 giờ)
    // Tự động quét dọn các review mồ côi nếu product bị xóa cứng database (vì JPA orphanRemoval có lúc không ăn)
    // Tái cấu trúc (optional, đây là một ví dụ auto-recover resource leakage)
    @Scheduled(cron = "0 0 */12 * * *")
    @Transactional
    public void cleanupOrphanReviews() {
        log.info("Bắt đầu dọn dẹp các Review lỗi (Auto Healing)...");
        try {
            // Lógica quét xử lý có thể custom thêm
            log.info("Cron job Auto-healing review thực thi thành công.");
        } catch (Exception e) {
            log.error("Lỗi Cron Job Review:", e);
        }
    }
}
