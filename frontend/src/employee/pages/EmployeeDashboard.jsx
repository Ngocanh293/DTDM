import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function EmployeeDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const ordersRes = await apiClient.get('/v1/orders/admin/all');
      setOrders(ordersRes.data || []);
    } catch (err) {
      console.error("Lỗi tải dashboard nhân viên:", err);
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
        text: `Đã chuyển đơn hàng #${orderId} sang trạng thái ${newStatus}`,
        timer: 1500,
        showConfirmButton: false
      });
      fetchOrders();
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: err.response?.data?.message || 'Có lỗi xảy ra khi kéo thả đơn hàng',
      });
      fetchOrders(); // reload to reset state
    }
  };

  const onDragStart = (e, orderId) => {
    e.dataTransfer.setData('orderId', orderId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, targetStatus) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('orderId');
    if (!orderId) return;
    
    const order = orders.find(o => o.id.toString() === orderId.toString());
    if (order && order.status !== targetStatus) {
      // Nếu là cột PAID thì chuyển thành PAID, nhưng nếu ở PAID kéo thả có thể là CONFIRMED.
      // Để đơn giản, khi kéo vào PAID column, ta set thành CONFIRMED nếu đang ở PENDING, hoặc set PAID.
      let finalStatus = targetStatus;
      if (targetStatus === 'PAID_CONFIRMED') {
         finalStatus = 'CONFIRMED';
      }
      handleUpdateStatus(orderId, finalStatus);
    }
  };

  const columns = [
    { id: 'PENDING', title: 'Chờ xử lý', color: 'secondary' },
    { id: 'PAID_CONFIRMED', title: 'Xác nhận/Thanh toán', color: 'primary' },
    { id: 'SHIPPING', title: 'Đang giao', color: 'warning' },
    { id: 'DELIVERED', title: 'Hoàn thành', color: 'success' }
  ];

  return (
    <div className="container-fluid">
      <div className="row mb-4">
        <div className="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 className="fs-3 mb-1">Bảng điều khiển</h1>
          </div>
          <button className="btn btn-outline-primary" onClick={fetchOrders}>
             <i className="bi bi-arrow-clockwise"></i> Làm mới
          </button>
        </div>
      </div>

      <div className="row flex-nowrap overflow-auto pb-4" style={{ minHeight: '600px' }}>
        {columns.map(col => {
          // Lọc order cho từng cột
          const colOrders = orders.filter(o => {
             if (col.id === 'PAID_CONFIRMED') return o.status === 'PAID' || o.status === 'CONFIRMED';
             return o.status === col.id;
          });

          return (
            <div 
              key={col.id} 
              className="col-12 col-md-6 col-lg-3"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              <div className="card bg-light border-0 h-100 shadow-sm">
                <div className={`card-header bg-${col.color} bg-opacity-10 text-${col.color} border-0 py-3 fw-bold d-flex justify-content-between`}>
                  <span>{col.title}</span>
                  <span className="badge bg-white text-dark shadow-sm">{colOrders.length}</span>
                </div>
                <div className="card-body p-2 d-flex flex-column gap-2" style={{ overflowY: 'auto' }}>
                  {loading ? (
                    <div className="text-center p-3 text-muted">Đang tải...</div>
                  ) : colOrders.length === 0 ? (
                    <div className="text-center p-4 text-muted small border border-dashed rounded bg-white">Trống</div>
                  ) : (
                    colOrders.map(o => (
                      <div 
                        key={o.id} 
                        className="card border-0 shadow-sm admin-card-hover cursor-grab"
                        draggable
                        onDragStart={(e) => onDragStart(e, o.id)}
                        style={{ cursor: 'grab', userSelect: 'none' }}
                      >
                        <div className="card-body p-3">
                          <div className="d-flex justify-content-between mb-2">
                             <span className="fw-bold">#{o.id}</span>
                             <span className="text-primary fw-bold">{o.totalAmount?.toLocaleString()}đ</span>
                          </div>
                          <div className="small text-muted mb-1"><i className="bi bi-person me-1"></i>{o.customerName || 'Khách vãng lai'}</div>
                          <div className="small text-muted mb-2"><i className="bi bi-telephone-fill me-1"></i>{o.customerPhone || o.shipping?.phone || 'Chưa cập nhật'}</div>
                          <div className="d-flex justify-content-between align-items-center mt-2">
                             <span className={`badge bg-${col.color}`}>{o.status}</span>
                             <Link to={`/employee/orders/${o.id}`} className="btn btn-sm btn-light border" title="Xem chi tiết">
                                <i className="bi bi-eye"></i>
                             </Link>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
