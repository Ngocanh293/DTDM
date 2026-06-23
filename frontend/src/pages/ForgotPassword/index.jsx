import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Vui lòng nhập email');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://pcestore.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSuccess('Link đặt lại mật khẩu đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư (kể cả mục Spam).');
      } else {
        const data = await response.text();
        setError(data || 'Không tìm thấy tài khoản với email này.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <span className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                <i className="bi bi-key fs-4"></i>
              </span>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>Quên mật khẩu?</h2>
            <p className="text-muted small">Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu cho bạn</p>
          </div>

          {/* Thông báo */}
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </div>
          )}
          {success && (
            <div className="alert alert-success py-2 small" role="alert">
              <i className="bi bi-check-circle-fill me-2"></i>{success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium" htmlFor="forgotEmail">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  id="forgotEmail"
                  placeholder="Nhập email đã đăng ký"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  required
                />
              </div>
            </div>

            {/* Nút gửi */}
            <button
              type="submit"
              className="btn btn-danger w-100 py-2 rounded-3 fw-medium"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</>
              ) : (
                <><i className="bi bi-send me-2"></i>Gửi link đặt lại</>
              )}
            </button>
          </form>

          {/* Link quay lại */}
          <div className="text-center mt-4 pt-2 border-top">
            <Link to="/login" className="text-decoration-none small text-muted">
              <i className="bi bi-arrow-left me-1"></i>Quay lại Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
