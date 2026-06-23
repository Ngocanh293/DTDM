import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function EmployeeSidebar({ isCollapsed, isMobileShow }) {
  const location = useLocation();
  const navigate = useNavigate();

  const getNavLinkClass = (path) => {
    return `nav-link ${location.pathname.startsWith(path) ? 'active' : ''}`;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Đăng xuất?',
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xác nhận',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdminAuthenticated');
        navigate('/login');
      }
    });
  };

  return (
    <aside id="sidebar" className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileShow ? 'mobile-show' : ''}`}>
      <div className="logo-area">
        <Link to="/employee" className="d-inline-flex">
          <img src="/logo-estore.png" alt="PC eStore Logo" style={{ height: '36px', objectFit: 'contain' }} />
        </Link>
        <div className="ms-2 badge bg-info text-dark small">Employee</div>
      </div>
      <ul className="nav flex-column">
        <li className="px-4 py-2"><small className="nav-text text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Chung</small></li>
        <li>
          <Link className={getNavLinkClass('/employee/dashboard')} to="/employee/dashboard">
            <i className="ti ti-dashboard"></i><span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li className="px-4 py-2"><small className="nav-text text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Vận hành</small></li>
        <li>
          <Link className={getNavLinkClass('/employee/orders')} to="/employee/orders">
            <i className="ti ti-shopping-cart"></i><span className="nav-text">Quản lý đơn hàng</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/employee/products')} to="/employee/products">
            <i className="ti ti-box-seam"></i><span className="nav-text">Quản lý kho hàng</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/employee/inventory-history')} to="/employee/inventory-history">
            <i className="ti ti-history"></i><span className="nav-text">Lịch sử nhập/xuất</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/employee/complaints')} to="/employee/complaints">
            <i className="ti ti-message-report"></i><span className="nav-text">Xử lý khiếu nại</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/employee/reviews')} to="/employee/reviews">
            <i className="ti ti-message-2-code"></i><span className="nav-text">Duyệt đánh giá</span>
          </Link>
        </li>
        
        <li className="px-4 py-2 mt-3"><small className="nav-text text-uppercase fw-bold text-muted" style={{ fontSize: '10px' }}>Cá nhân</small></li>
        <li>
          <Link className={getNavLinkClass('/employee/profile')} to="/employee/profile">
            <i className="ti ti-user-circle"></i><span className="nav-text">Hồ sơ của tôi</span>
          </Link>
        </li>

        <li>
          <a className="nav-link text-danger mt-4" href="#" onClick={handleLogout}>
            <i className="ti ti-logout"></i><span className="nav-text">Đăng xuất</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
