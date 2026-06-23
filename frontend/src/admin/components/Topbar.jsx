import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils';

export default function Topbar({ toggleSidebar, toggleMobileSidebar, isSidebarCollapsed }) {
  const { user } = useAuth();
  
  useEffect(() => {
    document.documentElement.removeAttribute('data-bs-theme');
    localStorage.removeItem('adminTheme');
  }, []);

  return (
    <nav id="topbar" className={`navbar bg-white border-bottom fixed-top topbar px-3 ${isSidebarCollapsed ? 'full' : ''}`}>
      <button 
        id="toggleBtn" 
        className="d-none d-lg-inline-flex btn btn-light btn-icon btn-sm"
        onClick={toggleSidebar}
      >
        <i className="ti ti-layout-sidebar-left-expand"></i>
      </button>

      {/* MOBILE */}
      <button 
        id="mobileBtn" 
        className="btn btn-light btn-icon btn-sm d-lg-none me-2"
        onClick={toggleMobileSidebar}
      >
        <i className="ti ti-layout-sidebar-left-expand"></i>
      </button>
      
      <div>
        {/* Navbar nav */}
        <ul className="list-unstyled d-flex align-items-center mb-0 gap-1">

          {/* Avatar Profile Link */}
          <li className="ms-3">
            <Link to="/admin/profile" title="Chỉnh sửa hồ sơ cá nhân">
              <img src={formatImageUrl(user?.avatarUrl) || "/avatar/avatar-1.jpg"} alt="User Avatar" className="avatar avatar-sm rounded-circle shadow-sm" style={{ border: '2px solid #fff' }} />
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
