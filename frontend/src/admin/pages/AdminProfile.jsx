import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';
import Swal from 'sweetalert2';

export default function AdminProfile() {
  const { user, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [avatar, setAvatar] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    // Fetch fresh data from server
    apiClient.get('/users/profile')
      .then(res => {
        setProfile({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
      })
      .catch(console.error);
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      
      // 1. Update Profile Info
      await apiClient.put('/users/profile', {
        fullName: profile.fullName,
        phone: profile.phone
      });
      updateUserInfo({ fullName: profile.fullName, phone: profile.phone });

      // 2. Update Avatar if selected
      if (avatar) {
        const formData = new FormData();
        formData.append('file', avatar);
        const avatarRes = await apiClient.post('/users/profile/avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        updateUserInfo({ avatarUrl: avatarRes.data });
      }

      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setMessage({ type: 'danger', text: 'Lỗi khi cập nhật hồ sơ' });
    } finally {
      setLoading(false);
    }
  };

      const handleChangePassword = async (e) => {
      e.preventDefault();
      try {
        await apiClient.put('/users/change-password', { oldPassword, newPassword });
        Swal.fire({icon: 'success', title: 'Thành công', text: 'Đổi mật khẩu thành công!'});
        setOldPassword('');
        setNewPassword('');
      } catch (err) {
        Swal.fire({icon: 'error', title: 'Lỗi', text: err.response?.data?.message || 'Mật khẩu cũ không chính xác!'});
      }
  };

  return (
    <div className="container-fluid">
       <div className="mb-4">
          <h1 className="fs-3">Hồ sơ Quản trị viên</h1>
          <p className="text-secondary text-sm">Quản lý thông tin định danh và bảo mật tài khoản hệ thống</p>
       </div>

       {message && <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
       </div>}

       <div className="row g-4">
          {/* Avatar Card */}
          <div className="col-12 col-lg-4">
             <div className="card shadow-sm border-0 text-center p-4">
                <div className="mb-3 position-relative d-inline-block mx-auto">
                    <img 
                      src={formatImageUrl(user?.avatarUrl) || "/avatar/avatar-1.jpg"} 
                      alt="Admin" 
                      className="rounded-circle shadow-sm object-fit-cover" 
                      style={{ width: '120px', height: '120px', border: '4px solid #f8f9fa' }}
                    />
                </div>
                <h5 className="mb-1">{user?.name || user?.fullName || 'Admin'}</h5>
                <p className="text-muted small mb-3">{user?.email}</p>
                <div className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-3 py-2 mb-4">
                   QUẢN TRỊ VIÊN
                </div>
                
                <div className="text-start">
                   <label className="form-label small fw-bold">Thay đổi ảnh đại diện</label>
                   <input type="file" className="form-control form-control-sm" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
                </div>
             </div>
          </div>

          {/* Info Card */}
          <div className="col-12 col-lg-8">
             <div className="card shadow-sm border-0 mb-4">
                <div className="card-header bg-white py-3 border-bottom">
                   <h5 className="mb-0 fs-6">Thông tin chi tiết</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleUpdate}>
                      <div className="row g-3">
                         <div className="col-md-6">
                            <label className="form-label small text-muted">Email hệ thống</label>
                            <input type="text" className="form-control bg-light" value={profile.email} disabled />
                         </div>
                         <div className="col-md-6">
                            <label className="form-label small">Họ và tên hiển thị</label>
                            <input type="text" className="form-control" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} required />
                         </div>
                         <div className="col-12">
                            <label className="form-label small">Số điện thoại liên lạc</label>
                            <input type="text" className="form-control" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                         </div>
                      </div>
                      <button type="submit" className="btn btn-primary mt-4 px-4 fw-bold shadow-none" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Cập nhật hồ sơ'}
                      </button>
                   </form>
                </div>
             </div>

             <div className="card shadow-sm border-0 border-start border-4 border-warning">
                <div className="card-header bg-white py-3 border-bottom">
                   <h5 className="mb-0 fs-6">Đổi mật khẩu bảo mật</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleChangePassword}>
                      <div className="row g-3">
                         <div className="col-md-6">
                            <label className="form-label small">Mật khẩu hiện tại</label>
                            <input type="password" placeholder="••••••••" className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                         </div>
                         <div className="col-md-6">
                            <label className="form-label small">Mật khẩu mới</label>
                            <input type="password" placeholder="Nhập mật khẩu mới" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                         </div>
                      </div>
                      <button type="submit" className="btn btn-warning mt-4 px-4 fw-bold shadow-none">Xác nhận đổi mật khẩu</button>
                   </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
