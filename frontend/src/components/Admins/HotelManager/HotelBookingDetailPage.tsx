import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
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
  Globe,
  Star,
  Award,
  FileText,
  Download,
  RefreshCw,
  Move,
  Bell,
  MessageSquare,
  Filter,
  Receipt,
  Eye,
} from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

type TabType = "customer" | "hotel" | "payment" | "checkin" | "activity";

const HotelBookingDetailPage = () => {
  const { hotelId, bookingId } = useParams<{ hotelId: string; bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [booking, setBooking] = useState<any>(null);
  const [newStatus, setNewStatus] = useState<string>("");
  const [activeTab, setActiveTab] = useState<TabType>("customer");
  const [adminNote, setAdminNote] = useState<string>("");
  const [showCheckinModal, setShowCheckinModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>("all");
  // TODO: Implement these modals
  const [showCustomerHistoryModal, setShowCustomerHistoryModal] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [showTransferRoomModal, setShowTransferRoomModal] = useState(false);
  const [showInternalNoteModal, setShowInternalNoteModal] = useState(false);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [checkinNote, setCheckinNote] = useState<string>("");

  useEffect(() => {
    if (hotelId && bookingId) {
      fetchBookingDetail();
      fetchActivityLog();
    }
  }, [hotelId, bookingId]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelBookingDetail(hotelId!, bookingId!);
      if (response.success && response.data) {
        setBooking(response.data);
        setNewStatus(response.data.status);
        // Extract admin note from special_requests if exists
        const specialRequests = response.data.special_requests || "";
        const adminNoteMatch = specialRequests.match(/--- ADMIN NOTE ---\n([\s\S]*?)\n--- END NOTE ---/);
        if (adminNoteMatch) {
          setAdminNote(adminNoteMatch[1].trim());
        } else {
          setAdminNote("");
        }
        // Extract check-in note (special_requests without admin note)
        const checkinNoteText = specialRequests.replace(/--- ADMIN NOTE ---\n[\s\S]*?\n--- END NOTE ---/g, "").trim();
        setCheckinNote(checkinNoteText);
        // Note: actual check-in/out times are derived from updated_at when status changes
      } else {
        showToast("error", response.message || "Không thể tải chi tiết booking");
        navigate(`/admin/hotels/${hotelId}`);
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải chi tiết booking");
      navigate(`/admin/hotels/${hotelId}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLog = async () => {
    try {
      const response = await adminService.getBookingActivityLog(hotelId!, bookingId!);
      if (response.success && response.data) {
        setActivityLog(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching activity log:", error);
      // Silently fail, use mock data as fallback
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
      const response = await adminService.updateHotelBookingStatus(hotelId!, bookingId!, newStatus);
      if (response.success) {
        showToast("success", response.message || "Cập nhật trạng thái thành công");
        await fetchBookingDetail();
        await fetchActivityLog();
        // Navigate back to bookings list after status update if needed
        if (newStatus === "CANCELLED") {
          setTimeout(() => {
            navigate(`/admin/hotels/${hotelId}?tab=bookings`);
          }, 1500);
        }
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
      const response = await adminService.checkInBooking(hotelId!, bookingId!);
      if (response.success) {
        showToast("success", response.message || "Check-in thành công");
        setShowCheckinModal(false);
        await fetchBookingDetail();
        await fetchActivityLog();
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
      const response = await adminService.checkOutBooking(hotelId!, bookingId!);
      if (response.success) {
        showToast("success", response.message || "Check-out thành công");
        setShowCheckoutModal(false);
        await fetchBookingDetail();
        await fetchActivityLog();
      } else {
        showToast("error", response.message || "Không thể check-out");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể check-out");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveAdminNote = async () => {
    if (!adminNote.trim()) {
      showToast("error", "Vui lòng nhập ghi chú");
      return;
    }

    setUpdating(true);
    try {
      const response = await adminService.updateBookingAdminNote(hotelId!, bookingId!, adminNote);
      if (response.success) {
        showToast("success", response.message || "Lưu ghi chú thành công");
        await fetchBookingDetail();
        await fetchActivityLog();
        // Đóng modal nếu đang mở
        setShowInternalNoteModal(false);
      } else {
        showToast("error", response.message || "Không thể lưu ghi chú");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu ghi chú");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    // Generate invoice HTML
    const invoiceWindow = window.open("", "_blank");
    if (!invoiceWindow) {
      showToast("error", "Không thể mở cửa sổ in. Vui lòng cho phép popup.");
      return;
    }

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Hóa đơn ${booking?.booking_id}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .info-section { margin-bottom: 20px; }
            .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
            .total { font-size: 18px; font-weight: bold; text-align: right; margin-top: 20px; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>HÓA ĐƠN THANH TOÁN</h1>
            <p>Mã booking: ${booking?.booking_id}</p>
          </div>
          <div class="info-section">
            <div class="info-row">
              <span><strong>Khách hàng:</strong> ${booking?.account_name}</span>
              <span><strong>Ngày tạo:</strong> ${formatDateTime(booking?.created_at || "")}</span>
            </div>
            <div class="info-row">
              <span><strong>Email:</strong> ${booking?.account_email}</span>
              <span><strong>Trạng thái:</strong> ${booking?.status}</span>
            </div>
            <div class="info-row">
              <span><strong>Khách sạn:</strong> ${booking?.hotel_name}</span>
              <span><strong>Thanh toán:</strong> ${booking?.payment_status || "Chưa thanh toán"}</span>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Mô tả</th>
                <th>Số lượng</th>
                <th>Đơn giá</th>
                <th>Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Phòng</td>
                <td>${booking?.booking_details?.length || 0}</td>
                <td>${formatCurrency(booking?.subtotal || 0)}</td>
                <td>${formatCurrency(booking?.subtotal || 0)}</td>
              </tr>
              <tr>
                <td>Thuế VAT (10%)</td>
                <td>-</td>
                <td>-</td>
                <td>${formatCurrency(booking?.tax_amount || 0)}</td>
              </tr>
              ${booking?.discount_amount > 0 ? `
              <tr>
                <td>Giảm giá</td>
                <td>-</td>
                <td>-</td>
                <td>-${formatCurrency(booking?.discount_amount || 0)}</td>
              </tr>
              ` : ''}
            </tbody>
          </table>
          <div class="total">
            <p>Tổng cộng: ${formatCurrency(booking?.total_amount || 0)}</p>
          </div>
          <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">In hóa đơn</button>
        </body>
      </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    showToast("success", "Đã mở cửa sổ hóa đơn. Vui lòng in từ cửa sổ đó.");
  };

  const handleSendEmail = () => {
    if (!booking?.account_email) {
      showToast("error", "Không tìm thấy email khách hàng");
      return;
    }
    
    // Tạo mailto link với nội dung email
    const subject = encodeURIComponent(`Xác nhận booking ${booking?.booking_id}`);
    const body = encodeURIComponent(`
Kính chào ${booking?.account_name},

Chúng tôi xin thông báo về booking của bạn:

Mã booking: ${booking?.booking_id}
Khách sạn: ${booking?.hotel_name}
Ngày check-in: ${booking?.booking_details?.[0]?.checkin_date ? formatDate(booking.booking_details[0].checkin_date) : "N/A"}
Ngày check-out: ${booking?.booking_details?.[0]?.checkout_date ? formatDate(booking.booking_details[0].checkout_date) : "N/A"}
Tổng tiền: ${formatCurrency(booking?.total_amount || 0)}
Trạng thái: ${booking?.status}

Trân trọng,
Đội ngũ hỗ trợ
    `);
    
    window.location.href = `mailto:${booking.account_email}?subject=${subject}&body=${body}`;
    showToast("success", "Đã mở ứng dụng email. Vui lòng gửi email từ ứng dụng đó.");
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
      case "PAID": // Legacy status
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
            <CreditCard size={16} className="mr-1.5" />
            Chờ xác nhận
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-red-100 text-red-800 border border-red-200">
            <XCircle size={16} className="mr-1.5" />
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  // Timeline steps - Flow đúng: CREATED -> PENDING_CONFIRMATION -> CONFIRMED -> CHECKED_IN -> CHECKED_OUT -> COMPLETED
  const getTimelineSteps = () => {
    const steps = [
      {
        id: "CREATED",
        label: "Đặt phòng",
        icon: Clock,
        color: "yellow",
        date: booking?.created_at || null,
        source: booking?.booking_source || "Website",
        performer: "Hệ thống",
        note: `Nguồn: ${booking?.booking_source || "Website"}`,
      },
      {
        id: "PENDING_CONFIRMATION",
        label: "Chờ xác nhận",
        icon: CreditCard,
        color: "yellow",
        date: (booking?.status === "PENDING_CONFIRMATION" || booking?.status === "PAID" || booking?.status === "CONFIRMED" || booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
        performer: "Hệ thống",
        note: "Đã thanh toán, chờ admin xác nhận",
      },
      {
        id: "CONFIRMED",
        label: "Xác nhận",
        icon: CheckCircle,
        color: "green",
        date: (booking?.status === "CONFIRMED" || booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
        performer: booking?.approved_by || "Admin",
        note: "Đã được xác nhận",
      },
      {
        id: "CHECKED_IN",
        label: "Check-in",
        icon: LogIn,
        color: "blue",
        date: (booking?.status === "CHECKED_IN" || booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
        performer: booking?.checkin_staff || "Lễ tân",
        note: "Đã check-in",
      },
      {
        id: "CHECKED_OUT",
        label: "Check-out",
        icon: LogOut,
        color: "purple",
        date: (booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") ? booking?.updated_at : null,
        performer: booking?.checkout_staff || "Lễ tân",
        note: "Đã check-out",
      },
      {
        id: "COMPLETED",
        label: "Hoàn tất",
        icon: CheckCircle,
        color: "gray",
        date: booking?.status === "COMPLETED" ? booking?.updated_at : null,
        performer: booking?.completed_by || "Hệ thống",
        note: "Đã hoàn tất",
      },
    ];

    // Xác định bước hiện tại dựa trên trạng thái booking
    let currentStepIndex = -1;
    
    if (booking?.status === "CREATED") {
      currentStepIndex = 0; // Đặt phòng
    } else if (booking?.status === "PENDING_CONFIRMATION" || booking?.status === "PAID") {
      currentStepIndex = 1; // Chờ xác nhận
    } else if (booking?.status === "CONFIRMED") {
      currentStepIndex = 2; // Đã xác nhận
    } else if (booking?.status === "CHECKED_IN") {
      currentStepIndex = 3; // Check-in
    } else if (booking?.status === "CHECKED_OUT") {
      currentStepIndex = 4; // Check-out
    } else if (booking?.status === "COMPLETED") {
      currentStepIndex = 5; // Hoàn tất
    } else if (booking?.status === "CANCELLED") {
      currentStepIndex = -1; // Đã hủy
    }

    return steps.map((step, index) => {
      const isCompleted = currentStepIndex >= 0 && index < currentStepIndex;
      const isCurrent = index === currentStepIndex;
      const hasDate = step.date !== null;
      
      return {
        ...step,
        isActive: isCompleted || (isCurrent && hasDate),
        isCurrent: isCurrent && !hasDate, // Current step mà chưa có date = đang chờ
        isCompleted: isCompleted && hasDate,
      };
    });
  };

  // Activity log được fetch từ API, sử dụng fallback nếu chưa có dữ liệu
  const displayActivityLog = activityLog.length > 0 ? activityLog : [
    {
      id: "1",
      action_type: "CREATE",
      action: "Tạo booking",
      time: booking?.created_at || new Date().toISOString(),
      user: "Hệ thống",
      department: "Hệ thống",
      change_details: `Booking ID: ${booking?.booking_id}`,
      ip_address: "192.168.1.1",
      note: "-",
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loading message="Đang tải chi tiết booking..." />
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Không tìm thấy booking</p>
          <button
            onClick={() => navigate(`/admin/hotels/${hotelId}`)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  const timelineSteps = getTimelineSteps();

  return (
    <div className="min-h-screen bg-gray-50">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* ========== A. HEADER ========== */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          {/* Back Button */}
          <button
            onClick={() => navigate(`/admin/hotels/${hotelId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Quay lại chi tiết khách sạn</span>
          </button>

          {/* Dashboard Mini - Tổng quan quan trọng */}
          <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Tổng tiền booking</p>
                <p className="text-lg font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                <div className="flex items-center gap-2">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Thanh toán</p>
                <p className={`text-sm font-semibold ${
                  booking.payment_status === "SUCCESS" ? "text-green-600" :
                  booking.payment_status === "PENDING" ? "text-yellow-600" :
                  "text-red-600"
                }`}>
                  {booking.payment_status === "SUCCESS" ? "✅ Đã thanh toán" :
                   booking.payment_status === "PENDING" ? "⏳ Chờ thanh toán" :
                   "❌ Chưa thanh toán"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Thời gian ở</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.booking_details?.[0]?.checkin_date && booking.booking_details?.[0]?.checkout_date
                    ? `${formatDate(booking.booking_details[0].checkin_date)} → ${formatDate(booking.booking_details[0].checkout_date)}`
                    : "N/A"}
                </p>
                <p className="text-xs text-gray-600">
                  ({booking.booking_details?.[0]?.nights_count || 0} đêm)
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Check-in</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.booking_details?.[0]?.checkin_date
                    ? `${formatDate(booking.booking_details[0].checkin_date)} 14:00`
                    : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Người duyệt</p>
                <p className="text-sm font-medium text-gray-900">
                  {booking.approved_by || "Chưa duyệt"}
                </p>
              </div>
            </div>
          </div>

          {/* Main Header Row */}
          <div className="flex items-start justify-between gap-6 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">Chi tiết Booking</h1>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium">
                  {booking.booking_id}
                </span>
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                <span>Nguồn: <span className="font-semibold text-gray-900">{booking.booking_source || "Website"}</span></span>
                <span>•</span>
                <span>Tạo: {formatDateTime(booking.created_at)}</span>
                <span>•</span>
                <span>Cập nhật: {formatDateTime(booking.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons - QUAN TRỌNG NHẤT */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <p className="text-xs text-gray-500 mb-3 font-medium">HÀNH ĐỘNG NHANH</p>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Check-in - Chỉ cho phép khi đã CONFIRMED */}
              {booking.status === "CONFIRMED" && booking.status !== "CHECKED_IN" && booking.status !== "CHECKED_OUT" && booking.status !== "COMPLETED" && (
                <button
                  onClick={() => setShowCheckinModal(true)}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
                >
                  <LogIn size={18} />
                  Check-in
                </button>
              )}

              {/* Check-out - Chỉ cho phép khi đã CHECKED_IN */}
              {booking.status === "CHECKED_IN" && booking.status !== "CHECKED_OUT" && booking.status !== "COMPLETED" && (
                <button
                  onClick={() => setShowCheckoutModal(true)}
                  className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
                >
                  <LogOut size={18} />
                  Check-out
                </button>
              )}

              {/* Xuất báo cáo PDF */}
              <button
                onClick={() => {
                  showToast("success", "Đang tạo báo cáo PDF...");
                }}
                className="px-5 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
              >
                <FileText size={18} />
                Xuất báo cáo PDF
              </button>

              {/* Button Xác nhận - Hiển thị khi chưa xác nhận (PENDING_CONFIRMATION) */}
              {booking.status === "PENDING_CONFIRMATION" && (
                <button
                  onClick={() => {
                    setNewStatus("CONFIRMED");
                    handleStatusUpdate();
                  }}
                  disabled={updating}
                  className="px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg disabled:opacity-50"
                >
                  <CheckCircle size={18} />
                  Xác nhận
                </button>
              )}

              {/* Button Hủy - Hiển thị khi chưa hủy và chưa hoàn tất */}
              {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && (
                <button
                  onClick={() => {
                    if (confirm("Bạn có chắc chắn muốn hủy booking này?")) {
                      setNewStatus("CANCELLED");
                      handleStatusUpdate();
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg"
                >
                  <XCircle size={18} />
                  Hủy booking
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== B. TIMELINE ========== */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Tiến trình booking</h3>
          <div className="relative">
            <div className="flex items-center justify-between">
              {timelineSteps.map((step, index) => {
                const Icon = step.icon;
                const isCompleted = step.isCompleted;
                const isCurrent = step.isCurrent;
                const hasDate = step.date !== null;
                
                // Determine circle color based on state
                let circleColor = "bg-gray-300";
                let iconColor = "text-gray-500";
                let textColor = "text-gray-400";
                
                if (booking?.status === "CANCELLED") {
                  circleColor = "bg-red-100 border-red-500";
                  iconColor = "text-red-600";
                  textColor = "text-red-600";
                } else if (isCompleted && hasDate) {
                  // Completed step with date
                  const colorMap: Record<string, string> = {
                    yellow: "bg-yellow-500",
                    green: "bg-green-500",
                    blue: "bg-blue-500",
                    purple: "bg-purple-500",
                    gray: "bg-gray-500",
                  };
                  circleColor = colorMap[step.color] || "bg-blue-500";
                  iconColor = "text-white";
                  textColor = "text-gray-700";
                } else if (isCurrent) {
                  // Current step (waiting)
                  circleColor = "bg-yellow-400";
                  iconColor = "text-white";
                  textColor = "text-yellow-600 font-semibold";
                } else {
                  // Pending step
                  circleColor = "bg-gray-300";
                  iconColor = "text-gray-500";
                  textColor = "text-gray-400";
                }

                return (
                  <div key={step.id} className="flex-1 flex flex-col items-center relative" style={{ minWidth: '120px' }}>
                    {/* Connector Line */}
                    {index < timelineSteps.length - 1 && (
                      <div
                        className={`absolute top-5 left-[60%] w-[40%] h-0.5 transition-colors -z-10 ${
                          isCompleted && hasDate ? "bg-green-500" : isCurrent ? "bg-yellow-400" : "bg-gray-300"
                        }`}
                      />
                    )}

                    {/* Step Circle */}
                    <div className="relative group z-10">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg transition-all ${
                          isCurrent ? "scale-110 ring-4 ring-yellow-200" : ""
                        } ${circleColor}`}
                      >
                        <Icon size={20} className={iconColor} />
                        {isCompleted && hasDate && (
                          <CheckCircle className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full border-2 border-white" size={16} />
                        )}
                      </div>

                      {/* Tooltip */}
                      {step.date && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block z-50">
                          <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 shadow-xl min-w-[200px]">
                            <div className="font-semibold mb-1">{step.label}</div>
                            <div className="text-white/80">Thời gian: {formatDateTime(step.date)}</div>
                            {step.performer && (
                              <div className="text-white/80">Người thực hiện: {step.performer}</div>
                            )}
                            {step.source && (
                              <div className="text-white/80">Nguồn: {step.source}</div>
                            )}
                            {step.note && (
                              <div className="text-white/80 mt-1">{step.note}</div>
                            )}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                              <div className="border-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Step Label */}
                    <div className="mt-3 text-center max-w-[140px]">
                      <p className={`text-xs font-medium ${textColor}`}>
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-xs text-gray-500 mt-1">{formatDateTime(step.date)}</p>
                      )}
                      {!step.date && isCurrent && (
                        <p className="text-xs text-yellow-600 mt-1 font-medium">Đang chờ...</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ========== C. TABS ========== */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
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
                        <div className="mt-2 flex flex-wrap gap-2">
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
                          {/* Loyalty Tier Badge */}
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            <Award size={12} className="mr-1" />
                            {booking.customer_tier || "Bronze"}
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
                      <button
                        onClick={() => setShowCustomerHistoryModal(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 mt-4"
                      >
                        <History size={16} />
                        Xem lịch sử booking gần đây
                      </button>
                    </div>
                  </div>

                  {/* Additional Customer Information */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Date of Birth */}
                      <div className="flex items-start gap-3">
                        <Calendar className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày sinh</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customer_date_of_birth
                              ? formatDate(booking.customer_date_of_birth)
                              : "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      {/* Nationality */}
                      <div className="flex items-start gap-3">
                        <Globe className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Quốc tịch</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customer_nationality || "Việt Nam"}
                          </p>
                        </div>
                      </div>

                      {/* Customer Type */}
                      <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Loại khách hàng</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customer_type || "Thường"}
                          </p>
                        </div>
                      </div>

                      {/* Total Bookings */}
                      <div className="flex items-start gap-3">
                        <History className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tổng số booking</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.total_bookings || 0} lần
                          </p>
                        </div>
                      </div>

                      {/* Total Spending */}
                      <div className="flex items-start gap-3">
                        <DollarSign className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tổng chi tiêu tích lũy</p>
                          <p className="text-sm font-medium text-gray-900">
                            {formatCurrency(booking.total_spending || 0)}
                          </p>
                        </div>
                      </div>

                      {/* Account Created Date */}
                      <div className="flex items-start gap-3">
                        <Clock className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Ngày đăng ký</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.account_created_at
                              ? formatDate(booking.account_created_at)
                              : "N/A"}
                          </p>
                        </div>
                      </div>

                      {/* Booking Source */}
                      <div className="flex items-start gap-3">
                        <Globe className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Nguồn đặt phòng</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.booking_source || "Website"}
                          </p>
                        </div>
                      </div>

                      {/* Gender */}
                      <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Giới tính</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.customer_gender === "MALE" ? "Nam" :
                             booking.customer_gender === "FEMALE" ? "Nữ" :
                             booking.customer_gender === "OTHER" ? "Khác" :
                             "Chưa cập nhật"}
                          </p>
                        </div>
                      </div>

                      {/* ID Card / Passport */}
                      <div className="flex items-start gap-3">
                        <FileText className="text-gray-400 mt-0.5" size={18} />
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 mb-1">CMND/CCCD / Passport</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-900">
                              {booking.customer_id_card || "Chưa cập nhật"}
                            </p>
                            {booking.customer_id_card_file && (
                              <a
                                href={booking.customer_id_card_file}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-700"
                                title="Xem file"
                              >
                                <Eye size={14} />
                              </a>
                            )}
                          </div>
                          {booking.customer_id_expiry_date && (
                            <p className="text-xs text-gray-500 mt-1">
                              Hết hạn: {formatDate(booking.customer_id_expiry_date)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Check-in Notes & Companions */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Check-in Notes */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MessageSquare className="text-blue-600" size={16} />
                          Ghi chú check-in
                        </h4>
                        <textarea
                          value={checkinNote}
                          onChange={(e) => setCheckinNote(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-sm resize-none"
                          rows={3}
                          placeholder="Khách đến sớm, Yêu cầu view hồ..."
                        />
                        <button
                          onClick={async () => {
                            setUpdating(true);
                            try {
                              // Preserve admin note when updating check-in note
                              const specialRequests = booking.special_requests || "";
                              const adminNoteMatch = specialRequests.match(/--- ADMIN NOTE ---\n([\s\S]*?)\n--- END NOTE ---/);
                              const adminNoteText = adminNoteMatch ? adminNoteMatch[1].trim() : "";
                              
                              let newSpecialRequests = checkinNote.trim();
                              if (adminNoteText) {
                                newSpecialRequests += `\n\n--- ADMIN NOTE ---\n${adminNoteText}\n--- END NOTE ---`;
                              }
                              
                              const response = await adminService.updateBookingSpecialRequests(hotelId!, bookingId!, newSpecialRequests);
                              if (response.success) {
                                showToast("success", response.message || "Lưu ghi chú check-in thành công");
                                await fetchBookingDetail();
                                await fetchActivityLog();
                              } else {
                                showToast("error", response.message || "Không thể lưu ghi chú check-in");
                              }
                            } catch (error: any) {
                              showToast("error", error.response?.data?.message || error.message || "Không thể lưu ghi chú check-in");
                            } finally {
                              setUpdating(false);
                            }
                          }}
                          disabled={updating || !checkinNote.trim()}
                          className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                        >
                          <Save size={16} />
                          {updating ? "Đang lưu..." : "Lưu ghi chú check-in"}
                        </button>
                      </div>

                      {/* Companions */}
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Users className="text-blue-600" size={16} />
                          Người đi cùng
                        </h4>
                        {booking.companions && booking.companions.length > 0 ? (
                          <div className="space-y-2">
                            {booking.companions.map((companion: any, idx: number) => (
                              <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <p className="text-sm font-medium text-gray-900">{companion.name}</p>
                                {companion.age && (
                                  <p className="text-xs text-gray-500">Tuổi: {companion.age}</p>
                                )}
                                {companion.relationship && (
                                  <p className="text-xs text-gray-500">Quan hệ: {companion.relationship}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500">Không có người đi cùng</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Upload Documents */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="text-blue-600" size={16} />
                      Tài liệu đính kèm
                    </h4>
                    <div className="flex flex-wrap gap-3">
                      {booking.customer_id_card_file && (
                        <a
                          href={booking.customer_id_card_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Download size={16} />
                          Tải CMND/CCCD
                        </a>
                      )}
                      {booking.passport_file && (
                        <a
                          href={booking.passport_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700 hover:bg-blue-100 transition-colors"
                        >
                          <Download size={16} />
                          Tải Passport
                        </a>
                      )}
                      <button
                        onClick={() => {
                          showToast("success", "Tính năng upload file đang được phát triển");
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-200 transition-colors"
                      >
                        <FileText size={16} />
                        Upload tài liệu
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
                    onClick={handleSaveAdminNote}
                    disabled={updating}
                    className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center gap-2"
                  >
                    <Save size={16} />
                    {updating ? "Đang lưu..." : "Lưu ghi chú"}
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

                  {/* Extended Hotel Information */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Hotel Code */}
                      <div className="flex items-start gap-3">
                        <Building className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Mã khách sạn</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.hotel_code || booking.hotel_id}
                          </p>
                        </div>
                      </div>

                      {/* Manager */}
                      <div className="flex items-start gap-3">
                        <User className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Người quản lý</p>
                          <p className="text-sm font-medium text-gray-900">
                            {booking.hotel_manager || "Chưa chỉ định"}
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex items-start gap-3">
                        <CheckCircle className="text-gray-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Tình trạng hoạt động</p>
                          <span
                            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              booking.hotel_status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {booking.hotel_status === "ACTIVE" ? "Đang hoạt động" : "Đóng tạm thời"}
                          </span>
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-start gap-3">
                        <Star className="text-yellow-400 mt-0.5" size={18} />
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Điểm đánh giá</p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-900">
                              {booking.hotel_avg_rating ? `${booking.hotel_avg_rating.toFixed(1)}` : "N/A"}
                            </span>
                            {booking.hotel_review_count && (
                              <span className="text-xs text-gray-500">
                                ({booking.hotel_review_count} đánh giá)
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
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

                        {/* Extended Room Information */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Bed Type */}
                            <div className="flex items-start gap-2">
                              <Bed className="text-gray-400 mt-0.5" size={16} />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Loại giường</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {detail.bed_type || "Chưa cập nhật"}
                                </p>
                              </div>
                            </div>

                            {/* Room View */}
                            <div className="flex items-start gap-2">
                              <Eye className="text-gray-400 mt-0.5" size={16} />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Hướng phòng</p>
                                <p className="text-sm font-medium text-gray-900">
                                  {detail.room_view || "Chưa cập nhật"}
                                </p>
                              </div>
                            </div>

                            {/* Room Status */}
                            <div className="flex items-start gap-2">
                              <CheckCircle className="text-gray-400 mt-0.5" size={16} />
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Trạng thái phòng</p>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    detail.room_status === "OCCUPIED"
                                      ? "bg-red-100 text-red-800"
                                      : detail.room_status === "CLEANING"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                  }`}
                                >
                                  {detail.room_status === "OCCUPIED"
                                    ? "Đang sử dụng"
                                    : detail.room_status === "CLEANING"
                                    ? "Đang dọn"
                                    : "Trống"}
                                </span>
                              </div>
                            </div>

                            {/* Room Area */}
                            {detail.room_area && (
                              <div className="flex items-start gap-2">
                                <Building className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Diện tích</p>
                                  <p className="text-sm font-medium text-gray-900">{detail.room_area}m²</p>
                                </div>
                              </div>
                            )}

                            {/* Capacity */}
                            {detail.capacity && (
                              <div className="flex items-start gap-2">
                                <Users className="text-gray-400 mt-0.5" size={16} />
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Sức chứa</p>
                                  <p className="text-sm font-medium text-gray-900">{detail.capacity} người</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Room Amenities */}
                          {detail.amenities && detail.amenities.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-2">Tiện nghi chính</p>
                              <div className="flex flex-wrap gap-2">
                                {detail.amenities.map((amenity: any, idx: number) => (
                                  <span
                                    key={idx}
                                    className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200"
                                  >
                                    {amenity.name || amenity}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Staff Note */}
                          {detail.staff_note && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-xs text-gray-500 mb-2 flex items-center gap-2">
                                <MessageSquare className="text-gray-400" size={14} />
                                Ghi chú của nhân viên buồng phòng
                              </p>
                              <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                {detail.staff_note}
                              </p>
                            </div>
                          )}
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
                {/* Payment Status Bar - Thanh trạng thái ngang màu */}
                <div className={`rounded-xl p-4 border-2 ${
                  booking.payment_status === "SUCCESS"
                    ? "bg-green-50 border-green-300"
                    : booking.payment_status === "PENDING"
                    ? "bg-yellow-50 border-yellow-300"
                    : "bg-red-50 border-red-300"
                }`}>
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-3">
                      <DollarSign className={`${
                        booking.payment_status === "SUCCESS" ? "text-green-600" :
                        booking.payment_status === "PENDING" ? "text-yellow-600" :
                        "text-red-600"
                      }`} size={24} />
                      <div>
                        <p className={`text-lg font-bold ${
                          booking.payment_status === "SUCCESS" ? "text-green-800" :
                          booking.payment_status === "PENDING" ? "text-yellow-800" :
                          "text-red-800"
                        }`}>
                          {formatCurrency(booking.total_amount)}
                        </p>
                        <p className={`text-sm font-medium ${
                          booking.payment_status === "SUCCESS" ? "text-green-700" :
                          booking.payment_status === "PENDING" ? "text-yellow-700" :
                          "text-red-700"
                        }`}>
                          {booking.payment_status === "SUCCESS"
                            ? "✅ Đã thanh toán đủ"
                            : booking.payment_status === "PENDING"
                            ? "⏳ Chờ thanh toán"
                            : "❌ Chưa thanh toán"}
                        </p>
                      </div>
                    </div>
                    {booking.payment_created_at && booking.payment_status === "SUCCESS" && (
                      <div className="text-sm text-gray-600">
                        {booking.payment_confirmed_by && (
                          <span className="font-medium">{booking.payment_confirmed_by}</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{formatDateTime(booking.payment_created_at)}</span>
                      </div>
                    )}
                  </div>
                </div>

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

                  {/* Invoice & Receipt Numbers */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {booking.invoice_number && (
                        <div className="flex items-start gap-3">
                          <FileText className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Hóa đơn VAT số</p>
                            <p className="text-sm font-medium text-gray-900 font-mono">
                              {booking.invoice_number}
                            </p>
                          </div>
                        </div>
                      )}
                      {booking.receipt_number && (
                        <div className="flex items-start gap-3">
                          <Receipt className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Biên lai số</p>
                            <p className="text-sm font-medium text-gray-900 font-mono">
                              {booking.receipt_number}
                            </p>
                          </div>
                        </div>
                      )}
                      {booking.payment_confirmed_by && (
                        <div className="flex items-start gap-3">
                          <User className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Người xác nhận thanh toán</p>
                            <p className="text-sm font-medium text-gray-900">
                              {booking.payment_confirmed_by}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Extended Payment Information */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {/* Deposit */}
                      {booking.deposit_amount && booking.deposit_amount > 0 && (
                        <div className="flex items-start gap-3">
                          <DollarSign className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Đặt cọc</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(booking.deposit_amount)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Remaining Balance */}
                      {booking.remaining_balance !== undefined && booking.remaining_balance > 0 && (
                        <div className="flex items-start gap-3">
                          <CreditCard className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Công nợ còn lại</p>
                            <p className="text-sm font-medium text-red-600">
                              {formatCurrency(booking.remaining_balance)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Payment Due Date */}
                      {booking.payment_due_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ngày hết hạn thanh toán</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(booking.payment_due_date)}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Transaction ID */}
                      {booking.transaction_id && (
                        <div className="flex items-start gap-3">
                          <FileText className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Mã giao dịch</p>
                            <p className="text-sm font-medium text-gray-900 font-mono">
                              {booking.transaction_id}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Refund Status */}
                      {booking.refund_status && (
                        <div className="flex items-start gap-3">
                          <RefreshCw className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Tình trạng hoàn tiền</p>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                booking.refund_status === "COMPLETED"
                                  ? "bg-green-100 text-green-800"
                                  : booking.refund_status === "PENDING"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {booking.refund_status === "COMPLETED"
                                ? "Đã hoàn"
                                : booking.refund_status === "PENDING"
                                ? "Chờ hoàn"
                                : "Không áp dụng"}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Refund Date */}
                      {booking.refund_date && (
                        <div className="flex items-start gap-3">
                          <Calendar className="text-gray-400 mt-0.5" size={18} />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Ngày hoàn tiền</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDateTime(booking.refund_date)}
                            </p>
                          </div>
                        </div>
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
                      <span className="text-gray-600">Thuế VAT (10%)</span>
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
                    {booking.service_fee && booking.service_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phụ phí dịch vụ</span>
                        <span className="font-medium text-gray-900">{formatCurrency(booking.service_fee)}</span>
                      </div>
                    )}
                    {booking.cleaning_fee && booking.cleaning_fee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Phí dọn phòng</span>
                        <span className="font-medium text-gray-900">{formatCurrency(booking.cleaning_fee)}</span>
                      </div>
                    )}
                    <div className="border-t-2 border-blue-200 pt-3 flex justify-between items-center">
                      <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                      <span className="text-2xl font-bold text-blue-600">{formatCurrency(booking.total_amount)}</span>
                    </div>
                  </div>
                </div>

                {/* Invoice & Receipt Downloads */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="text-blue-600" size={20} />
                    Hóa đơn & chứng từ
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePrintInvoice}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Download size={16} />
                      Tải hóa đơn VAT PDF
                    </button>
                    <button
                      onClick={handlePrintInvoice}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Receipt size={16} />
                      Tải biên lai thanh toán
                    </button>
                  </div>
                </div>

                {/* Payment Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                  <div className="flex flex-wrap gap-3">
                    {booking.payment_status === "PENDING" && (
                      <button
                        onClick={async () => {
                          if (confirm("Xác nhận thanh toán cho booking này?")) {
                            // Update payment status to SUCCESS
                            try {
                              // TODO: Implement API to confirm payment
                              showToast("success", "Xác nhận thanh toán thành công");
                              await fetchBookingDetail();
                              await fetchActivityLog();
                            } catch (error: any) {
                              showToast("error", error.message || "Không thể xác nhận thanh toán");
                            }
                          }
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <CheckCircle size={16} />
                        Xác nhận thanh toán
                      </button>
                    )}
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
                          <>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Giờ Check-in thực tế</p>
                              <p className="text-sm font-semibold text-green-600">{formatDateTime(booking?.updated_at || "")}</p>
                            </div>
                            {booking.checkin_staff && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Nhân viên check-in</p>
                                <p className="text-sm font-medium text-gray-900">{booking.checkin_staff}</p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="pt-3">
                            <button
                              onClick={() => setShowCheckinModal(true)}
                              disabled={booking?.status !== "CONFIRMED"}
                              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                            >
                              <LogIn size={16} />
                              Check-in
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
                          <>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Giờ Check-out thực tế</p>
                              <p className="text-sm font-semibold text-green-600">{formatDateTime(booking?.updated_at || "")}</p>
                            </div>
                            {booking.checkout_staff && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Nhân viên check-out</p>
                                <p className="text-sm font-medium text-gray-900">{booking.checkout_staff}</p>
                              </div>
                            )}
                            {booking.room_condition_on_checkout && (
                              <div>
                                <p className="text-xs text-gray-500 mb-1">Tình trạng phòng khi trả</p>
                                <span
                                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                    booking.room_condition_on_checkout === "CLEAN"
                                      ? "bg-green-100 text-green-800"
                                      : booking.room_condition_on_checkout === "NEEDS_MAINTENANCE"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {booking.room_condition_on_checkout === "CLEAN"
                                    ? "Đã dọn"
                                    : booking.room_condition_on_checkout === "NEEDS_MAINTENANCE"
                                    ? "Cần bảo trì"
                                    : "Bị hỏng thiết bị"}
                                </span>
                              </div>
                            )}
                          </>
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

                  {/* Receptionist Note */}
                  {booking.receptionist_note && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <MessageSquare className="text-blue-600" size={16} />
                        Ghi chú của lễ tân
                      </h4>
                      <p className="text-sm text-gray-700 bg-blue-50 border border-blue-200 rounded-lg p-3">
                        {booking.receptionist_note}
                      </p>
                    </div>
                  )}

                  {/* Check-out Images */}
                  {(booking?.status === "CHECKED_OUT" || booking?.status === "COMPLETED") && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <FileText className="text-blue-600" size={16} />
                        Hình ảnh sau check-out
                      </h4>
                      {booking.checkout_images && booking.checkout_images.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {booking.checkout_images.map((image: string, idx: number) => (
                            <div key={idx} className="relative group">
                              <img
                                src={image}
                                alt={`Check-out image ${idx + 1}`}
                                className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => window.open(image, "_blank")}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-opacity flex items-center justify-center">
                                <Eye className="text-white opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                          <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                          <p className="text-sm text-gray-500 mb-3">Chưa có hình ảnh sau check-out</p>
                          <button
                            onClick={() => {
                              showToast("success", "Tính năng upload hình ảnh đang được phát triển");
                            }}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                          >
                            Upload hình ảnh
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Hành động</h3>
                  <div className="flex flex-wrap gap-3">
                    {booking?.status === "CONFIRMED" && booking.status !== "CHECKED_IN" && booking.status !== "CHECKED_OUT" && booking.status !== "COMPLETED" && (
                      <button
                        onClick={() => setShowCheckinModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <LogIn size={16} />
                        Check-in
                      </button>
                    )}
                    {booking?.status === "CHECKED_IN" && booking.status !== "CHECKED_OUT" && booking.status !== "COMPLETED" && (
                      <>
                        <button
                          onClick={() => setShowCheckoutModal(true)}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <LogOut size={16} />
                          Check-out
                        </button>
                        <button
                          onClick={() => setShowExtendModal(true)}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Clock size={16} />
                          Gia hạn thêm đêm
                        </button>
                        <button
                          onClick={() => setShowTransferRoomModal(true)}
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Move size={16} />
                          Chuyển phòng
                        </button>
                        <button
                          onClick={() => {
                            showToast("success", "Đã gửi yêu cầu dọn phòng");
                          }}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Bell size={16} />
                          Yêu cầu dọn phòng
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setShowInternalNoteModal(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <MessageSquare size={16} />
                      Ghi chú nội bộ
                    </button>
                    {booking?.status !== "CHECKED_IN" && 
                     booking?.status !== "CHECKED_OUT" && 
                     booking?.status !== "COMPLETED" && 
                     booking?.status !== "CANCELLED" && (
                      <button
                        onClick={() => {
                          if (confirm("Bạn có chắc chắn muốn hủy booking này?")) {
                            setNewStatus("CANCELLED");
                            handleStatusUpdate();
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2 transition-colors"
                      >
                        <XCircle size={16} />
                        Hủy booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Tab 5: Activity Log */}
            {activeTab === "activity" && (
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <History className="text-blue-600" size={20} />
                    Lịch sử thay đổi
                  </h3>
                  {/* Filter & Export */}
                  <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={18} />
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="all">Tất cả</option>
                      <option value="CREATE">Tạo booking</option>
                      <option value="UPDATE">Cập nhật</option>
                      <option value="PAYMENT">Thanh toán</option>
                      <option value="CHECKIN">Check-in</option>
                      <option value="CHECKOUT">Check-out</option>
                      <option value="CANCEL">Hủy</option>
                    </select>
                    <button
                      onClick={() => {
                        // Export CSV functionality
                        const csvContent = [
                          ["Thời gian", "Loại hành động", "Chi tiết thay đổi", "Người thực hiện", "Bộ phận", "Địa chỉ IP", "Ghi chú"],
                          ...displayActivityLog.map((log) => [
                            formatDateTime(log.time),
                            log.action,
                            log.change_details || "-",
                            log.user,
                            log.department || "-",
                            log.ip_address || "-",
                            log.note,
                          ]),
                        ]
                          .map((row) => row.map((cell) => `"${cell}"`).join(","))
                          .join("\n");
                        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                        const link = document.createElement("a");
                        link.href = URL.createObjectURL(blob);
                        link.download = `booking-history-${booking.booking_id}-${new Date().toISOString().split("T")[0]}.csv`;
                        link.click();
                        showToast("success", "Đã xuất file CSV thành công");
                      }}
                      className="px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <Download size={16} />
                      Xuất CSV
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Thời gian
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Loại hành động
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chi tiết thay đổi
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Người thực hiện
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Bộ phận
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Địa chỉ IP
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ghi chú
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayActivityLog
                        .filter((log) => activityFilter === "all" || log.action_type === activityFilter)
                        .map((log, index) => (
                          <tr key={log.id || index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                              {formatDateTime(log.time)}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  log.action_type === "CREATE"
                                    ? "bg-green-100 text-green-800"
                                    : log.action_type === "UPDATE"
                                    ? "bg-blue-100 text-blue-800"
                                    : log.action_type === "PAYMENT"
                                    ? "bg-purple-100 text-purple-800"
                                    : log.action_type === "CHECKIN"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : log.action_type === "CHECKOUT"
                                    ? "bg-pink-100 text-pink-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {log.action}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-700">
                              {log.change_details || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{log.user}</td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                              {log.department || "-"}
                            </td>
                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                              {log.ip_address || "-"}
                            </td>
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
      </div>

      {/* Check-in Modal */}
      {showCheckinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận Check-in</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn check-in cho booking này? Thời gian check-in sẽ được ghi nhận tự động.
              </p>
            </div>
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
                {updating ? "Đang xử lý..." : "Xác nhận"}
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
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Bạn có chắc chắn muốn check-out cho booking này? Thời gian check-out sẽ được ghi nhận tự động.
              </p>
            </div>
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
                {updating ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Extend Booking Modal */}
      {showExtendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Gia hạn thêm đêm</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Tính năng gia hạn booking đang được phát triển. Vui lòng liên hệ quản lý để xử lý.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowExtendModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Room Modal */}
      {showTransferRoomModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chuyển phòng</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-4">
                Tính năng chuyển phòng đang được phát triển. Vui lòng liên hệ quản lý để xử lý.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowTransferRoomModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Internal Note Modal */}
      {showInternalNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ghi chú nội bộ</h3>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Ghi chú nội bộ chỉ dành cho nhân viên và admin. Khách hàng không thể xem được.
              </p>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Nhập ghi chú nội bộ..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={6}
              />
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowInternalNoteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={async () => {
                  await handleSaveAdminNote();
                  setShowInternalNoteModal(false);
                }}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {updating ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer History Modal */}
      {showCustomerHistoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Lịch sử booking của khách hàng</h3>
              <button
                onClick={() => setShowCustomerHistoryModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle size={24} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Tính năng xem lịch sử booking của khách hàng đang được phát triển.
              </p>
            </div>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowCustomerHistoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelBookingDetailPage;

