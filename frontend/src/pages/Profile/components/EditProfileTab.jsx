import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';

export default function EditProfileTab() {
  const { updateUserInfo } = useAuth();
  const [formData, setFormData] = useState({ fullName: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [emailMessage, setEmailMessage] = useState(null);

  useEffect(() => {
    apiClient.get('/users/profile')
      .then(res => setFormData({ 
        fullName: res.data.fullName || res.data.name || '', 
        phone: res.data.phone || '' 
      }))
      .catch(console.error);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone && formData.phone.trim() !== '' ? formData.phone : null
      };
      await apiClient.put('/users/profile', payload);
      updateUserInfo({ fullName: formData.fullName, phone: formData.phone });
      
      if (avatar) {
        const uploadForm = new FormData();
        uploadForm.append('file', avatar);
        const avatarRes = await apiClient.post('/users/profile/avatar', uploadForm, {
           headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateUserInfo({ avatarUrl: avatarRes.data });
      }
      setMessage({ type: 'success', text: 'Cập nhật thông tin thành công!' });
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ.' });
    } finally {
      setLoading(false);
    }
  };

  const handlDeactivate = async () => {
    if(window.confirm('BẠN CÓ CHẮC CHẮN MUỐN XÓA TÀI KHOẢN? Hành động này không thể hoàn tác!')) {
      try {
          await apiClient.delete('/users/deactivate');
          alert('Tài khoản đã được vô hiệu hóa. Bạn sẽ bị đăng xuất.');
          window.location.href = '/login';
      } catch (err) {
          alert(err.response?.data?.message || 'Có lỗi xảy ra khi xóa tài khoản');
      }
    }
  };

  const handleRequestEmailChange = async () => {
    if (!newEmail || newEmail.trim() === '') return;
    try {
        setEmailMessage({ type: 'info', text: 'Đang gửi yêu cầu...' });
        await apiClient.post('/users/email-change?newEmail=' + encodeURIComponent(newEmail));
        setEmailMessage({ type: 'success', text: 'Vui lòng kiểm tra email mới để xác nhận!' });
        setNewEmail('');
    } catch(err) {
        setEmailMessage({ type: 'danger', text: err.response?.data?.message || 'Có lỗi xảy ra' });
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-person-lines-fill text-danger me-2"></i>Chỉnh sửa Hồ sơ</h5>
        
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}
        
        <form onSubmit={handleUpdate} className="mb-5">
          <div className="mb-3">
            <label className="form-label text-muted small">Họ và tên</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.fullName} 
              onChange={e => setFormData({ ...formData, fullName: e.target.value })} 
              required 
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-muted small">Số điện thoại</label>
            <input 
              type="text" 
              className="form-control" 
              value={formData.phone} 
              onChange={e => setFormData({ ...formData, phone: e.target.value })} 
            />
          </div>
          <div className="mb-4">
            <label className="form-label text-muted small">Ảnh đại diện (Avatar)</label>
            <input 
              type="file" 
              className="form-control" 
              accept="image/*"
              onChange={e => setAvatar(e.target.files[0])} 
            />
          </div>
          <button type="submit" className="btn btn-danger" disabled={loading}>
            {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
          </button>
        </form>

        <hr />
        
        <div className="mt-4">
            <h6 className="fw-bold mb-3">Đổi Địa Chỉ Email</h6>
            {emailMessage && <div className={`alert alert-${emailMessage.type} small py-2`}>{emailMessage.text}</div>}
            <div className="input-group mb-3">
                <input 
                    type="email" 
                    className="form-control" 
                    placeholder="Nhập email mới" 
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                />
                <button className="btn btn-outline-secondary" type="button" onClick={handleRequestEmailChange}>Mã Xác Nhận</button>
            </div>
            <small className="text-muted d-block mb-4">Một email chứa đường dẫn xác nhận sẽ được gửi tới hòm thư mới của bạn.</small>
        </div>

        <hr />

        <div className="mt-4">
            <h6 className="fw-bold text-danger mb-3">Vùng Nguy Hiểm</h6>
            <p className="text-muted small">Vô hiệu hóa tài khoản sẽ xóa tài khoản vĩnh viễn khỏi hệ thống và bạn không thể đăng nhập lại.</p>
            <button type="button" className="btn btn-outline-danger btn-sm fw-bold" onClick={handlDeactivate}>
                Vô Hiệu Hóa Tài Khoản
            </button>
        </div>
      </div>
    </div>
  );
}
