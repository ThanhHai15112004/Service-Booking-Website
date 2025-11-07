import { useState, useEffect } from "react";
import {
  X,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  Building,
  Bed,
  Users,
  DollarSign,
  Send,
  Printer,
  LogIn,
  LogOut,
  History,
  Edit,
  Save,
  AlertCircle,
} from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface BookingDetailModalProps {
  hotelId: string;
  bookingId: string;
  onClose: () => void;
  onStatusUpdate: () => void;
}

type TabType = "customer" | "hotel" | "payment" | "checkin" | "activity";

const BookingDetailModal = ({ hotelId, bookingId, onClose, onStatusUpdate }: BookingDetailModalProps) => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("customer");
  const [adminNote, setAdminNote] = useState<string>("");
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  useEffect(() => {
    fetchBookingDetail();
  }, [hotelId, bookingId]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelBookingDetail(hotelId, bookingId);
      if (response.success && response.data) {
        setBooking(response.data);
        setNewStatus(response.data.status);
        setAdminNote(response.data.admin_note || "");
      } else {
        showToast("error", response.message || "Không thể tải chi tiết booking");
        onClose();
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải chi tiết booking");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    // Kiểm tra nếu đang update thì không cho update lại
    if (updating) {
      return;
    }

    // Kiểm tra status có thay đổi không
    if (booking && booking.status === newStatus) {
      showToast("error", "Trạng thái không thay đổi. Booking hiện tại đã có trạng thái này.");
      return;
    }

    setUpdating(true);
    try {
      const response = await adminService.updateHotelBookingStatus(hotelId, bookingId, newStatus);
      if (response.success) {
        showToast("success", response.message || "Cập nhật trạng thái thành công");
        fetchBookingDetail();
        onStatusUpdate();
      } else {
        showToast("error", response.message || "Không thể cập nhật trạng thái");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể cập nhật trạng thái");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckin = async () => {
    setUpdating(true);
    try {
      const response = await adminService.checkInBooking(hotelId, bookingId);
      if (response.success) {
        showToast("success", response.message || "Check-in thành công");
        setShowCheckinModal(false);
        fetchBookingDetail();
        onStatusUpdate();
      } else {
        showToast("error", response.message || "Không thể check-in");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể check-in");
    } finally {
      setUpdating(false);
    }
  };

  const handleCheckout = async () => {
    setUpdating(true);
    try {
      const response = await adminService.checkOutBooking(hotelId, bookingId);
      if (response.success) {
        showToast("success", response.message || "Check-out thành công");
        setShowCheckoutModal(false);
        fetchBookingDetail();
        onStatusUpdate();
      } else {
        showToast("error", response.message || "Không thể check-out");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể check-out");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    // TODO: Implement print invoice
    showToast("success", "Đang tạo hóa đơn...");
  };

  const handleSendEmail = () => {
    // TODO: Implement send email
    showToast("success", "Đang gửi email xác nhận...");
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <Clock size={16} className="mr-1.5" />
            Đặt phòng
          </span>
        );
      case "PENDING_CONFIRMATION":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <Clock size={16} className="mr-1.5" />
            Chờ xác nhận
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
            <CheckCircle size={16} className="mr-1.5" />
            Đã xác nhận
          </span>
        );
      case "CHECKED_IN":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
            <CheckCircle size={16} className="mr-1.5" />
            Đã check-in
          </span>
        );
      case "CHECKED_OUT":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800 border border-purple-200">
            <CheckCircle size={16} className="mr-1.5" />
            Đã check-out
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            <CheckCircle size={16} className="mr-1.5" />
            Hoàn tất
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle size={16} className="mr-1.5" />
            Đã hủy
          </span>
        );
      case "PAID": // Legacy status
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <CreditCard size={16} className="mr-1.5" />
            Đã thanh toán (Legacy)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  // Timeline steps
  const getTimelineSteps = () => {
    const steps = [
      {
        id: "CREATED",
        label: "Đặt phòng",
        icon: Clock,
        color: "yellow",
        date: booking?.created_at,
      },
      {
        id: "PENDING_CONFIRMATION",
        label: "Chờ xác nhận",
        icon: Clock,
        color: "yellow",
        date: booking?.status === "PENDING_CONFIRMATION" ? booking?.updated_at : null,
      },
      {
        id: "CONFIRMED",
        label: "Xác nhận",
        icon: CheckCircle,
        color: "green",
        date: booking?.status === "CONFIRMED" ? booking?.updated_at : null,
      },
      {
        id: "CHECKED_IN",
        label: "Check-in",
        icon: LogIn,
        color: "blue",
        date: (booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
      },
      {
        id: "CHECKED_OUT",
        label: "Check-out",
        icon: LogOut,
        color: "purple",
        date: (booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
      },
      {
        id: "COMPLETED",
        label: "Hoàn tất",
        icon: CheckCircle,
        color: "gray",
        date: booking?.status === "COMPLETED" ? booking?.updated_at : null,
      },
    ];

    // Determine current step index based on booking status
    let currentStepIndex = -1;
    if (booking?.status === "CREATED" || booking?.status === "PENDING_CONFIRMATION") {
      currentStepIndex = steps.findIndex(step => step.id === booking.status) || 0;
    } else if (booking?.status === "CONFIRMED") {
      currentStepIndex = steps.findIndex(step => step.id === "CONFIRMED") || 1;
    } else if (booking?.status === "CHECKED_IN") {
      currentStepIndex = steps.findIndex(step => step.id === "CHECKED_IN") || 2;
    } else if (booking?.status === "CHECKED_OUT") {
      currentStepIndex = steps.findIndex(step => step.id === "CHECKED_OUT") || 3;
    } else if (booking?.status === "COMPLETED") {
      currentStepIndex = steps.findIndex(step => step.id === "COMPLETED") || 4;
    } else if (booking?.status === "CANCELLED") {
      currentStepIndex = -1; // Cancelled bookings don't show in timeline
    }

    return steps.map((step, index) => ({
      ...step,
      isActive: index <= currentStepIndex,
      isCurrent: index === currentStepIndex,
    }));
  };

  // Mock activity log (TODO: Get from API)
  const activityLog = [
    {
      id: "1",
      time: booking?.created_at || new Date().toISOString(),
      action: "Tạo booking",
      user: "Hệ thống",
      note: "-",
    },
    ...(booking?.status === "PENDING_CONFIRMATION"
      ? [
          {
            id: "2",
            time: booking?.updated_at || new Date().toISOString(),
            action: "Chờ xác nhận",
            user: "Hệ thống",
            note: "Đã thanh toán, chờ admin xác nhận",
          },
        ]
      : []),
    ...(booking?.status === "CONFIRMED" || booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED"
      ? [
          {
            id: "3",
            time: booking?.updated_at || new Date().toISOString(),
            action: "Đã xác nhận",
            user: "Admin",
            note: "Admin đã xác nhận booking",
          },
        ]
      : []),
    ...((booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED")
      ? [
          {
            id: "4",
            time: booking?.updated_at || new Date().toISOString(),
            action: "Check-in",
            user: "Lễ tân",
            note: "-",
          },
        ]
      : []),
    ...((booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED")
      ? [
          {
            id: "5",
            time: booking?.updated_at || new Date().toISOString(),
            action: "Check-out",
            user: "Lễ tân",
            note: "-",
          },
        ]
      : []),
  ];

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8">
          <Loading message="Đang tải chi tiết booking..." />
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {toast && <Toast type={toast.type} message={toast.message} />}

        {/* ========== A. HEADER ========== */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-5 z-20 shadow-lg">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold">Chi tiết Booking</h2>
                {getStatusBadge(booking.status)}
              </div>
              <div className="flex items-center gap-4 text-sm text-blue-100">
                <span className="font-semibold">Mã: {booking.booking_id}</span>
                <span>•</span>
                <span>Tạo: {formatDateTime(booking.created_at)}</span>
                <span>•</span>
                <span>Cập nhật: {formatDateTime(booking.updated_at)}</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 transition-colors p-2 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 flex-wrap">
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg text-white text-sm focus:ring-2 focus:ring-white/50 focus:outline-none"
            >
              <option value="CREATED" className="text-gray-900">Đặt phòng (CREATED)</option>
              <option value="PENDING_CONFIRMATION" className="text-gray-900">Chờ xác nhận (PENDING_CONFIRMATION)</option>
              <option value="CONFIRMED" className="text-gray-900">Đã xác nhận (CONFIRMED)</option>
              <option value="CHECKED_IN" className="text-gray-900">Đã check-in (CHECKED_IN)</option>
              <option value="CHECKED_OUT" className="text-gray-900">Đã check-out (CHECKED_OUT)</option>
              <option value="COMPLETED" className="text-gray-900">Hoàn tất (COMPLETED)</option>
              <option value="CANCELLED" className="text-gray-900">Đã hủy (CANCELLED)</option>
              <option value="PAID" className="text-gray-900">Đã thanh toán - Legacy (PAID)</option>
            </select>
            {newStatus !== booking.status && (
              <button
                onClick={handleStatusUpdate}
                disabled={updating}
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
              >
                {updating ? (
                  <>
                    <Clock size={16} className="animate-spin" />
                    Đang cập nhật...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Cập nhật trạng thái
                  </>
                )}
              </button>
            )}
            <button
              onClick={handlePrintInvoice}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Printer size={16} />
              In hóa đơn
            </button>
            <button
              onClick={handleSendEmail}
              className="px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white rounded-lg hover:bg-white/30 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Send size={16} />
              Gửi email xác nhận
            </button>
          </div>
        </div>

        {/* ========== B. TIMELINE ========== */}
        <div className="bg-white border-b border-gray-200 px-6 py-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình booking</h3>
          <div className="relative">
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.isActive;
                const isCurrent = step.isCurrent;
                const colorMap: Record<string, string> = {
                  yellow: isActive ? "bg-yellow-500" : "bg-gray-300",
                  green: isActive ? "bg-green-500" : "bg-gray-300",
                  blue: isActive ? "bg-blue-500" : "bg-gray-300",
                  purple: isActive ? "bg-purple-500" : "bg-gray-300",
                  gray: isActive ? "bg-gray-500" : "bg-gray-300",
                };

                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center relative">
                    {/* Connector Line */}
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`absolute top-5 left-[60%] w-full h-0.5 ${
                          isActive ? "bg-blue-500" : "bg-gray-300"
                        }`}
                        style={{ width: "calc(100% - 40px)" }}
                      />
                    )}

                    {/* Step Circle */}
                    <div
                      className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all ${
                        isCurrent
                          ? `${colorMap[step.color]} scale-110 ring-4 ring-blue-200`
                          : isActive
                          ? `${colorMap[step.color]}`
                          : "bg-gray-300"
                      }`}
                      title={step.date ? formatDateTime(step.date) : ""}
                    >
                      <Icon
                        size={20}
                        className={isActive ? "text-white" : "text-gray-500"}
                      />
                    </div>

                    {/* Step Label */}
                    <div className="mt-3 text-center">
                      <p
                        className={`text-xs font-medium ${
                          isCurrent ? "text-blue-600 font-semibold" : isActive ? "text-gray-700" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(step.date)}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ========== C. TABS ========== */}
        <div className="flex-1 overflow-y-auto">
          {/* Tab Navigation */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 z-10">
            <div className="flex -mb-px overflow-x-auto">
              {[
                { id: "customer" as TabType, label: "Khách hàng", icon: User },
                { id: "hotel" as TabType, label: "Khách sạn & Phòng", icon: Building },
                { id: "payment" as TabType, label: "Thanh toán", icon: CreditCard },
                { id: "checkin" as TabType, label: "Check-in/out", icon: Calendar },
                { id: "activity" as TabType, label: "Lịch sử", icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Tab 1: Customer Info */}
            {activeTab === "customer" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <User className="text-blue-600" size={20} />
                    Thông tin khách hàng
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-start gap-4">
                      {booking.account_avatar ? (
                        <img
                          src={booking.account_avatar}
                          alt={booking.account_name}
                          className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                          <User className="text-white" size={32} />
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-gray-900">{booking.account_name}</p>
                        <p className="text-sm text-gray-500 mt-1">ID: {booking.account_id}</p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              booking.account_status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : booking.account_status === "BANNED"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {booking.account_status === "ACTIVE"
                              ? "Hoạt động"
                              : booking.account_status === "BANNED"
                              ? "Bị khóa"
                              : "Chờ xác nhận"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Mail className="text-gray-400" size={18} />
                        <span className="text-gray-700">{booking.account_email}</span>
                      </div>
                      {booking.account_phone && (
                        <div className="flex items-center gap-3 text-sm">
                          <Phone className="text-gray-400" size={18} />
                          <span className="text-gray-700">{booking.account_phone}</span>
                        </div>
                      )}
                      <button className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mt-4">
                        <History size={16} />
                        Xem lịch sử booking gần đây
                      </button>
                    </div>
                  </div>
                </div>

                {/* Admin Note */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Edit className="text-blue-600" size={20} />
                    Ghi chú của admin
                  </h3>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Thêm ghi chú về khách hàng (ví dụ: khách VIP, hay đến muộn, yêu cầu đặc biệt)..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={4}
                  />
                  <button
                    onClick={() => {
                      // TODO: Implement save admin note API
                      showToast("success", "Tính năng lưu ghi chú sẽ được triển khai trong tương lai");
                    }}
                    disabled={updating}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium flex items-center gap-2 transition-colors"
                  >
                    <Save size={16} />
                    Lưu ghi chú
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Hotel & Room Info */}
            {activeTab === "hotel" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Building className="text-blue-600" size={20} />
                    Thông tin khách sạn
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{booking.hotel_name}</p>
                      <p className="text-sm text-gray-600 mt-2 flex items-start gap-2">
                        <MapPin className="text-gray-400 mt-0.5" size={16} />
                        {booking.hotel_address}
                      </p>
                    </div>
                    <div className="space-y-2">
                      {booking.hotel_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="text-gray-400" size={16} />
                          Hotline: {booking.hotel_phone}
                        </div>
                      )}
                      {booking.hotel_email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="text-gray-400" size={16} />
                          {booking.hotel_email}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bed className="text-blue-600" size={20} />
                    Thông tin phòng ({booking.booking_details?.length || 0} phòng)
                  </h3>
                  <div className="space-y-4">
                    {booking.booking_details?.map((detail: any, index: number) => (
                      <div
                        key={detail.booking_detail_id}
                        className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                                Phòng {index + 1}
                              </span>
                              <span className="text-lg font-semibold text-gray-900">{detail.room_type_name}</span>
                            </div>
                            {detail.room_number && (
                              <p className="text-sm text-gray-600">Số phòng: {detail.room_number}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-blue-600">{formatCurrency(detail.total_price)}</p>
                            <p className="text-xs text-gray-500">{formatCurrency(detail.price_per_night)}/đêm</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Check-in</p>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(detail.checkin_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Check-out</p>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <Calendar size={14} />
                              {formatDate(detail.checkout_date)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Số đêm</p>
                            <p className="text-sm font-semibold text-gray-900">{detail.nights_count} đêm</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Số khách</p>
                            <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                              <Users size={14} />
                              {detail.guests_count} người
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Special Requests */}
                {booking.special_requests && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <AlertCircle className="text-yellow-600" size={20} />
                      Yêu cầu đặc biệt
                    </h3>
                    <p className="text-gray-700">{booking.special_requests}</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Payment */}
            {activeTab === "payment" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="text-blue-600" size={20} />
                    Thông tin thanh toán
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {booking.payment_method === "VNPAY"
                          ? "VNPay"
                          : booking.payment_method === "MOMO"
                          ? "MoMo"
                          : booking.payment_method === "CASH"
                          ? "Tiền mặt"
                          : booking.payment_method === "BANK_TRANSFER"
                          ? "Chuyển khoản"
                          : booking.payment_method || "Chưa chọn"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Trạng thái thanh toán</p>
                      <span
                        className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                          booking.payment_status === "SUCCESS"
                            ? "bg-green-100 text-green-800 border border-green-200"
                            : booking.payment_status === "PENDING"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                        }`}
                      >
                        {booking.payment_status === "SUCCESS"
                          ? "Đã thanh toán"
                          : booking.payment_status === "PENDING"
                          ? "Chờ thanh toán"
                          : "Thất bại"}
                      </span>
                      {booking.payment_created_at && (
                        <p className="text-xs text-gray-500 mt-2">
                          Ngày thanh toán: {formatDateTime(booking.payment_created_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="text-blue-600" size={20} />
                    Chi tiết giá
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tổng phụ</span>
                      <span className="font-medium text-gray-900">{formatCurrency(booking.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Thuế (10%)</span>
                      <span className="font-medium text-gray-900">{formatCurrency(booking.tax_amount)}</span>
                    </div>
                    {booking.discount_amount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Giảm giá</span>
                        <span className="font-medium text-green-600">-{formatCurrency(booking.discount_amount)}</span>
                      </div>
                    )}
                    {booking.discount_code && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Mã giảm giá</span>
                        <span className="font-medium text-gray-900">{booking.discount_code.code}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(booking.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => {
                        // TODO: Implement confirm payment
                        showToast("success", "Xác nhận thanh toán thành công");
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <CheckCircle size={16} />
                      Xác nhận thanh toán
                    </button>
                    <button
                      onClick={handlePrintInvoice}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Printer size={16} />
                      In hóa đơn PDF
                    </button>
                    <button
                      onClick={handleSendEmail}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Send size={16} />
                      Gửi biên lai cho khách
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 4: Check-in/Check-out */}
            {activeTab === "checkin" && (
              <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Calendar className="text-blue-600" size={20} />
                    Trạng thái Check-in / Check-out
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Check-in Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <LogIn className="text-blue-600" size={18} />
                        Check-in
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giờ Check-in dự kiến</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.booking_details?.[0]?.checkin_date
                              ? `${formatDate(booking.booking_details[0].checkin_date)} 14:00`
                              : "N/A"}
                          </p>
                        </div>
                        {(booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Giờ Check-in thực tế</p>
                            <p className="text-sm font-semibold text-green-600">{formatDateTime(booking?.updated_at || "")}</p>
                          </div>
                        ) : (
                          <div className="pt-3">
                            <button
                              onClick={() => setShowCheckinModal(true)}
                              disabled={booking?.status !== "CONFIRMED"}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <LogIn size={16} />
                              {booking?.status === "CONFIRMED" ? "Check-in" : `Check-in (Cần xác nhận booking trước)`}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Check-out Info */}
                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <LogOut className="text-purple-600" size={18} />
                        Check-out
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giờ Check-out dự kiến</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {booking.booking_details?.[0]?.checkout_date
                              ? `${formatDate(booking.booking_details[0].checkout_date)} 12:00`
                              : "N/A"}
                          </p>
                        </div>
                        {(booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? (
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Giờ Check-out thực tế</p>
                            <p className="text-sm font-semibold text-green-600">{formatDateTime(booking?.updated_at || "")}</p>
                          </div>
                        ) : (
                          <div className="pt-3">
                            <button
                              onClick={() => setShowCheckoutModal(true)}
                              disabled={booking?.status !== "CHECKED_IN"}
                              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <LogOut size={16} />
                              Check-out
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                  <div className="flex flex-wrap gap-3">
                    {booking?.status !== "CHECKED_IN" && booking?.status !== "CHECKED_OUT" && booking?.status !== "COMPLETED" && (
                      <button
                        onClick={() => setShowCheckinModal(true)}
                        disabled={booking?.status !== "CONFIRMED"}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2 transition-colors"
                        title={booking?.status !== "CONFIRMED" ? "Cần xác nhận booking (CONFIRMED) trước khi check-in" : ""}
                      >
                        <LogIn size={16} />
                        {booking?.status === "CONFIRMED" ? "Check-in" : `Check-in (Chỉ khi CONFIRMED)`}
                      </button>
                    )}
                    {booking?.status === "CHECKED_IN" && (
                      <button
                        onClick={() => setShowCheckoutModal(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <LogOut size={16} />
                        Check-out
                      </button>
                    )}
                    <button
                      onClick={() => {
                        if (confirm("Bạn có chắc chắn muốn hủy booking này?")) {
                          handleStatusUpdate();
                          setNewStatus("CANCELLED");
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <XCircle size={16} />
                      Hủy booking
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Activity Log */}
            {activeTab === "activity" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <History className="text-blue-600" size={20} />
                  Lịch sử thay đổi
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hành động
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người thực hiện
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {activityLog.map((log) => (
                        <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {formatDateTime(log.time)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{log.user}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{log.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận Check-in</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn check-in cho booking này? Thời gian check-in sẽ được ghi nhận tự động.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCheckinModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckin}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updating ? "Đang xử lý..." : "Xác nhận Check-in"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Check-out Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận Check-out</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn check-out cho booking này? Thời gian check-out sẽ được ghi nhận tự động.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCheckoutModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleCheckout}
                disabled={updating}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {updating ? "Đang xử lý..." : "Xác nhận Check-out"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingDetailModal;
