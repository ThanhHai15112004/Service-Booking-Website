import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, User, Search, Eye, ChevronLeft, ChevronRight, CheckCircle, XCircle, Clock, CreditCard } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface HotelBookingsTabProps {
  hotelId: string;
  onBookingUpdate?: () => void;
}

interface Booking {
  booking_id: string;
  account_id: string;
  account_name: string;
  account_email: string;
  account_phone?: string;
  account_avatar?: string;
  account_status: string;
  status: string;
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  special_requests?: string;
  created_at: string;
  updated_at: string;
  checkin_date: string;
  checkout_date: string;
  nights_count: number;
  total_guests: number;
  rooms_count: number;
  room_type_names?: string;
  payment_method?: string;
  payment_status?: string;
  amount_due?: number;
  amount_paid?: number;
}

const HotelBookingsTab = ({ hotelId, onBookingUpdate }: HotelBookingsTabProps) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [pendingBookingCount, setPendingBookingCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    status: "",
    accountName: "",
    accountEmail: "",
    dateFrom: "",
    dateTo: "",
    checkinFrom: "",
    checkinTo: "",
  });

  useEffect(() => {
    fetchBookings();
    fetchPendingBookingCount();
  }, [hotelId, currentPage, itemsPerPage, filters]);

  // Auto-refresh mỗi 60 giây để cập nhật số lượng booking chờ xác nhận
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPendingBookingCount();
      // Nếu đang ở trang đầu và không có filter, refresh danh sách
      if (currentPage === 1 && !filters.status && !filters.accountName && !filters.accountEmail && !filters.dateFrom && !filters.dateTo) {
        fetchBookings();
      }
    }, 60000); // 60 giây - giảm tần suất để tránh spam log

    return () => clearInterval(interval);
  }, [currentPage, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelBookings(hotelId, {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
        sortBy: "created_at",
        sortOrder: "DESC",
      });

      if (response.success && response.data) {
        setBookings(response.data.bookings);
        setTotalBookings(response.data.total);
        // Notify parent component to update pending count
        if (onBookingUpdate) {
          onBookingUpdate();
        }
      } else {
        showToast("error", response.message || "Không thể tải danh sách booking");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách booking");
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingBookingCount = async () => {
    try {
      const response = await adminService.getHotelBookings(hotelId, {
        status: "PENDING_CONFIRMATION",
        page: 1,
        limit: 1,
      });
      if (response.success && response.data) {
        setPendingBookingCount(response.data.total || 0);
      }
    } catch (error) {
      // Silently fail
      console.error("Error fetching pending booking count:", error);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleViewDetail = (booking: Booking) => {
    navigate(`/admin/hotels/${hotelId}/bookings/${booking.booking_id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock size={14} className="mr-1" />
            Đặt phòng
          </span>
        );
      case "PENDING_CONFIRMATION":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock size={14} className="mr-1" />
            Chờ xác nhận
          </span>
        );
      case "CONFIRMED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle size={14} className="mr-1" />
            Đã xác nhận
          </span>
        );
      case "CHECKED_IN":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <CheckCircle size={14} className="mr-1" />
            Đã check-in
          </span>
        );
      case "CHECKED_OUT":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle size={14} className="mr-1" />
            Đã check-out
          </span>
        );
      case "COMPLETED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <CheckCircle size={14} className="mr-1" />
            Hoàn tất
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle size={14} className="mr-1" />
            Đã hủy
          </span>
        );
      case "PAID": // Legacy status
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <CreditCard size={14} className="mr-1" />
            Chờ xác nhận
          </span>
        );
      default:
        return null;
    }
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

  const totalPages = Math.ceil(totalBookings / itemsPerPage);

  if (loading && bookings.length === 0) {
    return <Loading message="Đang tải danh sách booking..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Alert Banner for Pending Confirmations */}
      {bookings.some(b => b.status === "PENDING_CONFIRMATION" || b.status === "PAID") && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-yellow-800">
                  Có {bookings.filter(b => b.status === "PENDING_CONFIRMATION" || b.status === "PAID").length} booking đang chờ xác nhận
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Vui lòng xác nhận các booking này để khách hàng có thể check-in.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setFilters({ ...filters, status: "PENDING_CONFIRMATION" });
                setCurrentPage(1);
              }}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 text-sm font-medium transition-colors"
            >
              Xem ngay
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Bộ lọc</h3>
          {pendingBookingCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Bookings chờ xác nhận:</span>
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                {pendingBookingCount}
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="CREATED">Đặt phòng</option>
              <option value="PENDING_CONFIRMATION">Chờ xác nhận</option>
              <option value="CONFIRMED">Đã xác nhận</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="CHECKED_OUT">Đã check-out</option>
              <option value="COMPLETED">Hoàn tất</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="PAID">Đã thanh toán (Legacy)</option>
            </select>
          </div>

          {/* Account Name Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo tên..."
                value={filters.accountName}
                onChange={(e) => {
                  setFilters({ ...filters, accountName: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Account Email Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email khách hàng</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm theo email..."
                value={filters.accountEmail}
                onChange={(e) => {
                  setFilters({ ...filters, accountEmail: e.target.value });
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Date From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo từ</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => {
                setFilters({ ...filters, dateFrom: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo đến</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => {
                setFilters({ ...filters, dateTo: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Checkin From Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Check-in từ</label>
            <input
              type="date"
              value={filters.checkinFrom}
              onChange={(e) => {
                setFilters({ ...filters, checkinFrom: e.target.value });
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-xl border border-gray-200">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p>Chưa có booking nào</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thông tin booking</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày check-in/out</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thanh toán</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => {
                  const isPendingConfirmation = booking.status === "PENDING_CONFIRMATION" || booking.status === "PAID";
                  return (
                  <tr 
                    key={booking.booking_id} 
                    className={`hover:bg-gray-50 transition-colors ${
                      isPendingConfirmation ? "bg-yellow-50 border-l-4 border-yellow-400" : ""
                    }`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        {booking.account_avatar ? (
                          <img src={booking.account_avatar} alt={booking.account_name} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <User className="text-gray-400" size={20} />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booking.account_name}</div>
                          <div className="text-sm text-gray-500">{booking.account_email}</div>
                          {booking.account_phone && <div className="text-xs text-gray-400">{booking.account_phone}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">ID: {booking.booking_id}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {booking.rooms_count} phòng • {booking.total_guests} khách
                      </div>
                      {booking.room_type_names && (
                        <div className="text-xs text-gray-500 mt-1">{booking.room_type_names}</div>
                      )}
                      <div className="text-xs text-gray-400 mt-1">{formatDate(booking.created_at)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <Calendar size={14} className="inline mr-1" />
                        {formatDate(booking.checkin_date)}
                      </div>
                      <div className="text-sm text-gray-500">
                        → {formatDate(booking.checkout_date)}
                      </div>
                      <div className="text-xs text-gray-400">{booking.nights_count} đêm</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{formatCurrency(booking.total_amount)}</div>
                      {booking.discount_amount > 0 && (
                        <div className="text-xs text-green-600">Giảm: {formatCurrency(booking.discount_amount)}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booking.payment_status ? (
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            booking.payment_status === "SUCCESS"
                              ? "bg-green-100 text-green-800"
                              : booking.payment_status === "PENDING"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {booking.payment_status === "SUCCESS" ? "Thành công" : booking.payment_status === "PENDING" ? "Chờ thanh toán" : "Thất bại"}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa thanh toán</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {isPendingConfirmation && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold animate-pulse">
                            Cần xác nhận
                          </span>
                        )}
                        <button
                          onClick={() => handleViewDetail(booking)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-700">
                  Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalBookings)} trong tổng số {totalBookings} booking
                </span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value={10}>10 / trang</option>
                  <option value={20}>20 / trang</option>
                  <option value={50}>50 / trang</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={20} />
                </button>
                <span className="text-sm text-gray-700">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HotelBookingsTab;

