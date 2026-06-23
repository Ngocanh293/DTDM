import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils';

const PARTNERS = [
  { name: 'HomeCredit', image: 'https://cdn.iconscout.com/icon/free/png-256/free-home-credit-3628414-3029410.png', term: '3-12 tháng', rate: '0% - 1%' },
  { name: 'HDSaison', image: 'https://images.careerbuilder.vn/employer_folders/lot1/116901/brand_logo/hd_saison_logoo1.png', term: '3-24 tháng', rate: '0% - 1.5%' },
  { name: 'mCredit', image: 'https://images.careerbuilder.vn/employer_folders/lot4/127114/brand_logo/MCredit-Logo-Final-Horizontal-01.png', term: '6-18 tháng', rate: '0.9%' }
];

export default function InstallmentPage() {
  const [amount, setAmount] = useState(20000000);
  const [prepaidPercent, setPrepaidPercent] = useState(30);
  const [month, setMonth] = useState(12);

  const prepaidAmount = (amount * prepaidPercent) / 100;
  const loanAmount = amount - prepaidAmount;
  const monthlyPay = loanAmount / month; // Simple calculation for mock

  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb small">
          <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-dark">Trang chủ</Link></li>
          <li className="breadcrumb-item active">Trả góp</li>
        </ol>
      </nav>

      <div className="text-center mb-5">
         <h1 className="fw-bold text-dark mb-3">Mua Ngay Trả Sau - Lãi Suất 0%</h1>
         <p className="text-secondary mx-auto" style={{ maxWidth: '600px' }}>
            PCeStore hợp tác cùng các đối tác tài chính hàng đầu để mang đến giải pháp thanh toán linh hoạt, dễ dàng sở hữu dàn máy mơ ước.
         </p>
      </div>

      <div className="row g-4">
         {/* Calculator Widget */}
         <div className="col-lg-7">
            <div className="bg-white p-4 p-md-5 rounded-4 shadow-sm border h-100">
               <h4 className="fw-bold mb-4">Máy tính trả góp dự kiến</h4>
               
               <div className="mb-4">
                  <label className="form-label fw-bold small text-secondary">GIÁ TRỊ SẢN PHẨM (VND)</label>
                  <input 
                    type="number" 
                    className="form-control form-control-lg fw-bold text-danger border-2" 
                    value={amount} 
                    onChange={(e) => setAmount(Number(e.target.value))}
                  />
               </div>

               <div className="row mb-4">
                  <div className="col-6">
                     <label className="form-label fw-bold small text-secondary">TRẢ TRƯỚC (%)</label>
                     <select className="form-select" value={prepaidPercent} onChange={(e) => setPrepaidPercent(Number(e.target.value))}>
                        <option value={10}>10%</option>
                        <option value={20}>20%</option>
                        <option value={30}>30%</option>
                        <option value={50}>50%</option>
                        <option value={70}>70%</option>
                     </select>
                  </div>
                  <div className="col-6">
                     <label className="form-label fw-bold small text-secondary">KỲ HẠN (THÁNG)</label>
                     <select className="form-select" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
                        <option value={3}>3 Tháng</option>
                        <option value={6}>6 Tháng</option>
                        <option value={9}>9 Tháng</option>
                        <option value={12}>12 Tháng</option>
                        <option value={24}>24 Tháng</option>
                     </select>
                  </div>
               </div>

               <div className="bg-light p-4 rounded-4">
                  <div className="d-flex justify-content-between mb-3">
                     <span className="text-secondary">Trả trước ({prepaidPercent}%):</span>
                     <span className="fw-bold">{formatCurrency(prepaidAmount)}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-3">
                     <span className="text-secondary">Số tiền vay còn lại:</span>
                     <span className="fw-bold">{formatCurrency(loanAmount)}</span>
                  </div>
                  <hr/>
                  <div className="d-flex justify-content-between align-items-center">
                     <span className="fw-bold text-dark">Góp mỗi tháng dự kiến:</span>
                     <span className="fw-bold text-danger fs-3">{formatCurrency(Math.round(monthlyPay))}</span>
                  </div>
               </div>
               
               <p className="small text-muted mt-3 mb-0 italic">
                  * Kết quả chỉ mang tính chất tham khảo. Con số chính xác sẽ phụ thuộc vào biểu phí của đơn vị tài chính tại thời điểm duyệt hồ sơ.
               </p>
            </div>
         </div>

         {/* Partners & Steps */}
         <div className="col-lg-5">
            <div className="row g-4 h-100">
               <div className="col-12">
                  <div className="bg-white p-4 rounded-4 shadow-sm border shadow-sm">
                     <h5 className="fw-bold mb-4">Các bước thực hiện</h5>
                     <div className="d-flex gap-3 mb-4">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shrink-0" style={{ width: 32, height: 32 }}>1</div>
                        <div>
                           <div className="fw-bold small">Chọn sản phẩm</div>
                           <div className="small text-secondary">Giá trị sản phẩm từ 3.000.000đ trở lên.</div>
                        </div>
                     </div>
                     <div className="d-flex gap-3 mb-4">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shrink-0" style={{ width: 32, height: 32 }}>2</div>
                        <div>
                           <div className="fw-bold small">Chuẩn bị hồ sơ</div>
                           <div className="small text-secondary">CMND/CCCD hoặc Giấy phép lái xe.</div>
                        </div>
                     </div>
                     <div className="d-flex gap-3">
                        <div className="bg-danger text-white rounded-circle d-flex align-items-center justify-content-center shrink-0" style={{ width: 32, height: 32 }}>3</div>
                        <div>
                           <div className="fw-bold small">Duyệt nhanh</div>
                           <div className="small text-secondary">Xét duyệt online hoặc tại shop chỉ trong 15p.</div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="col-12 flex-grow-1">
                  <div className="bg-white p-4 rounded-4 shadow-sm border h-100">
                     <h5 className="fw-bold mb-4">Đối tác tài chính</h5>
                     <div className="d-flex flex-column gap-3">
                        {PARTNERS.map((p, idx) => (
                           <div key={idx} className="d-flex align-items-center p-3 border rounded hover-bg-light transition-all cursor-pointer">
                              <img src={p.image} alt={p.name} style={{ width: 60, height: 30, objectFit: 'contain' }} className="me-3" />
                              <div className="flex-grow-1">
                                 <div className="fw-bold small">{p.name}</div>
                                 <div className="text-muted small">Kỳ hạn: {p.term}</div>
                              </div>
                              <div className="text-danger fw-bold small">{p.rate}</div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
      
      <div className="mt-5 p-4 bg-white rounded-4 shadow-sm border text-center">
         <h4 className="fw-bold mb-3">Trả Góp Qua Thẻ Tín Dụng Online</h4>
         <p className="text-secondary mx-auto mb-4" style={{ maxWidth: '700px' }}>
            Hỗ trợ hơn 25 ngân hàng tại Việt Nam. Trả góp 0% lãi suất, kỳ hạn linh hoạt đến 12 tháng. Thủ tục 100% online không cần duyệt hồ sơ.
         </p>
         <div className="d-flex justify-content-center gap-3 flex-wrap">
            {['VCB', 'ACB', 'BIDV', 'TMB', 'HSBC', 'VIB'].map(bank => (
               <div key={bank} className="p-2 border rounded fw-bold text-muted" style={{ minWidth: 60 }}>{bank}</div>
            ))}
            <div className="p-2 border rounded fw-bold text-muted">... & 20+ banks</div>
         </div>
      </div>
    </div>
  );
}
