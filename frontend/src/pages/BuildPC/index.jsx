import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';
import { useCart } from '../../context/CartContext';
import apiClient from '../../services/api';

const BUILD_COMPONENTS = [
  { id: 'cpu', name: 'Vi xử lý (CPU)', icon: 'bi-cpu-fill', categoryKeyword: 'CPU' },
  { id: 'main', name: 'Bo mạch chủ (Mainboard)', icon: 'bi-motherboard-fill', categoryKeyword: 'Mainboard' },
  { id: 'ram', name: 'Bộ nhớ trong (RAM)', icon: 'bi-memory', categoryKeyword: 'RAM' },
  { id: 'vga', name: 'Card màn hình (VGA)', icon: 'bi-gpu-card', categoryKeyword: 'VGA' },
  { id: 'ssd', name: 'Ổ cứng (SSD/HDD)', icon: 'bi-device-hdd-fill', categoryKeyword: 'SSD' },
  { id: 'psu', name: 'Nguồn (PSU)', icon: 'bi-lightning-charge-fill', categoryKeyword: 'Nguồn' },
  { id: 'case', name: 'Vỏ máy tính (Case)', icon: 'bi-pc-display', categoryKeyword: 'Case' },
  { id: 'cooler', name: 'Tản nhiệt', icon: 'bi-fan', categoryKeyword: 'Tản' },
  { id: 'monitor', name: 'Màn hình', icon: 'bi-display', categoryKeyword: 'Màn hình' },
];

export default function BuildPC() {
  const [selectedParts, setSelectedParts] = useState({});
  const [showPicker, setShowPicker] = useState(null); // 'cpu', 'main', vv..
  const [pickerProducts, setPickerProducts] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const { addToCart } = useCart();

  const handleSelectPart = async (compDef) => {
    setShowPicker(compDef);
    setPickerLoading(true);
    setPickerProducts([]);
    try {
      const res = await apiClient.get(`/products?keyword=${encodeURIComponent(compDef.categoryKeyword)}&size=50`);
      setPickerProducts(res.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setPickerLoading(false);
    }
  };

  const chooseProduct = (compDef, product) => {
    setSelectedParts(prev => ({ ...prev, [compDef.id]: product }));
    setShowPicker(null);
  };

  const removePart = (compId) => {
    const nextParts = { ...selectedParts };
    delete nextParts[compId];
    setSelectedParts(nextParts);
  };

  const handleAddAllToCart = () => {
    const parts = Object.values(selectedParts);
    if (parts.length === 0) {
      setToast('CHƯA CÓ LINH KIỆN NÀO ĐỂ THÊM!');
      setTimeout(() => setToast(null), 2500);
      return;
    }
    parts.forEach(p => {
      addToCart({
        productId: p.id,
        productName: p.name,
        price: p.price,
        image: p.imageUrl,
        quantity: 1
      });
    });
    setToast(`Đã thêm ${parts.length} sản phẩm vào giỏ hàng!`);
    setTimeout(() => setToast(null), 2500);
  };

  const totalPrice = Object.values(selectedParts).reduce((sum, p) => sum + p.price, 0);

  return (
    <>
      {toast && (
        <div style={{
          position: 'fixed', bottom: '24px', left: '50%', transform: 'translateX(-50%)',
          backgroundColor: '#323232', color: '#fff', padding: '0.75rem 1.5rem',
          borderRadius: '8px', zIndex: 9999, fontSize: '0.9rem',
          boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
        }}>
          <i className="bi bi-info-circle me-2 text-warning"></i>{toast}
        </div>
      )}

      <div className="container pb-5">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb small">
            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none">Trang chủ</Link></li>
            <li className="breadcrumb-item active" aria-current="page">Xây dựng cấu hình</li>
          </ol>
        </nav>

        <div className="text-center mb-5">
           <h2 className="fw-bold text-uppercase" style={{ color: '#e30019' }}>Xây dựng cấu hình PC</h2>
           <p className="text-muted">Chọn các linh kiện tương thích để rắp ráp một bộ máy hoàn chỉnh theo nhu cầu của bạn</p>
        </div>

        <div className="row g-4">
          {/* Main List */}
          <div className="col-12 col-lg-8">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-white py-3 border-bottom d-flex align-items-center">
                 <h5 className="mb-0 fw-bold"><i className="bi bi-tools me-2 text-primary"></i>Cấu hình máy tính</h5>
              </div>
              <div className="card-body p-0">
                 {BUILD_COMPONENTS.map((comp, idx) => {
                    const sel = selectedParts[comp.id];
                    return (
                       <div className={`d-flex align-items-center p-3 border-bottom ${sel ? 'bg-white' : 'bg-light bg-opacity-50'}`} key={comp.id}>
                          <div className="d-flex flex-column align-items-center justify-content-center me-3 text-secondary" style={{ width: 60, height: 60, background: '#f8f9fa', borderRadius: 8 }}>
                             <i className={`bi ${comp.icon} fs-4`}></i>
                          </div>
                          <div className="flex-grow-1">
                             <div className="fw-bold mb-1" style={{ fontSize: '15px' }}>{comp.name}</div>
                             {sel ? (
                                <div className="text-dark small d-flex align-items-center gap-3">
                                   <Link to={`/products/${sel.id}`} target="_blank" className="text-decoration-none text-dark fw-medium hover-text-danger text-truncate" style={{ maxWidth: '300px' }}>
                                      {sel.name}
                                   </Link>
                                   <span className="text-danger fw-bold">{formatCurrency(sel.price)}</span>
                                </div>
                             ) : (
                                <div className="text-muted small">Vui lòng chọn linh kiện</div>
                             )}
                          </div>
                          <div className="ms-3">
                             {sel ? (
                                <div className="d-flex gap-2">
                                   <button className="btn btn-sm btn-outline-danger" onClick={() => removePart(comp.id)}>
                                      <i className="bi bi-trash"></i>
                                   </button>
                                   <button className="btn btn-sm btn-primary" onClick={() => handleSelectPart(comp)}>
                                      <i className="bi bi-arrow-repeat"></i> Đổi
                                   </button>
                                </div>
                             ) : (
                                <button className="btn btn-sm btn-outline-primary px-3 fw-medium" onClick={() => handleSelectPart(comp)}>
                                   <i className="bi bi-plus-lg me-1"></i>Chọn
                                </button>
                             )}
                          </div>
                       </div>
                    );
                 })}
              </div>
            </div>
          </div>

          {/* Right Summary */}
          <div className="col-12 col-lg-4">
            <div className="card border-0 shadow-sm sticky-top" style={{ top: '80px' }}>
              <div className="card-body p-4 text-center text-md-start">
                 <h5 className="fw-bold mb-4">Tổng chi phí dự kiến</h5>
                 <div className="display-6 fw-bold text-danger mb-4 text-center">
                    {formatCurrency(totalPrice)}
                 </div>
                 <div className="d-flex flex-column gap-3">
                    <button className="btn btn-danger btn-lg fw-bold" onClick={handleAddAllToCart}>
                       <i className="bi bi-cart-plus me-2"></i>Thêm Mọi Thứ Vào Giỏ
                    </button>
                    <button className="btn btn-outline-secondary fw-bold" onClick={() => window.print()}>
                       <i className="bi bi-printer me-2"></i>In cấu hình / Tải PDF
                    </button>
                 </div>
                 <hr className="my-4"/>
                 <div className="small text-muted text-center lh-relaxed">
                    <i className="bi bi-shield-check text-success fs-5 d-block mb-2"></i>
                    Bảo hành PCeStore 36 tháng
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Picker Modal */}
      {showPicker && (
        <>
          <div className="modal-backdrop show" style={{ zIndex: 1040 }}></div>
          <div className="modal show d-block" tabIndex="-1" style={{ zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light">
                  <h5 className="modal-title fw-bold">
                    Chọn <span className="text-danger">{showPicker.name}</span>
                  </h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowPicker(null)}></button>
                </div>
                <div className="modal-body bg-light p-3">
                  {pickerLoading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary"></div></div>
                  ) : pickerProducts.length === 0 ? (
                    <div className="text-center py-5 text-muted">Không tìm thấy linh kiện phù hợp</div>
                  ) : (
                    <div className="row g-2">
                       {pickerProducts.map(p => (
                          <div className="col-12 col-md-6" key={p.id}>
                             <div className="card h-100 border-0 shadow-sm">
                                <div className="card-body p-3 d-flex align-items-center gap-3">
                                   <img src={p.imageUrl || '/default-product.png'} style={{ width: 60, height: 60, objectFit: 'contain' }} alt=""/>
                                   <div className="flex-grow-1">
                                      <div className="fw-medium text-dark small text-truncate-2" style={{ lineHeight: 1.4, height: 40, marginBottom: '4px' }}>{p.name}</div>
                                      <div className="text-danger fw-bold">{formatCurrency(p.price)}</div>
                                   </div>
                                   <button className="btn btn-sm btn-outline-danger px-3 rounded-pill" onClick={() => chooseProduct(showPicker, p)}>
                                      Chọn
                                   </button>
                                </div>
                             </div>
                          </div>
                       ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
