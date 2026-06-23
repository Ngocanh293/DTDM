import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  // Validate phía client trước khi gửi
  const validate = () => {
    if (!form.fullName.trim()) return 'Vui lòng nhập họ và tên';
    if (!form.email.trim()) return 'Vui lòng nhập email';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Email không hợp lệ';
    if (!form.password) return 'Vui lòng nhập mật khẩu';
    if (form.password.length < 9) return 'Mật khẩu phải có ít nhất 9 ký tự';
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password)) {
      return 'Mật khẩu phải chứa chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)';
    }
    if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp';
    if (form.phone && !/^(?:0|\+84)[\s.]?(?:3[2-9]|5[689]|7[06-9]|8[1-689]|9[0-46-9])\d[\s.]?\d{3}[\s.]?\d{3}$/.test(form.phone)) {
      return 'Số điện thoại không hợp lệ';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://pcestore.onrender.com/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (response.ok) {
        setSuccess('Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
        setForm({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
      } else {
        const data = await response.text();
        setError(data || 'Đăng ký thất bại. Vui lòng thử lại!');
      }
    } catch (err) {
      setError('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra Backend có đang chạy không!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '460px' }}>
        <div className="card-body p-5">
          {/* Header */}
          <div className="text-center mb-4">
            <div className="mb-3">
              <span className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '56px', height: '56px' }}>
                <i className="bi bi-person-plus fs-4"></i>
              </span>
            </div>
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>Tạo tài khoản</h2>
            <p className="text-muted small">Đăng ký để mua sắm linh kiện PC chính hãng</p>
          </div>

          {/* Thông báo lỗi */}
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>{error}
            </div>
          )}

          {/* Thông báo thành công */}
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
            {/* Họ và tên */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="fullName">
                Họ và tên <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control bg-light border-start-0 ps-0"
                  id="fullName"
                  name="fullName"
                  placeholder="Nguyễn Văn A"
                  value={form.fullName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="regEmail">
                Email <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input
                  type="email"
                  className="form-control bg-light border-start-0 ps-0"
                  id="regEmail"
                  name="email"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Số điện thoại */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="phone">
                Số điện thoại <span className="text-muted">(tuỳ chọn)</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-phone text-muted"></i>
                </span>
                <input
                  type="tel"
                  className="form-control bg-light border-start-0 ps-0"
                  id="phone"
                  name="phone"
                  placeholder="0901 234 567"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="regPassword">
                Mật khẩu <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="form-control bg-light border-start-0 border-end-0 ps-0"
                  id="regPassword"
                  name="password"
                  placeholder="Tối thiểu 9 ký tự"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
              <div className="form-text small">
                Chứa chữ hoa, chữ thường, số và ký tự đặc biệt
              </div>
            </div>

            {/* Xác nhận mật khẩu */}
            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium" htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className="text-danger">*</span>
              </label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-lock text-muted"></i>
                </span>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  className="form-control bg-light border-start-0 border-end-0 ps-0"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-group-text bg-light border-start-0"
                  onClick={() => setShowConfirm(!showConfirm)}
                  tabIndex={-1}
                >
                  <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                </button>
              </div>
            </div>

            {/* Nút đăng ký */}
            <button
              type="submit"
              className="btn btn-danger w-100 py-2 rounded-3 fw-medium"
              disabled={loading}
            >
              {loading ? (
                <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
              ) : (
                <><i className="bi bi-person-plus me-2"></i>Đăng ký</>
              )}
            </button>

            {/* Divider */}
            <div className="d-flex align-items-center my-4">
              <hr className="flex-grow-1" />
              <span className="mx-3 text-muted small">hoặc</span>
              <hr className="flex-grow-1" />
            </div>

            {/* Google OAuth */}
            <div className="d-flex justify-content-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  setLoading(true);
                  setError('');
                  try {
                    const response = await fetch('https://pcestore.onrender.com/api/auth/google-login', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ idToken: credentialResponse.credential })
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      login(data.accessToken, data.role, { id: data.userId }, data.refreshToken);
                      
                      if (data.role === 'ADMIN') {
                        window.location.href = '/admin';
                      } else if (data.role === 'EMPLOYEE') {
                        window.location.href = '/employee';
                      } else {
                        window.location.href = '/';
                      }
                    } else {
                      setError('Đăng ký/Đăng nhập Google thất bại từ máy chủ.');
                    }
                  } catch (err) {
                    setError('Lỗi kết nối khi tích hợp Google.');
                  } finally {
                    setLoading(false);
                  }
                }}
                onError={() => {
                  setError('Lỗi khi xác thực tài khoản Google.');
                }}
                useOneTap
                theme="outline"
                width="100%"
                text="continue_with"
              />
            </div>

            {/* Link đăng nhập */}
            <div className="text-center mt-4 pt-2 border-top">
              <p className="small text-muted mb-0">
                Đã có tài khoản? <Link to="/login" className="text-decoration-none fw-semibold text-danger">Đăng nhập ngay</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
