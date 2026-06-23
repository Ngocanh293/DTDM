import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await apiClient.get('/v1/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error("Lỗi tải khiếu nại:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcess = async (id) => {
    Swal.fire({
      title: 'Xử lý khiếu nại',
      input: 'text',
      inputLabel: 'Nhập kết quả xử lý hỗ trợ khách hàng (VD: Đã hoàn tiền, Đã gọi điện xin lỗi):',
      showCancelButton: true,
      confirmButtonText: 'Lưu',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        try {
          await apiClient.put(`/v1/complaints/${id}/resolve`, { solution: result.value });
          Swal.fire({icon: 'success', title: 'Thành công', text: 'Tiếp nhận và xử lý trạng thái thành công!'});
          fetchComplaints(); // Tải lại dữ liệu sau khi sửa
        } catch (error) {
          console.error("Lỗi xử lý khiếu nại:", error);
          Swal.fire({icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi cập nhật trạng thái.'});
        }
      }
    });
  };

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="fs-3 mb-1">Xử lý khiếu nại</h1>
        <p className="text-secondary">Hỗ trợ khách hàng và giải quyết các vấn đề phát sinh</p>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
             <div className="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 className="mb-0 fs-6">Danh sách khiếu nại mới</h5>
                <div className="d-flex gap-2">
                   <select className="form-select form-select-sm">
                      <option value="">Tất cả trạng thái</option>
                      <option value="PENDING">Chờ xử lý</option>
                      <option value="PROCESSING">Đang xử lý</option>
                      <option value="RESOLVED">Đã giải quyết</option>
                   </select>
                </div>
             </div>
             <div className="card-body p-0">
                <div className="table-responsive text-nowrap">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Mã đơn</th>
                        <th>Khách hàng</th>
                        <th>Vấn đề</th>
                        <th>Ngày yêu cầu</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints.map(c => (
                        <tr key={c.id}>
                          <td>#{c.orderId || c.id}</td>
                          <td>{c.customerName}</td>
                          <td>
                             <div>{c.issue}</div>
                             {c.solution && <small className="text-success d-block"><i className="bi bi-arrow-return-right me-1"></i>{c.solution}</small>}
                          </td>
                          <td>{c.createdDate?.split('T')[0] || c.date}</td>
                          <td>
                            <span className={`badge ${c.status === 'PENDING' ? 'bg-danger' : c.status === 'RESOLVED' ? 'bg-success' : 'bg-warning'}`}>
                               {c.status}
                            </span>
                          </td>
                          <td>
                             {c.status !== 'RESOLVED' ? (
                                <button className="btn btn-sm btn-primary" onClick={() => handleProcess(c.id)}>Xử lý ngay</button>
                             ) : (
                                <button className="btn btn-sm btn-secondary" disabled>Đã xử lý</button>
                             )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
