import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Loading from './Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { isLoggedIn, user, accessToken, isLoading } = useAuth();
  const location = useLocation();

  // ✅ Nếu đang loading (chưa xác định trạng thái auth), hiển thị loading
  if (isLoading) {
    return <Loading message="Đang kiểm tra xác thực..." />;
  }

  // ✅ Nếu chưa đăng nhập, redirect đến login
  if (!isLoggedIn || !user || !accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Nếu yêu cầu role cụ thể
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ Chỉ yêu cầu verify email khi status = PENDING (giống logic backend)
  // Nếu status = ACTIVE thì không cần verify email (đã được verify hoặc login bằng Google/Facebook)
  if (user.status === 'PENDING' && !user.is_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Nếu tài khoản bị khóa hoặc xóa
  if (user.status === 'BANNED' || user.status === 'DELETED') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
