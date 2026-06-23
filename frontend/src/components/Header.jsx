import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils';

const Header = ({ minimal = false }) => {
  const { cartCount } = useCart();
  const { isLoggedIn, logout, user } = useAuth();
  const navigate = useNavigate();
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const categoryRef = useRef(null);
  const accountRef = useRef(null);

  const megaMenuData = [
    { id: 1, name: 'CPU, Mainboard, VGA', icon: 'bi-cpu', sub: ['CPU', 'Mainboard', 'VGA', 'RTX', 'Intel', 'AMD'] },
    { id: 2, name: 'RAM, SSD, HDD', icon: 'bi-device-ssd', sub: ['RAM', 'SSD', 'HDD', 'DDR5', '1TB'] },
    { id: 3, name: 'Case, tan nhiet, nguon', icon: 'bi-box', sub: ['Case', 'Tan nhiet', 'Nguon', 'Corsair', 'Seasonic'] },
    { id: 4, name: 'Man hinh may tinh', icon: 'bi-display', sub: ['Man hinh', 'Gaming', 'Do hoa', '4K'] },
    { id: 5, name: 'Laptop & Macbook', icon: 'bi-laptop', sub: ['Laptop', 'Macbook', 'Laptop Gaming', 'Laptop van phong'] },
    { id: 6, name: 'Gear gaming', icon: 'bi-mouse', sub: ['Ban phim', 'Chuot', 'Tai nghe'] },
    { id: 7, name: 'Build PC theo nhu cau', icon: 'bi-pc-display', sub: ['PC Gaming', 'PC Workstation', 'PC van phong'] },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setIsAccountOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsAccountOpen(false);
    navigate('/login');
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchTerm.trim();
    navigate(query ? `/products?q=${encodeURIComponent(query)}` : '/products');
  };

  return (
    <header className="store-header sticky-top">
      {!minimal && (
        <div className="store-header__video" aria-hidden="true">
          <video autoPlay muted loop playsInline>
            <source src="/top-promo-video.mp4" type="video/mp4" />
          </video>
        </div>
      )}

      <div className="store-header__top d-none d-md-block">
        <div className="container d-flex justify-content-between align-items-center">
          <div className="store-header__links">
            <Link to="/khuyen-mai"><i className="bi bi-gift me-1"></i>Khuyến mãi</Link>
            <Link to="/tra-gop"><i className="bi bi-credit-card me-1"></i>Trả góp</Link>
            <Link to="/khuyen-mai"><i className="bi bi-newspaper me-1"></i>Tin khuyến mãi</Link>
            <Link to="/products?q=thu%20cu%20doi%20moi"><i className="bi bi-arrow-repeat me-1"></i>Thu cũ đổi mới</Link>
            <Link to="/bao-hanh"><i className="bi bi-shield-check me-1"></i>Bảo hành</Link>
          </div>
          <div className="store-header__hotline">
            <i className="bi bi-telephone-fill me-1"></i> Hotline: 1900 0243
          </div>
        </div>
      </div>

      <div className="store-header__main">
        <div className="container">
          <div className="row align-items-center g-3">
            <div className="col-12 col-md-3 text-center text-md-start">
              <Link to="/" className="store-logo">
                <img src="/logo-estore-removebg-preview.png" alt="PCeStore Logo" />
              </Link>
            </div>

            <div className="col-12 col-md-5">
              {!minimal ? (
                <form className="store-search" onSubmit={handleSearch} ref={categoryRef}>
                  <button
                    className="store-search__category"
                    type="button"
                    onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                  >
                    <i className="bi bi-list"></i> Danh mục
                  </button>
                  <input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Bạn cần tìm linh kiện nào?"
                  />
                  <button className="store-search__submit" type="submit">
                    <i className="bi bi-search"></i>
                  </button>

                  {isCategoryOpen && (
                    <div className="store-mega-menu">
                      <div className="store-mega-menu__left">
                        {megaMenuData.map(item => (
                          <button
                            key={item.id}
                            type="button"
                            className={activeMenuId === item.id ? 'is-active' : ''}
                            onMouseEnter={() => setActiveMenuId(item.id)}
                            onClick={() => {
                              setIsCategoryOpen(false);
                              navigate(`/products?q=${encodeURIComponent(item.name)}`);
                            }}
                          >
                            <span><i className={`bi ${item.icon}`}></i>{item.name}</span>
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        ))}
                      </div>
                      <div className="store-mega-menu__right">
                        <span className="store-eyebrow">Goi y nhanh</span>
                        <h6>{megaMenuData.find(x => x.id === activeMenuId)?.name}</h6>
                        <div className="store-mega-menu__chips">
                          {megaMenuData.find(x => x.id === activeMenuId)?.sub.map(sub => (
                            <Link
                              key={sub}
                              to={`/products?q=${encodeURIComponent(sub)}`}
                              onClick={() => setIsCategoryOpen(false)}
                            >
                              {sub}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              ) : (
                <div className="store-auth-title">
                  {window.location.pathname.includes('login') ? 'Đăng nhập' :
                    window.location.pathname.includes('register') || window.location.pathname.includes('signup') ? 'Đăng ký' :
                      window.location.pathname.includes('forgot-password') ? 'Khôi phục mật khẩu' : ''}
                </div>
              )}
            </div>

            <div className="col-12 col-md-4 d-flex justify-content-center justify-content-md-end align-items-center gap-3">
              {minimal ? (
                <Link to="/" className="store-link-strong">Cần hỗ trợ?</Link>
              ) : (
                <div className="store-header-actions">
                  <Link to="/build-pc" className="store-header-action">
                    <i className="bi bi-pc-display"></i>
                    <strong>Build<br />PC</strong>
                  </Link>
                  <Link to="/order-tracking" className="store-header-action">
                    <i className="bi bi-box-seam"></i>
                    <strong>Tra cứu<br />đơn hàng</strong>
                  </Link>
                  <div className="dropdown" ref={accountRef}>
                    <button
                      className="store-account"
                      type="button"
                      onClick={() => setIsAccountOpen(!isAccountOpen)}
                    >
                      {isLoggedIn && user?.role !== 'ADMIN' && user?.avatarUrl ? (
                        <img src={formatImageUrl(user.avatarUrl)} alt="" />
                      ) : (
                        <i className="bi bi-person-circle"></i>
                      )}
                      <span>
                        <small>{isLoggedIn && user?.role !== 'ADMIN' ? 'Xin chào,' : 'Đăng nhập/Đăng ký'}</small>
                        <strong>{isLoggedIn && user?.role !== 'ADMIN' ? (user?.name || 'Tài khoản') : 'Tài khoản'}</strong>
                      </span>
                    </button>
                    <ul className={`dropdown-menu dropdown-menu-end shadow border-0 mt-2 ${isAccountOpen ? 'show' : ''}`}>
                      {isLoggedIn && user?.role !== 'ADMIN' ? (
                        <>
                          <li><Link className="dropdown-item py-2" to="/profile" onClick={() => setIsAccountOpen(false)}><i className="bi bi-person me-2"></i>Thông tin cá nhân</Link></li>
                          <li><Link className="dropdown-item py-2" to="/profile" onClick={() => setIsAccountOpen(false)}><i className="bi bi-box-seam me-2"></i>Đơn hàng của tôi</Link></li>
                          <li><hr className="dropdown-divider" /></li>
                          <li><button className="dropdown-item py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Đăng xuất</button></li>
                        </>
                      ) : (
                        <>
                          <li><Link className="dropdown-item py-2" to="/login" onClick={() => setIsAccountOpen(false)}><i className="bi bi-box-arrow-in-right me-2"></i>Đăng nhập</Link></li>
                          <li><Link className="dropdown-item py-2" to="/signup" onClick={() => setIsAccountOpen(false)}><i className="bi bi-person-plus me-2"></i>Đăng ký thành viên</Link></li>
                        </>
                      )}
                    </ul>
                  </div>

                  <Link to="/cart" className="store-cart">
                    <span>
                      <i className="bi bi-cart3"></i>
                      <em>{cartCount}</em>
                    </span>
                    <strong>Giỏ hàng</strong>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
