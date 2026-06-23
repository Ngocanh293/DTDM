import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../../../services/api';
import { formatCurrency, formatImageUrl } from '../../../utils';
import { useAuth } from '../../../context/AuthContext';

export default function OrdersTab() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);
  
  // order details modal state
  const [detailOrder, setDetailOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/v1/orders/history');
      setOrders(response.data || []);
    } catch (err) {
      console.error("Lỗi khi tải lịch sử đơn hàng:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc muốn huỷ đơn hàng này?")) return;
    try {
      await apiClient.post(`/v1/orders/${orderId}/cancel`);
      alert("Đã huỷ đơn hàng thành công!");
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || "Lỗi khi huỷ đơn hàng.");
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa bản ghi của đơn hàng này khỏi lịch sử của mình? Hành động này không thể hoàn tác!")) return;
    try {
        await apiClient.delete(`/v1/orders/${orderId}`);
        fetchOrders();
    } catch (err) {
        alert(err.response?.data?.message || "Lỗi khi xóa lịch sử đơn hàng.");
    }
  };

  const fetchOrderDetail = async (orderId) => {
    try {
      const response = await apiClient.get(`/v1/orders/${orderId}`);
      setDetailOrder(response.data);
      setShowDetailModal(true);
    } catch (err) {
      alert("Không thể tải chi tiết đơn hàng");
    }
  };

  const handleComplaint = async (orderId, customerName) => {
    const issue = window.prompt("Mô tả vấn đề bạn đang gặp phải (Sản phẩm lỗi, Giao sai hàng, v.v.):");
    if (!issue) return;

    try {
      await apiClient.post('/v1/complaints', {
        orderId,
        customerName: customerName || user?.fullName || user?.email,
        issue
      });
      alert("Đã gửi yêu cầu hỗ trợ! Chúng tôi sẽ phản hồi sớm nhất qua email của bạn.");
    } catch (err) {
      alert("Lỗi khi gửi yêu cầu. Vui lòng thử lại sau.");
    }
  };

  const [trackOrder, setTrackOrder] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  const fetchOrderTracking = async (orderId) => {
    try {
      const response = await apiClient.get(`/v1/shipping/track/${orderId}`);
      setTrackOrder(response.data);
      setShowTrackModal(true);
    } catch (err) {
       alert("Xin lỗi, thông tin vận chuyển của kiện hàng này chưa sẵn sàng. Vui lòng thử lại sau.");
    }
  };

  const STATUS_MAP = {
    PENDING: { label: 'Chờ xác nhận', color: 'warning', icon: 'bi-clock' },
    CONFIRMED: { label: 'Đã xác nhận', color: 'info', icon: 'bi-check-circle' },
    SHIPPING: { label: 'Đang giao', color: 'primary', icon: 'bi-truck' },
    DELIVERED: { label: 'Đã giao', color: 'success', icon: 'bi-check-circle-fill' },
    CANCELLED: { label: 'Đã huỷ', color: 'danger', icon: 'bi-x-circle' },
  };

  return (
    <div>
      <h5 className="fw-bold mb-3"><i className="bi bi-box-seam text-danger me-2"></i>Lịch sử đơn hàng</h5>
      
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-danger"></div><p className="mt-2 text-muted">Đang tải lịch sử...</p></div>
      ) : orders.length === 0 ? (
        <div className="card border-0 shadow-sm text-center py-5">
          <i className="bi bi-bag-x fs-1 text-muted d-block mb-3"></i>
          <h6 className="text-muted">Chưa có đơn hàng nào</h6>
          <Link to="/products" className="btn btn-outline-danger btn-sm mt-3">Mua sắm ngay</Link>
        </div>
      ) : (
        <div className="d-flex flex-column gap-3">
          {orders.map(order => {
            const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: 'secondary', icon: 'bi-info-circle' };
            const isExpanded = expandedOrder === order.id;

            return (
              <div className="card border-0 shadow-sm" key={order.id}>
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <span className="fw-bold">Mã ĐH: #{order.id}</span>
                      <span className="text-muted small ms-3">
                        <i className="bi bi-calendar3 me-1"></i>{new Date(order.orderDate || order.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <div>
                      <span className={`badge bg-${statusInfo.color}`}>
                        <i className={`bi ${statusInfo.icon} me-1`}></i>{statusInfo.label}
                      </span>
                      {(order.status === 'CANCELLED' || order.status === 'DELIVERED') && (
                          <button 
                              className="btn btn-sm btn-link text-muted p-0 ms-3" 
                              title="Xóa dữ liệu cũ"
                              onClick={() => handleDeleteOrder(order.id)}
                          >
                              <i className="bi bi-trash"></i>
                          </button>
                      )}
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <>
                      <div className="d-flex align-items-center gap-3 mb-2">
                      <div className="bg-light rounded-2 p-1 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                        {order.items[0].imageUrl ? (
                          <img src={formatImageUrl(order.items[0].imageUrl)} alt="" className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
                        ) : (
                          <i className="bi bi-box text-secondary fs-4"></i>
                        )}
                      </div>
                        <div className="flex-grow-1">
                          <p className="small fw-medium mb-0">{order.items[0].productName}</p>
                          <small className="text-muted">Số lượng: {order.items[0].quantity}</small>
                        </div>
                        <span className="text-danger fw-bold small">{formatCurrency(order.items[0].price * order.items[0].quantity)}</span>
                      </div>
                      
                      {isExpanded && order.items.slice(1).map((item, idx) => (
                        <div className="d-flex align-items-center gap-3 mb-2 border-top pt-2" key={idx}>
                          <div className="bg-light rounded-2 p-1 flex-shrink-0 d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px', overflow: 'hidden' }}>
                            {item.imageUrl ? (
                              <img src={formatImageUrl(item.imageUrl)} alt="" className="img-fluid w-100 h-100" style={{ objectFit: 'contain' }} />
                            ) : (
                              <i className="bi bi-box text-secondary fs-4"></i>
                            )}
                          </div>
                          <div className="flex-grow-1">
                            <p className="small fw-medium mb-0">{item.productName}</p>
                            <small className="text-muted">Số lượng: {item.quantity}</small>
                          </div>
                          <span className="text-danger fw-bold small">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </>
                  )}

                  <hr className="my-3" />
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                      {order.items && order.items.length > 1 && (
                        <button className="btn btn-sm btn-light text-muted" onClick={() => setExpandedOrder(isExpanded ? null : order.id)}>
                          {isExpanded ? 'Thu gọn' : `Xem thêm ${order.items.length - 1} sản phẩm`}
                        </button>
                      )}
                      {(order.status === 'SHIPPING' || order.status === 'DELIVERED') && (
                          <button className="btn btn-sm btn-outline-info" onClick={() => fetchOrderTracking(order.id)}>
                             <i className="bi bi-geo-alt-fill me-1"></i>Vận chuyển
                          </button>
                      )}
                      {order.status === 'PENDING' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancelOrder(order.id)}>Huỷ đơn</button>
                      )}
                      <button className="btn btn-sm btn-outline-primary" onClick={() => fetchOrderDetail(order.id)}>Xem Chi Tiết</button>
                      {order.status === 'DELIVERED' && (
                        <Link to={`/products/${order.items?.[0]?.productId || ''}`} className="btn btn-sm btn-success ms-2">
                          <i className="bi bi-star-fill me-1"></i>Đánh giá
                        </Link>
                      )}
                      <button className="btn btn-sm btn-outline-secondary ms-2" onClick={() => handleComplaint(order.id, order.customerName)}>
                        <i className="bi bi-chat-dots me-1"></i>Hỗ trợ/Khiếu nại
                      </button>
                    </div>
                    <div className="text-end">
                      <small className="text-muted">Tổng cộng: </small>
                      <span className="fw-bold text-danger fs-5">{formatCurrency(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shipping Track Modal */}
      {showTrackModal && trackOrder && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-info text-white border-bottom-0">
                  <h5 className="modal-title fw-bold"><i className="bi bi-geo-alt-fill me-2"></i>Hành trình đơn hàng</h5>
                  <button type="button" className="btn-close btn-close-white shadow-none" onClick={() => setShowTrackModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="mb-4">
                     <p className="mb-1 text-muted small">Đơn vị vận chuyển</p>
                     <p className="fw-bold fs-5 mb-0"><i className="bi bi-truck me-2"></i>{trackOrder.carrier || 'PCeStore Logistics'}</p>
                  </div>
                  <div className="mb-4">
                     <p className="mb-1 text-muted small">Mã vận đơn (Tracking Code)</p>
                     <div className="d-flex px-3 py-2 bg-light rounded align-items-center justify-content-between">
                       <span className="fw-mono fs-5 fw-bold text-dark">{trackOrder.trackingCode || 'Đang cập nhật'}</span>
                       <button className="btn btn-sm btn-outline-secondary"><i className="bi bi-clipboard"></i></button>
                     </div>
                  </div>
                  <div className="mb-2 border-start border-3 border-info ps-3 py-2 ms-2 position-relative">
                     <div className="position-absolute bg-info rounded-circle" style={{ width: 12, height: 12, left: -7.5, top: '40%' }}></div>
                     <p className="mb-1 fw-bold text-info">Trạng thái hiện tại</p>
                     <p className="mb-0">{trackOrder.status === 'DELIVERED' ? 'Đã giao thành công' : trackOrder.status === 'IN_TRANSIT' ? 'Đang giao hàng' : 'Chờ lấy hàng'}</p>
                     <small className="text-muted">Giao đến: {trackOrder.deliveryAddress || 'Chưa rõ địa chỉ'}</small>
                  </div>
                </div>
                <div className="modal-footer border-top-0 d-flex justify-content-center">
                   <button className="btn btn-info text-white fw-bold px-5" onClick={() => window.open('https://track-demo.example.com', '_blank')}>Tra cứu chi tiết trên Web Hãng</button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Order Detail Modal */}
      {showDetailModal && detailOrder && (
        <>
          <div className="modal-backdrop fade show"></div>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered modal-lg" role="document">
              <div className="modal-content border-0 shadow">
                <div className="modal-header bg-light border-bottom-0">
                  <h5 className="modal-title fw-bold">Chi tiết đơn hàng #{detailOrder.id}</h5>
                  <button type="button" className="btn-close shadow-none" onClick={() => setShowDetailModal(false)}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-4 mb-4">
                    <div className="col-md-6">
                      <div className="card bg-light border-0 h-100">
                        <div className="card-body">
                          <h6 className="fw-bold text-primary mb-3"><i className="bi bi-geo-alt-fill me-2"></i>Địa chỉ nhận hàng</h6>
                          <p className="mb-1 text-dark fw-medium">{detailOrder.shippingAddress?.fullName || 'Khách hàng'}</p>
                          <p className="mb-1 small text-muted"><i className="bi bi-telephone text-secondary me-2"></i>{detailOrder.shippingAddress?.phone || 'Chưa cập nhật'}</p>
                          <p className="mb-0 small text-muted"><i className="bi bi-map text-secondary me-2"></i>{detailOrder.shippingAddress?.street}, {detailOrder.shippingAddress?.city}</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card bg-light border-0 h-100">
                        <div className="card-body">
                          <h6 className="fw-bold text-success mb-3"><i className="bi bi-credit-card-fill me-2"></i>Thanh toán</h6>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">Phương thức:</span>
                            <span className="fw-medium text-dark">{detailOrder.paymentMethod || 'COD'}</span>
                          </div>
                          <div className="d-flex justify-content-between mb-1 small">
                            <span className="text-muted">Trạng thái:</span>
                            <span className={`badge bg-${detailOrder.paymentStatus === 'PAID' ? 'success' : 'warning'}`}>{detailOrder.paymentStatus || 'Chưa thanh toán'}</span>
                          </div>
                          <div className="d-flex justify-content-between mt-3">
                            <span className="fw-bold">Tổng tiền:</span>
                            <span className="fw-bold text-danger fs-5">{formatCurrency(detailOrder.totalAmount || 0)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold mb-3 border-bottom pb-2">Danh sách sản phẩm</h6>
                  <ul className="list-group list-group-flush mb-0">
                    {detailOrder.items?.map((item, idx) => (
                      <li className="list-group-item px-0 py-3" key={idx}>
                        <div className="d-flex">
                          {item.imageUrl ? (
                            <img src={formatImageUrl(item.imageUrl)} alt="Sp" className="rounded" style={{ width: 60, height: 60, objectFit: 'contain', backgroundColor: '#f8f9fa' }} />
                          ) : (
                            <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                          <div className="ms-3 flex-grow-1">
                            <h6 className="mb-1 small fw-bold">{item.productName}</h6>
                            <p className="mb-0 small text-muted">Số lượng: {item.quantity}</p>
                          </div>
                          <div className="text-end ms-3">
                            <div className="text-danger fw-bold small">{formatCurrency(item.price * item.quantity)}</div>
                            <div className="text-muted small" style={{ fontSize: '0.75rem' }}>{formatCurrency(item.price)} / sản phẩm</div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                </div>
                <div className="modal-footer border-top-0 bg-light">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowDetailModal(false)}>Đóng</button>
                  {detailOrder.status === 'PENDING' && (
                    <button type="button" className="btn btn-outline-danger" onClick={() => { setShowDetailModal(false); handleCancelOrder(detailOrder.id); }}>Huỷ đơn hàng</button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
