import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu nhập lại không khớp!');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://pcestore.onrender.com/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Đăng ký thành công! Vui lòng đăng nhập.');
        navigate('/login');
      } else {
        const data = await response.json().catch(() => null);
        if (data && data.message) {
            setError(data.message);
        } else {
            setError('Đăng ký thất bại. Vui lòng kiểm tra kỹ email, SĐT hoặc định dạng mật khẩu!');
        }
      }
    } catch (err) {
      console.error(err);
      setError('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '70vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '500px' }}>
        <div className="card-body p-5">
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-1" style={{ color: '#2b3452' }}>Tạo tài khoản</h2>
            <p className="text-muted small">Điền thông tin để đăng ký tài khoản mới</p>
          </div>
          
          {error && (
            <div className="alert alert-danger py-2 small" role="alert">
              <i className="bi bi-exclamation-triangle-fill me-2"></i>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="fullName">Họ và tên</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-person text-muted"></i>
                </span>
                <input type="text" className="form-control bg-light border-start-0 ps-0" id="fullName" placeholder="Nhập họ và tên" value={formData.fullName} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="email">Email</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-envelope text-muted"></i>
                </span>
                <input type="email" className="form-control bg-light border-start-0 ps-0" id="email" placeholder="example@gmail.com" value={formData.email} onChange={handleChange} required />
              </div>
            </div>
            
            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="phone">Số điện thoại</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-telephone text-muted"></i>
                </span>
                <input type="tel" className="form-control bg-light border-start-0 ps-0" id="phone" placeholder="VD: 0912345678" value={formData.phone} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary small fw-medium" htmlFor="password">Mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-lock text-muted"></i>
                </span>
                <input type="password" className="form-control bg-light border-start-0 ps-0" id="password" placeholder="9+ ký tự, in hoa, số và ký tự biểu tượng" value={formData.password} onChange={handleChange} required />
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary small fw-medium" htmlFor="confirmPassword">Nhập lại mật khẩu</label>
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-shield-lock text-muted"></i>
                </span>
                <input type="password" className="form-control bg-light border-start-0 ps-0" id="confirmPassword" placeholder="Nhập lại mật khẩu" value={formData.confirmPassword} onChange={handleChange} required />
              </div>
            </div>
            
            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3 fw-medium" disabled={loading}>
              {loading ? 'Đang xử lý...' : 'Đăng ký ngay'}
            </button>
            
            <div className="text-center mt-4 pt-2 border-top">
              <p className="small text-muted mb-0">
                Đã có tài khoản? <Link to="/login" className="text-decoration-none fw-semibold">Đăng nhập</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
