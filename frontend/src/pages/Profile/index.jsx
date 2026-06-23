import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';

// Import các Tab Components
import DashboardTab from './components/DashboardTab';
import EditProfileTab from './components/EditProfileTab';
import SecurityTab from './components/SecurityTab';
import MfaTab from './components/MfaTab';
import AddressTab from './components/AddressTab';
import NotificationsTab from './components/NotificationsTab';
import NotificationSettingsTab from './components/NotificationSettingsTab';
import OrdersTab from './components/OrdersTab';
import ReviewsTab from './components/ReviewsTab';

export default function Profile() {
  const { user: authUser, logout: authLogout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const TABS = [
    { key: 'dashboard', label: 'Dashboard Cá nhân', icon: 'bi-speedometer2' },
    { key: 'edit-profile', label: 'Chỉnh sửa Hồ sơ', icon: 'bi-person-lines-fill' },
    { key: 'security', label: 'Cài đặt Bảo mật', icon: 'bi-shield-lock' },
    { key: 'mfa', label: 'Quản lý MFA', icon: 'bi-phone-vibrate' },
    { key: 'addresses', label: 'Sổ địa chỉ', icon: 'bi-geo-alt' },
    { key: 'notifications', label: 'Thông báo của tôi', icon: 'bi-bell' },
    { key: 'notification-settings', label: 'Cài đặt Thông báo', icon: 'bi-gear-wide-connected' },
    { key: 'orders', label: 'Lịch sử Đơn hàng', icon: 'bi-box-seam' },
    { key: 'reviews', label: 'Đánh giá của tôi', icon: 'bi-star-half' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'edit-profile': return <EditProfileTab />;
      case 'security': return <SecurityTab />;
      case 'mfa': return <MfaTab />;
      case 'addresses': return <AddressTab />;
      case 'notifications': return <NotificationsTab />;
      case 'notification-settings': return <NotificationSettingsTab />;
      case 'orders': return <OrdersTab />;
      case 'reviews': return <ReviewsTab />;
      default: return <DashboardTab />;
    }
  };

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Tài khoản của tôi</li>
        </ol>
      </nav>

      <div className="row g-4">
        {/* SIDEBAR */}
        <div className="col-lg-3">
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden sticky-top" style={{ top: '80px', zIndex: 10 }}>
            <div className="p-4 text-center bg-danger bg-opacity-10">
              <div className="bg-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3 shadow-sm overflow-hidden" style={{ width: '80px', height: '80px' }}>
                {authUser?.avatarUrl ? (
                   <img src={formatImageUrl(authUser.avatarUrl)} alt="Avatar" className="w-100 h-100 object-fit-cover" />
                ) : (
                   <i className="bi bi-person fs-1 text-danger"></i>
                )}
              </div>
              <h6 className="fw-bold mb-0">{authUser?.name || authUser?.fullName || 'Người dùng'}</h6>
              <small className="text-muted">{authUser?.email || 'email@example.com'}</small>
              <div className="mt-2">
                 <span className="badge bg-danger text-white rounded-pill px-3">
                    {authUser?.role || 'Khách hàng'}
                 </span>
              </div>
            </div>
            
            <div className="list-group list-group-flush p-2">
              {TABS.map(tab => (
                <button
                  key={tab.key}
                  className={`list-group-item list-group-item-action border-0 rounded-3 mb-1 d-flex align-items-center gap-3 py-3 ${
                    activeTab === tab.key ? 'active bg-danger text-white fw-medium' : 'text-dark'
                  }`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <i className={`bi ${tab.icon} fs-5`}></i>
                  {tab.label}
                </button>
              ))}
              <hr className="my-2" />
              <button 
                className="list-group-item list-group-item-action border-0 rounded-3 text-secondary d-flex align-items-center gap-3 py-3" 
                onClick={authLogout}
              >
                <i className="bi bi-box-arrow-right fs-5"></i>
                Đăng xuất
              </button>
            </div>
          </div>
        </div>

        {/* NỘI DUNG TAB */}
        <div className="col-lg-9">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
}
