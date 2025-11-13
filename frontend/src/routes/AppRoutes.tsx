import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import HomePage from "../pages/Clients/HomePage";
import HotelLandingPage from "../pages/Clients/HotelPage";
import HotelsListPage from "../pages/Clients/HotelsListPage";
import HotelDetailPage from "../pages/Clients/HotelDetailPage";
import BookingPage from "../pages/Clients/BookingPage";
import LoginPage from "../pages/Clients/Auth/LoginPage";
import RegisterPage from "../pages/Clients/Auth/RegisterPage";
import VerifyEmailPage from "../pages/Clients/Auth/VerifyEmailPage";
import ForgotPasswordPage from "../pages/Clients/Auth/ForgotPasswordPage";
import ProfilePage from "../pages/Clients/Profile/ProfilePage";
import MyBookingsPage from "../pages/Clients/Profile/MyBookingsPage";
import BookingDetailPage from "../pages/Clients/Profile/BookingDetailPage";
import InvoiceDetailPage from "../pages/Clients/Profile/InvoiceDetailPage";
import WishlistPage from "../pages/Clients/Profile/WishlistPage";
import UnauthorizedPage from "../pages/Error/UnauthorizedPage";
import AccountSuspendedPage from "../pages/Error/AccountSuspendedPage";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedAdminRoute from "../components/ProtectedAdminRoute";
import AdminLayout from "../components/Admins/AdminLayout";
import AdminLoginPage from "../pages/Admin/AdminLoginPage";
import AdminProfilePage from "../pages/Admin/AdminProfilePage";
import UserList from "../pages/Admin/UserList";
import { AccountDashboard, AccountList, CreateAccount } from "../components/Admins/AccountManager";
import AccountDetail from "../components/Admins/AccountManager/AccountDetail";
import HotelDashboard from "../components/Admins/HotelManager/Dashboard";
import HotelList from "../components/Admins/HotelManager/HotelList";
import HotelDetail from "../components/Admins/HotelManager/HotelDetail";
import EditHotel from "../components/Admins/HotelManager/EditHotel";
import CategoriesAndLocations from "../components/Admins/HotelManager/CategoriesAndLocations";
import HotelReports from "../components/Admins/HotelManager/HotelReports";
import HotelBookingDetailPage from "../components/Admins/HotelManager/HotelBookingDetailPage";
import RoomDashboard from "../components/Admins/RoomManager/Dashboard";
import RoomTypesList from "../components/Admins/RoomManager/RoomTypesList";
import RoomTypeDetail from "../components/Admins/RoomManager/RoomTypeDetail";
import RoomsList from "../components/Admins/RoomManager/RoomsList";
import Availability from "../components/Admins/RoomManager/Availability";
import BookingDashboard from "../components/Admins/BookingManager/Dashboard";
import BookingList from "../components/Admins/BookingManager/BookingList";
import BookingDetail from "../components/Admins/BookingManager/BookingDetail";
import CreateBooking from "../components/Admins/BookingManager/CreateBooking";
import Payments from "../components/Admins/BookingManager/Payments";
import BookingReports from "../components/Admins/BookingManager/BookingReports";
import Discounts from "../components/Admins/BookingManager/Discounts";
import ActivityLog from "../components/Admins/BookingManager/ActivityLog";
import PaymentDashboard from "../components/Admins/PaymentManager/Dashboard";
import PaymentsList from "../components/Admins/PaymentManager/PaymentsList";
import PaymentDetail from "../components/Admins/PaymentManager/PaymentDetail";
import ManualConfirmation from "../components/Admins/PaymentManager/ManualConfirmation";
import RefundManagement from "../components/Admins/PaymentManager/RefundManagement";
import RetryPayment from "../components/Admins/PaymentManager/RetryPayment";
import ExportInvoice from "../components/Admins/PaymentManager/ExportInvoice";
import PaymentReports from "../components/Admins/PaymentManager/PaymentReports";
import PaymentActivityLog from "../components/Admins/PaymentManager/PaymentActivityLog";
import DiscountDashboard from "../components/Admins/DiscountManager/Dashboard";
import DiscountCodesList from "../components/Admins/DiscountManager/DiscountCodesList";
import CreateDiscountCode from "../components/Admins/DiscountManager/CreateDiscountCode";
import DiscountCodeDetail from "../components/Admins/DiscountManager/DiscountCodeDetail";
import DiscountUsageAnalytics from "../components/Admins/DiscountManager/DiscountUsageAnalytics";
import DiscountUsers from "../components/Admins/DiscountManager/DiscountUsers";
import DiscountReports from "../components/Admins/DiscountManager/DiscountReports";
import PromotionDashboard from "../components/Admins/PromotionManager/Dashboard";
import PromotionsList from "../components/Admins/PromotionManager/PromotionsList";
import CreatePromotion from "../components/Admins/PromotionManager/CreatePromotion";
import PromotionDetail from "../components/Admins/PromotionManager/PromotionDetail";
import PromotionReports from "../components/Admins/PromotionManager/PromotionReports";
import PromotionActivityLog from "../components/Admins/PromotionManager/ActivityLog";

// Review Manager
import ReviewDashboard from "../components/Admins/ReviewManager/Dashboard";
import ReviewsList from "../components/Admins/ReviewManager/ReviewsList";
import ReviewDetail from "../components/Admins/ReviewManager/ReviewDetail";
import ReviewReports from "../components/Admins/ReviewManager/ReviewReports";
import ReviewActivityLog from "../components/Admins/ReviewManager/ReviewActivityLog";

// Reports Manager
import ReportsManager from "../components/Admins/ReportsManager";

// List Manager
import ListManager from "../components/Admins/ListManager";

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
      <Route path="/admin/profile" element={
        <ProtectedAdminRoute requireAdmin={false}>
          <AdminProfilePage />
        </ProtectedAdminRoute>
      } />
      {/* Redirect /admin to /admin/reports */}
      <Route path="/admin" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <Navigate to="/admin/reports?tab=main" replace />
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReportsManager /></AdminLayout>
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
      
      {/* Hotel Management Routes */}
      <Route path="/admin/hotels/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><HotelDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><HotelList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/create" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><EditHotel /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/:hotelId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><HotelDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/:hotelId/edit" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><EditHotel /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/:hotelId/bookings/:bookingId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><HotelBookingDetailPage /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/categories" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CategoriesAndLocations /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/hotels/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><HotelReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      
      {/* Room Management Routes */}
      <Route path="/admin/rooms/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RoomDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/rooms/types" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RoomTypesList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/rooms/types/:roomTypeId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RoomTypeDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/rooms" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RoomsList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/rooms/availability" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><Availability /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      
      {/* Booking Management Routes */}
      <Route path="/admin/bookings/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><BookingDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><BookingList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/create" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreateBooking /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/:bookingId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><BookingDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/payments" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><Payments /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><BookingReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/discounts" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><Discounts /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/bookings/activity" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ActivityLog /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* Payment Management Routes */}
      <Route path="/admin/payments/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PaymentDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PaymentsList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/:paymentId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PaymentDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/manual" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ManualConfirmation /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/refunds" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RefundManagement /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/retry" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><RetryPayment /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/invoice" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ExportInvoice /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PaymentReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/payments/activity" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PaymentActivityLog /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* Discount Management Routes */}
      <Route path="/admin/discounts/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountCodesList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/create" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreateDiscountCode /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/:codeId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountCodeDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/:codeId/edit" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreateDiscountCode /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/analytics" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountUsageAnalytics /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/users" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountUsers /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/discounts/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><DiscountReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* Promotion Management Routes */}
      <Route path="/admin/promotions/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PromotionDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions/create" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreatePromotion /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions/:promotionId/edit" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><CreatePromotion /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions/:promotionId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PromotionDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PromotionsList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PromotionReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/promotions/activity" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><PromotionActivityLog /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* Review Management Routes */}
      <Route path="/admin/reviews/dashboard" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReviewDashboard /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/reviews" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReviewsList /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/reviews/:reviewId" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReviewDetail /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/reviews/reports" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReviewReports /></AdminLayout>
        </ProtectedAdminRoute>
      } />
      <Route path="/admin/reviews/activity" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ReviewActivityLog /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* List Management Routes */}
      <Route path="/admin/lists" element={
        <ProtectedAdminRoute requireAdmin={true}>
          <AdminLayout><ListManager /></AdminLayout>
        </ProtectedAdminRoute>
      } />

      {/* Error Routes */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />
      <Route path="/account-suspended" element={<AccountSuspendedPage />} />
      
      {/* 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

// NotFoundPage component for 404 errors
function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-black mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Không tìm thấy trang</p>
        <button
          onClick={() => navigate('/', { replace: true })}
          className="bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
        >
          Về trang chủ
        </button>
      </div>
    </div>
  );
}

export default AppRoutes;
