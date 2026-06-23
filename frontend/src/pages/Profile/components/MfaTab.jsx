import React, { useState } from 'react';
import apiClient from '../../../services/api';

export default function MfaTab() {
  const [qrCode, setQrCode] = useState(null);
  const [secret, setSecret] = useState(null);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSetupMfa = async () => {
    try {
      setLoading(true);
      const res = await apiClient.post('/auth/mfa/setup');
      // Assume backend returns base64 QR code image and a secret string
      setQrCode(res.data.qrCodeImage); 
      setSecret(res.data.secret);
      setMessage(null);
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Lỗi khi thiết lập MFA.' });
    } finally {
      setLoading(false);
    }
  };

  const handleEnableMfa = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await apiClient.post('/auth/mfa/enable', { otp: parseInt(otp, 10) });
      setMessage({ type: 'success', text: 'Kích hoạt Bảo mật 2 lớp (MFA) thành công!' });
      setQrCode(null);
      setSecret(null);
      setOtp('');
    } catch (err) {
      setMessage({ type: 'danger', text: err.response?.data?.message || 'Mã OTP không hợp lệ.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <h5 className="fw-bold mb-4"><i className="bi bi-phone-vibrate text-danger me-2"></i>Quản lý Bảo mật 2 Lớp (MFA)</h5>
        
        {message && <div className={`alert alert-${message.type}`}>{message.text}</div>}

        <p className="text-muted">Bảo vệ tài khoản của bạn bằng cách yêu cầu mã xác minh ứng dụng (như Google Authenticator) mỗi khi đăng nhập.</p>

        {!qrCode && (
          <button className="btn btn-primary" onClick={handleSetupMfa} disabled={loading}>
            {loading ? 'Đang chuẩn bị...' : 'Thiết lập MFA ngay'}
          </button>
        )}

        {qrCode && (
          <div className="mt-4 p-4 border rounded bg-light text-center">
            <h6 className="fw-bold mb-3">1. Quét mã QR</h6>
            <p className="small text-muted">Mở Google Authenticator hoặc ứng dụng quét mã QR tương tự trên điện thoại của bạn và quét mã bên dưới:</p>
            <div className="bg-white p-3 d-inline-block rounded shadow-sm mb-3">
              <img src={`data:image/png;base64,${qrCode}`} alt="MFA QR Code" />
            </div>
            {secret && <p className="small text-muted">Hoặc nhập mã thủ công: <strong>{secret}</strong></p>}
            
            <hr className="my-4" />

            <h6 className="fw-bold mb-3">2. Xác nhận mã OTP</h6>
            <form onSubmit={handleEnableMfa} className="d-flex gap-2 justify-content-center">
              <input 
                type="text" 
                className="form-control w-auto text-center" 
                placeholder="Nhập 6 số OTP" 
                value={otp}
                onChange={e => setOtp(e.target.value)}
                maxLength={6}
                required 
              />
              <button type="submit" className="btn btn-success" disabled={loading || otp.length !== 6}>
                Kích hoạt
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
