import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Gọi API lấy toàn bộ đơn hàng cho Admin
      const res = await apiClient.get('/v1/orders/admin/all');
      setOrders(res.data || []);
    } catch (err) {
      console.error("Lỗi khi tải đơn hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await apiClient.put(`/v1/orders/admin/${orderId}/status?status=${newStatus}`);
      Swal.fire({
        icon: 'success',
        title: 'Cập nhật thành công!',
        text: `Đã cập nhật đơn hàng #${orderId} sang trạng thái ${newStatus}`,
        confirmButtonColor: '#3085d6'
      });
      fetchOrders();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi khi cập nhật',
        text: err.response?.data?.message || err.message,
        confirmButtonColor: '#3085d6'
      });
    }
  };

  const getStatusBadge = (status) => {
     const configs = {
        'PENDING': { label: 'Chờ xử lý', class: 'bg-secondary bg-opacity-10 text-secondary border-secondary' },
        'PAID': { label: 'Đã thanh toán', class: 'bg-success bg-opacity-10 text-success border-success' },
        'CONFIRMED': { label: 'Đã xác nhận', class: 'bg-primary bg-opacity-10 text-primary border-primary' },
        'SHIPPING': { label: 'Đang giao', class: 'bg-warning bg-opacity-10 text-warning border-warning' },
        'DELIVERED': { label: 'Thành công', class: 'bg-info bg-opacity-10 text-info border-info' },
        'CANCELLED': { label: 'Đã hủy', class: 'bg-danger bg-opacity-10 text-danger border-danger' }
     };
     const config = configs[status] || { label: status, class: 'bg-light text-dark' };
     return <span className={`badge border ${config.class}`} style={{ fontWeight: '500' }}>{config.label}</span>;
  };

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h1 className="fs-3 mb-1">Vận hành đơn hàng</h1>
              <p className="text-secondary mb-0">Theo dõi luồng xử lý đơn: Thanh toán → Xác nhận → Giao hàng</p>
            </div>
            <button className="btn btn-outline-secondary" onClick={fetchOrders} disabled={loading}>
              <i className="bi bi-arrow-clockwise me-1"></i> Làm mới
            </button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="py-3">Khách hàng</th>
                <th className="py-3">Ngày đặt</th>
                <th className="py-3 text-end px-4">Tổng tiền</th>
                <th className="py-3 text-center">Trạng thái</th>
                <th className="py-3 text-center px-4">Thao tác xử lý</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" className="text-center py-5"><div className="spinner-border spinner-border-sm text-primary"></div> Đang tải...</td></tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="6">
                    <div className="empty-state py-5">
                      <i className="bi bi-inbox"></i>
                      <h5 className="text-muted">Hệ thống chưa ghi nhận đơn hàng nào</h5>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map(o => (
                  <tr key={o.id}>
                    <td className="px-4 fw-bold text-dark">#{o.id}</td>
                    <td>
                       <div className="fw-bold small">{o.customerName || 'Khách vãng lai'}</div>
                       <div className="text-muted" style={{ fontSize: '11px' }}>
                          <i className="bi bi-telephone-fill me-1"></i>
                          {o.customerPhone || o.shipping?.phone || o.shipping?.phoneNumber || 'Chưa cập nhật'}
                       </div>
                    </td>
                    <td>
                       <div className="small">{new Date(o.orderDate).toLocaleDateString('vi-VN')}</div>
                       <small className="text-muted" style={{ fontSize: '10px' }}>{new Date(o.orderDate).toLocaleTimeString('vi-VN')}</small>
                    </td>
                    <td className="text-end px-4 fw-bold text-primary">
                       {o.totalAmount?.toLocaleString()}₫
                    </td>
                    <td className="text-center">
                       {getStatusBadge(o.status)}
                    </td>
                    <td className="text-center px-4">
                      <div className="d-flex justify-content-center gap-1">
                         <Link to={`${o.id}`} className="btn btn-sm btn-light border" title="Chi tiết">
                            <i className="bi bi-eye"></i>
                         </Link>
                         {o.status === 'PAID' && (
                           <button onClick={() => handleUpdateStatus(o.id, 'CONFIRMED')} className="btn btn-sm btn-primary" title="Xác nhận">
                             <i className="bi bi-check-circle"></i>
                           </button>
                         )}
                         {o.status === 'CONFIRMED' && (
                           <button onClick={() => handleUpdateStatus(o.id, 'SHIPPING')} className="btn btn-sm btn-warning text-dark" title="Giao hàng">
                             <i className="bi bi-truck"></i>
                           </button>
                         )}
                         {o.status === 'SHIPPING' && (
                           <button onClick={() => handleUpdateStatus(o.id, 'DELIVERED')} className="btn btn-sm btn-success" title="Hoàn thành">
                             <i className="bi bi-check2-all"></i>
                           </button>
                         )}
                         {(o.status !== 'DELIVERED' && o.status !== 'CANCELLED') && (
                            <button onClick={() => handleUpdateStatus(o.id, 'CANCELLED')} className="btn btn-sm btn-outline-danger" title="Hủy đơn">
                               <i className="bi bi-x-circle"></i>
                            </button>
                         )}
                      </div>
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
