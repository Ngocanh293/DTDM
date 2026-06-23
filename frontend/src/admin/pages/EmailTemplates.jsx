import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/notifications/templates');
      setTemplates(response.data);
      if (response.data.length > 0) {
        setSelectedTemplate(response.data[0]);
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Không thể tải danh sách mẫu email.' });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await apiClient.put('/notifications/templates', {
        type: selectedTemplate.type,
        locale: selectedTemplate.locale,
        subject: selectedTemplate.subject,
        content: selectedTemplate.content
      });
      setMessage({ type: 'success', text: `Đã lưu thay đổi mẫu email (${selectedTemplate.locale}) thành công!` });
      // Update local templates list
      setTemplates(templates.map(t => (t.type === selectedTemplate.type && t.locale === selectedTemplate.locale) ? selectedTemplate : t));
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Lỗi khi lưu mẫu email.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>;

  return (
    <div className="container-fluid">
       <div className="row">
          <div className="col-12">
             <div className="mb-4">
                <h1 className="fs-3 mb-1">Email Template Editor</h1>
                <p className="text-secondary">Tùy chỉnh nội dung các mẫu email tự động gửi khách hàng</p>
             </div>
          </div>
       </div>

       {message && <div className={`alert alert-${message.type} alert-dismissible fade show mb-4`} role="alert">
          {message.text}
          <button type="button" className="btn-close" onClick={() => setMessage(null)}></button>
       </div>}

       <div className="row g-4">
          {/* List Sidebar */}
          <div className="col-md-4 col-lg-3">
             <div className="card border-0 shadow-sm h-100">
                <div className="card-header bg-white py-3 border-bottom">
                   <h6 className="mb-0 fw-bold">Danh sách Mẫu</h6>
                </div>
                <div className="list-group list-group-flush">
                   {templates.map(t => (
                      <button 
                         key={`${t.type}-${t.locale}`} 
                         className={`list-group-item list-group-item-action border-0 py-3 ${selectedTemplate?.type === t.type && selectedTemplate?.locale === t.locale ? 'bg-primary bg-opacity-10 text-primary fw-bold' : ''}`}
                         onClick={() => {
                            setSelectedTemplate(t);
                            setMessage(null);
                         }}
                      >
                         <div className="d-flex justify-content-between align-items-center">
                            <span>
                               <i className="bi bi-file-earmark-code me-2"></i>
                               {String(t.type || '').replace(/_/g, ' ').toUpperCase()}
                            </span>
                            <span className="badge bg-secondary bg-opacity-10 text-secondary text-uppercase" style={{ fontSize: '10px' }}>
                               {t.locale}
                            </span>
                         </div>
                      </button>
                   ))}
                </div>
             </div>
          </div>

          {/* Editor Area */}
          <div className="col-md-8 col-lg-9">
             {selectedTemplate ? (
                <div className="card border-0 shadow-sm">
                   <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                      <h5 className="mb-0 text-primary fw-bold">Đang chỉnh sửa: {String(selectedTemplate.type || '').replace(/_/g, ' ').toUpperCase()}</h5>
                      <span className="badge bg-light text-dark border">Cấu hình tự động</span>
                   </div>
                   <div className="card-body p-4">
                      <form onSubmit={handleUpdate}>
                         <div className="mb-3">
                            <label className="form-label fw-bold">Tiêu đề Email (Subject)</label>
                            <input 
                              type="text" 
                              className="form-control" 
                              value={selectedTemplate.subject}
                              onChange={e => setSelectedTemplate({...selectedTemplate, subject: e.target.value})}
                              required 
                            />
                         </div>
                         <div className="mb-4">
                            <label className="form-label fw-bold">Nội dung HTML Content</label>
                            <textarea 
                              className="form-control font-monospace text-sm bg-light" 
                              rows="15" 
                              style={{ fontSize: '13px' }}
                              value={selectedTemplate.content}
                              onChange={e => setSelectedTemplate({...selectedTemplate, content: e.target.value})}
                              required
                            ></textarea>
                            <div className="form-text small mt-2">
                               <i className="bi bi-info-circle me-1"></i> Sử dụng các biến như <code>{'{fullName}'}</code>, <code>{'{orderId}'}</code> (tùy thuộc vào từng mẫu) để cá nhân hóa nội dung.
                            </div>
                         </div>
                         <div className="d-flex justify-content-end gap-2">
                            <button type="button" className="btn btn-outline-secondary px-4" onClick={() => fetchTemplates()}>Làm mới</button>
                            <button type="submit" className="btn btn-primary px-5 shadow-sm" disabled={saving}>
                               {saving ? 'Đang lưu...' : 'Lưu mẫu Email'}
                            </button>
                         </div>
                      </form>
                   </div>
                </div>
             ) : (
                <div className="card border-0 shadow-sm p-5 text-center">
                   <i className="bi bi-cursor fs-1 text-muted mb-3"></i>
                   <p className="text-muted">Vui lòng chọn một mẫu email từ danh sách bên trái để chỉnh sửa</p>
                </div>
             )}
          </div>
       </div>
    </div>
  );
}
