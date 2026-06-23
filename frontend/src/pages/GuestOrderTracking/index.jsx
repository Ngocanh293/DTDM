import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';

export default function GuestOrderTracking() {
  const [phone, setPhone] = useState('');
  const [orderCode, setOrderCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // Giả lập dữ liệu trả về

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone || !orderCode) {
      setError('Vui lòng nhập đầy đủ Số điện thoại và Mã đơn hàng.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      // Gọi API thật từ server
      const res = await apiClient.get(`/v1/orders/guest-track?phone=${phone}&orderCode=${orderCode}`);
      setResult(res.data);
    } catch (err) {
      setResult(null);
      setError('Không tìm thấy đơn hàng. Vui lòng kiểm tra lại thông tin Số điện thoại và Mã đơn hàng.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'PENDING': 'CHỜ XỬ LÝ',
      'PAID': 'ĐÃ THANH TOÁN',
      'CONFIRMED': 'ĐÃ XÁC NHẬN',
      'SHIPPING': 'ĐANG GIAO HÀNG',
      'DELIVERED': 'GIAO THÀNH CÔNG',
      'CANCELLED': 'ĐÃ HỦY'
    };
    return labels[status] || status;
  };

  return (
    <div className="container py-5" style={{ maxWidth: '800px' }}>
      <div className="text-center mb-5">
        <h2 className="fw-bold mb-3"><i className="bi bi-box-seam me-2 text-danger"></i>Tra cứu Đơn Hàng</h2>
        <p className="text-muted">Kiểm tra tình trạng đơn hàng của bạn nhanh chóng mà không cần đăng nhập.</p>
      </div>

      <div className="card border-0 shadow-sm mb-5 p-4 mx-auto" style={{ maxWidth: '500px' }}>
        <form onSubmit={handleSearch}>
          <div className="mb-3">
            <label className="form-label fw-bold small text-secondary">Số điện thoại đặt hàng</label>
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-telephone text-muted"></i></span>
              <input 
                type="text" 
                className="form-control form-control-lg" 
                placeholder="Nhập SĐT của bạn" 
                value={phone}
                onChange={e => setPhone(e.target.value)}
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="form-label fw-bold small text-secondary">Mã đơn hàng</label>
            <div className="input-group">
              <span className="input-group-text bg-light"><i className="bi bi-upc-scan text-muted"></i></span>
              <input 
                type="text" 
                className="form-control form-control-lg text-uppercase" 
                placeholder="VD: ORD00123" 
                value={orderCode}
                onChange={e => setOrderCode(e.target.value)}
              />
            </div>
          </div>

          {error && <div className="alert alert-danger small py-2"><i className="bi bi-exclamation-circle me-2"></i>{error}</div>}

          <button type="submit" className="btn btn-danger btn-lg w-100 fw-bold" disabled={loading}>
            {loading ? <span className="spinner-border spinner-border-sm me-2"></span> : <i className="bi bi-search me-2"></i>}
            TRA CỨU NGAY
          </button>
        </form>
      </div>

      {/* Kết quả tra cứu */}
      {result && !loading && (
        <div className="card border-0 shadow-sm border-top border-danger border-4">
          <div className="card-body p-4">
            <h5 className="fw-bold mb-4 border-bottom pb-3 d-flex justify-content-between align-items-center">
              <span>Thông tin đơn hàng: <span className="text-danger">DH-00{result.id}</span></span>
              <span className={`badge ${result.status === 'DELIVERED' ? 'bg-success' : 'bg-primary'} px-3 py-2 fs-6`}>
                {getStatusLabel(result.status)}
              </span>
            </h5>
            
            <div className="row mb-4">
              <div className="col-sm-4 mb-3 mb-sm-0">
                <div className="text-muted small">Ngày đặt:</div>
                <div className="fw-bold">{new Date(result.orderDate).toLocaleDateString('vi-VN')}</div>
              </div>
              <div className="col-sm-4 mb-3 mb-sm-0">
                <div className="text-muted small">Sản phẩm:</div>
                <div className="fw-bold">{result.items?.length || 0} sản phẩm</div>
              </div>
              <div className="col-sm-4">
                <div className="text-muted small">Tổng tiền:</div>
                <div className="fw-bold text-danger">{result.totalAmount?.toLocaleString('vi-VN')} đ</div>
              </div>
            </div>

            <div className="bg-light p-4 rounded-3">
              <h6 className="fw-bold mb-4">Chi tiết trạng thái</h6>
              <div className="timeline position-relative ps-4" style={{ borderLeft: '2px solid #e9ecef' }}>
                <div className="timeline-item position-relative mb-4">
                  <div className="position-absolute rounded-circle border border-2 border-white" 
                       style={{ width: '14px', height: '14px', background: '#e30019', left: '-32px', top: '4px' }}></div>
                  <div className="fw-bold small text-danger">Hiện tại</div>
                  <div className="text-dark mt-1">Trạng thái: <strong>{getStatusLabel(result.status)}</strong></div>
                </div>
                {result.paymentStatus === 'COMPLETED' && (
                  <div className="timeline-item position-relative mb-4">
                    <div className="position-absolute rounded-circle border border-2 border-white" 
                         style={{ width: '14px', height: '14px', background: '#28a745', left: '-32px', top: '4px' }}></div>
                    <div className="text-success small fw-bold">Thanh toán</div>
                    <div className="text-dark mt-1">Đã hoàn tất thanh toán qua {result.paymentMethod}</div>
                  </div>
                )}
                <div className="timeline-item position-relative">
                   <div className="position-absolute rounded-circle border border-2 border-white" 
                        style={{ width: '14px', height: '14px', background: '#adb5bd', left: '-32px', top: '4px' }}></div>
                   <div className="text-secondary small fw-bold">{new Date(result.orderDate).toLocaleTimeString('vi-VN')} {new Date(result.orderDate).toLocaleDateString('vi-VN')}</div>
                   <div className="text-dark mt-1">Đơn hàng đã được khởi tạo trên hệ thống.</div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-4">
               <Link to="/" className="btn btn-outline-secondary px-4">Về trang chủ</Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
