import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate
    if (!password) return setError('Vui lòng nhập mật khẩu mới');
    if (password.length < 9) return setError('Mật khẩu phải có ít nhất 9 ký tự');
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(password)) {
      return setError('Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt');
    }
    if (password !== confirmPassword) return setError('Mật khẩu xác nhận không khớp');
    if (!token) return setError('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn');

    setLoading(true);
    try {
      const response = await fetch('https://pcestore.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });

      if (response.ok) {
        setSuccess('Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.');
        setPassword('');
        setConfirmPassword('');
      } else {
        const data = await response.text();
        setError(data || 'Link đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau!');
    } finally {
      setLoading(false);
    }
  };

  // Trường hợp không có token
  if (!token) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
          <div className="card-body p-5 text-center">
            <span className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '56px', height: '56px' }}>
              <i className="bi bi-exclamation-triangle fs-4"></i>
            </span>
            <h4 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Link không hợp lệ</h4>
            <p className="text-muted small mb-4">Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu gửi lại.</p>
            <Link to="/forgot-password" className="btn btn-danger rounded-3">
              <i className="bi bi-arrow-repeat me-2"></i>Yêu cầu link mới
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="card-body p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <span className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                <i className="bi bi-shield-lock fs-4"></i>
              </span>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>Đặt lại mật khẩu</h2>
            <p className="text-muted small">Nhập mật khẩu mới cho tài khoản của bạn</p>
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
              <div className="mt-2">
                <Link to="/login" className="btn btn-success btn-sm">
                  <i className="bi bi-box-arrow-in-right me-1"></i>Đi tới Đăng nhập
                </Link>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Mật khẩu mới */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="newPassword">Mật khẩu mới</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-light border-start-0 border-end-0 ps-0"
                  id="newPassword"
                  placeholder="Tối thiểu 9 ký tự"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  required
                />
                <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}>
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
              <div className="form-text small">Chứa chữ hoa, chữ thường, số và ký tự đặc biệt</div>
            </div>

            {/* Xác nhận */}
            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium" htmlFor="confirmNewPw">Xác nhận mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-lock text-muted"></i>
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control bg-light border-start-0 border-end-0 ps-0"
                  id="confirmNewPw"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
                  required
                />
                <button type="button" className="input-group-text bg-light border-start-0" onClick={() => setShowConfirm(!showConfirm)} tabIndex={-1}>
                  <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            {/* Nút submit */}
            <button type="submit" className="btn btn-danger w-100 py-2 rounded-3 fw-medium" disabled={loading}>
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
              ) : (
                <><i className="bi bi-check-lg me-2"></i>Đặt lại mật khẩu</>
              )}
            </button>
          </form>

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
