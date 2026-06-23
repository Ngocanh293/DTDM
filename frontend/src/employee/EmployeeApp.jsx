import React from 'react';
import { Routes, Route } from 'react-router-dom';
import '../admin/assets/scss/style.scss';
import EmployeeLayout from './components/EmployeeLayout';

import Orders from '../admin/pages/Orders';
import OrderDetail from '../admin/pages/OrderDetail';
import Inventory from '../admin/pages/Inventory';
import EmployeeDashboard from './pages/EmployeeDashboard';
import InventoryHistory from './pages/InventoryHistory';
import Complaints from './pages/Complaints';
import ReviewsMan from './pages/ReviewsMan';
import ProfileEmp from './pages/ProfileEmp';

function EmployeeApp() {
  return (
    <Routes>
      <Route path="/" element={<EmployeeLayout />}>
        <Route index element={<EmployeeDashboard />} />
        <Route path="dashboard" element={<EmployeeDashboard />} />
        <Route path="orders" element={<Orders />} />
        <Route path="orders/:id" element={<OrderDetail />} />
        <Route path="products" element={<Inventory />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="inventory-history" element={<InventoryHistory />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="reviews" element={<ReviewsMan />} />
        <Route path="profile" element={<ProfileEmp />} />
      </Route>
    </Routes>
  );
}

export default EmployeeApp;
