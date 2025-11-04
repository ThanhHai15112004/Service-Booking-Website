import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, DollarSign, CreditCard, ChevronLeft, ChevronRight, Plus, X } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface ManualPayment {
  payment_id: string;
  booking_id: string;
  customer_name: string;
  hotel_name: string;
  payment_method: "CASH" | "BANK_TRANSFER";
  amount: number;
  created_at: string;
  note?: string;
}

const ManualConfirmation = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [payments, setPayments] = useState<ManualPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ManualPayment[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedPayment, setSelectedPayment] = useState<ManualPayment | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [confirmForm, setConfirmForm] = useState({
    admin_name: "admin01",
    received_date: new Date().toISOString().split("T")[0],
    note: "",
  });
  const [rejectForm, setRejectForm] = useState({
    reason: "",
  });

  useEffect(() => {
    fetchManualPayments();
  }, []);

  useEffect(() => {
    setFilteredPayments(payments);
  }, [payments]);

  const fetchManualPayments = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call - filter by method CASH/BANK_TRANSFER and status PENDING
      setTimeout(() => {
        setPayments([
          {
            payment_id: "PAY003",
            booking_id: "BK003",
            customer_name: "Lê Văn C",
            hotel_name: "Saigon Riverside Hotel",
            payment_method: "CASH",
            amount: 4200000,
            created_at: "2025-11-03T09:15:00",
            note: "Khách sẽ thanh toán tại quầy",
          },
          {
            payment_id: "PAY004",
            booking_id: "BK004",
            customer_name: "Phạm Thị D",
            hotel_name: "Hanoi Old Quarter Hotel",
            payment_method: "BANK_TRANSFER",
            amount: 3200000,
            created_at: "2025-11-02T14:20:00",
            note: "Đã chuyển khoản",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách thanh toán thủ công");
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!selectedPayment) return;

    try {
      // TODO: API call to confirm payment
      showToast("success", `Đã xác nhận thanh toán ${selectedPayment.payment_id}`);
      setShowConfirmModal(false);
      setSelectedPayment(null);
      setConfirmForm({ admin_name: "admin01", received_date: new Date().toISOString().split("T")[0], note: "" });
      fetchManualPayments();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xác nhận thanh toán");
    }
  };

  const handleReject = async () => {
    if (!selectedPayment || !rejectForm.reason.trim()) {
      showToast("error", "Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      // TODO: API call to reject payment
      showToast("success", `Đã từ chối thanh toán ${selectedPayment.payment_id}`);
      setShowRejectModal(false);
      setSelectedPayment(null);
      setRejectForm({ reason: "" });
      fetchManualPayments();
    } catch (error: any) {
      showToast("error", error.message || "Không thể từ chối thanh toán");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPayments = filteredPayments.slice(startIndex, endIndex);

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
      {loading && <Loading message="Đang tải danh sách thanh toán thủ công..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xác nhận thanh toán thủ công</h1>
          <p className="text-gray-600 mt-1">Xác nhận các thanh toán bằng tiền mặt hoặc chuyển khoản</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Có {filteredPayments.length} thanh toán đang chờ xác nhận
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Vui lòng xác nhận sau khi đã nhận được tiền từ khách hàng hoặc kiểm tra chuyển khoản.
            </p>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    Không có thanh toán nào chờ xác nhận
                  </td>
                </tr>
              ) : (
                currentPayments.map((payment) => (
                  <tr key={payment.payment_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.payment_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">{payment.booking_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {payment.payment_method === "CASH" ? "Tiền mặt" : "Chuyển khoản"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatPrice(payment.amount)} VNĐ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(payment.created_at)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{payment.note || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowConfirmModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Xác nhận"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPayment(payment);
                            setShowRejectModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Từ chối"
                        >
                          <XCircle size={18} />
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
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredPayments.length)} trong tổng số {filteredPayments.length} thanh toán
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

      {/* Confirm Modal */}
      {showConfirmModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận đã nhận tiền</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện *</label>
                <input
                  type="text"
                  value={confirmForm.admin_name}
                  onChange={(e) => setConfirmForm({ ...confirmForm, admin_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày nhận tiền *</label>
                <input
                  type="date"
                  value={confirmForm.received_date}
                  onChange={(e) => setConfirmForm({ ...confirmForm, received_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ghi chú</label>
                <textarea
                  value={confirmForm.note}
                  onChange={(e) => setConfirmForm({ ...confirmForm, note: e.target.value })}
                  placeholder="Nhập ghi chú về việc nhận tiền..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối thanh toán</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Payment</label>
                <p className="text-gray-900 font-mono">{selectedPayment.payment_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối *</label>
                <textarea
                  value={rejectForm.reason}
                  onChange={(e) => setRejectForm({ reason: e.target.value })}
                  placeholder="Nhập lý do từ chối thanh toán..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedPayment(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle size={18} />
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManualConfirmation;

