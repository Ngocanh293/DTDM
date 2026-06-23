import React from 'react';
import { useLocation, Link } from 'react-router-dom';

const PAGE_DATA = {
  '/khuyen-mai': {
    title: 'Chương Trình Khuyến Mãi',
    icon: 'bi-gift',
    content: (
      <>
        <h4 className="fw-bold mb-4 text-danger">ƯU ĐÃI THÁNG VÀNG - NGẬP TRÀN QUÀ TẶNG</h4>
        <p>Chào tháng mới, PCeStore tung ra loạt khuyến mãi siêu khủng dành cho Quý khách hàng:</p>
        <ul className="lh-lg text-secondary">
          <li><strong>Giảm Giá PC Build:</strong> Giảm trực tiếp 1.000.000đ khi Build PC trên 20 triệu.</li>
          <li><strong>Tặng Màn Hình:</strong> Tặng kèm màn hình 24 inch khi mua PC Gaming cấu hình cao.</li>
          <li><strong>Voucher Khủng:</strong> Thu thập mã để giảm tiếp 5% (tối đa 500.000đ) cho linh kiện lẻ.</li>
        </ul>
        <img src="/default-product.png" alt="Khuyen Mai" className="img-fluid rounded mb-4" style={{ height: '300px', width: '100%', objectFit: 'cover', backgroundColor: '#f8f9fa' }} />
        <p className="text-muted fst-italic">*Lưu ý: CTKM có thể kết thúc sớm nếu hết quà tặng. Vui lòng liên hệ Hotline 1900 0243 để biết thêm chi tiết.</p>
      </>
    )
  },
  '/tra-gop': {
    title: 'Chính Sách Trả Góp 0%',
    icon: 'bi-credit-card',
    content: (
      <>
        <h4 className="fw-bold mb-4">MUA SẮM LÀ KIỂM SOÁT TÀI CHÍNH</h4>
        <p>Linh kiện máy tính là tài sản cần thiết để làm việc và giải trí. Với PCeStore, bạn hoàn toàn có thể mua ngay lập tức mà không phải lo nghĩ về ngân sách với chương trình Trả Góp siêu tốc.</p>
        
        <div className="row g-4 mt-2">
           <div className="col-12 col-md-6">
              <div className="bg-light p-4 rounded h-100 border">
                 <h5 className="fw-bold text-danger"><i className="bi bi-credit-card-2-front me-2"></i>Quyệt Thẻ Tín Dụng</h5>
                 <ul className="mt-3 lh-lg text-secondary">
                    <li>Hỗ trợ kỳ hạn: 3, 6, 9, 12 tháng.</li>
                    <li>Lãi suất: <strong>0%</strong>. Chuyển đổi qua máy MPOS dễ dàng.</li>
                    <li>Thủ tục: Chỉ cần CMND/CCCD và Thẻ tín dụng khả dụng.</li>
                 </ul>
              </div>
           </div>
           <div className="col-12 col-md-6">
              <div className="bg-light p-4 rounded h-100 border">
                 <h5 className="fw-bold text-primary"><i className="bi bi-wallet2 me-2"></i>Qua Công Ty Tài Chính</h5>
                 <ul className="mt-3 lh-lg text-secondary">
                    <li>Hỗ trợ HomeCredit, HDSaison, mCredit.</li>
                    <li>Chỉ cần trả trước từ 10% đến 30% giá trị máy.</li>
                    <li>Duyệt hồ sơ nhanh chóng trong vòng 15 phút.</li>
                 </ul>
              </div>
           </div>
        </div>
      </>
    )
  },
  '/bao-hanh': {
    title: 'Chính Sách Bảo Hành & Đổi Trả',
    icon: 'bi-shield-check',
    content: (
      <>
        <h4 className="fw-bold mb-4">AN TÂM SỬ DỤNG - DỊCH VỤ DẪN ĐẦU</h4>
        <p className="text-secondary lh-lg mb-4">
          Tại PCeStore, chúng tôi cam kết bán hàng chính hãng 100% với đặc quyền hỗ trợ kỹ thuật mạnh mẽ.
        </p>
        
        <div className="table-responsive mb-4">
           <table className="table table-bordered table-striped text-center align-middle">
              <thead className="table-dark">
                 <tr>
                    <th>Sản phẩm</th>
                    <th>Thời gian bảo hành</th>
                    <th>Đổi trả lỗi NSX</th>
                 </tr>
              </thead>
              <tbody>
                 <tr><td className="fw-medium">CPU, Mainboard, RAM</td><td className="text-danger fw-bold">36 Tháng</td><td>1 đổi 1 trong 30 ngày</td></tr>
                 <tr><td className="fw-medium">VGA - Card đồ hoạ</td><td className="text-danger fw-bold">36 Tháng</td><td>1 đổi 1 trong 7 ngày</td></tr>
                 <tr><td className="fw-medium">Ổ cứng SSD, PSU Nguồn</td><td className="text-danger fw-bold">36 - 60 Tháng</td><td>1 đổi 1 trong 30 ngày</td></tr>
                 <tr><td className="fw-medium">Chuột, Phím, Tai Nghe</td><td className="text-danger fw-bold">12 - 24 Tháng</td><td>1 đổi 1 trong 7 ngày</td></tr>
              </tbody>
           </table>
        </div>
        
        <h5 className="fw-bold mt-4 mb-3">Điều Kiện Bảo Hành</h5>
        <ul className="lh-lg text-secondary mb-4">
           <li>Sản phẩm phải còn nguyên Tem bảo hành của PCeStore và NPP chính hãng.</li>
           <li>Không chấp nhận bảo hành các lỗi ngoại quan: Vỡ, móp méo, cháy nổ, cong chân socket CPU...</li>
           <li>VGA trâu cày (Coin) sẽ bị từ chối bảo hành theo quy định của mọi NPP.</li>
        </ul>
      </>
    )
  }
};

export default function StaticPage() {
  const location = useLocation();
  const pageInfo = PAGE_DATA[location.pathname] || {
    title: 'Trang Đang Cập Nhật',
    icon: 'bi-info-circle',
    content: <div className="py-5 text-center text-muted">Nội dung trang này đang được PCeStore tổng hợp và xây dựng. Vui lòng quay lại sau!</div>
  };

  return (
    <div className="container py-5" style={{ minHeight: '60vh' }}>
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-dark">Trang chủ</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{pageInfo.title}</li>
        </ol>
      </nav>

      <div className="row justify-content-center">
        <div className="col-12 col-lg-9">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-bottom py-3">
               <h3 className="fw-bold mb-0 text-dark">
                  <i className={`bi ${pageInfo.icon} text-danger me-2`}></i>{pageInfo.title}
               </h3>
            </div>
            <div className="card-body p-4 p-md-5">
              {pageInfo.content}
              
              <div className="mt-5 text-center">
                 <hr className="mb-4 opacity-10"/>
                 <div className="fw-bold text-dark">Trung Tâm Chăm Sóc Khách Hàng PCeStore</div>
                 <div className="text-danger fw-bold fs-4 my-2"><i className="bi bi-telephone-fill me-2"></i>1900 0243</div>
                 <div className="text-muted small">Thời gian hỗ trợ: 08:00 - 20:00 Hàng ngày (Cả T7 & CN)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
