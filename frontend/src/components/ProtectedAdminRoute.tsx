import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import Loading from './Loading';

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean; // true = chỉ ADMIN, false = ADMIN hoặc STAFF
}

const ProtectedAdminRoute: React.FC<ProtectedAdminRouteProps> = ({ 
  children, 
  requireAdmin = true 
}) => {
  const { isLoggedIn, user, accessToken, isLoading } = useAdminAuth();
  const location = useLocation();

  // ✅ Nếu đang loading (chưa load xong từ localStorage), hiển thị loading
  if (isLoading) {
    return <Loading message="Đang kiểm tra xác thực..." />;
  }

  // ✅ Nếu chưa đăng nhập, redirect đến admin login với state để quay lại sau khi đăng nhập
  if (!isLoggedIn || !user || !accessToken) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  // Kiểm tra quyền truy cập
  if (requireAdmin) {
    // Chỉ ADMIN
    if (user.role !== 'ADMIN') {
      return <Navigate to="/unauthorized" replace />;
    }
  } else {
    // ADMIN hoặc STAFF
    if (user.role !== 'ADMIN' && user.role !== 'STAFF') {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Nếu tài khoản chưa được xác thực email
  if (!user.is_verified) {
    return <Navigate to="/verify-email" replace />;
  }

  // Nếu tài khoản bị khóa hoặc xóa
  if (user.status === 'BANNED' || user.status === 'DELETED') {
    return <Navigate to="/account-suspended" replace />;
  }

  return <>{children}</>;
};

export default ProtectedAdminRoute;
