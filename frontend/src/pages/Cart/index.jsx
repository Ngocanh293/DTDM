import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatCurrency } from '../../utils';
import { validateDiscountCode } from '../../utils/discounts';
import apiClient from '../../services/api';
import AuthModal from '../../components/AuthModal';

export default function Cart() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const { isLoggedIn } = useAuth();
  
  // Selection state (local to this view)
  const [selectedItems, setSelectedItems] = useState(cartItems.map(item => item.productId));
  const [loading, setLoading] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [message, setMessage] = useState(null);
  const [showDiscount, setShowDiscount] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleToggleSelect = (productId) => {
    setSelectedItems(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.productId));
    }
  };

  const handleCheckout = () => {
    if (!isLoggedIn) {
      setIsLoginModalOpen(true);
      return;
    }
    
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn ít nhất một sản phẩm để thanh toán");
      return;
    }

    const itemsToOrder = cartItems.filter(i => selectedItems.includes(i.productId));
    
    // Chuyền hướng sang trang checkout và mang theo danh sách sản phẩm đã chọn
    navigate('/checkout', { 
      state: { 
        items: itemsToOrder,
        discountPercent,
        discountCode
      } 
    });
  };
  
  const handleApplyDiscount = () => {
    const percent = validateDiscountCode(discountCode);
    if (percent) {
      setDiscountPercent(percent);
      setMessage({ type: 'success', text: `Đã áp dụng mã giảm giá ${discountCode} (${percent * 100}%)` });
    } else {
      setDiscountPercent(0);
      alert('Mã giảm giá không hợp lệ!');
    }
  };

  // ============================================================
  // TÍNH TOÁN
  // ============================================================
  const selectedCartItems = cartItems.filter(item => selectedItems.includes(item.productId));
  const subtotal = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalQuantity = selectedCartItems.reduce((sum, item) => sum + item.quantity, 0);
  const discountAmount = subtotal * discountPercent;
  const shippingFee = 60000; // Cứng 60k trên giao diện
  const total = subtotal - discountAmount + shippingFee;

  // ============================================================
  // GIỎ HÀNG TRỐNG
  // ============================================================
  if (cartItems.length === 0) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">
          <i className="bi bi-cart-x" style={{ fontSize: '80px', color: '#dee2e6' }}></i>
          <h3 className="mt-3 fw-bold" style={{ color: '#2b3452' }}>Giỏ hàng trống</h3>
          <p className="text-muted mb-4">Bạn chưa thêm sản phẩm nào vào giỏ hàng</p>
          <Link to="/products" className="btn btn-danger px-5 py-2 fw-medium rounded-3">
            <i className="bi bi-bag me-2"></i>Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container pb-5">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Giỏ hàng ({cartItems.length})</li>
        </ol>
      </nav>

      {message && (
        <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-danger'} mb-4`}>
          {message.text}
        </div>
      )}

      <div className="row">
        {/* CỘT TRÁI — Danh sách sản phẩm */}
        <div className="col-lg-8 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white py-3 px-4">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="selectAll"
                      checked={selectedItems.length === cartItems.length && cartItems.length > 0}
                      onChange={handleSelectAll}
                    />
                    <label className="form-check-label fw-semibold" htmlFor="selectAll">
                      Chọn tất cả ({cartItems.length})
                    </label>
                  </div>
                </div>
                <button className="btn btn-sm btn-outline-danger" onClick={clearCart}>
                  <i className="bi bi-trash3 me-1"></i>Xoá tất cả
                </button>
              </div>
            </div>

            <div className="card-body p-0">
              {cartItems.map((item, index) => (
                <div
                  className={`d-flex align-items-center gap-3 p-4 ${index < cartItems.length - 1 ? 'border-bottom' : ''}`}
                  key={item.productId}
                >
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedItems.includes(item.productId)}
                      onChange={() => handleToggleSelect(item.productId)}
                    />
                  </div>

                    <Link to={`/products/${item.productId}`}>
                    <div className="bg-light rounded-3 p-2 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '90px', height: '90px', overflow: 'hidden' }}>
                      {item.imageUrl || item.image ? (
                        <img
                          src={item.imageUrl || item.image}
                          alt={item.productName}
                          className="img-fluid w-100 h-100"
                          style={{ objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="d-flex flex-column align-items-center justify-content-center text-muted" style={{ fontSize: '10px' }}>
                          <i className="bi bi-image fs-2"></i>
                          <span>No Image</span>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div className="flex-grow-1 min-width-0">
                    <Link to={`/products/${item.productId}`} className="text-decoration-none text-dark">
                      <h6 className="fw-bold mb-1" style={{ fontSize: '14px' }}>{item.productName}</h6>
                    </Link>
                    <span className="badge bg-light text-dark border" style={{ fontSize: '10px' }}>PC Component</span>
                    <div className="d-md-none mt-2">
                      <span className="text-danger fw-bold">{formatCurrency(item.price)}</span>
                    </div>
                  </div>

                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '120px' }}>
                    <div className="text-danger fw-bold">{formatCurrency(item.price)}</div>
                  </div>

                  <div className="flex-shrink-0">
                    <div className="input-group input-group-sm" style={{ width: '110px' }}>
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                      >
                        <i className="bi bi-dash"></i>
                      </button>
                      <input
                        type="text"
                        className="form-control text-center fw-bold"
                        value={item.quantity}
                        readOnly
                      />
                      <button
                        className="btn btn-outline-secondary"
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>

                  <div className="text-end d-none d-md-block flex-shrink-0" style={{ minWidth: '130px' }}>
                    <div className="fw-bold text-danger">{formatCurrency(item.price * item.quantity)}</div>
                  </div>

                  <button
                    className="btn btn-sm btn-outline-secondary border-0 flex-shrink-0"
                    onClick={() => removeFromCart(item.productId)}
                    title="Xoá sản phẩm"
                  >
                    <i className="bi bi-x-lg text-muted"></i>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <Link to="/products" className="text-decoration-none text-danger fw-medium small">
              <i className="bi bi-arrow-left me-1"></i>Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* CỘT PHẢI — Tóm tắt đơn hàng */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '100px' }}>
            <div className="card-body p-4">
              <h5 className="fw-bold mb-4">
                <i className="bi bi-receipt text-danger me-2"></i>Tóm tắt đơn hàng
              </h5>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Tạm tính ({totalQuantity} sản phẩm)</span>
                <span className="fw-medium">{formatCurrency(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Phí vận chuyển</span>
                {shippingFee === 0 ? (
                  <span className="text-success fw-medium">Miễn phí</span>
                ) : (
                  <span className="fw-medium">{formatCurrency(shippingFee)}</span>
                )}
              </div>

              {/* MÃ GIẢM GIÁ */}
              <div className="mt-3 mb-2">
                <div 
                  className="d-flex align-items-center justify-content-between p-2 border rounded-3"
                  style={{ 
                    cursor: 'pointer', 
                    backgroundColor: '#f8f9fa',
                    borderColor: '#dee2e6',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => setShowDiscount(!showDiscount)}
                >
                  <div className="d-flex align-items-center gap-2 text-primary">
                    <i className="bi bi-ticket-perforated fs-5"></i>
                    <span className="small fw-semibold">Sử dụng mã giảm giá</span>
                  </div>
                  <i className={`bi bi-chevron-${showDiscount ? 'up' : 'down'} text-muted small`}></i>
                </div>
                
                {showDiscount && (
                  <div className="mt-2 d-flex gap-2 animate__animated animate__fadeIn">
                    <input 
                      type="text" 
                      className="form-control form-control-sm border-primary border-opacity-25" 
                      placeholder="Nhập mã giảm giá"
                      value={discountCode}
                      onChange={(e) => setDiscountCode(e.target.value)}
                      autoFocus
                    />
                    <button 
                      className="btn btn-sm btn-primary px-3 fw-medium"
                      onClick={handleApplyDiscount}
                    >
                      Áp dụng
                    </button>
                  </div>
                )}
              </div>

              {discountPercent > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success small">
                  <span>Giảm giá ({discountPercent * 100}%)</span>
                  <span>-{formatCurrency(discountAmount)}</span>
                </div>
              )}

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-5">Tổng tiền</span>
                <span className="fw-bold fs-5 text-danger">{formatCurrency(total)}</span>
              </div>

              <button
                className="btn btn-danger w-100 py-3 fw-bold rounded-3"
                disabled={loading || selectedItems.length === 0}
                onClick={handleCheckout}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <i className="bi bi-bag-check me-2"></i>
                    ĐẶT HÀNG NGAY ({selectedItems.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AuthModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onSuccess={() => handleCheckout()} 
      />
    </div>
  );
}
