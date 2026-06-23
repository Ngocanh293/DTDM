import React from 'react';
import { Link } from 'react-router-dom';

const WARRANTY_CENTERS = [
  { region: 'Miền Bắc', address: '123 Phố Vọng, Hai Bà Trưng, Hà Nội', phone: '024 1234 5678', map: 'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?q=80&w=400&fit=crop' },
  { region: 'Miền Nam', address: '456 Cách Mạng Tháng Tám, Quận 10, TP.HCM', phone: '028 8765 4321', map: 'https://images.unsplash.com/photo-1524850011238-e3d235c7d419?q=80&w=400&fit=crop' },
  { region: 'Miền Trung', address: '789 Nguyễn Văn Linh, Hải Châu, Đà Nẵng', phone: '0236 111 222', map: 'https://images.unsplash.com/photo-1517404215738-15263e9f9178?q=80&w=400&fit=crop' }
];

export default function WarrantyPage() {
  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-dark">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Bảo hành</li>
        </ol>
      </nav>

      {/* Header Section */}
      <div className="text-center mb-5">
         <h1 className="fw-bold text-dark mb-3">Chính Sách Bảo Hành PCeStore</h1>
         <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            Chúng tôi cam kết dịch vụ sau bán hàng tốt nhất với sự tận tâm và chuyên nghiệp. An tâm sử dụng, đã có PCeStore lo!
         </p>
      </div>

      {/* Process Section */}
      <div className="row g-4 mb-5">
         {[
            { step: '01', title: 'Tiếp nhận', desc: 'Liên hệ Hotline hoặc đến trực tiếp trung tâm bảo hành.', icon: 'bi-telephone' },
            { step: '02', title: 'Kiểm tra', desc: 'Kỹ thuật viên kiểm tra lỗi và xác định điều kiện bảo hành.', icon: 'bi-search' },
            { step: '03', title: 'Xử lý', desc: 'Sửa chữa hoặc đổi mới sản phẩm theo chính sách hãng.', icon: 'bi-tools' },
            { step: '04', title: 'Hoàn trả', desc: 'Khách hàng nhận máy tại trung tâm hoặc nhận qua ship.', icon: 'bi-box-seam' },
         ].map((item, idx) => (
            <div className="col-12 col-md-3" key={idx}>
               <div className="bg-white p-4 rounded-4 shadow-sm border text-center h-100 position-relative">
                  <div className="display-4 fw-bold text-danger opacity-10 position-absolute end-0 top-0 m-3">{item.step}</div>
                  <div className="bg-danger text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: 60, height: 60 }}>
                     <i className={`bi ${item.icon} fs-3`}></i>
                  </div>
                  <h5 className="fw-bold mb-2">{item.title}</h5>
                  <p className="small text-secondary mb-0">{item.desc}</p>
               </div>
            </div>
         ))}
      </div>

      <div className="row g-4 mb-5">
         {/* Policy Table */}
         <div className="col-lg-8">
            <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
               <h4 className="fw-bold mb-4 border-start border-4 border-danger ps-3">Bảng thời gian bảo hành</h4>
               <div className="table-responsive">
                  <table className="table table-hover align-middle">
                     <thead className="table-light">
                        <tr>
                           <th>Nhóm sản phẩm</th>
                           <th>Thời hạn</th>
                           <th>Hình thức</th>
                        </tr>
                     </thead>
                     <tbody className="border-top-0">
                        <tr><td>CPU (Chip xử lý)</td><td className="fw-bold text-danger">36 Tháng</td><td>Đổi mới 1:1</td></tr>
                        <tr><td>Mainboard (Bo mạch chủ)</td><td className="fw-bold text-danger">36 Tháng</td><td>Đổi mới/Sửa chữa</td></tr>
                        <tr><td>VGA (Card màn hình)</td><td className="fw-bold text-danger">36 Tháng</td><td>Sửa chữa/Trả hãng</td></tr>
                        <tr><td>RAM, SSD</td><td className="fw-bold text-danger">36-60 Tháng</td><td>Đổi mới nhanh</td></tr>
                        <tr><td>Gaming Gear (Chuột, Phím)</td><td className="fw-bold text-danger">12-24 Tháng</td><td>Đổi mới/Sửa chữa</td></tr>
                     </tbody>
                  </table>
               </div>
               <div className="mt-4 p-3 bg-light rounded text-secondary small">
                  <strong>*Lưu ý:</strong> Một số dòng sản phẩm đặc biệt (vàng, giới hạn) có thời gian bảo hành riêng theo quy định NPP.
               </div>
            </div>
         </div>

         {/* Support Section */}
         <div className="col-lg-4">
            <div className="bg-danger text-white p-4 rounded-4 shadow-sm h-100 d-flex flex-column justify-content-center">
               <h4 className="fw-bold mb-3">Cần hỗ trợ ngay?</h4>
               <p className="opacity-75 mb-4">Liên hệ bộ phận kỹ thuật để được tư vấn từ xa.</p>
               <div className="d-flex align-items-center mb-4">
                  <div className="bg-white text-danger p-3 rounded-circle me-3">
                     <i className="bi bi-headset fs-2"></i>
                  </div>
                  <div>
                     <div className="small opacity-75">Hotline Kỹ thuật</div>
                     <div className="fs-3 fw-bold">1900 8888</div>
                  </div>
               </div>
               <button className="btn btn-outline-light w-100 py-2 fw-bold">CHAT VỚI KỸ THUẬT</button>
            </div>
         </div>
      </div>

      {/* Centers Section */}
      <h4 className="fw-bold mb-4">Hệ thống Trung tâm Bảo hành</h4>
      <div className="row g-4">
         {WARRANTY_CENTERS.map((center, idx) => (
            <div className="col-12 col-md-4" key={idx}>
               <div className="card h-100 border-0 shadow-sm overflow-hidden">
                  <img src={center.map} className="card-img-top" style={{ height: '150px', objectFit: 'cover' }} alt={center.region} />
                  <div className="card-body">
                     <h6 className="fw-bold text-danger mb-2">{center.region}</h6>
                     <p className="small mb-1"><i className="bi bi-geo-alt me-2"></i>{center.address}</p>
                     <p className="small text-secondary"><i className="bi bi-telephone me-2"></i>{center.phone}</p>
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
}
