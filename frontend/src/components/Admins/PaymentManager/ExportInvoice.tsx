import { useState } from "react";
import { Download, FileText, Mail, CheckCircle } from "lucide-react";
import Toast from "../../Toast";

interface ExportInvoiceProps {
  paymentId?: string;
  bookingId?: string;
  onClose?: () => void;
}

const ExportInvoice = ({ paymentId, bookingId, onClose }: ExportInvoiceProps) => {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleExport = async (format: "PDF" | "EMAIL") => {
    setLoading(true);
    try {
      // TODO: API call to export invoice
      if (format === "PDF") {
        showToast("success", "Đang xuất hóa đơn PDF...");
        // Simulate download
        setTimeout(() => {
          showToast("success", "Đã xuất hóa đơn PDF thành công!");
          setLoading(false);
        }, 1500);
      } else {
        showToast("success", "Đang gửi email hóa đơn...");
        setTimeout(() => {
          showToast("success", "Đã gửi email hóa đơn thành công!");
          setLoading(false);
          if (onClose) onClose();
        }, 1500);
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất hóa đơn");
      setLoading(false);
    }
  };

  const handleBatchExport = async () => {
    setLoading(true);
    try {
      // TODO: API call to batch export invoices
      showToast("success", "Đang xuất hàng loạt hóa đơn...");
      setTimeout(() => {
        showToast("success", "Đã xuất hàng loạt hóa đơn thành công!");
        setLoading(false);
      }, 2000);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất hàng loạt hóa đơn");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xuất hóa đơn</h1>
        <p className="text-gray-600 mt-1">Xuất hóa đơn PDF hoặc gửi email cho khách hàng</p>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Single Invoice Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Xuất hóa đơn đơn lẻ</h2>
          {paymentId && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Payment ID:</p>
              <p className="font-mono text-gray-900">{paymentId}</p>
            </div>
          )}
          {bookingId && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Booking ID:</p>
              <p className="font-mono text-gray-900">{bookingId}</p>
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={() => handleExport("PDF")}
              disabled={loading || (!paymentId && !bookingId)}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span className="font-medium">Xuất PDF</span>
              </div>
              <Download size={18} />
            </button>
            <button
              onClick={() => handleExport("EMAIL")}
              disabled={loading || (!paymentId && !bookingId)}
              className="w-full flex items-center justify-between px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center gap-3">
                <Mail size={20} />
                <span className="font-medium">Gửi email</span>
              </div>
              <CheckCircle size={18} />
            </button>
          </div>
        </div>

        {/* Batch Export */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Xuất hàng loạt</h2>
          <p className="text-sm text-gray-600 mb-4">
            Xuất hóa đơn cho nhiều booking/payment cùng lúc
          </p>
          <div className="space-y-3">
            <button
              onClick={handleBatchExport}
              disabled={loading}
              className="w-full flex items-center justify-between px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText size={20} />
                <span className="font-medium">Xuất hàng loạt PDF</span>
              </div>
              <Download size={18} />
            </button>
          </div>
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              💡 Lưu ý: Bạn có thể chọn nhiều payment từ danh sách thanh toán và xuất hàng loạt.
            </p>
          </div>
        </div>
      </div>

      {/* Invoice Template Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Thông tin hóa đơn</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>• Hóa đơn bao gồm: Logo hệ thống, thông tin khách hàng, chi tiết phòng, thuế, chiết khấu, phương thức thanh toán</p>
          <p>• Mã QR xác thực hóa đơn (tùy chọn)</p>
          <p>• Template có thể tùy chỉnh theo khách sạn hoặc hệ thống</p>
        </div>
      </div>
    </div>
  );
};

export default ExportInvoice;

