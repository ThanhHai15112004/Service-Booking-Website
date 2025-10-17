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

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/hotels" element={<HotelLandingPage />} />
      <Route path="/hotels/search" element={<HotelsListPage />} />
      <Route path="/hotel/:id" element={<HotelDetailPage />} />
      <Route path="/booking/:id" element={<BookingPage />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />
      
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
