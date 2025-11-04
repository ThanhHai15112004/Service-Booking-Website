import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Edit, Mail, FileText, CheckCircle, XCircle, Clock, DollarSign, User, Hotel, Calendar, Phone, CreditCard, History, Plus, X } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface BookingDetail {
  booking_id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  provider: string;
  hotel_id: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  final_amount: number;
  payment_method: string;
  payment_status: "PENDING" | "SUCCESS" | "FAILED";
  payment_created_at?: string;
  status: "CREATED" | "CONFIRMED" | "PAID" | "COMPLETED" | "CANCELLED";
  special_requests?: string;
  created_at: string;
  updated_at: string;
  rooms: Array<{
    room_type_id: string;
    room_type_name: string;
    room_id: string;
    room_number: string;
    price_per_night: number;
    nights: number;
    subtotal: number;
  }>;
  statusHistory: Array<{
    id: number;
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
    note: string;
  }>;
}

const BookingDetail = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    if (bookingId) {
      fetchBookingDetail();
    }
  }, [bookingId]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setBooking({
          booking_id: bookingId || "BK001",
          account_id: "ACC001",
          customer_name: "Nguyễn Văn A",
          customer_email: "nguyenvana@email.com",
          customer_phone: "0901234567",
          provider: "LOCAL",
          hotel_id: "H001",
          hotel_name: "Hanoi Old Quarter Hotel",
          check_in: "2025-11-10",
          check_out: "2025-11-12",
          total_amount: 3500000,
          tax_amount: 350000,
          discount_amount: 200000,
          final_amount: 3650000,
          payment_method: "VNPAY",
          payment_status: "SUCCESS",
          payment_created_at: "2025-11-01T10:30:00",
          status: "CONFIRMED",
          special_requests: "Yêu cầu phòng không hút thuốc, tầng cao",
          created_at: "2025-11-01T09:00:00",
          updated_at: "2025-11-01T10:30:00",
          rooms: [
            {
              room_type_id: "RT001",
              room_type_name: "Deluxe Sea View",
              room_id: "R001",
              room_number: "101",
              price_per_night: 1750000,
              nights: 2,
              subtotal: 3500000,
            },
          ],
          statusHistory: [
            {
              id: 1,
              date: "2025-11-01T09:00:00",
              admin_name: "System",
              old_status: "-",
              new_status: "CREATED",
              note: "Booking được tạo",
            },
            {
              id: 2,
              date: "2025-11-01T10:30:00",
              admin_name: "admin01",
              old_status: "CREATED",
              new_status: "CONFIRMED",
              note: "Khách gọi xác nhận",
            },
          ],
          internalNotes: [
            {
              id: 1,
              created_at: "2025-11-01T10:30:00",
              admin_name: "admin01",
              note: "Khách hàng yêu cầu check-in sớm",
            },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Lỗi khi tải thông tin booking");
      navigate("/admin/bookings");
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string, reason?: string) => {
    if (!booking) return;
    try {
      // TODO: API call
      showToast("success", `Đã cập nhật trạng thái sang ${newStatus}`);
      fetchBookingDetail();
      setShowStatusModal(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      showToast("error", "Vui lòng nhập ghi chú");
      return;
    }
    try {
      // TODO: API call
      showToast("success", "Đã thêm ghi chú");
      setNewNote("");
      setShowNoteModal(false);
      fetchBookingDetail();
    } catch (error: any) {
      showToast("error", error.message || "Không thể thêm ghi chú");
    }
  };

  const handleSendEmail = async () => {
    try {
      // TODO: API call
      showToast("success", "Đã gửi lại email xác nhận");
    } catch (error: any) {
      showToast("error", error.message || "Không thể gửi email");
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
      case "CONFIRMED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">Đã xác nhận</span>;
      case "PAID":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Đã thanh toán</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return null;
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
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Quay lại danh sách</span>
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSendEmail()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Mail size={18} />
            Gửi email
          </button>
          <button
            onClick={() => setShowStatusModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <CheckCircle size={18} />
            Đổi trạng thái
          </button>
          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Edit size={18} />
            Chỉnh sửa
          </button>
        </div>
      </div>

      {/* Booking Overview Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Booking #{booking.booking_id}</h1>
            <div className="flex items-center gap-4 mt-2">
              {getStatusBadge(booking.status)}
              <span className="text-gray-500">Ngày tạo: {formatDateTime(booking.created_at)}</span>
            </div>
          </div>
        </div>

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
                {formatDateTime(booking.check_in)} → {formatDateTime(booking.check_out)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 rounded-lg p-3">
              <DollarSign className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tổng tiền</p>
              <p className="font-medium text-gray-900">{formatPrice(booking.final_amount)} VNĐ</p>
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
                    <tr key={index}>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.room_type_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.room_number}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(room.price_per_night)} VNĐ</td>
                      <td className="px-4 py-3 text-sm text-gray-900">{room.nights}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(room.subtotal)} VNĐ</td>
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
                    <span className="text-gray-900">{formatPrice(booking.total_amount)} VNĐ</span>
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
                    <span className="text-gray-900">{formatPrice(booking.final_amount)} VNĐ</span>
                  </div>
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
                  {booking.statusHistory.map((history) => (
                    <tr key={history.id}>
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
                booking.internalNotes.map((note) => (
                  <div key={note.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-gray-50 rounded">
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

      {/* Status Change Modal */}
      {showStatusModal && (
        <StatusChangeModal
          currentStatus={booking.status}
          onClose={() => setShowStatusModal(false)}
          onUpdate={handleUpdateStatus}
        />
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

// Status Change Modal Component
const StatusChangeModal = ({
  currentStatus,
  onClose,
  onUpdate,
}: {
  currentStatus: string;
  onClose: () => void;
  onUpdate: (status: string, reason?: string) => void;
}) => {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [reason, setReason] = useState("");

  const getAvailableStatuses = () => {
    switch (currentStatus) {
      case "CREATED":
        return ["CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["PAID", "CANCELLED"];
      case "PAID":
        return ["COMPLETED", "CANCELLED"];
      default:
        return [];
    }
  };

  const availableStatuses = getAvailableStatuses();
  const needsReason = selectedStatus === "CANCELLED";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Thay đổi trạng thái</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
            <p className="text-gray-900">{currentStatus}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Chọn trạng thái</option>
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
          {needsReason && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hủy</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Nhập lý do hủy booking..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
                required
              />
            </div>
          )}
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => {
                if (selectedStatus) {
                  onUpdate(selectedStatus, needsReason ? reason : undefined);
                }
              }}
              disabled={!selectedStatus || (needsReason && !reason.trim())}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetail;
