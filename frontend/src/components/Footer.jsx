import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white pt-5 pb-3 border-top mt-5">
      <div className="container">
        <div className="row">
          <div className="col-md-4 mb-4">
            <img src="/logo-estore-removebg-preview.png" alt="Logo" height="45" className="mb-3" />
            <p className="small text-muted">
              Hệ thống bán lẻ linh kiện PC chính hãng lớn nhất. Cung cấp máy tính chơi game, máy tính văn phòng, Laptop, Workstation với giá thành và ưu đãi tốt nhất.
            </p>
            <div className="d-flex gap-3">
              <a href="#!" className="text-secondary fs-4"><i className="bi bi-facebook"></i></a>
              <a href="#!" className="text-secondary fs-4"><i className="bi bi-tiktok"></i></a>
              <a href="#!" className="text-secondary fs-4"><i className="bi bi-youtube"></i></a>
            </div>
          </div>
          <div className="col-md-2 mb-4">
            <h6 className="fw-bold mb-3 text-uppercase">Chính Sách</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Chính sách bảo hành</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Chính sách giao hàng</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Chính sách đổi trả</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Chính sách thanh toán</a></li>
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-uppercase">Hỗ Trợ Khách Hàng</h6>
            <ul className="list-unstyled small">
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Hướng dẫn mua trả góp</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Tra cứu đơn hàng</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Gửi yêu cầu bảo hành</a></li>
              <li className="mb-2"><a href="#!" className="text-decoration-none text-muted hover-danger">Lắp đặt phòng Net</a></li>
            </ul>
          </div>
          <div className="col-md-3 mb-4">
            <h6 className="fw-bold mb-3 text-uppercase">Liên Hệ</h6>
            <ul className="list-unstyled small">
              <li className="mb-3">
                <strong className="text-danger fs-5 d-block">1900 0243</strong>
                <span className="text-muted">(Tổng đài miễn phí: 8h - 21h)</span>
              </li>
              <li className="mb-2 text-muted fw-medium"><i className="bi bi-envelope-fill me-2 text-danger"></i>cskh@pcestore.com</li>
              <li className="mb-2 text-muted fw-medium"><i className="bi bi-geo-alt-fill me-2 text-danger"></i>28-30 Đường ABC, Quận XYZ, TP.HCM</li>
            </ul>
          </div>
        </div>
        <div className="text-center mt-4 small text-muted border-top pt-3">
          &copy; 2026 PC Components eStore. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
