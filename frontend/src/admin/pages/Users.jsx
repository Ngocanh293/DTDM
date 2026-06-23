import React, { useState, useEffect } from 'react';
import apiClient from '../../services/api';
import Swal from 'sweetalert2';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyword, setKeyword] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const endpoint = keyword.trim() 
        ? `/admin/users/search?keyword=${encodeURIComponent(keyword)}&size=50` 
        : '/admin/users?size=50';
      const response = await apiClient.get(endpoint);
      setUsers(response.data.content || []);
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [keyword]); // fetch when keyword changes (could debounce, or button trigger, but simple search on change/enter)

  const handleRoleChange = async (userId, newRole) => {
    try {
      await apiClient.put(`/admin/users/${userId}/role?role=${newRole}`);
      Swal.fire({icon: 'success', title: 'Thành công', text: 'Cập nhật quyền thành công!', timer: 1500});
      fetchUsers();
    } catch (error) {
      console.error(error);
      Swal.fire({icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi phân quyền!'});
    }
  };

  const handleHardDelete = async (userId) => {
    Swal.fire({
      title: 'CẢNH BÁO',
      text: "Hành động này sẽ xóa vĩnh viễn dữ liệu của người dùng này khỏi cơ sở dữ liệu. Bạn có chắc chắn muốn xóa?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Xóa vĩnh viễn',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/admin/users/${userId}/hard`);
          Swal.fire({icon: 'success', title: 'Đã xóa', text: 'Đã xóa vĩnh viễn tài khoản!'});
          fetchUsers();
        } catch (error) {
          console.error(error);
          Swal.fire({icon: 'error', title: 'Lỗi', text: 'Bạn không thể xóa tài khoản này!'});
        }
      }
    });
  };

  const handleStatusChange = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await apiClient.put(`/admin/users/${userId}/status?status=${newStatus}`);
      fetchUsers();
    } catch (error) {
      console.error(error);
      Swal.fire({icon: 'error', title: 'Lỗi', text: 'Có lỗi xảy ra khi cập nhật trạng thái hoạt động!'});
    }
  };

  const handleSoftDelete = async (userId) => {
    Swal.fire({
      title: 'Xác nhận xóa',
      text: "Bạn muốn xóa (vô hiệu hóa tạm thời) tài khoản này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Đồng ý',
      cancelButtonText: 'Hủy'
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`/admin/users/${userId}`);
          fetchUsers();
        } catch (error) { console.error(error); }
      }
    });
  };

  const handleRestore = async (userId) => {
    try {
      await apiClient.post(`/admin/users/${userId}/restore`);
      fetchUsers();
    } catch (error) { console.error(error); }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="">
              <h1 className="fs-3 mb-1">Quản lý người dùng</h1>
              <p className="mb-0 text-muted">Thiết lập vai trò và quản lý tài khoản email khách hàng</p>
            </div>
          </div>
          
          <div className="card shadow-sm border-0 mb-4 bg-white">
            <div className="card-body p-3">
              <div className="input-group" style={{ maxWidth: '400px' }}>
                <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                <input 
                  type="text" 
                  className="form-control border-start-0 bg-light" 
                  placeholder="Tìm theo email hoặc tên..." 
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <div className="card table-responsive">
            <table className="table mb-0 text-nowrap table-hover">
              <thead className="table-light border-light">
                <tr>
                  <th>ID</th>
                  <th>Người dùng</th>
                  <th>Email</th>
                  <th>Phân quyền (Role)</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="text-center">Đang tải...</td></tr>
                ) : users.length === 0 ? (
                  <tr><td colSpan="6" className="text-center">Trống</td></tr>
                ) : (
                  users.map(u => (
                    <tr key={u.id}>
                      <td>#{u.id}</td>
                      <td>{u.fullName || 'Chưa cập nhật'}</td>
                      <td>{u.email}</td>
                      <td>
                        <select 
                          className="form-select form-select-sm" 
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="CUSTOMER">Khách hàng (User)</option>
                          <option value="EMPLOYEE">Nhân viên (Employee)</option>
                          <option value="ADMIN">Quản trị (Admin)</option>
                        </select>
                      </td>
                      <td>
                        <span className={`badge ${u.status === 'ACTIVE' ? 'bg-success' : 'bg-secondary'} me-1`}>
                          {u.status}
                        </span>
                        {u.deletedAt && <span className="badge bg-danger">XÓA TẠM</span>}
                      </td>
                      <td>
                        <div className="btn-group gap-1">
                          <button 
                            onClick={() => handleStatusChange(u.id, u.status)}
                            className={`btn btn-sm ${u.status === 'ACTIVE' ? 'btn-outline-warning' : 'btn-outline-success'}`}
                            title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                             {u.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                          </button>
                          
                          {u.deletedAt ? (
                            <button onClick={() => handleRestore(u.id)} className="btn btn-sm btn-outline-info" title="Khôi phục">
                              Khôi phục
                            </button>
                          ) : (
                            <button onClick={() => handleSoftDelete(u.id)} className="btn btn-sm btn-outline-secondary" title="Xóa tạm">
                              Xóa
                            </button>
                          )}

                          <button 
                            onClick={() => handleHardDelete(u.id)}
                            className="btn btn-sm btn-danger text-white"
                            title="Xóa vĩnh viễn"
                          >
                             <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
