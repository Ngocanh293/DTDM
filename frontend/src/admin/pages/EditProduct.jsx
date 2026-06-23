import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '', // Stock field for reference, but usually updated via Inventory
    brand: '',
    categoryId: '',
    imageUrl: ''
  });

  useEffect(() => {
    // Tải danh mục và thông tin sản phẩm song song
    const fetchData = async () => {
      try {
        const [catRes, prodRes] = await Promise.all([
          apiClient.get('/categories'),
          apiClient.get(`/products/${id}`)
        ]);
        
        setCategories(catRes.data);
        
        const p = prodRes.data;
        setFormData({
          name: p.name || '',
          description: p.description || '',
          price: p.price || '',
          stock: p.stock || 0,
          brand: p.brand || '',
          categoryId: p.categoryId || '',
          imageUrl: p.imageUrl || ''
        });
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        Swal.fire({icon: 'error', title: 'Lỗi', text: 'Không thể tải thông tin sản phẩm!', confirmButtonColor: '#3085d6'});
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        categoryId: parseInt(formData.categoryId)
      };
      await apiClient.put(`/products/${id}`, payload);
      Swal.fire({icon: 'success', title: 'Thành công', text: 'Cập nhật sản phẩm thành công!', confirmButtonColor: '#3085d6'});
      navigate('/admin/products');
    } catch (err) {
      Swal.fire({icon: 'error', title: 'Lỗi', text: "Lỗi khi cập nhật sản phẩm: " + (err.response?.data?.message || err.message), confirmButtonColor: '#3085d6'});
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-5 text-center">Đang tải dữ liệu sản phẩm...</div>;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12 col-lg-8 mx-auto">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">
              <h1 className="fs-3 mb-4">Chỉnh sửa sản phẩm: #{id}</h1>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-bold">Tên sản phẩm</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
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
                      required 
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label fw-bold">Số lượng trong kho (Chỉ xem)</label>
                    <input 
                      type="number" 
                      className="form-control bg-light" 
                      value={formData.stock}
                      readOnly
                    />
                    <small className="text-muted">Việc cập nhật số lượng được thực hiện qua module Kho.</small>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold">Link ảnh Sản phẩm (URL)</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={formData.imageUrl}
                    onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                  {formData.imageUrl && (
                    <img src={formData.imageUrl} alt="Preview" className="mt-2 rounded" style={{ height: '100px' }} />
                  )}
                </div>

                <div className="mb-4">
                  <label className="form-label fw-bold">Mô tả sản phẩm</label>
                  <textarea 
                    className="form-control" 
                    rows="6"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                  ></textarea>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary px-4" disabled={saving}>
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
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
