import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function SecurityTab() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [emailForm, setEmailForm] = useState({ newEmail: '' });
  const [message, setMessage] = useState(null);
  const [emailMsg, setEmailMsg] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'danger', text: 'Mật khẩu xác nhận không khớp!' });
      return;
    }
    try {
      setLoading(true);
      setMessage(null);
      await apiClient.put('/users/change-password', {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword
      });
      setMessage({ type: 'success', text: 'Đổi mật khẩu thành công!' });
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi khi đổi mật khẩu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async (e) => {
    e.preventDefault();
    try {
      setEmailLoading(true);
      setEmailMsg(null);
      await apiClient.post(`/users/email-change?newEmail=${emailForm.newEmail}`);
      setEmailMsg({ type: 'success', text: 'Yêu cầu đã được gửi! Vui lòng kiểm tra hộp thư của email mới để xác nhận.' });
      setEmailForm({ newEmail: '' });
    } catch (err) {
      setEmailMsg({ type: 'danger', text: err.response?.data?.message || 'Lỗi khi yêu cầu đổi Email.' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản này? Hành động này không thể hoàn tác!")) return;
    try {
      await apiClient.delete('/users/deactivate');
      alert("Tài khoản đã được xóa!");
      logout();
      navigate('/login');
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi xóa tài khoản.");
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-shield-lock text-danger me-2"></i>Cài đặt Bảo mật</h5>
        
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        
        <form onSubmit={handleChangePassword} className="mb-5">
          <h6 className="fw-bold mb-3">Đổi mật khẩu</h6>
          <div className="mb-3">
            <label className="form-label text-muted small">Mật khẩu hiện tại</label>
            <input 
              type="password" 
              className="form-control" 
              value={passwordForm.oldPassword}
              onChange={e => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
              required 
            />
          </div>
          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label text-muted small">Mật khẩu mới</label>
              <input 
                type="password" 
                className="form-control" 
                value={passwordForm.newPassword}
                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required 
              />
            </div>
            <div className="col-md-6">
              <label className="form-label text-muted small">Xác nhận mật khẩu mới</label>
              <input 
                type="password" 
                className="form-control" 
                value={passwordForm.confirmPassword}
                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required 
              />
            </div>
          </div>
          <button type="submit" className="btn btn-dark" disabled={loading}>
            {loading ? 'Đang xử lý...' : 'Cập nhật Mật khẩu'}
          </button>
        </form>

        <hr className="my-4" />

        <form onSubmit={handleEmailChange} className="mb-5">
          <h6 className="fw-bold mb-3">Yêu cầu đổi Email</h6>
          {emailMsg && <div className={`alert alert-${emailMsg.type}`}>{emailMsg.text}</div>}
          <div className="mb-3">
            <label className="form-label text-muted small">Địa chỉ Email mới</label>
            <div className="input-group">
              <input 
                type="email" 
                className="form-control" 
                value={emailForm.newEmail}
                onChange={e => setEmailForm({ newEmail: e.target.value })}
                required 
                placeholder="Nhập email mới của bạn..."
              />
              <button type="submit" className="btn btn-primary" disabled={emailLoading}>
                {emailLoading ? 'Đang gửi...' : 'Gửi Yêu cầu'}
              </button>
            </div>
            <div className="form-text">Hệ thống sẽ gửi một liên kết xác nhận đến Email mới của bạn để hoàn tất việc đổi.</div>
          </div>
        </form>

        <hr className="my-4" />

        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h6 className="fw-bold text-danger mb-1">Xóa tài khoản</h6>
            <p className="small text-muted mb-0">Xóa vĩnh viễn tài khoản và dữ liệu cá nhân của bạn khỏi hệ thống.</p>
          </div>
          <button className="btn btn-outline-danger" onClick={handleDeleteAccount}>
            Xóa Tài khoản
          </button>
        </div>
      </div>
    </div>
  );
}
