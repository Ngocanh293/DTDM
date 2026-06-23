import React, { useState } from 'react';
import Chart from 'react-apexcharts';

export default function Reports() {
  const [showingBoth, setShowingBoth] = useState(true);

  // Data
  const salesThisYear = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const salesLastYear = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Series based on state
  const series = showingBoth 
    ? [
        { name: 'This Year', data: salesThisYear },
        { name: 'Last Year', data: salesLastYear }
      ]
    : [
        { name: 'This Year', data: salesThisYear }
      ];

  const salesOptions = {
    chart: { type: 'area', zoom: { enabled: false }, toolbar: { show: false } },
    colors: ['#E66239', '#198754'],
    stroke: { width: [3, 2.5], curve: 'smooth' },
    markers: { size: 4, hover: { sizeOffset: 2 } },
    dataLabels: { enabled: false },
    fill: {
      type: 'gradient',
      gradient: { shadeIntensity: 1, inverseColors: false, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 60, 100] }
    },
    yaxis: {
      labels: { formatter: (val) => '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) },
      title: { text: 'Doanh thu ($)' }
    },
    xaxis: { categories: months, tickPlacement: 'on' },
    tooltip: {
      shared: true,
      y: { formatter: (val) => '₹' + Number(val).toLocaleString('en-IN', { maximumFractionDigits: 0 }) }
    },
    legend: { position: 'top', horizontalAlign: 'right' },
  };

  const toggleSeries = () => {
    setShowingBoth(!showingBoth);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="">
            <h1 className="fs-3 mb-1">Báo cáo</h1>
            <p className="mb-0">Xem phân tích và báo cáo kho hàng của bạn</p>
          </div>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-3">
        {/* Stat cards */}
        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Tổng doanh thu</h6>
              <h3 className="mb-1 fw-bold">$0</h3>
              <p className="mb-0 text-secondary small">0% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Sản phẩm đã bán</h6>
              <h3 className="mb-1 fw-bold">0</h3>
              <p className="mb-0 text-secondary small">0% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Mặt hàng sắp hết</h6>
              <h3 className="mb-1 fw-bold">0</h3>
              <p className="mb-0 text-secondary small">0% so với tháng trước</p>
            </div>
          </div>
        </div>

        <div className="col-12 col-sm-6 col-md-3">
          <div className="card h-100">
            <div className="card-body p-4">
              <h6 className="mb-4 ">Hết hàng</h6>
              <h3 className="mb-1 fw-bold">0</h3>
              <p className="mb-0 text-secondary small">0% so với tháng trước</p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mb-3">
        {/* Sales Overview (full width) */}
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex flex-column flex-md-row justify-content-between align-items-start mb-3 gap-2">
                <div>
                  <h2 className="mb-0 fs-5">Tổng quan doanh thu</h2>
                </div>
                <div className="controls">
                  <button className="btn btn-light btn-sm me-2">Dữ liệu ngẫu nhiên</button>
                  <button className="btn btn-primary btn-sm" onClick={toggleSeries}>
                    {showingBoth ? 'Chỉ xem năm nay' : 'Xem so sánh'}
                  </button>
                </div>
              </div>

              {/* Chart Implementation */}
              <div id="salesChart">
                 <Chart options={salesOptions} series={series} type="area" height={420} />
              </div>

              <div className="d-flex justify-content-end mt-3">
                <a href="#!" className="small">Xem báo cáo chi tiết</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Top Products */}
        <div className="col-12">
          <div className="card">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div>
                  <h2 className="mb-0 fs-5">Sản phẩm hàng đầu</h2>
                </div>
              </div>

              {/* Product rows */}
              <div className="text-center p-4 text-muted">
                <p className="mb-0">Chưa có dữ liệu</p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
