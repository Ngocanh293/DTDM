import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './authModal.css';

export default function AuthModal({ isOpen, onClose, onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://pcestore.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        login(data.accessToken, { email });
        if (onSuccess) onSuccess();
        onClose();
      } else {
        setError('Email hoặc mật khẩu không chính xác!');
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối tới máy chủ. Vui lòng kiểm tra Backend!');
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target.className === 'auth-modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="auth-modal-overlay" onClick={handleOverlayClick}>
      <div className="auth-modal-card">
        <button className="auth-modal-close" onClick={onClose}>&times;</button>
        
        <div className="auth-modal-header">
          <h2>Đăng nhập</h2>
          <p>Vui lòng đăng nhập để tiếp tục</p>
        </div>

        {error && (
          <div className="alert alert-danger py-2 small mb-3" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="auth-form-label">Email</label>
            <div className="auth-input-group">
              <i className="bi bi-envelope auth-input-icon"></i>
              <input
                type="email"
                className="auth-input"
                placeholder="Nhập Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="auth-form-label">Mật khẩu</label>

            <div className="auth-input-group">
              <i className="bi bi-lock auth-input-icon"></i>
              <input
                type={showPassword ? "text" : "password"}
                className="auth-input auth-input-password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i 
                className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} auth-toggle-password`} 
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              ></i>
            </div>
          </div>

          <div className="auth-remember-row">
            <input type="checkbox" id="modal-remember" />
            <label htmlFor="modal-remember">Nhớ tài khoản</label>
          </div>

          <button type="submit" className="auth-submit-btn" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <div className="auth-footer">
            <p>
              Chưa có tài khoản? <Link to="/signup" className="auth-signup-link" onClick={onClose}>Đăng ký ngay</Link>
            </p>
            <div className="mt-3">
              <a href="#" className="auth-forgot-link-footer">Quên mật khẩu?</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
