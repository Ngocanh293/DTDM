import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import apiClient from '../services/api';

export default function EmailChangeConfirm() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('Đang xác minh email mới của bạn...');
  
  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Liên kết không hợp lệ. Vui lòng kiểm tra lại email.');
      return;
    }
    
    apiClient.get(`/users/email-change/confirm?token=${encodeURIComponent(token)}`)
      .then(res => {
        setStatus('success');
        setMessage(res.data || 'Địa chỉ email của bạn đã được thay đổi thành công.');
      })
      .catch(err => {
        setStatus('error');
        setMessage(err.response?.data?.message || 'Liên kết xác nhận đã hết hạn hoặc không hợp lệ.');
      });
  }, [searchParams]);

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="card shadow-lg border-0 rounded-4" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body p-5 text-center">
          
          {status === 'loading' && (
            <div className="mb-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mb-4 text-success">
              <i className="bi bi-check-circle-fill" style={{ fontSize: '3rem' }}></i>
            </div>
          )}

          {status === 'error' && (
            <div className="mb-4 text-danger">
              <i className="bi bi-x-circle-fill" style={{ fontSize: '3rem' }}></i>
            </div>
          )}

          <h4 className="fw-bold mb-3">Xác Nhận Email</h4>
          <p className="text-muted mb-4">{message}</p>

          {(status === 'success' || status === 'error') && (
            <Link to="/profile" className="btn btn-primary px-4 py-2 rounded-3 fw-medium">
              Quay lại Hồ Sơ
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
