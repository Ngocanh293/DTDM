import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../../services/api';
import { formatCurrency } from '../../utils';

export default function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(`/v1/orders/${orderId}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Lỗi tải đơn hàng:", err);
        setError("Không tìm thấy thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  const handleConfirmPayment = async () => {
    setProcessing(true);
    // Giả lập quá trình xác thực thanh toán
    setTimeout(() => {
      setProcessing(false);
      navigate(`/order-success/${orderId}`);
    }, 2000);
  };

  if (loading) return (
    <div className="container py-5 text-center">
      <div className="spinner-border text-danger"></div>
      <p className="mt-3">Đang tải thông tin thanh toán...</p>
    </div>
  );

  if (error || !order) return (
    <div className="container py-5 text-center">
      <div className="alert alert-danger">{error || "Lỗi hệ thống"}</div>
      <Link to="/" className="btn btn-danger">Về trang chủ</Link>
    </div>
  );

  const isBankTransfer = order.paymentMethod === 'BANK_TRANSFER' || (order.payment && order.payment.paymentMethod === 'BANK_TRANSFER');

  return (
    <div className="container pb-5">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          {/* Progress Steps */}
          <div className="d-flex justify-content-center mb-4">
             <div className="d-flex align-items-center gap-2 small">
                <span className="text-muted"><i className="bi bi-check-circle-fill text-success me-1"></i>Giỏ hàng</span>
                <i className="bi bi-chevron-right text-muted mx-1"></i>
                <span className="text-muted"><i className="bi bi-check-circle-fill text-success me-1"></i>Thông tin</span>
                <i className="bi bi-chevron-right text-muted mx-1"></i>
                <span className="badge bg-danger rounded-pill px-3 py-2">Thanh toán</span>
                <i className="bi bi-chevron-right text-muted mx-1"></i>
                <span className="text-muted">Hoàn tất</span>
             </div>
          </div>

          <div className="card border-0 shadow-sm overflow-hidden mb-4">
             <div className="bg-danger p-4 text-white text-center">
                <h4 className="fw-bold mb-1">TRANG THANH TOÁN</h4>
                <p className="mb-0 opacity-75 small">Đơn hàng: #PCE{order.id}</p>
             </div>
             
             <div className="card-body p-4">
                <div className="row g-4">
                   {/* Cột trái: Thông tin thanh toán */}
                   <div className="col-md-6 border-end-md">
                      <h5 className="fw-bold mb-4">Thông tin đơn hàng</h5>
                      <div className="d-flex justify-content-between mb-2">
                         <span className="text-muted">Tổng cộng:</span>
                         <span className="fw-bold text-danger fs-5">{formatCurrency(order.totalAmount)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                         <span className="text-muted text-nowrap">Địa chỉ nhận hàng:</span>
                         <span className="small text-end ms-3">{order.shippingAddress}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-4">
                         <span className="text-muted">Phương thức:</span>
                         <span className="badge bg-light text-dark border">
                           {order.paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản / QR' : 'Thanh toán COD'}
                         </span>
                      </div>
                      
                      <div className="alert alert-warning py-2 small mb-0">
                         <i className="bi bi-info-circle me-2"></i>
                         Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
                      </div>
                   </div>

                   {/* Cột phải: QR hoặc Hướng dẫn */}
                   <div className="col-md-6 text-center">
                      {isBankTransfer ? (
                        <>
                          <h6 className="fw-bold mb-3">Quét mã QR để thanh toán</h6>
                          <div className="bg-white p-2 border rounded d-inline-block shadow-sm mb-3">
                             <img 
                                src={`https://img.vietqr.io/image/MB-123456789-compact2.png?amount=${order.totalAmount}&addInfo=PCE${order.id}&accountName=PCESTORE`} 
                                alt="QR Code" 
                                className="img-fluid"
                                style={{ width: '220px' }} 
                             />
                          </div>
                          <div className="small text-muted text-start bg-light p-3 rounded">
                             <p className="mb-1"><strong>Ngân hàng:</strong> MB Bank (Quân Đội)</p>
                             <p className="mb-1"><strong>Số tài khoản:</strong> 123456789</p>
                             <p className="mb-1"><strong>Chủ tài khoản:</strong> CTY TNHH PCESTORE</p>
                             <p className="mb-0"><strong>Nội dung:</strong> PCE{order.id}</p>
                          </div>
                        </>
                      ) : (
                        <div className="py-4">
                           <i className="bi bi-truck fs-1 text-danger opacity-25 mb-3 d-block"></i>
                           <h6 className="fw-bold mb-2">Thanh toán khi nhận hàng</h6>
                           <p className="text-muted small">
                             Bạn sẽ thanh toán số tiền <strong>{formatCurrency(order.totalAmount)}</strong> cho nhân viên giao hàng sau khi đã kiểm tra và nhận đầy đủ sản phẩm.
                           </p>
                        </div>
                      )}
                   </div>
                </div>
             </div>
             
             <div className="card-footer bg-white p-4 border-top-0 pt-0">
                <button 
                  className="btn btn-danger w-100 py-3 fw-bold fs-5 shadow-sm"
                  onClick={handleConfirmPayment}
                  disabled={processing}
                >
                  {processing ? (
                    <><span className="spinner-border spinner-border-sm me-2"></span>ĐANG XỬ LÝ...</>
                  ) : (
                    'TÔI ĐÃ KIỂM TRA & XÁC NHẬN ĐẶT HÀNG'
                  )}
                </button>
                <div className="text-center mt-3">
                   <Link to="/cart" className="text-decoration-none text-muted small">Hủy giao dịch và quay lại giỏ hàng</Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
