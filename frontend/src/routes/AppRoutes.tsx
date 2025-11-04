import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/Clients/HomePage";
import HotelLandingPage from "../pages/Clients/HotelPage";
import HotelsListPage from "../pages/Clients/HotelsListPage";
import HotelDetailPage from "../pages/Clients/HotelDetailPage";
import BookingPage from "../pages/Clients/BookingPage";
import LoginPage from "../pages/Auth/LoginPage";
import RegisterPage from "../pages/Auth/RegisterPage";
import VerifyEmailPage from "../pages/Auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/Auth/ForgotPasswordPage";
import ProfilePage from "../pages/Profile/ProfilePage";
import MyBookingsPage from "../pages/Profile/MyBookingsPage";
import BookingDetailPage from "../pages/Profile/BookingDetailPage";
import InvoiceDetailPage from "../pages/Profile/InvoiceDetailPage";
import WishlistPage from "../pages/Profile/WishlistPage";
import UnauthorizedPage from "../pages/Error/UnauthorizedPage";
import AccountSuspendedPage from "../pages/Error/AccountSuspendedPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";
import AdminLayout from "../components/Admins/AdminLayout";
import AdminLoginPage from "../pages/Admin/AdminLoginPage";
import Dashboard from "../pages/Admin/Dashboard";
import UserList from "../pages/Admin/UserList";
import ProductList from "../pages/Admin/ProductList";
import OrderList from "../pages/Admin/OrderList";
import { AccountDashboard, AccountList, CreateAccount } from "../components/Admins/AccountManager";
import AccountDetail from "../components/Admins/AccountManager/AccountDetail";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/hotels" element={<HotelLandingPage />} />
      <Route path="/hotels/search" element={<HotelsListPage />} />
      <Route path="/hotel/:id" element={<HotelDetailPage />} />
      <Route path="/booking/:id" element={
        <ProtectedRoute>
          <BookingPage />
        </ProtectedRoute>
      } />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />
      
      {/* Protected Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      } />
      <Route path="/bookings" element={
        <ProtectedRoute>
          <MyBookingsPage />
        </ProtectedRoute>
      } />
      <Route path="/booking-detail/:bookingId" element={
        <ProtectedRoute>
          <BookingDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/invoice/:bookingId" element={
        <ProtectedRoute>
          <InvoiceDetailPage />
        </ProtectedRoute>
      } />
      <Route path="/favorites" element={
        <ProtectedRoute>
          <WishlistPage />
        </ProtectedRoute>
      } />
      
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/admin" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><Dashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/users" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><UserList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      
      {/* Account Management Routes */}
      <Route path="/admin/accounts/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><AccountDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/accounts" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><AccountList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/accounts/create" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreateAccount /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/accounts/:accountId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><AccountDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/products" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ProductList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/orders" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><OrderList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      
      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/account-suspended" element={<AccountSuspendedPage />} />
      
      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-black mb-4">404</h1>
            <p className="text-xl text-gray-600 mb-8">Không tìm thấy trang</p>
            <button
              onClick={() => window.location.href = '/'}
              className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Về trang chủ
            </button>
          </div>
        </div>
      } />
    </Routes>
  );
}

export default AppRoutes;
