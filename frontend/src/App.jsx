import { BrowserRouter as Router, Routes, Route, Outlet, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingContact from './components/FloatingContact';
import Home from './pages/Home';
import Product from './pages/Product';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import EmailChangeConfirm from './pages/EmailChangeConfirm';
import GuestOrderTracking from './pages/GuestOrderTracking';
import StaticPage from './pages/StaticPage';
import Profile from './pages/Profile';
import BuildPC from './pages/BuildPC';
import PromoPage from './pages/Promo';
import WarrantyPage from './pages/Warranty';
import InstallmentPage from './pages/Installment';
import PaymentPage from './pages/Payment';
import OrderSuccessPage from './pages/OrderSuccess';
import AdminApp from './admin/App';
import EmployeeApp from './employee/EmployeeApp';
import ProtectedRoute from './components/ProtectedRoute';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

// Component Layout Chung cho luồng Khách Hàng
const MainLayout = () => {
  return (
    <>
      <Header />
      <main className="flex-grow-1 storefront-main pt-4" style={{ minHeight: '60vh' }}>
        <Outlet />
      </main>
      <FloatingContact />
      <Footer />
    </>
  );
};

// Component Layout cho các trang Auth (Đăng nhập, Đăng ký, Quên mật khẩu)
const AuthLayout = () => {
  return (
    <>
      <Header minimal={true} />
      <main className="flex-grow-1 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '80vh', padding: '40px 0' }}>
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <div className="app-container d-flex flex-column min-vh-100">
            <Routes>
              {/* Main App Routes with Header & Footer Layout */}
              <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Product />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/order-tracking" element={<GuestOrderTracking />} />
                <Route path="/build-pc" element={<BuildPC />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment/:orderId" element={<PaymentPage />} />
                <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                <Route path="/profile" element={<Profile />} />

                {/* Static / Policy Pages */}
                <Route path="/khuyen-mai" element={<PromoPage />} />
                <Route path="/tra-gop" element={<InstallmentPage />} />
                <Route path="/bao-hanh" element={<WarrantyPage />} />
              </Route>
              
              {/* Auth Routes with Minimal Header */}
              <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/signup" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/email-change/confirm" element={<EmailChangeConfirm />} />
              </Route>
  
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminApp />
                  </ProtectedRoute>
                }
              />

              {/* Employee Dashboard Route */}
              <Route 
                path="/employee/*" 
                element={
                  <ProtectedRoute>
                    <EmployeeApp />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
