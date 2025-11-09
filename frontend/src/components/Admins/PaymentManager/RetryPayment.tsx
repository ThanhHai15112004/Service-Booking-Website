import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface FailedPayment {
  payment_id: string;
  booking_id: string;
  customer_name: string;
  hotel_name: string;
  payment_method: string;
  amount: number;
  created_at: string;
  error_reason?: string;
  retry_count: number;
}

const RetryPayment = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [payments, setPayments] = useState<FailedPayment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<FailedPayment | null>(null);
  const [showRetryModal, setShowRetryModal] = useState(false);
  const [newMethod, setNewMethod] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  useEffect(() => {
    fetchFailedPayments();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchFailedPayments = async () => {
    setLoading(true);
    try {
      const response = await adminService.getFailedPayments({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
      });

      if (response.success && response.data) {
        const mappedPayments = response.data.payments.map((p: any) => ({
          payment_id: p.payment_id,
          booking_id: p.booking_id,
          customer_name: p.customer_name || p.full_name || "N/A",
          hotel_name: p.hotel_name || "N/A",
          payment_method: p.method || p.payment_method,
          amount: p.amount_due || p.amount,
          created_at: p.created_at,
          error_reason: p.error_reason || "Thanh toán thất bại",
          retry_count: p.retry_count || 0,
        }));
        setPayments(mappedPayments);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } else {
        showToast("error", response.message || "Không thể tải danh sách thanh toán thất bại");
      }
      setLoading(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách thanh toán thất bại");
      setLoading(false);
    }
  };

  // Filters are applied on the backend

  const handleRetry = async (useNewMethod: boolean) => {
    if (!selectedPayment) return;
    if (useNewMethod && !newMethod) {
      showToast("error", "Vui lòng chọn phương thức thanh toán mới");
      return;
    }

    try {
      const response = await adminService.retryPayment(
        selectedPayment.payment_id,
        useNewMethod ? newMethod : undefined
      );
      if (response.success) {
        showToast("success", response.message || `Đã thử lại thanh toán thành công`);
        setShowRetryModal(false);
        setSelectedPayment(null);
        setNewMethod("");
        fetchFailedPayments();
      } else {
        showToast("error", response.message || "Không thể thử lại thanh toán");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể thử lại thanh toán");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = payments;

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
      {loading && <Loading message="Đang tải danh sách thanh toán thất bại..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thử lại thanh toán</h1>
          <p className="text-gray-600 mt-1">Retry các giao dịch thanh toán bị lỗi</p>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-900">
              Có {total} thanh toán bị thất bại
            </p>
            <p className="text-sm text-red-700 mt-1">
              Bạn có thể thử lại với cùng phương thức hoặc chuyển sang phương thức khác.
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo mã payment, booking ID, tên khách hàng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lý do lỗi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số lần retry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-6 py-12 text-center text-gray-500">
                    Không có thanh toán nào bị thất bại
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.payment_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        {payment.booking_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {payment.payment_method}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(payment.amount)} VNĐ
                    </td>
                    <td className="px-6 py-4 text-sm text-red-600">{payment.error_reason || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {payment.retry_count} lần
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setNewMethod("");
                          setShowRetryModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="Thử lại"
                      >
                        <RefreshCw size={18} />
                      </button>
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, total)} trong tổng số {total} thanh toán
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

      {/* Retry Modal */}
      {showRetryModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Thử lại thanh toán</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Payment</label>
                <p className="text-gray-900 font-mono">{selectedPayment.payment_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <p className="text-gray-900 font-bold text-lg">{formatPrice(selectedPayment.amount)} VNĐ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức hiện tại</label>
                <p className="text-gray-900">{selectedPayment.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do lỗi</label>
                <p className="text-red-600">{selectedPayment.error_reason || "-"}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Chọn phương thức mới (tùy chọn)</label>
                <select
                  value={newMethod}
                  onChange={(e) => setNewMethod(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Giữ nguyên ({selectedPayment.payment_method})</option>
                  <option value="VNPAY">VNPAY</option>
                  <option value="MOMO">MOMO</option>
                  <option value="CASH">Tiền mặt</option>
                  <option value="BANK">Chuyển khoản</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRetryModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={() => handleRetry(newMethod !== "")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <RefreshCw size={18} />
                {newMethod ? `Thử lại với ${newMethod}` : "Thử lại"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetryPayment;

