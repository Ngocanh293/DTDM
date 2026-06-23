import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('loading'); // 'loading' | 'success' | 'error' | 'no-token'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  // Tự động xác thực khi có token
  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch('https://pcestore.onrender.com/api/auth/verify-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          setStatus('success');
          setMessage('Email đã được xác thực thành công!');
        } else {
          const data = await response.text();
          setStatus('error');
          setMessage(data || 'Token không hợp lệ hoặc đã hết hạn.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Lỗi kết nối tới máy chủ. Vui lòng thử lại sau.');
      }
    };

    verifyEmail();
  }, [token]);

  // Gửi lại email xác thực
  const handleResend = async (e) => {
    e.preventDefault();
    if (!resendEmail.trim()) return;

    setResendLoading(true);
    setResendMsg('');
    try {
      const response = await fetch(`https://pcestore.onrender.com/api/auth/resend-verification?email=${encodeURIComponent(resendEmail)}`, {
        method: 'POST',
      });

      if (response.ok) {
        setResendMsg('Đã gửi lại email xác thực! Kiểm tra hộp thư của bạn.');
      } else {
        setResendMsg('Không thể gửi lại. Email không tồn tại hoặc đã xác thực.');
      }
    } catch (err) {
      setResendMsg('Lỗi kết nối tới máy chủ.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '450px' }}>
        <div className="card-body p-5 text-center">

          {/* Trạng thái: Đang xử lý */}
          {status === 'loading' && (
            <>
              <div className="mb-4">
                <div className="spinner-border text-danger" style={{ width: '48px', height: '48px' }} role="status">
                  <span className="visually-hidden">Đang xác thực...</span>
                </div>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Đang xác thực email...</h4>
              <p className="text-muted small">Vui lòng chờ trong giây lát</p>
            </>
          )}

          {/* Trạng thái: Thành công */}
          {status === 'success' && (
            <>
              <div className="mb-3">
                <span className="bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-check-circle fs-2"></i>
                </span>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Xác thực thành công!</h4>
              <p className="text-muted small mb-4">{message}</p>
              <Link to="/login" className="btn btn-danger rounded-3 px-4">
                <i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập ngay
              </Link>
            </>
          )}

          {/* Trạng thái: Lỗi */}
          {status === 'error' && (
            <>
              <div className="mb-3">
                <span className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-x-circle fs-2"></i>
                </span>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Xác thực thất bại</h4>
              <p className="text-muted small mb-4">{message}</p>

              {/* Form gửi lại */}
              <div className="bg-light rounded-3 p-3 text-start">
                <p className="small fw-medium mb-2">Gửi lại email xác thực:</p>
                <form onSubmit={handleResend}>
                  <div className="input-group input-group-sm">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập email của bạn"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-danger" type="submit" disabled={resendLoading}>
                      {resendLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Gửi lại'}
                    </button>
                  </div>
                  {resendMsg && <small className="text-success d-block mt-2"><i className="bi bi-check-circle me-1"></i>{resendMsg}</small>}
                </form>
              </div>
            </>
          )}

          {/* Trạng thái: Không có token */}
          {status === 'no-token' && (
            <>
              <div className="mb-3">
                <span className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px' }}>
                  <i className="bi bi-envelope-exclamation fs-2"></i>
                </span>
              </div>
              <h4 className="fw-bold mb-2" style={{ color: '#2b3452' }}>Xác thực email</h4>
              <p className="text-muted small mb-4">
                Chúng tôi đã gửi email xác thực đến địa chỉ email bạn đăng ký. Vui lòng kiểm tra hộp thư và click vào link xác thực.
              </p>

              {/* Form gửi lại */}
              <div className="bg-light rounded-3 p-3 text-start mb-3">
                <p className="small fw-medium mb-2">Không nhận được email? Gửi lại:</p>
                <form onSubmit={handleResend}>
                  <div className="input-group input-group-sm">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Nhập email của bạn"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-danger" type="submit" disabled={resendLoading}>
                      {resendLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Gửi lại'}
                    </button>
                  </div>
                  {resendMsg && <small className="text-success d-block mt-2"><i className="bi bi-check-circle me-1"></i>{resendMsg}</small>}
                </form>
              </div>

              <Link to="/login" className="text-decoration-none small text-muted">
                <i className="bi bi-arrow-left me-1"></i>Quay lại Đăng nhập
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
