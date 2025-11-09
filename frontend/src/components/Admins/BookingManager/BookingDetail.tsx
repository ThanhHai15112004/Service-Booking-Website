import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Mail, FileText, CheckCircle, XCircle, Clock, DollarSign, User, Hotel, Calendar, Phone, CreditCard, History, Plus, X, LogIn, LogOut } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface BookingDetail {
  booking_id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  provider: string;
  hotel_id: string;
  hotel_name: string;
  hotel_address?: string;
  hotel_phone?: string;
  hotel_email?: string;
  hotel_checkin_time?: string;
  hotel_checkout_time?: string;
  check_in: string;
  check_out: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  payment_method: string;
  payment_status: "PENDING" | "SUCCESS" | "FAILED";
  payment_created_at?: string;
  payment_updated_at?: string;
  amount_due?: number;
  amount_paid?: number;
  status: "CREATED" | "PENDING_CONFIRMATION" | "CONFIRMED" | "CHECKED_IN" | "CHECKED_OUT" | "COMPLETED" | "CANCELLED";
  special_requests?: string;
  created_at: string;
  updated_at: string;
  booking_code?: string;
  rooms: Array<{
    booking_detail_id?: string;
    room_type_id: string;
    room_type_name: string;
    room_id: string;
    room_number: string;
    price_per_night: number;
    nights_count: number;
    guests_count: number;
    total_price: number;
    checkin_date: string;
    checkout_date: string;
    capacity?: number;
  }>;
  activityLogs?: Array<{
    action_type: string;
    action: string;
    time: string;
    user: string;
    department: string;
    change_details: string;
    note: string;
    ip_address?: string;
  }>;
  statusHistory: Array<{
    id?: number;
    date: string;
    admin_name: string;
    old_status: string;
    new_status: string;
    note?: string;
  }>;
  internalNotes: Array<{
    id: number;
    created_at: string;
    admin_name: string;
    admin_id?: string;
    note: string;
  }>;
}

const BookingDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    specialRequests: "",
    checkIn: "",
    checkOut: "",
  });

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const result = await adminService.getBookingDetailForAdmin(bookingId);
      if (result.success && result.data) {
        const data = result.data;
        // Map data from backend to frontend format
        setBooking({
          booking_id: data.booking_id,
          account_id: data.account_id,
          customer_name: data.customer_name,
          customer_email: data.customer_email,
          customer_phone: data.customer_phone,
          provider: data.provider || "LOCAL",
          hotel_id: data.hotel_id,
          hotel_name: data.hotel_name,
          hotel_address: data.hotel_address,
          hotel_phone: data.hotel_phone,
          hotel_email: data.hotel_email,
          hotel_checkin_time: data.hotel_checkin_time || "14:00",
          hotel_checkout_time: data.hotel_checkout_time || "12:00",
          check_in: data.rooms?.[0]?.checkin_date || data.check_in || "",
          check_out: data.rooms?.[0]?.checkout_date || data.check_out || "",
          subtotal: data.subtotal || 0,
          tax_amount: data.tax_amount || 0,
          discount_amount: data.discount_amount || 0,
          total_amount: data.total_amount || 0,
          payment_method: data.payment_method || "",
          payment_status: data.payment_status || "PENDING",
          payment_created_at: data.payment_created_at,
          payment_updated_at: data.payment_updated_at,
          amount_due: data.amount_due,
          amount_paid: data.amount_paid,
          status: data.status,
          special_requests: data.special_requests,
          created_at: data.created_at,
          updated_at: data.updated_at,
          booking_code: data.booking_code,
          rooms: data.rooms || [],
          activityLogs: data.activityLogs || [],
          statusHistory: data.statusHistory || [],
          internalNotes: data.internalNotes || [],
        });
        // Set edit form với giá trị hiện tại
        setEditForm({
          specialRequests: data.special_requests || "",
          checkIn: data.rooms?.[0]?.checkin_date || "",
          checkOut: data.rooms?.[0]?.checkout_date || "",
        });
      } else {
        showToast("error", result.message || "Không tìm thấy booking");
        navigate("/admin/bookings");
      }
    } catch (error: any) {
      showToast("error", error.message || "Lỗi khi tải thông tin booking");
      navigate("/admin/bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!bookingId || updating) return;
    setUpdating(true);
    try {
      const result = await adminService.updateBookingStatus(bookingId, "CONFIRMED");
      if (result.success) {
        showToast("success", result.message || "Đã xác nhận booking");
        fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể xác nhận booking");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể xác nhận booking");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckIn = async () => {
    if (!bookingId || updating) return;
    setUpdating(true);
    try {
      const result = await adminService.updateBookingStatus(bookingId, "CHECKED_IN");
      if (result.success) {
        showToast("success", result.message || "Đã check-in");
        fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể check-in");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể check-in");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckOut = async () => {
    if (!bookingId || updating) return;
    setUpdating(true);
    try {
      const result = await adminService.updateBookingStatus(bookingId, "CHECKED_OUT");
      if (result.success) {
        showToast("success", result.message || "Đã check-out");
        fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể check-out");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể check-out");
    } finally {
      setUpdating(false);
    }
  };

  const handleComplete = async () => {
    if (!bookingId || updating) return;
    setUpdating(true);
    try {
      const result = await adminService.updateBookingStatus(bookingId, "COMPLETED");
      if (result.success) {
        showToast("success", result.message || "Đã hoàn tất booking");
        fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể hoàn tất booking");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể hoàn tất booking");
    } finally {
      setUpdating(false);
    }
  };

  const handleCancel = async () => {
    if (!bookingId || updating) return;
    if (!window.confirm("Bạn có chắc chắn muốn hủy booking này? Phòng sẽ được trả lại vào hệ thống.")) {
      return;
    }
    setUpdating(true);
    try {
      const result = await adminService.updateBookingStatus(bookingId, "CANCELLED");
      if (result.success) {
        showToast("success", result.message || "Đã hủy booking");
      fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể hủy booking");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể hủy booking");
    } finally {
      setUpdating(false);
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim() || !bookingId) {
      showToast("error", "Vui lòng nhập ghi chú");
      return;
    }
    try {
      const result = await adminService.addBookingInternalNote(bookingId, newNote.trim());
      if (result.success) {
        showToast("success", result.message || "Đã thêm ghi chú");
      setNewNote("");
      setShowNoteModal(false);
      fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể thêm ghi chú");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể thêm ghi chú");
    }
  };

  const handleSendEmail = async () => {
    if (!bookingId) return;
    try {
      const result = await adminService.sendBookingConfirmationEmail(bookingId);
      if (result.success) {
        showToast("success", result.message || "Đã gửi lại email xác nhận");
      } else {
        showToast("error", result.message || "Không thể gửi email");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể gửi email");
    }
  };

  const handleUpdateBooking = async () => {
    if (!bookingId) return;
    try {
      const result = await adminService.updateBooking(bookingId, {
        specialRequests: editForm.specialRequests,
        checkIn: editForm.checkIn,
        checkOut: editForm.checkOut,
      });
      if (result.success) {
        showToast("success", result.message || "Đã cập nhật booking");
        setShowEditModal(false);
        fetchBookingDetail();
      } else {
        showToast("error", result.message || "Không thể cập nhật booking");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật booking");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Tạo mới</span>;
      case "PENDING_CONFIRMATION":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Chờ xác nhận</span>;
      case "CONFIRMED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Đã xác nhận</span>;
      case "CHECKED_IN":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Đã check-in</span>;
      case "CHECKED_OUT":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Đã check-out</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case "SUCCESS":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Thành công</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Thất bại</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatTime = (timeString?: string, defaultTime: string = "00:00") => {
    if (!timeString) return defaultTime;
    // Format từ "HH:MM:SS" hoặc "HH:MM" thành "HH:MM"
    return timeString.substring(0, 5);
  };

  if (loading) {
    return <Loading message="Đang tải thông tin booking..." />;
  }

  if (!booking) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy booking</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/bookings")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết booking</h1>
              {getStatusBadge(booking.status)}
            </div>
            <p className="text-gray-600 mt-1">Booking ID: {booking.booking_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Action Buttons based on status */}
          {booking.status === "PENDING_CONFIRMATION" && (
            <>
              <button
                onClick={handleConfirm}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {updating ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    Xác nhận
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} />
                Hủy booking
              </button>
            </>
          )}
          {booking.status === "CONFIRMED" && (
            <>
          <button
                onClick={handleCheckIn}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {updating ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogIn size={16} />
                    Check-in
                  </>
                )}
          </button>
          <button
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} />
                Hủy booking
              </button>
            </>
          )}
          {booking.status === "CHECKED_IN" && (
            <>
              <button
                onClick={handleCheckOut}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {updating ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <LogOut size={16} />
                    Check-out
                  </>
                )}
          </button>
              <button
                onClick={handleCancel}
                disabled={updating}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <XCircle size={16} />
                Hủy booking
              </button>
            </>
          )}
          {booking.status === "CHECKED_OUT" && (
            <button
              onClick={handleComplete}
              disabled={updating}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              {updating ? (
                <>
                  <Clock size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  <CheckCircle size={16} />
                  Hoàn tất
                </>
              )}
            </button>
          )}
          {(booking.status === "COMPLETED" || booking.status === "CANCELLED") && (
            <button
              onClick={() => handleSendEmail()}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Mail size={16} />
              Gửi email
            </button>
          )}
          <button
            onClick={() => setShowEditModal(true)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium flex items-center gap-2 transition-colors"
          >
            <Edit size={16} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Booking Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-lg p-3">
              <Hotel className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Khách sạn</p>
              <p className="font-medium text-gray-900">{booking.hotel_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-lg p-3">
              <Calendar className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Check-in / Check-out</p>
              <p className="font-medium text-gray-900">
                {formatDate(booking.check_in)} {formatTime(booking.hotel_checkin_time, "14:00")}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                → {formatDate(booking.check_out)} {formatTime(booking.hotel_checkout_time, "12:00")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-medium text-gray-900">{formatPrice(booking.total_amount)} VNĐ</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 rounded-lg p-3">
              <CreditCard className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Thanh toán</p>
              <p className="font-medium text-gray-900">{booking.payment_method}</p>
              {getPaymentStatusBadge(booking.payment_status)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <User className="text-blue-600" size={20} />
              Thông tin khách hàng
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
                <p className="text-gray-900">{booking.customer_name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{booking.customer_email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <p className="text-gray-900">{booking.customer_phone || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <p className="text-gray-900">{booking.provider}</p>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">ID tài khoản</label>
                <button
                  onClick={() => navigate(`/admin/accounts/${booking.account_id}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {booking.account_id} (Xem chi tiết)
                </button>
              </div>
            </div>
          </div>

          {/* Rooms Booked */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Hotel className="text-green-600" size={20} />
              Phòng đã đặt
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá/đêm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số đêm</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {booking.rooms.map((room, index) => (
                    <tr key={room.room_id || room.booking_detail_id || `room-${index}`}>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.room_type_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.room_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(room.price_per_night)} VNĐ</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.nights_count || room.nights || 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(room.total_price || room.subtotal)} VNĐ</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CreditCard className="text-purple-600" size={20} />
              Thông tin thanh toán
            </h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
                  <p className="text-gray-900">{booking.payment_method}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái thanh toán</label>
                  <div className="mt-1">{getPaymentStatusBadge(booking.payment_status)}</div>
                </div>
                {booking.payment_created_at && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian tạo payment</label>
                    <p className="text-gray-900">{formatDateTime(booking.payment_created_at)}</p>
                  </div>
                )}
              </div>
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tổng tiền phòng:</span>
                    <span className="text-gray-900">{formatPrice(booking.subtotal)} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Thuế:</span>
                    <span className="text-gray-900">{formatPrice(booking.tax_amount)} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Giảm giá:</span>
                    <span className="text-green-600">-{formatPrice(booking.discount_amount)} VNĐ</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                    <span className="text-gray-900">Tổng cộng:</span>
                    <span className="text-gray-900">{formatPrice(booking.total_amount)} VNĐ</span>
                  </div>
                  {booking.amount_due !== undefined && booking.amount_paid !== undefined && (
                    <>
                      <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                        <span className="text-gray-600">Đã thanh toán:</span>
                        <span className="text-green-600">{formatPrice(booking.amount_paid)} VNĐ</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Còn lại:</span>
                        <span className="text-orange-600">{formatPrice(booking.amount_due - booking.amount_paid)} VNĐ</span>
                  </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Status History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="text-orange-600" size={20} />
              Lịch sử thay đổi trạng thái
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thay đổi</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {booking.statusHistory.map((history, index) => (
                    <tr key={history.id || `history-${index}-${history.date}`}>
                      <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(history.date)}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{history.admin_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {history.old_status} → {history.new_status}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{history.note || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Special Requests */}
          {booking.special_requests && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-yellow-600" size={20} />
                Yêu cầu đặc biệt
              </h2>
              <p className="text-gray-700 whitespace-pre-wrap">{booking.special_requests}</p>
            </div>
          )}

          {/* Internal Notes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="text-red-600" size={20} />
                Ghi chú nội bộ
              </h2>
              <button
                onClick={() => setShowNoteModal(true)}
                className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
              >
                <Plus size={18} />
              </button>
            </div>
            <div className="space-y-3">
              {booking.internalNotes.length === 0 ? (
                <p className="text-gray-500 text-sm">Chưa có ghi chú nào</p>
              ) : (
                booking.internalNotes.map((note, index) => (
                  <div key={note.id || `note-${index}-${note.created_at}`} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{note.note}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDateTime(note.created_at)} - {note.admin_name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Edit Booking Modal */}
      {showEditModal && booking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa booking</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu đặc biệt</label>
                <textarea
                  value={editForm.specialRequests}
                  onChange={(e) => setEditForm({ ...editForm, specialRequests: e.target.value })}
                  placeholder="Nhập yêu cầu đặc biệt..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-in</label>
                  <input
                    type="date"
                    value={editForm.checkIn}
                    onChange={(e) => setEditForm({ ...editForm, checkIn: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Check-out</label>
                  <input
                    type="date"
                    value={editForm.checkOut}
                    onChange={(e) => setEditForm({ ...editForm, checkOut: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateBooking}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm ghi chú nội bộ</h3>
              <button onClick={() => setShowNoteModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none"
            />
            <div className="flex items-center gap-3 justify-end mt-4">
              <button
                onClick={() => setShowNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAddNote}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


export default BookingDetail;
