import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function InventoryHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products to choose from
    const loadProducts = async () => {
      try {
        const res = await apiClient.get('/products?size=50');
        setProducts(res.data.content || []);
        if (res.data.content.length > 0) {
           setSelectedProductId(res.data.content[0].id);
        }
      } catch (err) { console.error(err); }
    };
    loadProducts();
  }, []);

  const fetchHistory = async () => {
    if (!selectedProductId) return;
    try {
      setLoading(true);
      const res = await apiClient.get(`/v1/inventory/history/${selectedProductId}?size=50`);
      setHistory(res.data.content || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [selectedProductId]);

  const getChangeColor = (amount) => {
     if (amount > 0) return 'text-success';
     if (amount < 0) return 'text-danger';
     return 'text-muted';
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <h1 className="fs-3 mb-1">Lịch sử Nhập/Xuất Kho</h1>
          <p className="text-secondary">Theo dõi các biến động kho: Nhập mới, Xuất bán, Điều chỉnh...</p>
        </div>
      </div>

      <div className="card shadow-sm border-0 mb-4 p-3">
         <div className="row align-items-center">
            <div className="col-md-4">
               <label className="form-label small fw-bold">Chọn sản phẩm cần xem</label>
               <select 
                 className="form-select" 
                 value={selectedProductId}
                 onChange={e => setSelectedProductId(e.target.value)}
               >
                  {products.map(p => (
                     <option key={p.id} value={p.id}>#{p.id} - {p.name}</option>
                  ))}
               </select>
            </div>
         </div>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light">
              <tr>
                <th className="px-4 py-3">Thời gian</th>
                <th className="py-3">Loại biến động</th>
                <th className="py-3 text-center">Số lượng</th>
                <th className="py-3">Lý do / Tham chiếu</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-5">Đang tải lịch sử...</td></tr>
              ) : history.length === 0 ? (
                <tr><td colSpan="4" className="text-center py-5 text-muted">Chưa có lịch sử biến động cho sản phẩm này</td></tr>
              ) : (
                history.map(h => (
                  <tr key={h.id}>
                    <td className="px-4">
                       <div className="small font-monospace">{new Date(h.createdAt).toLocaleString('vi-VN')}</div>
                    </td>
                    <td>
                       <span className={`badge bg-light text-dark border`}>{h.type}</span>
                    </td>
                    <td className={`text-center fw-bold ${getChangeColor(h.changeAmount)}`}>
                       {h.changeAmount > 0 ? '+' : ''}{h.changeAmount}
                    </td>
                    <td>
                       <div className="small text-dark">{h.reason}</div>
                       {h.referenceId && <small className="text-muted">Mã tham chiếu: {h.referenceId}</small>}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
