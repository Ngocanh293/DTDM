import React, { useState, useEffect } from 'react';
import apiClient from '../../../services/api';

export default function NotificationsTab() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      // Assuming PUT /api/notifications/{id}/read
      await apiClient.put(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu đã đọc', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.put('/notifications/read-all');
      fetchNotifications();
    } catch (err) {
      console.error('Lỗi khi đánh dấu tất cả', err);
    }
  };

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="fw-bold mb-0"><i className="bi bi-bell text-danger me-2"></i>Thông báo của tôi</h5>
          {notifications.some(n => !n.isRead) && (
            <button className="btn btn-sm btn-outline-secondary" onClick={handleMarkAllAsRead}>
              Đánh dấu tất cả đã đọc
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-4"><span className="spinner-border spinner-border-sm text-danger"></span></div>
        ) : notifications.length === 0 ? (
          <p className="text-muted text-center py-4">Bạn không có thông báo nào mới.</p>
        ) : (
          <div className="list-group list-group-flush gap-2">
            {notifications.map(noti => (
              <div key={noti.id} className={`list-group-item list-group-item-action rounded border-0 ${noti.isRead ? 'bg-light text-muted' : 'bg-primary bg-opacity-10'}`}>
                <div className="d-flex justify-content-between align-items-center">
                  <span className={`fw-${noti.isRead ? 'normal' : 'bold'}`}>{noti.title || 'Thông báo mới'}</span>
                  <small className="text-muted">{new Date(noti.createdAt).toLocaleDateString('vi-VN')}</small>
                </div>
                <p className="mb-0 mt-1 small">{noti.message}</p>
                {!noti.isRead && (
                  <button className="btn btn-link btn-sm p-0 text-decoration-none mt-2" onClick={() => handleMarkAsRead(noti.id)}>
                    Đánh dấu đã đọc
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
