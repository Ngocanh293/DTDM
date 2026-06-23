import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const PROMO_DATA = [
  {
    id: 1,
    title: 'SIÊU SALE BUILD PC - GIẢM ĐẾN 2 TRIỆU',
    description: 'Ưu đãi cực khủng khi Build PC tại PCeStore. Giảm trực tiếp 1.000.000đ cho dàn máy từ 15Tr và 2.000.000đ cho dàn máy từ 30Tr.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?q=80&w=1000&auto=format&fit=crop',
    expiredDate: '2026-04-30',
    category: 'Build PC',
    hot: true
  },
  {
    id: 2,
    title: 'MUA VGA TẶNG NGUỒN XỊN',
    description: 'Khi mua các dòng VGA RTX 4070 trở lên, khách hàng được tặng ngay Nguồn Corsair RM850e trị giá 2.990.000đ.',
    image: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?q=80&w=1000&auto=format&fit=crop',
    expiredDate: '2026-04-20',
    category: 'Linh kiện',
    hot: false
  },
  {
    id: 3,
    title: 'TUẦN LỄ MONITOR - ĐỒNG GIÁ 2.990K',
    description: 'Loạt màn hình Gaming 24-27 inch 144Hz-165Hz đồng giá chỉ 2.990.000đ. Số lượng có hạn!',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=1000&auto=format&fit=crop',
    expiredDate: '2026-04-15',
    category: 'Màn hình',
    hot: true
  }
];

export default function PromoPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 5, mins: 45, secs: 30 });

  useEffect(() => {
    const timer = setInterval(() => {
        setTimeLeft(prev => {
            if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
            if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
            return prev;
        });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-dark">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Khuyến mãi</li>
        </ol>
      </nav>

      {/* Hero Banner */}
      <div className="rounded-4 overflow-hidden position-relative mb-5 shadow" style={{ height: '400px' }}>
         <img src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop" className="w-100 h-100 object-fit-cover" alt="Hero" />
         <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center bg-dark bg-opacity-50">
            <div className="ps-5 text-white">
               <span className="badge bg-danger mb-3 p-2 px-3 fs-6">ĐANG DIỄN RA</span>
               <h1 className="display-4 fw-bold mb-3">LỄ HỘI CÔNG NGHỆ <br/> GIẢM SỐC 50%</h1>
               <p className="fs-5 mb-4">Duy nhất tại PCeStore từ 01/04 đến 30/04/2026</p>
               <div className="d-flex gap-3 text-center">
                  <div className="bg-white text-dark rounded-3 p-2 px-3">
                     <div className="fw-bold fs-4">{timeLeft.days}</div>
                     <div className="small opacity-75">Ngày</div>
                  </div>
                  <div className="bg-white text-dark rounded-3 p-2 px-3">
                     <div className="fw-bold fs-4">{timeLeft.hours}</div>
                     <div className="small opacity-75">Giờ</div>
                  </div>
                  <div className="bg-white text-dark rounded-3 p-2 px-3">
                     <div className="fw-bold fs-4">{timeLeft.mins}</div>
                     <div className="small opacity-75">Phút</div>
                  </div>
                  <div className="bg-white text-dark rounded-3 p-2 px-3">
                     <div className="fw-bold fs-4">{timeLeft.secs}</div>
                     <div className="small opacity-75">Giây</div>
                  </div>
               </div>
            </div>
         </div>
      </div>

      <div className="row g-4 mb-5">
         {PROMO_DATA.map(promo => (
            <div className="col-12 col-md-6 col-lg-4" key={promo.id}>
               <div className="card h-100 border-0 shadow-sm overflow-hidden hover-translate-y transition-all">
                  <div className="position-relative">
                     <img src={promo.image} className="card-img-top" style={{ height: '200px', objectFit: 'cover' }} alt={promo.title} />
                     {promo.hot && <div className="position-absolute top-0 start-0 m-3 badge bg-danger p-2 px-3">HOT</div>}
                     <div className="position-absolute bottom-0 start-0 m-3 badge bg-warning text-dark p-2">Hết hạn: {promo.expiredDate}</div>
                  </div>
                  <div className="card-body p-4">
                     <div className="text-danger small fw-bold mb-2 text-uppercase">{promo.category}</div>
                     <h5 className="fw-bold mb-3">{promo.title}</h5>
                     <p className="text-secondary small line-clamp-3 mb-4">{promo.description}</p>
                     <Link to="/products" className="btn btn-outline-danger w-100 fw-bold">XEM CHI TIẾT</Link>
                  </div>
               </div>
            </div>
         ))}
      </div>

      {/* Promotion Policy Section */}
      <div className="bg-white rounded-4 p-5 shadow-sm border">
         <div className="row align-items-center">
            <div className="col-lg-6">
               <h3 className="fw-bold mb-4">Điều khoản & Lưu ý Khuyến mãi</h3>
               <ul className="lh-lg text-secondary">
                  <li>Khuyến mãi chỉ áp dụng cho khách lẻ, không áp dụng cho đại lý.</li>
                  <li>Mỗi khách hàng được áp dụng tối đa 1 chương trình quà tặng cho 1 đơn hàng.</li>
                  <li>Quà tặng không có giá trị quy đổi thành tiền mặt hoặc trừ trực tiếp vào giá bán (trừ khi có quy định khác).</li>
                  <li>Trường hợp trả hàng, khách hàng phải hoàn trả toàn bộ quà tặng đi kèm.</li>
               </ul>
               <button className="btn btn-danger mt-3 p-2 px-4 fw-bold">TẢI FILE CHI TIẾT (.PDF)</button>
            </div>
            <div className="col-lg-6 mt-4 mt-lg-0 text-center">
               <div className="p-5 bg-light rounded-circle d-inline-block">
                  <i className="bi bi-shield-lock-fill display-1 text-danger"></i>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
