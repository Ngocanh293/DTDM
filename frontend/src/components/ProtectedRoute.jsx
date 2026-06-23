import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';

  if (!isAuthenticated) {
    // Chuyển hướng người dùng về trang đăng nhập nếu chưa auth
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
