import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CheckCircle, XCircle, RefreshCw, Calendar, Download, FileText, CreditCard, ChevronLeft, ChevronRight, Filter, DollarSign } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Payment {
  payment_id: string;
  booking_id: string;
  customer_name: string;
  customer_email: string;
  hotel_id: string;
  hotel_name: string;
  payment_method: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  created_at: string;
  updated_at?: string;
}

const PaymentsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    paymentMethod: "",
    status: "",
    hotel: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedPayments, setSelectedPayments] = useState<string[]>([]);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, searchTerm, filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setPayments([
          {
            payment_id: "PAY001",
            booking_id: "BK001",
            customer_name: "Nguyễn Văn A",
            customer_email: "nguyenvana@email.com",
            hotel_id: "H001",
            hotel_name: "Hanoi Old Quarter Hotel",
            payment_method: "VNPAY",
            amount: 3650000,
            status: "SUCCESS",
            created_at: "2025-11-01T10:30:00",
            updated_at: "2025-11-01T10:35:00",
          },
          {
            payment_id: "PAY002",
            booking_id: "BK002",
            customer_name: "Trần Thị B",
            customer_email: "tranthib@email.com",
            hotel_id: "H002",
            hotel_name: "My Khe Beach Resort",
            payment_method: "MOMO",
            amount: 8500000,
            status: "SUCCESS",
            created_at: "2025-11-02T14:20:00",
          },
          {
            payment_id: "PAY003",
            booking_id: "BK003",
            customer_name: "Lê Văn C",
            customer_email: "levanc@email.com",
            hotel_id: "H003",
            hotel_name: "Saigon Riverside Hotel",
            payment_method: "CASH",
            amount: 4200000,
            status: "PENDING",
            created_at: "2025-11-03T09:15:00",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách thanh toán");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...payments];

    if (searchTerm) {
      result = result.filter(
        (payment) =>
          payment.payment_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.booking_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          payment.customer_email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.paymentMethod) {
      result = result.filter((payment) => payment.payment_method === filters.paymentMethod);
    }

    if (filters.status) {
      result = result.filter((payment) => payment.status === filters.status);
    }

    if (filters.hotel) {
      result = result.filter((payment) => payment.hotel_id === filters.hotel);
    }

    if (filters.dateFrom) {
      result = result.filter((payment) => payment.created_at >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((payment) => payment.created_at <= filters.dateTo);
    }

    setFilteredPayments(result);
    setCurrentPage(1);
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      // TODO: API call
      showToast("success", `Đã cập nhật trạng thái sang ${newStatus}`);
      fetchPayments();
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleExport = async (format: "CSV" | "EXCEL" | "PDF") => {
    try {
      // TODO: API call to export
      showToast("success", `Đang xuất file ${format}...`);
      setShowExportModal(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất file");
    }
  };

  const calculateTotalRevenue = () => {
    return filteredPayments
      .filter((p) => p.status === "SUCCESS")
      .reduce((sum, p) => sum + p.amount, 0);
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case "SUCCESS":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Thành công</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Thất bại</span>;
      case "REFUNDED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">Đã hoàn tiền</span>;
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

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách thanh toán..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách thanh toán</h1>
          <p className="text-gray-600 mt-1">Quản lý toàn bộ giao dịch thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={20} />
            Xuất báo cáo
          </button>
        </div>
      </div>

      {/* Revenue Summary */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm">Tổng doanh thu (đã lọc)</p>
            <p className="text-4xl font-bold mt-2">{formatPrice(calculateTotalRevenue())} VNĐ</p>
            <p className="text-blue-100 text-sm mt-2">{filteredPayments.filter(p => p.status === "SUCCESS").length} giao dịch thành công</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <DollarSign size={48} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã payment, booking ID, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

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

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>

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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
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
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  <input type="checkbox" className="rounded" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy payment nào
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input type="checkbox" className="rounded" />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.payment_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium"
                      >
                        {payment.booking_id}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{payment.customer_name}</div>
                      <div className="text-sm text-gray-500">{payment.customer_email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(payment.amount)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/payments/${payment.payment_id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/bookings/${payment.booking_id}?tab=invoice`)}
                          className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                          title="Xuất hóa đơn"
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} trong tổng số {filteredPayments.length} payment
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

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xuất báo cáo thanh toán</h3>
            <div className="space-y-3">
              <button
                onClick={() => handleExport("CSV")}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-green-600" size={20} />
                  <span className="font-medium">Xuất CSV</span>
                </div>
                <Download size={18} />
              </button>
              <button
                onClick={() => handleExport("EXCEL")}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-blue-600" size={20} />
                  <span className="font-medium">Xuất Excel</span>
                </div>
                <Download size={18} />
              </button>
              <button
                onClick={() => handleExport("PDF")}
                className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="text-red-600" size={20} />
                  <span className="font-medium">Xuất PDF</span>
                </div>
                <Download size={18} />
              </button>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentsList;

