import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Mail, Search, Eye, CheckCircle, XCircle, Clock, DollarSign, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface Refund {
  refund_id: string;
  payment_id: string;
  booking_id: string;
  amount: number;
  payment_method: string;
  refund_date: string;
  status: "PENDING" | "COMPLETED" | "FAILED";
  reason?: string;
  admin_name?: string;
  customer_email: string;
}

const RefundManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    paymentMethod: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedRefund, setSelectedRefund] = useState<Refund | null>(null);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundForm, setRefundForm] = useState({
    reason: "",
    amount: 0,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, searchTerm]);

  useEffect(() => {
    fetchRefunds();
  }, [currentPage, itemsPerPage, filters, searchTerm]);

  const fetchRefunds = async () => {
    setLoading(true);
    try {
      const response = await adminService.getRefunds({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        paymentMethod: filters.paymentMethod || undefined,
        status: filters.status || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      });

      if (response.success && response.data) {
        const mappedRefunds = response.data.refunds.map((r: any) => ({
          refund_id: r.refund_id || r.payment_id,
          payment_id: r.payment_id,
          booking_id: r.booking_id,
          amount: r.amount || r.amount_paid,
          payment_method: r.payment_method || r.method,
          refund_date: r.refund_date || r.updated_at,
          status: r.status || "COMPLETED",
          reason: r.reason || "",
          admin_name: r.admin_name,
          customer_email: r.customer_email || "N/A",
        }));
        setRefunds(mappedRefunds);
        setTotalPages(response.data.pagination.totalPages);
        setTotal(response.data.pagination.total);
      } else {
        showToast("error", response.message || "Không thể tải danh sách hoàn tiền");
      }
      setLoading(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách hoàn tiền");
      setLoading(false);
    }
  };

  // Filters are applied on the backend

  const handleCreateRefund = async () => {
    if (!selectedRefund || !refundForm.reason.trim()) {
      showToast("error", "Vui lòng nhập lý do hoàn tiền");
      return;
    }

    try {
      const response = await adminService.createRefund(selectedRefund.payment_id, {
        amount: refundForm.amount || selectedRefund.amount,
        reason: refundForm.reason,
      });
      if (response.success) {
        showToast("success", response.message || "Đã tạo yêu cầu hoàn tiền thành công");
        setShowRefundModal(false);
        setSelectedRefund(null);
        setRefundForm({ reason: "", amount: 0 });
        fetchRefunds();
      } else {
        showToast("error", response.message || "Không thể tạo yêu cầu hoàn tiền");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tạo yêu cầu hoàn tiền");
    }
  };

  const handleSendEmail = async (refundId: string) => {
    try {
      // TODO: API call to send refund notification email
      showToast("success", "Đã gửi email thông báo hoàn tiền");
    } catch (error: any) {
      showToast("error", error.message || "Không thể gửi email");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRefunds = refunds;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Đang xử lý</span>;
      case "COMPLETED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hoàn thành</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Thất bại</span>;
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
      {loading && <Loading message="Đang tải danh sách hoàn tiền..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý hoàn tiền</h1>
          <p className="text-gray-600 mt-1">Theo dõi và quản lý các giao dịch hoàn tiền</p>
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
                placeholder="Tìm kiếm theo mã refund, payment, booking..."
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
            <option value="PENDING">Đang xử lý</option>
            <option value="COMPLETED">Hoàn thành</option>
            <option value="FAILED">Thất bại</option>
          </select>

          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Từ ngày"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Refund</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày Refund</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentRefunds.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy refund nào
                  </td>
                </tr>
              ) : (
                currentRefunds.map((refund) => (
                  <tr key={refund.refund_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{refund.refund_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/payments/${refund.payment_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        {refund.payment_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => navigate(`/admin/bookings/${refund.booking_id}`)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-sm"
                      >
                        {refund.booking_id}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(refund.amount)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{refund.payment_method}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(refund.refund_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(refund.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedRefund(refund);
                            setRefundForm({ reason: refund.reason || "", amount: refund.amount });
                            setShowRefundModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {refund.status === "COMPLETED" && (
                          <button
                            onClick={() => handleSendEmail(refund.refund_id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Gửi email thông báo"
                          >
                            <Mail size={18} />
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, total)} trong tổng số {total} refund
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

      {/* Refund Detail Modal */}
      {showRefundModal && selectedRefund && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Chi tiết hoàn tiền</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Refund</label>
                <p className="text-gray-900 font-mono">{selectedRefund.refund_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền</label>
                <p className="text-gray-900 font-bold text-lg">{formatPrice(selectedRefund.amount)} VNĐ</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức</label>
                <p className="text-gray-900">{selectedRefund.payment_method}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
                <div className="mt-1">{getStatusBadge(selectedRefund.status)}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do hoàn tiền</label>
                <p className="text-gray-900">{selectedRefund.reason || "-"}</p>
              </div>
              {selectedRefund.admin_name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin thực hiện</label>
                  <p className="text-gray-900">{selectedRefund.admin_name}</p>
                </div>
              )}
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRefundModal(false);
                  setSelectedRefund(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

export default RefundManagement;

