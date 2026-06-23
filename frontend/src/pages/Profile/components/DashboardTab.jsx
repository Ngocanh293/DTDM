import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

export default function DashboardTab() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/profile');
      setProfileData(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-speedometer2 text-danger me-2"></i>Dashboard Cá nhân</h5>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-danger"></div></div>
        ) : profileData ? (
          <div className="row g-4">
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3">
                <p className="text-muted small mb-1">Họ và tên</p>
                <div className="fw-bold">{profileData.fullName || profileData.name || 'N/A'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3">
                <p className="text-muted small mb-1">Email</p>
                <div className="fw-bold">{profileData.email}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3">
                <p className="text-muted small mb-1">Số điện thoại</p>
                <div className="fw-bold">{profileData.phone || 'Chưa cập nhật'}</div>
              </div>
            </div>
            <div className="col-md-6">
              <div className="p-3 bg-light rounded-3">
                <p className="text-muted small mb-1">Vai trò</p>
                <div className="fw-bold">
                  {profileData.roles ? profileData.roles.join(', ') : profileData.role || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-muted">Không tải được thông tin, vui lòng thử lại sau.</p>
        )}
      </div>
    </div>
  );
}
