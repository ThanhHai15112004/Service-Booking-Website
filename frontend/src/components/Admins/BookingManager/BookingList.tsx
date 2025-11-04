import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Filter, Eye, Edit, Mail, FileText, Plus, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Booking {
  booking_id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  hotel_id: string;
  hotel_name: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  payment_method: string;
  payment_status: "PENDING" | "SUCCESS" | "FAILED";
  status: "CREATED" | "CONFIRMED" | "PAID" | "COMPLETED" | "CANCELLED";
  created_at: string;
}

const BookingList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    paymentMethod: "",
    paymentStatus: "",
    hotel: "",
    dateFrom: "",
    dateTo: "",
  });
  const [sortBy, setSortBy] = useState<"created_at" | "total_amount" | "status">("created_at");
  const [sortOrder, setSortOrder] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [bookings, searchTerm, filters, sortBy, sortOrder]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setBookings([
          {
            booking_id: "BK001",
            account_id: "ACC001",
            customer_name: "Nguyễn Văn A",
            customer_email: "nguyenvana@email.com",
            hotel_id: "H001",
            hotel_name: "Hanoi Old Quarter Hotel",
            check_in: "2025-11-10",
            check_out: "2025-11-12",
            total_amount: 3500000,
            payment_method: "VNPAY",
            payment_status: "SUCCESS",
            status: "CONFIRMED",
            created_at: "2025-11-01",
          },
          {
            booking_id: "BK002",
            account_id: "ACC002",
            customer_name: "Trần Thị B",
            customer_email: "tranthib@email.com",
            hotel_id: "H002",
            hotel_name: "My Khe Beach Resort",
            check_in: "2025-11-15",
            check_out: "2025-11-18",
            total_amount: 8500000,
            payment_method: "MOMO",
            payment_status: "SUCCESS",
            status: "PAID",
            created_at: "2025-11-02",
          },
          {
            booking_id: "BK003",
            account_id: "ACC003",
            customer_name: "Lê Văn C",
            customer_email: "levanc@email.com",
            hotel_id: "H003",
            hotel_name: "Saigon Riverside Hotel",
            check_in: "2025-11-20",
            check_out: "2025-11-22",
            total_amount: 4200000,
            payment_method: "CASH",
            payment_status: "PENDING",
            status: "CREATED",
            created_at: "2025-11-03",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách booking");
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let result = [...bookings];

    // Search filter
    if (searchTerm) {
      result = result.filter(
        (booking) =>
          booking.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          booking.hotel_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filters.status) {
      result = result.filter((booking) => booking.status === filters.status);
    }

    // Payment method filter
    if (filters.paymentMethod) {
      result = result.filter((booking) => booking.payment_method === filters.paymentMethod);
    }

    // Payment status filter
    if (filters.paymentStatus) {
      result = result.filter((booking) => booking.payment_status === filters.paymentStatus);
    }

    // Hotel filter
    if (filters.hotel) {
      result = result.filter((booking) => booking.hotel_id === filters.hotel);
    }

    // Date filters
    if (filters.dateFrom) {
      result = result.filter((booking) => booking.created_at >= filters.dateFrom);
    }
    if (filters.dateTo) {
      result = result.filter((booking) => booking.created_at <= filters.dateTo);
    }

    // Sort
    result.sort((a, b) => {
      let aValue: any, bValue: any;
      switch (sortBy) {
        case "created_at":
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        case "total_amount":
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case "status":
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (sortOrder === "ASC") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredBookings(result);
    setCurrentPage(1);
  };

  const handleSendEmail = async (bookingId: string) => {
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

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBookings = filteredBookings.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Tạo mới</span>;
      case "CONFIRMED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Đã xác nhận</span>;
      case "PAID":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Đã thanh toán</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Hoàn thành</span>;
      case "CANCELLED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã hủy</span>;
      default:
        return null;
    }
  };

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case "SUCCESS":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Thành công</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Thất bại</span>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách booking..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách booking</h1>
          <p className="text-gray-600 mt-1">Quản lý tất cả các đặt phòng trong hệ thống</p>
        </div>
        <button
          onClick={() => navigate("/admin/bookings/create")}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo booking
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã booking, tên khách hàng, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="CREATED">Tạo mới</option>
            <option value="CONFIRMED">Đã xác nhận</option>
            <option value="PAID">Đã thanh toán</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="CANCELLED">Đã hủy</option>
          </select>

          {/* Payment Status Filter */}
          <select
            value={filters.paymentStatus}
            onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái thanh toán</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {/* Payment Method Filter */}
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả phương thức</option>
            <option value="VNPAY">VNPAY</option>
            <option value="MOMO">MOMO</option>
            <option value="CASH">Tiền mặt</option>
            <option value="BANK">Chuyển khoản</option>
          </select>

          {/* Hotel Filter */}
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
            <option value="H003">Saigon Riverside Hotel</option>
            <option value="H004">Sofitel Metropole</option>
          </select>

          {/* Date From */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Từ ngày"
            />
          </div>

          {/* Date To */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Đến ngày"
            />
          </div>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-sm font-medium text-gray-700">Sắp xếp theo:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="created_at">Ngày tạo</option>
            <option value="total_amount">Tổng tiền</option>
            <option value="status">Trạng thái</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === "ASC" ? "DESC" : "ASC")}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {sortOrder === "ASC" ? "↑ Tăng dần" : "↓ Giảm dần"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-in</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Check-out</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentBookings.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy booking nào
                  </td>
                </tr>
              ) : (
                currentBookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{booking.booking_id}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{booking.customer_name}</div>
                      <div className="text-sm text-gray-500">{booking.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{booking.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.check_in)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(booking.check_out)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(booking.total_amount)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 mb-1">{booking.payment_method}</div>
                      {getPaymentStatusBadge(booking.payment_status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(booking.created_at)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking.booking_id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/bookings/${booking.booking_id}/edit`)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleSendEmail(booking.booking_id)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Gửi lại email"
                        >
                          <Mail size={18} />
                        </button>
                        <button
                          onClick={() => {/* TODO: Show notes modal */}}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50"
                          title="Ghi chú"
                        >
                          <FileText size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredBookings.length)} trong tổng số {filteredBookings.length} booking
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
    </div>
  );
};

export default BookingList;

