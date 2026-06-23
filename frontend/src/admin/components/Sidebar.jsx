import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

export default function Sidebar({ isCollapsed, isMobileShow }) {
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const getNavLinkClass = (path) => {
    return `nav-link ${location.pathname === path ? 'active' : ''}`;
  };

  const handleLogout = (e) => {
    e.preventDefault();
    Swal.fire({
      title: 'Xác nhận đăng xuất?',
      text: "Bạn có chắc chắn muốn đăng xuất không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Đăng xuất',
      cancelButtonText: 'Hủy'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  return (
    <aside id="sidebar" className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileShow ? 'mobile-show' : ''}`}>
      <div className="logo-area">
        <Link to="/admin" className="d-inline-flex">
          <img src="/logo-estore.png" alt="PC eStore Logo" style={{ height: '48px', objectFit: 'contain' }} />
        </Link>
      </div>
      <ul className="nav flex-column">
        <li className="px-4 py-2"><small className="nav-text">Main</small></li>
        <li>
          <Link className={getNavLinkClass('/admin')} to="/admin">
            <i className="ti ti-home"></i><span className="nav-text">Dashboard</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/products')} to="/admin/products">
            <i className="ti ti-box-seam"></i><span className="nav-text">Inventory</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/categories')} to="/admin/categories">
            <i className="ti ti-category"></i><span className="nav-text">Categories</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/create-product')} to="/admin/create-product">
            <i className="ti ti-plus"></i><span className="nav-text">Add Product</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/orders')} to="/admin/orders">
            <i className="ti ti-shopping-cart"></i><span className="nav-text">Orders</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/users')} to="/admin/users">
            <i className="ti ti-users"></i><span className="nav-text">Users</span>
          </Link>
        </li>
        <li>
          <Link className={getNavLinkClass('/admin/reports')} to="/admin/reports">
            <i className="ti ti-receipt"></i><span className="nav-text">Reports</span>
          </Link>
        </li>
         <li>
           <Link className={getNavLinkClass('/admin/reviews')} to="/admin/reviews">
             <i className="ti ti-star"></i><span className="nav-text">Reviews</span>
           </Link>
         </li>
         <li className="px-4 py-2 mt-2"><small className="nav-text">Settings</small></li>
         <li>
           <Link className={getNavLinkClass('/admin/notifications')} to="/admin/notifications">
             <i className="ti ti-bell"></i><span className="nav-text">Notifications</span>
           </Link>
         </li>
         <li>
           <Link className={getNavLinkClass('/admin/email-templates')} to="/admin/email-templates">
             <i className="ti ti-mail"></i><span className="nav-text">Email Templates</span>
           </Link>
         </li>

        <li>
          <a className="nav-link text-danger mt-4" href="#" onClick={handleLogout}>
            <i className="ti ti-logout"></i><span className="nav-text">Log Out</span>
          </a>
        </li>
      </ul>
    </aside>
  );
}
