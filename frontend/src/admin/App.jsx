import React from 'react';
import { Routes, Route } from 'react-router-dom';
import * as bootstrap from 'bootstrap';
import './assets/scss/style.scss';
import Layout from './components/Layout';

import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import CreateProduct from './pages/CreateProduct';
import EditProduct from './pages/EditProduct';
import Reports from './pages/Reports';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Users from './pages/Users';
import Reviews from './pages/Reviews';
import Docs from './pages/Docs';
import NotFound from './pages/NotFound';
import AdminProfile from './pages/AdminProfile';
import AdminNotifications from './pages/AdminNotifications';
import EmailTemplates from './pages/EmailTemplates';
import Categories from './pages/Categories';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Inventory />} />
          <Route path="categories" element={<Categories />} />
          <Route path="create-product" element={<CreateProduct />} />
          <Route path="edit-product/:id" element={<EditProduct />} />
          <Route path="reports" element={<Reports />} />
          <Route path="users" element={<Users />} />
          <Route path="orders" element={<Orders />} />
          <Route path="orders/:id" element={<OrderDetail />} />
          <Route path="reviews" element={<Reviews />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="notifications" element={<AdminNotifications />} />
          <Route path="email-templates" element={<EmailTemplates />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    
  );
}

export default App;
