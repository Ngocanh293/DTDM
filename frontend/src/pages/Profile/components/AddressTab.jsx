import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

export default function AddressTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({ 
    street: '', city: '', district: '', ward: '', isDefault: false 
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/users/address');
      setAddresses(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/users/address/${editingId}`, formData);
      } else {
        await apiClient.post('/users/address', formData);
      }
      setShowForm(false);
      setEditingId(null);
      setFormData({ street: '', city: '', district: '', ward: '', isDefault: false });
      fetchAddresses();
    } catch (err) {
      alert(err.response?.data?.message || 'Lỗi khi lưu địa chỉ.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa địa chỉ này?")) return;
    try {
      await apiClient.delete(`/users/address/${id}`);
      fetchAddresses();
    } catch (err) {
      alert('Lỗi khi xóa địa chỉ.');
    }
  };

  const handleEdit = (addr) => {
    setEditingId(addr.id);
    setFormData({
      street: addr.street || '',
      city: addr.city || '',
      district: addr.district || '',
      ward: addr.ward || '',
      isDefault: addr.isDefault || false
    });
    setShowForm(true);
  };

  const handleSetDefault = async (id) => {
    try {
      await apiClient.put(`/users/address/${id}/default`);
      fetchAddresses();
    } catch (err) {
      alert('Lỗi khi đặt mặc định.');
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0"><i className="bi bi-geo-alt-fill text-danger me-2"></i>Sổ địa chỉ</h5>
          {!showForm && (
            <button className="btn btn-sm btn-outline-danger" onClick={() => setShowForm(true)}>
              <i className="bi bi-plus-lg me-1"></i>Thêm địa chỉ mới
            </button>
          )}
        </div>

        {showForm && (
          <div className="bg-light p-4 rounded mb-4">
            <h6 className="fw-bold mb-3">{editingId ? 'Cập nhật địa chỉ' : 'Thêm địa chỉ mới'}</h6>
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="form-label small text-muted">Số nhà, Đường</label>
                <input type="text" className="form-control" value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} required />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-4">
                  <label className="form-label small text-muted">Thành phố/Tỉnh</label>
                  <input type="text" className="form-control" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Quận/Huyện</label>
                  <input type="text" className="form-control" value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} required />
                </div>
                <div className="col-md-4">
                  <label className="form-label small text-muted">Phường/Xã</label>
                  <input type="text" className="form-control" value={formData.ward} onChange={e => setFormData({...formData, ward: e.target.value})} required />
                </div>
              </div>
              <div className="form-check mb-3">
                <input className="form-check-input" type="checkbox" id="isDefault" checked={formData.isDefault} onChange={e => setFormData({...formData, isDefault: e.target.checked})} />
                <label className="form-check-label small" htmlFor="isDefault">Đặt làm địa chỉ mặc định</label>
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-danger btn-sm">Lưu địa chỉ</button>
                <button type="button" className="btn btn-light btn-sm" onClick={() => { setShowForm(false); setEditingId(null); }}>Hủy bỏ</button>
              </div>
            </form>
          </div>
        )}

        {loading ? (
          <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-danger"></span></div>
        ) : addresses.length === 0 ? (
          <p className="text-muted text-center py-4">Chưa có địa chỉ nào được lưu.</p>
        ) : (
          <div className="d-flex flex-column gap-3">
            {addresses.map(addr => (
              <div key={addr.id} className="border p-3 rounded position-relative">
                {addr.isDefault && <span className="badge bg-success position-absolute top-0 end-0 m-3">Mặc định</span>}
                <div className="mb-2">
                  <span className="fw-medium d-block">{addr.street}</span>
                  <span className="text-muted small">{addr.ward}, {addr.district}, {addr.city}</span>
                </div>
                <div className="d-flex gap-3 text-sm">
                  <button className="btn btn-link text-primary p-0 text-decoration-none small" onClick={() => handleEdit(addr)}>Chỉnh sửa</button>
                  <button className="btn btn-link text-danger p-0 text-decoration-none small" onClick={() => handleDelete(addr.id)}>Xóa</button>
                  {!addr.isDefault && (
                    <button className="btn btn-link text-secondary p-0 text-decoration-none small" onClick={() => handleSetDefault(addr.id)}>Đặt làm mặc định</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
