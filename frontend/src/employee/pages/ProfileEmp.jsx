import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfileEmp() {
  const { user, updateUserInfo } = useAuth();
  const [profile, setProfile] = useState({ fullName: '', email: '', phone: '' });
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        fullName: user.name || user.fullName || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
    // Fetch fresh data from server to be sure
    apiClient.get('/users/profile')
      .then(res => {
        setProfile({
          fullName: res.data.fullName || '',
          email: res.data.email || '',
          phone: res.data.phone || ''
        });
      })
      .catch(console.error);
  }, [user]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.put('/users/profile', {
        fullName: profile.fullName,
        phone: profile.phone
      });
      updateUserInfo({ fullName: profile.fullName, phone: profile.phone });
      alert('Cập nhật hồ sơ thành công!');
    } catch (err) {
      alert('Lỗi khi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await apiClient.post('/users/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      updateUserInfo({ avatarUrl: res.data });
      alert('Cập nhật ảnh đại diện thành công!');
    } catch (err) {
      alert('Lỗi cập nhật ảnh đại diện');
    }
  };

  const handleChangePassword = async (e) => {
      e.preventDefault();
      try {
        await apiClient.put('/users/change-password', { oldPassword, newPassword });
        alert('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
      } catch (err) {
        alert(err.response?.data?.message || 'Mật khẩu cũ không chính xác!');
      }
  };

  return (
    <div className="container-fluid">
       <div className="mb-4">
          <h1 className="fs-3">Hồ sơ cá nhân</h1>
          <p className="text-secondary text-sm">Cập nhật thông tin định danh nhân viên</p>
       </div>

       <div className="row g-4">
          <div className="col-12 col-md-6">
             <div className="card shadow-sm border-0">
                <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
                   <h5 className="mb-0 fs-6">Thông tin tài khoản</h5>
                </div>
                <div className="card-body p-4">
                   <div className="d-flex align-items-center gap-3 mb-4">
                      <img src={user?.avatarUrl ? `https://pcestore.onrender.com${user.avatarUrl}` : "https://ui-avatars.com/api/?name=" + (profile.fullName || 'NV') + "&background=random"} alt="Avatar" className="rounded-circle" style={{width: 72, height: 72, objectFit: 'cover'}} />
                      <div>
                         <label className="btn btn-sm btn-outline-primary mb-1">
                            Đổi ảnh đại diện
                            <input type="file" hidden accept="image/*" onChange={handleAvatarUpload} />
                         </label>
                         <div className="small text-muted">JPG, GIF hoặc PNG. Tối đa 5MB</div>
                      </div>
                   </div>
                   <form onSubmit={handleUpdate}>
                      <div className="mb-3">
                         <label className="form-label small text-muted">Email (Tài khoản được cấp)</label>
                         <input type="text" className="form-control bg-light" value={profile.email} disabled />
                      </div>
                      <div className="mb-3">
                         <label className="form-label small">Họ và tên</label>
                         <input type="text" className="form-control" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} required />
                      </div>
                      <div className="mb-4">
                         <label className="form-label small">Số điện thoại</label>
                         <input type="text" className="form-control" value={profile.phone} onChange={e => setProfile({...profile, phone: e.target.value})} />
                      </div>
                      <button type="submit" className="btn btn-primary px-4 fw-bold shadow-none" disabled={loading}>
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                   </form>
                </div>
             </div>
          </div>

          <div className="col-12 col-md-6">
             <div className="card shadow-sm border-0 border-start border-4 border-warning">
                <div className="card-header bg-white py-3 border-bottom">
                   <h5 className="mb-0 fs-6">Bảo mật & Mật khẩu</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleChangePassword}>
                      <div className="mb-3">
                         <label className="form-label small">Mật khẩu cũ</label>
                         <input type="password" placeholder="Nhập mật khẩu cũ" className="form-control" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required />
                      </div>
                      <div className="mb-4">
                         <label className="form-label small">Mật khẩu mới</label>
                         <input type="password" placeholder="Mật khẩu cực mạnh" className="form-control" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                      </div>
                      <button type="submit" className="btn btn-warning px-4 fw-bold shadow-none">Đổi mật khẩu</button>
                   </form>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
