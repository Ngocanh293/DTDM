import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      // Giả sử API lấy toàn bộ review cho admin. 
      // Nếu chưa có API này, ta có thể phải thêm vào Backend.
      // Tạm thời gọi API lấy review (cần kiểm tra Backend ReviewController)
      const res = await apiClient.get('/reviews?size=100'); 
      setReviews(res.data.content || []);
    } catch (err) {
      console.error("Lỗi khi tải đánh giá:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    Swal.fire({
      title: 'Xóa đánh giá?',
      text: "Bạn có chắc chắn muốn xóa đánh giá này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/reviews/${id}`);
          Swal.fire({icon: 'success', title: 'Thành công', text: 'Đã xóa đánh giá thành công!'});
          fetchReviews();
        } catch (err) {
          Swal.fire({icon: 'error', title: 'Lỗi', text: "Lỗi khi xóa: " + (err.response?.data?.message || err.message)});
        }
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Kiểm duyệt Đánh giá</h1>
          <p className="mb-4 text-muted">Quản lý và loại bỏ các bình luận không phù hợp từ khách hàng</p>
          
          <div className="card border-0 shadow-sm">
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Sản phẩm</th>
                      <th>Người đánh giá</th>
                      <th>Số sao</th>
                      <th>Nội dung</th>
                      <th>Ngày viết</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr><td colSpan="6" className="text-center py-5">Đang tải...</td></tr>
                    ) : reviews.length === 0 ? (
                      <tr><td colSpan="6" className="text-center py-5">Chưa có đánh giá nào</td></tr>
                    ) : (
                      reviews.map(r => (
                        <tr key={r.id}>
                          <td>
                            <div className="small fw-bold">{r.productName}</div>
                            <small className="text-muted">ID SP: #{r.productId}</small>
                          </td>
                          <td>
                             <div className="fw-bold small">{r.userFullName || 'Khách ẩn danh'}</div>
                             <small className="text-muted d-block">{r.userEmail}</small>
                           </td>
                          <td>
                            <span className="text-warning">
                              {Array.from({ length: r.rating }).map((_, i) => (
                                <i key={i} className="bi bi-star-fill"></i>
                              ))}
                            </span>
                          </td>
                          <td>
                            <p className="mb-0 small" style={{ maxWidth: '300px', whiteSpace: 'normal' }}>
                              {r.comment}
                            </p>
                          </td>
                          <td>{new Date(r.createdAt).toLocaleDateString('vi-VN')}</td>
                          <td>
                            <button onClick={() => handleDelete(r.id)} className="btn btn-sm btn-outline-danger">
                              <i className="bi bi-trash"></i> Xóa
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
