import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Download, CheckCircle, XCircle, Clock, DollarSign, CreditCard, History, User, Calendar, CreditCard as CardIcon, Building2, ArrowRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface PaymentDetail {
  payment_id: string;
  booking_id: string;
  payment_method: string;
  amount_due: number;
  amount_paid: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  created_at: string;
  updated_at?: string;
  gateway?: string;
  transaction_id?: string;
  card_type?: string;
  card_last4?: string;
  card_holder_name?: string;
  customer_name: string;
  customer_email: string;
  hotel_name: string;
  status_history: Array<{
    id: number;
    date: string;
    old_status: string;
    new_status: string;
    admin_name?: string;
    note?: string;
  }>;
}

const PaymentDetail = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [payment, setPayment] = useState<PaymentDetail | null>(null);

  useEffect(() => {
    if (paymentId) {
      fetchPaymentDetail();
    }
  }, [paymentId]);

  const fetchPaymentDetail = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setPayment({
          payment_id: paymentId || "PAY001",
          booking_id: "BK001",
          payment_method: "VNPAY",
          amount_due: 3650000,
          amount_paid: 3650000,
          status: "SUCCESS",
          created_at: "2025-11-01T10:30:00",
          updated_at: "2025-11-01T10:35:00",
          gateway: "VNPAY",
          transaction_id: "VNPAY20251101103012345678",
          card_type: "Visa",
          card_last4: "1234",
          card_holder_name: "NGUYEN VAN A",
          customer_name: "Nguyễn Văn A",
          customer_email: "nguyenvana@email.com",
          hotel_name: "Hanoi Old Quarter Hotel",
          status_history: [
            {
              id: 1,
              date: "2025-11-01T10:30:00",
              old_status: "PENDING",
              new_status: "SUCCESS",
              admin_name: "system",
              note: "callback VNPAY",
            },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải chi tiết thanh toán");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">Chờ thanh toán</span>;
      case "SUCCESS":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Thành công</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Thất bại</span>;
      case "REFUNDED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">Đã hoàn tiền</span>;
      default:
        return null;
    }
  };

  if (loading) {
    return <Loading message="Đang tải chi tiết thanh toán..." />;
  }

  if (!payment) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy thanh toán</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/payments")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chi tiết thanh toán</h1>
            <p className="text-gray-600 mt-1">Payment ID: {payment.payment_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FileText size={18} />
            Xem booking
          </button>
          <button
            onClick={() => {
              // TODO: Export invoice
              showToast("success", "Đang xuất hóa đơn...");
            }}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            Xuất hóa đơn
          </button>
        </div>
      </div>

      {/* Payment Info Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Thông tin giao dịch</h2>
          {getStatusBadge(payment.status)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Payment</label>
              <p className="text-gray-900 font-mono">{payment.payment_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Booking</label>
              <button
                onClick={() => navigate(`/admin/bookings/${payment.booking_id}`)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-mono"
              >
                {payment.booking_id}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán</label>
              <p className="text-gray-900">{payment.payment_method}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền cần trả</label>
              <p className="text-gray-900 font-bold text-lg">{formatPrice(payment.amount_due)} VNĐ</p>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền đã trả</label>
              <p className="text-gray-900 font-bold text-lg text-green-600">{formatPrice(payment.amount_paid)} VNĐ</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
              <p className="text-gray-900">{formatDateTime(payment.created_at)}</p>
            </div>
            {payment.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cập nhật</label>
                <p className="text-gray-900">{formatDateTime(payment.updated_at)}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card/Gateway Info */}
      {(payment.gateway || payment.card_type) && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CardIcon className="text-blue-600" size={24} />
            Thông tin thẻ / Gateway
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {payment.gateway && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gateway</label>
                <p className="text-gray-900">{payment.gateway}</p>
              </div>
            )}
            {payment.transaction_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
                <p className="text-gray-900 font-mono text-sm">{payment.transaction_id}</p>
              </div>
            )}
            {payment.card_type && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại thẻ</label>
                <p className="text-gray-900">{payment.card_type}</p>
              </div>
            )}
            {payment.card_last4 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">4 số cuối thẻ</label>
                <p className="text-gray-900 font-mono">**** **** **** {payment.card_last4}</p>
              </div>
            )}
            {payment.card_holder_name && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên chủ thẻ</label>
                <p className="text-gray-900">{payment.card_holder_name}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Customer & Hotel Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Thông tin khách hàng
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
              <p className="text-gray-900">{payment.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{payment.customer_email}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-green-600" size={24} />
            Thông tin khách sạn
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách sạn</label>
              <p className="text-gray-900">{payment.hotel_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <History className="text-purple-600" size={24} />
          Lịch sử thay đổi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thời gian</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái cũ → mới</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Người thực hiện</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {payment.status_history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Không có lịch sử thay đổi
                  </td>
                </tr>
              ) : (
                payment.status_history.map((history) => (
                  <tr key={history.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(history.date)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{history.old_status}</span>
                        <ArrowRight size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{history.new_status}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{history.admin_name || "system"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{history.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetail;

