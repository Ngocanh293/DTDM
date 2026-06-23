import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import apiClient from '../../services/api';
import { formatCurrency } from '../../utils';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProfit: 0,
    totalPurchases: 0,
    totalExpenses: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const resStats = await apiClient.get('/v1/admin/dashboard/stats');
      setStats(resStats.data);

      const resOrders = await apiClient.get('/v1/orders/admin/all');
      const orders = resOrders.data || [];
      
      // Lấy 3 đơn hàng mới nhất
      setRecentOrders(orders.slice(0, 3));

      // Tính sản phẩm bán chạy từ đơn hàng
      const productCount = {};
      orders.forEach(order => {
        order.orderItems?.forEach(item => {
           if (!productCount[item.productName]) {
              productCount[item.productName] = { name: item.productName, qty: 0, revenue: 0 };
           }
           productCount[item.productName].qty += item.quantity;
           productCount[item.productName].revenue += item.price * item.quantity;
        });
      });
      const sortedProducts = Object.values(productCount).sort((a, b) => b.qty - a.qty).slice(0, 3);
      setBestSellers(sortedProducts);
    } catch (err) {
      console.error("Lỗi khi tải thống kê:", err);
    } finally {
      setLoading(false);
    }
  };

  const salesPurchaseOptions = {
    colors: ['#f7a085', '#E66239'],
    chart: {
      type: 'bar',
      toolbar: { show: false },
    },
    grid: { show: true, borderColor: "#e2e8f0" },
    legend: {
      show: true,
      fontFamily: 'Poppins, serif',
      fontWeight: 500,
      markers: { size: 5, shape: 'square', offsetX: -2, offsetY: 0, strokeWidth: 0 },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '85%',
        borderRadius: 3,
        borderRadiusApplication: 'end',
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ['transparent'] },
    xaxis: {
      categories: ['28 Jan', '29 Jan', '30 Jan', '31 Jan', '1 Feb', '2 Feb', '3 Feb', '4 Feb', '5 Feb'],
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { formatter: (e) => e + 'k' },
      title: { text: '$ (thousands)' },
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val) => "$ " + val + " thousands" }
    },
  };

  const salesPurchaseSeries = [
    { name: 'Sales', data: [
        stats.totalRevenue * 0.05, stats.totalRevenue * 0.1, stats.totalRevenue * 0.08, 
        stats.totalRevenue * 0.15, stats.totalRevenue * 0.12, stats.totalRevenue * 0.2, 
        stats.totalRevenue * 0.18, stats.totalRevenue * 0.09, stats.totalRevenue * 0.03
    ].map(v => Math.round(v / 1000)) },
    { name: 'Purchase', data: [
        stats.totalPurchases * 0.05, stats.totalPurchases * 0.1, stats.totalPurchases * 0.08, 
        stats.totalPurchases * 0.15, stats.totalPurchases * 0.12, stats.totalPurchases * 0.2, 
        stats.totalPurchases * 0.18, stats.totalPurchases * 0.09, stats.totalPurchases * 0.03
    ].map(v => Math.round(v / 1000)) },
  ];

  const customerOptions = {
    chart: { type: 'radialBar' },
    colors: ['#5BE49B', '#E66239'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: { fontSize: '14px' },
          value: { fontSize: '16px' },
          total: { show: false },
        },
        hollow: { margin: 3, size: '40%', background: 'transparent' },
        track: { show: true, background: "#f0f0f0", strokeWidth: '45%' },
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        shade: 'dark',
        type: 'vertical',
        gradientToColors: ['#007867', '#FFD666', '#FFAC82'],
        stops: [0, 100],
      },
    },
    stroke: { lineCap: 'round' },
    labels: ['First Time', 'Return'],
  };

  const customerSeries = [stats.totalCustomers, stats.totalCustomers * 2];

  return (
    <div className="container-fluid">
      <div className="row ">
        <div className="col-12">
          <div className="mb-4 d-flex justify-content-between align-items-end flex-wrap gap-3">
            <div>
              <h1 className="fs-3 mb-1">Tổng quan</h1>
              <p className="text-muted mb-0">Nắm bắt nhanh tình hình hoạt động của hệ thống.</p>
            </div>
            <div className="d-flex gap-2">
              <Link to="/admin/create-product" className="btn btn-primary shadow-sm"><i className="bi bi-plus-lg me-1"></i>Thêm Sản phẩm</Link>
              <Link to="/admin/orders" className="btn btn-light border shadow-sm"><i className="bi bi-card-list me-1"></i>Quản lý Đơn</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="row g-3 mb-3">
        <div className="col-lg-3 col-12">
          <div className="card p-4 admin-card-hover bg-primary bg-opacity-10 border border-primary border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-primary text-white rounded-2">
                <i className="ti ti-report-analytics fs-4"></i>
              </div>
              <div className="flex-grow-1">
                <h2 className="mb-3 fs-6">Tổng doanh thu</h2>
                <h3 className="fw-bold mb-0">{loading ? <div className="skeleton-box skeleton-text" style={{width: '80%'}}></div> : formatCurrency(stats.totalRevenue)}</h3>
                <p className="text-primary mb-0 small mt-1">Phát sinh từ đơn hàng thật</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4 admin-card-hover bg-success bg-opacity-10 border border-success border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-success text-white rounded-2">
                <i className="ti ti-repeat fs-4"></i>
              </div>
              <div className="flex-grow-1">
                <h2 className="mb-3 fs-6">Vốn nhập hàng (Ước tính)</h2>
                <h3 className="fw-bold mb-0">{loading ? <div className="skeleton-box skeleton-text" style={{width: '80%'}}></div> : formatCurrency(stats.totalPurchases)}</h3>
                <p className="text-success mb-0 small mt-1">Lấy giá trị 80% doanh thu</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4 admin-card-hover bg-info bg-opacity-10 border border-info border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-info text-white rounded-2">
                <i className="ti ti-currency-dollar fs-4"></i>
              </div>
              <div className="flex-grow-1">
                <h2 className="mb-3 fs-6">Tổng chi phí</h2>
                <h3 className="fw-bold mb-0">{loading ? <div className="skeleton-box skeleton-text" style={{width: '80%'}}></div> : '$0'}</h3>
                <p className="text-info mb-0 small mt-1">0% so với tháng trước</p>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-3 col-12">
          <div className="card p-4 admin-card-hover bg-warning bg-opacity-10 border border-warning border-opacity-25 rounded-2">
            <div className="d-flex gap-3 ">
              <div className="icon-shape icon-md bg-warning text-white rounded-2">
                <i className="ti ti-notes fs-4"></i>
              </div>
              <div className="flex-grow-1">
                <h2 className="mb-3 fs-6">Khách hàng</h2>
                <h3 className="fw-bold mb-0">{loading ? <div className="skeleton-box skeleton-text" style={{width: '50%'}}></div> : stats.totalCustomers}</h3>
                <p className="text-warning mb-0 small mt-1">Người dùng đã đăng ký</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">{loading ? <div className="skeleton-box skeleton-text" style={{width: '100px'}}></div> : formatCurrency(stats.totalProfit)}</h3>
                  <span>Tổng lợi nhuận (20%)</span>
                </div>
                <div>
                  <i className="ti ti-layers-subtract fs-1 text-primary"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$0</h3>
                  <span>Tổng tiền hoàn trả</span>
                </div>
                <div>
                  <i className="ti ti-credit-card fs-1 text-danger"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                 <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between border-bottom pb-5 mb-3">
                <div>
                  <h3 className="fw-bold h4">$0</h3>
                  <span>Tổng chi phí</span>
                </div>
                <div>
                  <i className="ti ti-cash-banknote fs-1 text-warning"></i>
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center small">
                <div className="text-muted"><span className="text-secondary">0%</span> so với tháng trước</div>
                <div><a href="#!" className="link-primary text-decoration-underline">Xem chi tiết</a></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
              <h3 className="h5 mb-0">Doanh thu & Mua hàng</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="This Year">
                  <option value="This Year">Năm nay</option>
                  <option value="This Month">Tháng này</option>
                  <option value="This Week">Tuần này</option>
                </select>
              </div>
            </div>
            <div className="card-body p-4">
              <div id="salesPurchaseChart">
                <Chart options={salesPurchaseOptions} series={salesPurchaseSeries} type="bar" height={350} />
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-lg-6">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center bg-transparent px-4 py-3">
              <h3 className="h5 mb-0">Thông tin tổng thể</h3>
              <div>
                <select className="form-select form-select-sm" defaultValue="Last 6 Months">
                  <option value="Last 6 Months">6 Tháng qua</option>
                  <option value="This Month">Tháng này</option>
                  <option value="This Week">Tuần này</option>
                </select>
              </div>
            </div>
            <div className="card-body p-4">
              <h3 className="h6">Tổng quan khách hàng</h3>
              <div className="row align-items-center">
                <div className="col-sm-6">
                  <div id="customerChart">
                    <Chart options={customerOptions} series={customerSeries} type="radialBar" height={220} />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="row">
                    <div className="col-6 border-end">
                      <div className="text-center ">
                        <h2 className="mb-1">0</h2>
                        <p className="text-success mb-2">Khách mới</p>
                        <span className="badge bg-secondary"><i className="ti ti-minus me-1"></i>0%</span>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="text-center">
                        <h2 className="mb-1">0</h2>
                        <p className="text-warning mb-2">Quay lại</p>
                        <span className="badge bg-secondary badge-xs d-inline-flex align-items-center"><i
                            className="ti ti-minus me-1"></i>0%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row text-center border-top mt-4 pt-4">
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Nhà cung cấp</small>
                </div>
                <div className="col-4 border-end">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Khách hàng</small>
                </div>
                <div className="col-4">
                  <h3 className="fw-bold mb-2">0</h3>
                  <small className="text-secondary">Đơn hàng</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        {/* CARD 1 — Top Selling Products */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h4 className="mb-0 h5">Sản phẩm bán chạy nhất</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar"></i> Gần đây
              </button>
            </div>
            {loading ? (
               <div className="p-4 d-flex flex-column gap-2">
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
               </div>
            ) : bestSellers.length === 0 ? (
               <div className="empty-state">
                 <i className="bi bi-box-seam"></i>
                 <p className="mb-0">Chưa có dữ liệu</p>
               </div>
            ) : (
               <div className="list-group list-group-flush">
                 {bestSellers.map((item, idx) => (
                    <div key={idx} className="list-group-item d-flex justify-content-between align-items-center px-4 py-3 bg-transparent border-bottom">
                       <div>
                          <h6 className="mb-1 text-truncate" style={{maxWidth: '200px'}}>{item.name}</h6>
                          <small className="text-muted">Đã bán: {item.qty}</small>
                       </div>
                       <span className="fw-bold text-success">+{formatCurrency(item.revenue)}</span>
                    </div>
                 ))}
               </div>
            )}
          </div>
        </div>

        {/* CARD 2 — Low Stock Products */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <div className="d-flex align-items-center">
                <h4 className="mb-0 h5">Sản phẩm sắp hết hàng</h4>
              </div>
              <a href="#!" className="small text-primary text-decoration-underline">Xem tất cả</a>
            </div>
            {loading ? (
               <div className="p-4 d-flex flex-column gap-2">
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
               </div>
            ) : (
               <div className="empty-state">
                 <i className="bi bi-inboxes"></i>
                 <p className="mb-0">Kho hàng ổn định</p>
               </div>
            )}
          </div>
        </div>

        {/* CARD 3 — Recent Sales */}
        <div className="col-lg-4">
          <div className="card  h-100">
            <div className="card-header bg-transparent d-flex justify-content-between align-items-center px-4 py-3 border-bottom">
              <h4 className="mb-0 h5">Đơn hàng gần đây</h4>
              <button className="btn btn-sm btn-outline-secondary">
                <i className="ti ti-calendar-event"></i> Mới nhất
              </button>
            </div>
            {loading ? (
               <div className="p-4 d-flex flex-column gap-2">
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
                 <div className="skeleton-box skeleton-text"></div>
               </div>
            ) : recentOrders.length === 0 ? (
               <div className="empty-state">
                 <i className="bi bi-receipt"></i>
                 <p className="mb-0">Chưa có đơn hàng nào</p>
               </div>
            ) : (
               <div className="list-group list-group-flush">
                 {recentOrders.map(order => (
                    <Link to={`/admin/orders/${order.id}`} key={order.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center px-4 py-3 bg-transparent border-bottom text-decoration-none">
                       <div>
                          <h6 className="mb-1 text-primary">#{order.id}</h6>
                          <small className="text-muted">{new Date(order.orderDate).toLocaleDateString('vi-VN')}</small>
                       </div>
                       <div className="text-end">
                          <div className="fw-bold" style={{color: 'var(--bs-body-color)'}}>{order.totalAmount?.toLocaleString()}₫</div>
                          <small className="badge bg-secondary bg-opacity-10 text-secondary">{order.status}</small>
                       </div>
                    </Link>
                 ))}
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
