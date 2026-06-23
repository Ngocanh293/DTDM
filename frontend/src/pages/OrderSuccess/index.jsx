import { useParams, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    setConfetti(true);
  }, []);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7">
          <div className="card border-0 shadow-lg text-center overflow-hidden" style={{ borderRadius: '20px' }}>
            <div className={`p-5 transition-all ${confetti ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`} style={{ transitionDuration: '0.8s' }}>
              <div className="mb-4">
                <div className="success-animation d-inline-block">
                  <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52" style={{ width: '100px', height: '100px' }}>
                    <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="#198754" strokeWidth="2" />
                    <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" stroke="#198754" strokeWidth="5" />
                  </svg>
                </div>
              </div>
              
              <h1 className="fw-bold mb-3" style={{ color: '#2b3452' }}>Cảm ơn bạn đã đặt hàng!</h1>
              <p className="fs-5 text-muted mb-4">Đơn hàng của bạn <span className="text-danger fw-bold">#PCE{orderId}</span> đã được ghi nhận và đang được xử lý.</p>
              
              <div className="bg-light rounded-4 p-4 mb-5 text-start border shadow-sm">
                 <h6 className="fw-bold mb-3 d-flex align-items-center">
                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                    Thông tin cần lưu ý:
                 </h6>
                 <ul className="small text-muted mb-0 ps-3">
                    <li className="mb-2">Chúng tôi sẽ gọi điện xác nhận trong vòng 15-30 phút tới.</li>
                    <li className="mb-2">Thông báo trạng thái đơn hàng sẽ được gửi qua Email của bạn.</li>
                    <li className="mb-0">Nếu có bất kỳ thắc mắc nào, vui lòng gọi Hotline: <strong>1900 1234</strong>.</li>
                 </ul>
              </div>

              <div className="d-grid gap-3 d-sm-flex justify-content-center">
                <Link to="/" className="btn btn-danger btn-lg px-5 fw-bold shadow-sm rounded-pill transition-all hover-translate-y">
                  <i className="bi bi-house-door me-2"></i>Quay lại màn hình chính
                </Link>
                <Link to="/products" className="btn btn-outline-dark btn-lg px-5 fw-bold rounded-pill transition-all hover-translate-y">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
            
            <div className="card-footer bg-light border-0 py-3 small text-muted">
              Hệ thống PCeStore &copy; 2026. Một dự án xây dựng bởi Antigravity.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .success-animation { margin: 0 auto; }
        .checkmark { border-radius: 50%; display: block; stroke-width: 2; stroke: #fff; stroke-miterlimit: 10; box-shadow: inset 0px 0px 0px #198754; animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both; }
        .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #198754; fill: none; animation: stroke .6s cubic-bezier(.65, 0, .45, 1) forwards; }
        .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; animation: stroke .3s cubic-bezier(.65, 0, .45, 1) .8s forwards; }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 50px #fff; } }
        .hover-translate-y:hover { transform: translateY(-3px); }
      `}</style>
    </div>
  );
}
