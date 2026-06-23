import React, { useState } from 'react';
import apiClient from '../../services/api';

export default function AdminNotifications() {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    type: 'SYSTEM_ALERT'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setMessage(null);
      // Gửi Broadcast thông báo
      const response = await apiClient.post('/notifications/broadcast', null, {
        params: {
          subject: formData.subject,
          content: formData.content,
          type: formData.type
        }
      });
      
      setMessage({ type: 'success', text: response.data || 'Đã gửi thông báo thành công!' });
      setFormData({ subject: '', content: '', type: 'SYSTEM_ALERT' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Có lỗi xảy ra khi gửi thông báo. Lỗi: ' + (err.response?.data?.message || err.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
       <div className="row">
          <div className="col-12 col-lg-8 mx-auto">
             <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                   <h1 className="fs-3 mb-1">Trung tâm Thông báo</h1>
                   <p className="text-secondary">Gửi thông báo hàng loạt tới toàn bộ người dùng trong hệ thống</p>
                </div>
             </div>

             {message && <div className={`alert alert-${message.type} alert-dismissible fade show`} role="alert">
                {message.text}
                <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
             </div>}

             <div className="card border-0 shadow-sm">
                <div className="card-header bg-white py-3 border-bottom">
                   <h5 className="mb-0 fw-bold"><i className="bi bi-megaphone me-2 text-primary"></i>Tạo thông báo Broadcast</h5>
                </div>
                <div className="card-body p-4">
                   <form onSubmit={handleSubmit}>
                      <div className="mb-3">
                         <label className="form-label fw-bold">Tiêu đề thông báo</label>
                         <input 
                           type="text" 
                           className="form-control" 
                           placeholder="Ví dụ: Bảo trì hệ thống định kỳ" 
                           value={formData.subject}
                           onChange={e => setFormData({...formData, subject: e.target.value})}
                           required 
                         />
                      </div>

                      <div className="row mb-3">
                         <div className="col-md-6">
                            <label className="form-label fw-bold">Loại thông báo</label>
                            <select 
                              className="form-select" 
                              value={formData.type}
                              onChange={e => setFormData({...formData, type: e.target.value})}
                            >
                               <option value="SYSTEM_ALERT">Cảnh báo hệ thống (SYSTEM_ALERT)</option>
                               <option value="ORDER_STATUS_UPDATE">Cập nhật chung (ORDER_STATUS_UPDATE)</option>
                            </select>
                         </div>
                      </div>

                      <div className="mb-4">
                         <label className="form-label fw-bold">Nội dung chi tiết</label>
                         <textarea 
                           className="form-control" 
                           rows="6" 
                           placeholder="Nhập nội dung bạn muốn truyền tải tới người dùng..."
                           value={formData.content}
                           onChange={e => setFormData({...formData, content: e.target.value})}
                           required
                         ></textarea>
                         <div className="form-text text-muted mt-2">
                            Lưu ý: Thông báo này sẽ được gửi tới TẤT CẢ người dùng đăng ký trên hệ thống. Hãy kiểm tra kỹ nội dung trước khi gửi.
                         </div>
                      </div>

                      <div className="d-grid">
                         <button type="submit" className="btn btn-primary btn-lg shadow-sm" disabled={loading}>
                            {loading ? (
                               <><span className="spinner-border spinner-border-sm me-2"></span> Đang xử lý...</>
                            ) : (
                               <><i className="bi bi-send-fill me-2"></i> Phát hành thông báo</>
                            )}
                         </button>
                      </div>
                   </form>
                </div>
             </div>

             <div className="mt-4 card border-0 shadow-sm bg-light">
                <div className="card-body">
                   <h6 className="fw-bold"><i className="bi bi-info-circle me-2 text-info"></i>Hướng dẫn</h6>
                   <ul className="mb-0 small text-secondary">
                      <li><strong>System:</strong> Các thông báo quan trọng về vận hành web.</li>
                      <li><strong>Promotion:</strong> Gửi mã giảm giá hoặc chương trình mới.</li>
                      <li><strong>Security:</strong> Cảnh báo về tài khoản hoặc thay đổi chính sách.</li>
                   </ul>
                </div>
             </div>
          </div>
       </div>
    </div>
  );
}
