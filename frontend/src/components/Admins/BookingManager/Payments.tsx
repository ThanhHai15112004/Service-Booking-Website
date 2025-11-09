import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CheckCircle, XCircle, Clock, DollarSign, CreditCard, ChevronLeft, ChevronRight, Calendar, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface Payment {
  payment_id: string;
  booking_id: string;
  payment_method: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  created_at: string;
  updated_at?: string;
}

const Payments = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statistics, setStatistics] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    refundedAmount: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    paymentMethod: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, [currentPage, itemsPerPage, searchTerm, filters]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) {
        params.search = searchTerm;
      }
      if (filters.paymentMethod) {
        params.paymentMethod = filters.paymentMethod;
      }
      if (filters.status) {
        params.status = filters.status;
      }
      if (filters.dateFrom) {
        params.dateFrom = filters.dateFrom;
      }
      if (filters.dateTo) {
        params.dateTo = filters.dateTo;
      }

      const result = await adminService.getBookingPayments(params);
      if (result.success && result.data) {
        setPayments(result.data.payments || []);
        setTotalPages(result.data.pagination?.totalPages || 1);
        setTotal(result.data.pagination?.total || 0);
        if (result.data.statistics) {
          setStatistics(result.data.statistics);
        }
      } else {
        showToast("error", result.message || "Không thể tải danh sách thanh toán");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (paymentId: string, newStatus: string) => {
    try {
      const result = await adminService.updatePaymentStatus(paymentId, newStatus);
      if (result.success) {
        showToast("success", result.message || `Đã cập nhật trạng thái sang ${newStatus}`);
        fetchPayments();
        setShowStatusModal(false);
        setSelectedPayment(null);
      } else {
        showToast("error", result.message || "Không thể cập nhật trạng thái");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật trạng thái");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const currentPayments = payments;

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

  // Statistics from API (calculated from all payments, not just current page)
  const totalRevenue = statistics.totalRevenue || 0;
  const pendingAmount = statistics.pendingAmount || 0;
  const refundedAmount = statistics.refundedAmount || 0;

  return (
    <div className="space-y-4 md:space-y-6 px-2 md:px-0">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách thanh toán..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý thanh toán</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý tất cả các giao dịch thanh toán</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Tổng doanh thu</p>
              <p className="text-xl md:text-2xl font-bold text-green-600 mt-2 truncate" title={formatPrice(totalRevenue) + " VNĐ"}>
                {formatPrice(totalRevenue)} VNĐ
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-2 md:p-3 flex-shrink-0">
              <DollarSign className="text-green-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Đang chờ thanh toán</p>
              <p className="text-xl md:text-2xl font-bold text-yellow-600 mt-2 truncate" title={formatPrice(pendingAmount) + " VNĐ"}>
                {formatPrice(pendingAmount)} VNĐ
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-2 md:p-3 flex-shrink-0">
              <Clock className="text-yellow-600" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-600 truncate">Đã hoàn tiền</p>
              <p className="text-xl md:text-2xl font-bold text-purple-600 mt-2 truncate" title={formatPrice(refundedAmount) + " VNĐ"}>
                {formatPrice(refundedAmount)} VNĐ
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-2 md:p-3 flex-shrink-0">
              <XCircle className="text-purple-600" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          <div className="lg:col-span-2 min-w-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã payment, booking..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 md:pl-10 md:pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">Chờ thanh toán</option>
            <option value="SUCCESS">Thành công</option>
            <option value="FAILED">Thất bại</option>
            <option value="REFUNDED">Đã hoàn tiền</option>
          </select>

          <div className="flex gap-2 min-w-0">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="flex-1 min-w-0 px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="flex-1 min-w-0 px-2 md:px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Đến ngày"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Mã Payment</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Mã Booking</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Phương thức</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Số tiền</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Trạng thái</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Ngày tạo</th>
                <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-3 py-12 text-center text-gray-500">
                    Không tìm thấy payment nào
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-3 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[120px]" title={payment.payment_id}>
                        {payment.payment_id}
                      </div>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm truncate max-w-[120px]"
                        title={payment.booking_id}
                      >
                        {payment.booking_id}
                      </button>
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">{payment.payment_method}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(payment.amount)} VNĐ
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap">{getStatusBadge(payment.status)}</td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {payment.status !== "REFUNDED" && (
                          <button
                            onClick={() => {
                              setSelectedPayment(payment);
                              setShowStatusModal(true);
                            }}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Cập nhật trạng thái"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
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
                Hiển thị {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, total)} trong tổng số {total} payment
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

      {/* Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết thanh toán</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Payment</label>
                <p className="text-gray-900">{selectedPayment.payment_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Booking</label>
                <button
                  onClick={() => {
                    setShowDetailModal(false);
                    navigate(`/admin/bookings/${selectedPayment.booking_id}`);
                  }}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {selectedPayment.booking_id}
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
                <p className="text-gray-900">{selectedPayment.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <p className="text-gray-900 font-medium">{formatPrice(selectedPayment.amount)} VNĐ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                <p className="text-gray-900">{formatDateTime(selectedPayment.created_at)}</p>
              </div>
              {selectedPayment.updated_at && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật lần cuối</label>
                  <p className="text-gray-900">{formatDateTime(selectedPayment.updated_at)}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Cập nhật trạng thái</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái hiện tại</label>
                <div className="mt-1">{getStatusBadge(selectedPayment.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái mới</label>
                <select
                  onChange={(e) => {
                    handleUpdateStatus(selectedPayment.payment_id, e.target.value);
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Chọn trạng thái</option>
                  {selectedPayment.status === "PENDING" && (
                    <>
                      <option value="SUCCESS">Thành công</option>
                      <option value="FAILED">Thất bại</option>
                    </>
                  )}
                  {selectedPayment.status === "SUCCESS" && (
                    <option value="REFUNDED">Hoàn tiền</option>
                  )}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedPayment(null);
                }}
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

export default Payments;
