package com.project.review.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReviewRequest {

    // Nhận xét không được bỏ trống
    @NotBlank(message = "Nhận xét không được để trống")
    private String comment;

    // Yêu cầu điểm đánh giá từ 1 đến 5
    @NotNull(message = "Điểm đánh giá không được để trống")
    @Min(value = 1, message = "Điểm đánh giá tối thiểu là 1")
    @Max(value = 5, message = "Điểm đánh giá tối đa là 5")
    private Integer rating;

    // ID của sản phẩm cần review
    @NotNull(message = "ID Sản phẩm không được để trống")
    private Long productId;

    public ReviewRequest() {
    }

    public ReviewRequest(String comment, Integer rating, Long productId) {
        this.comment = comment;
        this.rating = rating;
        this.productId = productId;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public static ReviewRequestBuilder builder() {
        return new ReviewRequestBuilder();
    }

    public static class ReviewRequestBuilder {
        private String comment;
        private Integer rating;
        private Long productId;

        public ReviewRequestBuilder comment(String comment) {
            this.comment = comment;
            return this;
        }

        public ReviewRequestBuilder rating(Integer rating) {
            this.rating = rating;
            return this;
        }

        public ReviewRequestBuilder productId(Long productId) {
            this.productId = productId;
            return this;
        }

        public ReviewRequest build() {
            return new ReviewRequest(comment, rating, productId);
        }
    }
}
