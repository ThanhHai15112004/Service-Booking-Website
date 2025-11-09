import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, DollarSign, TrendingUp, Users, Hotel, XCircle, CreditCard, Filter, Download } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface PaymentReportStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  successRate: number;
  failureRate: number;
  refundCount: number;
  refundAmount: number;
  paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
  revenueByDay: Array<{ date: string; revenue: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  failureRateTrend: Array<{ date: string; rate: number }>;
  revenueByHotel: Array<{ hotel_id: string; hotel_name: string; revenue: number }>;
  topCustomers: Array<{
    account_id: string;
    full_name: string;
    total_spent: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PaymentReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<PaymentReportStats | null>(null);
  const [filters, setFilters] = useState({
    period: "month", // 7days, month, quarter, year
    paymentMethod: "",
    hotel: "",
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminService.getPaymentReports({
        period: filters.period as "7days" | "month" | "quarter" | "year",
        paymentMethod: filters.paymentMethod || undefined,
        hotelId: filters.hotel || undefined,
      });

      if (response.success && response.data) {
        setStats({
          totalRevenue: response.data.totalRevenue || 0,
          todayRevenue: response.data.todayRevenue || 0,
          monthlyRevenue: response.data.monthlyRevenue || 0,
          successRate: response.data.successRate || 0,
          failureRate: response.data.failureRate || 0,
          refundCount: response.data.refundCount || 0,
          refundAmount: response.data.refundAmount || 0,
          paymentMethods: response.data.paymentMethods || [],
          revenueByDay: response.data.revenueByDay || [],
          revenueByMonth: response.data.revenueByMonth || [],
          failureRateTrend: response.data.failureRateTrend || [],
          revenueByHotel: response.data.revenueByHotel || [],
          topCustomers: response.data.topCustomers || [],
        });
      } else {
        showToast("error", response.message || "Không thể tải dữ liệu báo cáo");
      }
      setLoading(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu báo cáo");
      setLoading(false);
    }
  };

  const handleExport = async (format: "CSV" | "PDF" | "EXCEL") => {
    try {
      // TODO: API call to export
      showToast("success", `Đang xuất báo cáo ${format}...`);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất báo cáo");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu báo cáo..." />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo thanh toán</h1>
          <p className="text-gray-600 mt-1">Phân tích doanh thu và trạng thái thanh toán</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("CSV")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            PDF
          </button>
          <button
            onClick={() => handleExport("EXCEL")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            Excel
          </button>
        </div>
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
          </select>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả phương thức</option>
            <option value="VNPAY">VNPAY</option>
            <option value="MOMO">MOMO</option>
            <option value="CASH">Tiền mặt</option>
            <option value="BANK">Chuyển khoản</option>
          </select>
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
            <option value="H003">Saigon Riverside Hotel</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {(stats.monthlyRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ thành công</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{stats.successRate}%</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <TrendingUp className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ thất bại</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.failureRate}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Số lần hoàn tiền</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">{stats.refundCount}</p>
              <p className="text-xs text-gray-500 mt-1">{(stats.refundAmount / 1000000).toFixed(0)}M VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CreditCard className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.revenueByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ phương thức thanh toán</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.paymentMethods.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue Trend & Failure Rate */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Xu hướng doanh thu</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Failure Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ lỗi thanh toán</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.failureRateTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => `${value}%`} />
              <Legend />
              <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue by Hotel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo khách sạn</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.revenueByHotel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotel_name" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
            <Legend />
            <Bar dataKey="revenue" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Customers */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top khách hàng chi tiêu cao nhất</h3>
        <div className="space-y-3">
          {stats.topCustomers.map((customer, index) => (
            <div key={customer.account_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">{customer.full_name}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-medium text-gray-900">
                  {(customer.total_spent / 1000000).toFixed(1)}M VNĐ
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaymentReports;

