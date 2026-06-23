import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function ReviewsTab() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) {
      fetchReviews();
    }
  }, [user]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Gọi API lấy danh sách đánh giá của user
      const response = await apiClient.get(`/reviews/user/${user.id}`);
      
      // Xử lý dữ liệu trả về (hỗ trợ cả mảng trực tiếp hoặc object phân trang Spring Data Page)
      if (response.data && Array.isArray(response.data.content)) {
        setReviews(response.data.content);
      } else if (Array.isArray(response.data)) {
        setReviews(response.data);
      } else {
        setReviews([]);
      }
    } catch (err) {
      console.error('Lỗi khi tải danh sách đánh giá:', err);
      setError('Không thể tải lịch sử đánh giá của bạn lúc này.');
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i key={i} className={`bi ${i <= rating ? 'bi-star-fill text-warning' : 'bi-star text-secondary'} me-1`}></i>
      );
    }
    return stars;
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4">
          <i className="bi bi-star-half text-danger me-2"></i> Đánh giá của tôi
        </h5>

        {error && <div className="alert alert-danger">{error}</div>}

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-danger" role="status">
              <span className="visually-hidden">Đang tải...</span>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-5 bg-light rounded-3">
            <i className="bi bi-chat-square-quote fs-1 text-muted mb-3 d-block"></i>
            <p className="text-muted mb-0">Bạn chưa viết bất kỳ đánh giá sản phẩm nào.</p>
          </div>
        ) : (
          <div className="row g-4">
            {reviews.map((review) => (
              <div key={review.id} className="col-12">
                <div className="card border h-100 shadow-none">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <div>
                        {renderStars(review.rating)}
                        <span className="ms-2 fw-bold text-dark">{review.rating}/5</span>
                      </div>
                      <small className="text-muted">
                        {review.createdAt ? new Date(review.createdAt).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                      </small>
                    </div>

                    <p className="card-text text-secondary mb-3">"{review.comment}"</p>

                    <div className="d-flex align-items-center bg-light p-2 rounded">
                      <i className="bi bi-box-seam text-danger fs-4 me-3 ms-2"></i>
                      <div>
                        <small className="text-muted d-block" style={{ fontSize: '12px' }}>Sản phẩm được đánh giá</small>
                        <Link to={`/products/${review.productId}`} className="text-decoration-none text-dark fw-medium" style={{ fontSize: '14px' }}>
                          Xem chi tiết sản phẩm <i className="bi bi-arrow-right-short"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
