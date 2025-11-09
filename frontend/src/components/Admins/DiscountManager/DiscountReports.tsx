import { useState, useEffect } from "react";
import { Download, FileText, Filter, Tag, DollarSign, TrendingUp, TrendingDown, Users, XCircle, CheckCircle, BarChart3 } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface DiscountReport {
  totalUsageByCode: Array<{
    code: string;
    usage_count: number;
    discount_amount: number;
  }>;
  totalDiscountRevenue: number;
  topCodeByBooking: Array<{
    code: string;
    booking_count: number;
  }>;
  expiredUnusedCodes: Array<{
    code: string;
    expiry_date: string;
    usage_count: number;
  }>;
  refundRateWithCode: number;
  usageByCustomer: Array<{
    customer_name: string;
    usage_count: number;
    total_saved: number;
  }>;
  usageByHotel: Array<{
    hotel_name: string;
    usage_count: number;
    discount_amount: number;
  }>;
}

const DiscountReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<DiscountReport | null>(null);
  const [filters, setFilters] = useState({
    period: "month", // 7days, month, quarter, year
    startDate: "",
    endDate: "",
    groupBy: "code", // code, customer, hotel
  });
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.period) {
        params.period = filters.period;
      }
      if (filters.startDate) {
        params.startDate = filters.startDate;
      }
      if (filters.endDate) {
        params.endDate = filters.endDate;
      }
      if (filters.groupBy) {
        params.groupBy = filters.groupBy;
      }

      const result = await adminService.getDiscountReports(params);
      if (result.success && result.data) {
        setReport(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      console.error("[DiscountReports] fetchReports error:", error);
      showToast("error", error.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "CSV" | "EXCEL" | "PDF") => {
    try {
      setLoading(true);
      const exportData = {
        format,
        period: filters.period,
        startDate: filters.startDate,
        endDate: filters.endDate,
        groupBy: filters.groupBy,
      };

      const result = await adminService.exportDiscountReport(exportData);
      if (result.success) {
        if (format === "CSV") {
          showToast("success", result.message || "Đã xuất file CSV thành công");
        } else {
          showToast("success", result.message || `Dữ liệu đã sẵn sàng để xuất ${format}`);
          // For EXCEL and PDF, frontend can use libraries like xlsx or jsPDF
          console.log("Export data:", result.data);
        }
        setShowExportModal(false);
      } else {
        showToast("error", result.message || "Không thể xuất báo cáo");
      }
    } catch (error: any) {
      console.error("[DiscountReports] handleExport error:", error);
      showToast("error", error.message || "Không thể xuất báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu báo cáo..." />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

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

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo & Xuất dữ liệu</h1>
          <p className="text-gray-600 mt-1">Tổng hợp toàn bộ thông tin về hiệu quả mã giảm giá</p>
        </div>
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          <Download size={18} />
          Xuất dữ liệu
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="7days">7 ngày qua</option>
            <option value="month">Tháng này</option>
            <option value="quarter">Quý này</option>
            <option value="year">Năm này</option>
            <option value="custom">Tùy chọn</option>
          </select>
          {filters.period === "custom" && (
            <>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Từ ngày"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Đến ngày"
              />
            </>
          )}
          <select
            value={filters.groupBy}
            onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="code">Nhóm theo mã</option>
            <option value="customer">Nhóm theo khách hàng</option>
            <option value="hotel">Nhóm theo khách sạn</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng lượt dùng</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {report.totalUsageByCode.reduce((sum, item) => sum + item.usage_count, 0)}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu bị giảm</p>
              <p className="text-2xl font-bold text-red-600 mt-2">
                {(report.totalDiscountRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hoàn tiền</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{report.refundRateWithCode}%</p>
              <p className="text-xs text-gray-500 mt-1">Với booking có mã</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <XCircle className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã hết hạn chưa dùng</p>
              <p className="text-2xl font-bold text-gray-600 mt-2">{report.expiredUnusedCodes.length}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <Tag className="text-gray-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Reports Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Total Usage by Code */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="text-blue-600" size={20} />
            Tổng lượt dùng theo mã
          </h3>
          <div className="space-y-3">
            {report.totalUsageByCode.map((item, index) => (
              <div key={item.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-mono">{item.code}</p>
                    <p className="text-sm text-gray-600">{item.usage_count} lượt</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-red-600">{formatPrice(item.discount_amount)} VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Code by Booking */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Mã nào tạo nhiều booking nhất
          </h3>
          <div className="space-y-3">
            {report.topCodeByBooking.map((item, index) => (
              <div key={item.code} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 font-mono">{item.code}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{item.booking_count} bookings</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expired Unused Codes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <XCircle className="text-red-600" size={20} />
            Mã hết hạn / chưa dùng
          </h3>
          <div className="space-y-3">
            {report.expiredUnusedCodes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Không có mã nào hết hạn chưa dùng</p>
            ) : (
              report.expiredUnusedCodes.map((item) => (
                <div key={item.code} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900 font-mono">{item.code}</p>
                    <p className="text-sm text-gray-600">Hết hạn: {formatDate(item.expiry_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{item.usage_count} lượt</p>
                    <p className="text-xs text-red-600">Chưa sử dụng</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Usage by Customer/Hotel */}
        {filters.groupBy === "customer" ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="text-purple-600" size={20} />
              Theo khách hàng
            </h3>
            <div className="space-y-3">
              {report.usageByCustomer.map((item, index) => (
                <div key={item.customer_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.customer_name}</p>
                    <p className="text-sm text-gray-600">{item.usage_count} lượt sử dụng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">{formatPrice(item.total_saved)} VNĐ</p>
                    <p className="text-xs text-gray-500">Tiết kiệm</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Tag className="text-indigo-600" size={20} />
              Theo khách sạn
            </h3>
            <div className="space-y-3">
              {report.usageByHotel.map((item, index) => (
                <div key={item.hotel_name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{item.hotel_name}</p>
                    <p className="text-sm text-gray-600">{item.usage_count} lượt sử dụng</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-red-600">{formatPrice(item.discount_amount)} VNĐ</p>
                    <p className="text-xs text-gray-500">Giảm giá</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xuất báo cáo mã giảm giá</h3>
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

export default DiscountReports;

