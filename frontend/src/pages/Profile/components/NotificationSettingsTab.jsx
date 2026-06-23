import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

export default function NotificationSettingsTab() {
  const [preferences, setPreferences] = useState({
    orderUpdatesEmail: true,
    orderUpdatesWeb: true,
    promotionsEmail: false,
    securityAlertsEmail: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications/preferences');
      // Map API list to current local state structure
      if (Array.isArray(res.data)) {
        const newPrefs = { ...preferences };
        res.data.forEach(p => {
          if (p.type === 'ORDER_CONFIRMATION') newPrefs.orderUpdatesEmail = p.isEnabled;
          else if (p.type === 'ORDER_STATUS_UPDATE') newPrefs.orderUpdatesWeb = p.isEnabled;
          else if (p.type === 'PROMOTIONS') newPrefs.promotionsEmail = p.isEnabled;
          else if (p.type === 'SYSTEM_ALERT') newPrefs.securityAlertsEmail = p.isEnabled;
        });
        setPreferences(newPrefs);
      }
    } catch (err) {
      console.error("Lỗi khi tải cài đặt thông báo:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage(null);
      await apiClient.put('/notifications/preferences/bulk', preferences);
      setMessage({ type: 'success', text: 'Đã lưu cài đặt thông báo!' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'danger', text: 'Lỗi khi lưu cài đặt.' });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setPreferences(prev => ({ ...prev, [name]: checked }));
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-gear-wide-connected text-danger me-2"></i>Cài đặt Thông báo</h5>
        
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        {loading ? (
          <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-danger"></span></div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Cập nhật đơn hàng</h6>
              <div className="form-check form-switch mb-2">
                <input className="form-check-input" type="checkbox" id="orderUpdatesWeb" name="orderUpdatesWeb" checked={preferences.orderUpdatesWeb} onChange={handleChange} />
                <label className="form-check-label" htmlFor="orderUpdatesWeb">Thông báo qua Website</label>
              </div>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="orderUpdatesEmail" name="orderUpdatesEmail" checked={preferences.orderUpdatesEmail} onChange={handleChange} />
                <label className="form-check-label" htmlFor="orderUpdatesEmail">Thông báo qua Email</label>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Khuyến mãi & Tin tức</h6>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="promotionsEmail" name="promotionsEmail" checked={preferences.promotionsEmail} onChange={handleChange} />
                <label className="form-check-label" htmlFor="promotionsEmail">Nhận email khuyến mãi</label>
              </div>
            </div>

            <div className="mb-4">
              <h6 className="fw-bold mb-3">Cảnh báo bảo mật</h6>
              <div className="form-check form-switch">
                <input className="form-check-input" type="checkbox" id="securityAlertsEmail" name="securityAlertsEmail" checked={preferences.securityAlertsEmail} onChange={handleChange} disabled />
                <label className="form-check-label text-muted" htmlFor="securityAlertsEmail">Cảnh báo đăng nhập lạ, đổi mật khẩu (Bắt buộc bật)</label>
              </div>
            </div>

            <button type="submit" className="btn btn-danger" disabled={saving}>
              {saving ? 'Đang lưu...' : 'Lưu Cài đặt'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
