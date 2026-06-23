import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function CreateProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    brand: '',
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Tải danh mục thực tế từ Backend
    apiClient.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi khi tải danh mục:", err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId)
      };
      await apiClient.post('/products', payload);
      Swal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: 'Thêm sản phẩm thành công!',
        confirmButtonColor: '#3085d6'
      });
      navigate('/admin/products');
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: "Lỗi khi thêm sản phẩm: " + (err.response?.data?.message || err.message),
        confirmButtonColor: '#3085d6'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="fs-3 mb-4">Thêm sản phẩm mới</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên sản phẩm</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="VD: CPU Intel Core i9-14900K"
                    required 
                  />
                </div>
                
                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Danh mục</label>
                    <select 
                      className="form-select" 
                      value={formData.categoryId}
                      onChange={e => setFormData({...formData, categoryId: e.target.value})}
                      required
                    >
                      <option value="">Chọn danh mục...</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Thương hiệu</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={formData.brand}
                      onChange={e => setFormData({...formData, brand: e.target.value})}
                      placeholder="VD: ASUS, MSI, Intel..."
                      required 
                    />
                  </div>
                </div>

                <div className="row g-3 mb-3">
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Giá bán (VNĐ)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.price}
                      onChange={e => setFormData({...formData, price: e.target.value})}
                      placeholder="0"
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Số lượng nhập kho</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={formData.stock}
                      onChange={e => setFormData({...formData, stock: e.target.value})}
                      placeholder="0"
                      required 
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Link ảnh Sản phẩm (URL)</label>
                  <div className="d-flex gap-3 align-items-start">
                    <input 
                      type="url" 
                      className="form-control" 
                      value={formData.imageUrl}
                      onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.imageUrl && (
                      <div className="border rounded p-1 bg-white shadow-sm" style={{width: '60px', height: '60px', flexShrink: 0}}>
                        <img src={formData.imageUrl} alt="Preview" className="w-100 h-100 object-fit-contain" onError={(e) => { e.target.style.display = 'none'; }} onLoad={(e) => { e.target.style.display = 'block'; }} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Mô tả sản phẩm</label>
                  <textarea 
                    className="form-control" 
                    rows="4"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                    {loading ? 'Đang lưu...' : 'Lưu sản phẩm'}
                  </button>
                  <button type="button" className="btn btn-light border" onClick={() => navigate('/admin/products')}>
                    Hủy bỏ
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

