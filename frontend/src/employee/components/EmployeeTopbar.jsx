import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';

export default function EmployeeTopbar({ toggleSidebar, toggleMobileSidebar, isSidebarCollapsed }) {
  const { user, logout } = useAuth();

  return (
    <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3 ${isSidebarCollapsed ? 'full' : ''}`}>
      <div className="d-flex align-items-center">
        <button 
          id="toggleBtn" 
          className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm me-3"
          onClick={toggleSidebar}
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>

        <button 
          id="mobileBtn" 
          className="btn btn-light btn-icon btn-sm d-lg-none me-2"
          onClick={toggleMobileSidebar}
        >
          <i className="ti ti-layout-sidebar-left-expand"></i>
        </button>
        <span className="fw-bold d-none d-md-inline-block">Cổng thông tin Nhân viên</span>
      </div>
      
      <div className="ms-auto d-flex align-items-center gap-3">
        <div className="text-end d-none d-sm-block">
          <p className="mb-0 small fw-bold">{user?.name || user?.fullName || 'Nhân viên'}</p>
          <p className="mb-0 text-muted" style={{ fontSize: '11px' }}>
            {user?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên vận hành'}
          </p>
        </div>
        <div className="dropdown">
           <a href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
              <img src={formatImageUrl(user?.avatarUrl) || "/avatar/avatar-1.jpg"} alt="" className="avatar avatar-sm rounded-circle shadow-sm" style={{ border: '2px solid #fff' }} />
           </a>
           <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
              <li><Link className="dropdown-item py-2" to="/employee/profile"><i className="bi bi-person me-2"></i>Thông tin hồ sơ</Link></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item py-2 text-danger" onClick={logout}><i className="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
           </ul>
        </div>
      </div>
    </nav>
  );
}
