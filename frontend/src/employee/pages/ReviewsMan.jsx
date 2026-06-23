import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function ReviewsMan() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  const fetchPendingReviews = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/reviews?size=100');
      // Lấy danh sách ID đã duyệt lưu trong localStorage để không hiển thị lại
      const approvedIds = JSON.parse(localStorage.getItem('approved_review_ids') || '[]');
      
      const pendingList = (res.data.content || []).filter(r => !approvedIds.includes(r.id)).map(r => ({
         id: r.id,
         user: r.userFullName || 'Khách hàng',
         product: r.productName,
         comment: r.comment,
         rating: r.rating,
         status: 'PENDING'
      }));
      setReviews(pendingList);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, newStatus) => {
    if (newStatus === 'HIDDEN') {
      if (!window.confirm("Bạn có chắc muốn xóa/ẩn đánh giá này khỏi hệ thống?")) return;
      try {
        await apiClient.delete(`/reviews/${id}`);
        setReviews(reviews.filter(r => r.id !== id));
        alert('Đã xóa đánh giá thành công!');
      } catch (err) {
        alert('Lỗi khi xóa đánh giá: ' + err.message);
      }
    } else if (newStatus === 'APPROVED') {
       // Cập nhật localStorage
       const approvedIds = JSON.parse(localStorage.getItem('approved_review_ids') || '[]');
       if (!approvedIds.includes(id)) {
           approvedIds.push(id);
           localStorage.setItem('approved_review_ids', JSON.stringify(approvedIds));
       }
       setReviews(reviews.filter(r => r.id !== id));
       alert('Đã duyệt đánh giá! Đánh giá sẽ được hiển thị công khai bình thường.');
    }
  };

  return (
    <div className="container-fluid">
       <div className="mb-4">
          <h1 className="fs-3">Kiểm duyệt đánh giá</h1>
          <p className="text-secondary">Phê duyệt hoặc ẩn các nhận xét từ khách hàng</p>
       </div>

       <div className="row">
          {reviews.filter(r => r.status === 'PENDING').length === 0 ? (
            <div className="col-12 text-center py-5">
               <i className="ti ti-check fs-1 text-success"></i>
               <p className="mt-2">Đã xử lý hết đánh giá chờ duyệt!</p>
            </div>
          ) : (
            reviews.filter(r => r.status === 'PENDING').map(r => (
              <div className="col-12 col-md-6 col-lg-4 mb-4" key={r.id}>
                 <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                       <div className="d-flex justify-content-between mb-2">
                          <span className="fw-bold">{r.user}</span>
                          <span className="text-warning">
                             {[...Array(r.rating)].map((_, i) => <i key={i} className="ti ti-star-filled"></i>)}
                          </span>
                       </div>
                       <h6 className="text-primary small mb-2">{r.product}</h6>
                       <p className="card-text small text-dark italic">"{r.comment}"</p>
                       <div className="d-flex gap-2 mt-3">
                          <button onClick={() => handleAction(r.id, 'APPROVED')} className="btn btn-sm btn-success w-50">Duyệt</button>
                          <button onClick={() => handleAction(r.id, 'HIDDEN')} className="btn btn-sm btn-outline-danger w-50">Ẩn</button>
                       </div>
                    </div>
                 </div>
              </div>
            ))
          )}
       </div>
    </div>
  );
}
