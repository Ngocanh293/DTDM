import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function Inventory() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [newQuantity, setNewQuantity] = useState(0);
  const [updating, setUpdating] = useState(false);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/products?keyword=${keyword}&size=50`);
      setProducts(res.data.content || []);
    } catch (err) {
      console.error("Lỗi khi tải sản phẩm:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    try {
      setUpdating(true);
      await apiClient.put('/v1/inventory/update', {
        productId: selectedProduct.id,
        quantity: parseInt(newQuantity),
        referenceId: "MANUAL-" + Date.now()
      });
      
      const modalElement = document.getElementById('stockModal');
      // Sử dụng cách đóng an toàn hơn qua data-bs-dismiss hoặc kiểm tra window.bootstrap
      if (window.bootstrap) {
        const modal = window.bootstrap.Modal.getInstance(modalElement);
        if (modal) modal.hide();
      } else {
        // Fallback: Click nút close ẩn để đóng modal nếu không tìm thấy biến bootstrap
        modalElement.querySelector('[data-bs-dismiss="modal"]')?.click();
      }
      
      // Đợi modal đóng xong rồi mới báo success để tránh kẹt focus
      setTimeout(() => {
        Swal.fire({icon: 'success', title: 'Thành công', text: `Đã cập nhật tồn kho cho #${selectedProduct.id} thành công!`, confirmButtonColor: '#3085d6'});
        fetchProducts();
      }, 300);
    } catch (err) {
      Swal.fire({icon: 'error', title: 'Lỗi', text: err.response?.data?.message || "Không thể cập nhật", confirmButtonColor: '#3085d6'});
    } finally {
      setUpdating(false);
    }
  };

  const handleSearch = (e) => {
    if (e.key === 'Enter') fetchProducts();
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="fs-3 mb-1">Quản lý Kho tổng</h1>
              <p className="text-secondary">Giám sát tồn kho, hàng chờ (reserved) và cập nhật số lượng thực tế</p>
            </div>
            <div>
              <button className="btn btn-outline-secondary me-2" onClick={fetchProducts}>
                <i className="bi bi-arrow-clockwise"></i> Làm mới
              </button>
              {isAdmin && (
                <Link to="../create-product" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-1"></i> Nhập SP mới
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-3">
             <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text bg-white border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input 
                   type="text" 
                   className="form-control border-start-0" 
                   placeholder="Mã SKU hoặc tên sản phẩm..." 
                   value={keyword}
                   onChange={e => setKeyword(e.target.value)}
                   onKeyDown={handleSearch}
                />
             </div>
          </div>
      </div>

      <div className="card border-0 shadow-sm overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4">Sản phẩm</th>
                <th>Thương hiệu</th>
                <th>Tồn kho khả dụng</th>
                <th className="text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div> Đang tải...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Không tìm thấy dữ liệu</td></tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td className="px-4">
                       <div className="d-flex align-items-center">
                          <img src={p.imageUrl || "/default-product.png"} className="rounded me-3 border" style={{ width: '40px', height: '40px', objectFit: 'cover' }} />
                          <div>
                             <div className="fw-bold text-dark small">{p.name}</div>
                             <small className="text-muted">SKU: #{p.id}</small>
                          </div>
                       </div>
                    </td>
                    <td><span className="badge bg-light text-dark fw-normal border">{p.brand}</span></td>
                    <td>
                       <div className="d-flex align-items-center">
                          <span className={`fs-5 fw-bold me-2 ${p.stock <= 5 ? 'text-danger' : 'text-success'}`}>
                             {p.stock}
                          </span>
                          {p.stock <= 5 && <span className="badge bg-danger bg-opacity-10 text-danger rounded-pill px-2" style={{ fontSize: '10px' }}>Sắp hết</span>}
                       </div>
                    </td>
                    <td className="text-center">
                       {isAdmin && (
                         <Link 
                           to={`../edit-product/${p.id}`} 
                           className="btn btn-sm btn-outline-secondary mb-1 me-1"
                           title="Chỉnh sửa thông tin / giá tiền"
                         >
                           <i className="bi bi-pencil-square"></i>
                         </Link>
                       )}
                       <button 
                         className="btn btn-sm btn-outline-primary mb-1 me-1"
                         data-bs-toggle="modal" 
                         data-bs-target="#stockModal"
                         onClick={() => {
                            setSelectedProduct(p);
                            setNewQuantity(p.stock);
                         }}
                         title="Cập nhật tồn kho"
                       >
                          <i className="bi bi-box-seam me-1"></i> Kho
                       </button>
                       {isAdmin && (
                         <button 
                           className="btn btn-sm btn-outline-danger mb-1"
                           onClick={async () => {
                             Swal.fire({
                               title: 'CẢNH BÁO',
                               text: 'Bạn có chắc chắn muốn xoá sản phẩm này?',
                               icon: 'warning',
                               showCancelButton: true,
                               confirmButtonColor: '#d33',
                               cancelButtonColor: '#3085d6',
                               confirmButtonText: 'Đồng ý xóa',
                               cancelButtonText: 'Hủy'
                             }).then(async (result) => {
                               if (result.isConfirmed) {
                                 try {
                                   await apiClient.delete(`/products/${p.id}`);
                                   fetchProducts();
                                 } catch (err) {
                                   Swal.fire({icon: 'error', title: 'Lỗi', text: "Không thể xoá sản phẩm: " + (err.response?.data?.message || err.message)});
                                 }
                               }
                             });
                           }}
                         >
                            <i className="bi bi-trash-fill"></i>
                         </button>
                       )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cập nhật kho */}
      <div className="modal fade" id="stockModal" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content border-0 shadow">
            <div className="modal-header border-bottom-0">
              <h5 className="modal-title fw-bold">Điều chỉnh hàng tồn kho</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="modal-body py-4">
                {selectedProduct && (
                   <div className="mb-4 d-flex align-items-center p-3 bg-light rounded">
                      <img src={selectedProduct.imageUrl} className="rounded me-3 border" style={{ width: '60px', height: '60px', objectFit: 'cover' }} />
                      <div>
                         <div className="fw-bold">{selectedProduct.name}</div>
                         <div className="text-muted small">Mã SP: #{selectedProduct.id}</div>
                      </div>
                   </div>
                )}
                <div className="mb-3">
                  <label className="form-label fw-bold">Số lượng tồn kho mới</label>
                  <div className="input-group input-group-lg">
                    <input 
                      type="number" 
                      className="form-control text-center fw-bold" 
                      min="0"
                      value={newQuantity}
                      onChange={e => setNewQuantity(e.target.value)}
                    />
                    <span className="input-group-text">Cái</span>
                  </div>
                  <div className="form-text mt-2 text-danger">
                    <i className="bi bi-exclamation-triangle me-1"></i> Hành động này sẽ cập nhật số lượng thực tế trong kho.
                  </div>
                </div>
              </div>
              <div className="modal-footer border-top-0 pt-0">
                <button type="button" className="btn btn-light px-4" data-bs-dismiss="modal">Hủy</button>
                <button type="submit" className="btn btn-primary px-4 fw-bold" disabled={updating}>
                  {updating ? 'Đang lưu...' : 'Xác nhận cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
