package com.project.review.repository;

import com.project.review.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    // Tránh N+1 query bằng EntityGraph load sẵn User
    @EntityGraph(attributePaths = {"user"})
    Page<Review> findByProductId(Long productId, Pageable pageable);

    // Kiểm tra xem User đã Review Product này chưa
    boolean existsByUserIdAndProductId(Long userId, Long productId);

    // Tính điểm trung bình của sản phẩm
    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Long productId);

    // Lấy danh sách review theo user
    @EntityGraph(attributePaths = {"product"})
    Page<Review> findByUserId(Long userId, Pageable pageable);

}
