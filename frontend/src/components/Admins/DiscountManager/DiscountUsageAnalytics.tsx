import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tag, TrendingDown, DollarSign, Filter, Download, TrendingUp, Users } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface UsageAnalytics {
  totalUsage: number;
  totalDiscountAmount: number;
  usageRate: number; // Tỷ lệ áp dụng mã trên tổng booking
  topCodesByUsage: Array<{
    code: string;
    usage_count: number;
    discount_amount: number;
  }>;
  topCodesByRevenue: Array<{
    code: string;
    usage_count: number;
    discount_amount: number;
  }>;
  usageByType: Array<{ type: string; usage_count: number; percentage: number }>;
  usageByDay: Array<{ date: string; usage_count: number }>;
  discountByCode: Array<{ code: string; discount_amount: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DiscountUsageAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [filters, setFilters] = useState({
    period: "month", // 7days, month, quarter
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
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

      const result = await adminService.getDiscountUsageAnalytics(params);
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu thống kê");
      }
    } catch (error: any) {
      console.error("[DiscountUsageAnalytics] fetchAnalytics error:", error);
      showToast("error", error.message || "Không thể tải dữ liệu thống kê");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu thống kê..." />;
  }

  if (!analytics) {
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
          <h1 className="text-3xl font-bold text-gray-900">Thống kê hiệu suất mã</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu quả của các mã giảm giá</p>
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
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số mã được dùng</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{analytics.totalUsage}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng tiền giảm giá</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {(analytics.totalDiscountAmount / 1000000).toFixed(0)}M
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
              <p className="text-sm font-medium text-gray-600">Tỷ lệ áp dụng mã</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{analytics.usageRate}%</p>
              <p className="text-xs text-gray-500 mt-1">Trên tổng booking</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Usage by Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ loại mã theo usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.usageByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="usage_count"
              >
                {analytics.usageByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Usage by Day */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lượng mã dùng theo ngày</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analytics.usageByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage_count" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discount by Code */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu 'mất đi' theo mã</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.discountByCode}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="code" angle={-45} textAnchor="end" height={100} />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
            <Legend />
            <Bar dataKey="discount_amount" fill="#ef4444" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by Usage */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top mã theo lượt dùng</h3>
          <div className="space-y-3">
            {analytics.topCodesByUsage.map((code, index) => (
              <div key={code.code} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate font-mono">{code.code}</p>
                  <p className="text-sm text-gray-600">{code.usage_count} lượt sử dụng</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {(code.discount_amount / 1000000).toFixed(1)}M VNĐ
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top by Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top mã theo doanh thu giảm</h3>
          <div className="space-y-3">
            {analytics.topCodesByRevenue.map((code, index) => (
              <div key={code.code} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate font-mono">{code.code}</p>
                  <p className="text-sm text-gray-600">{formatPrice(code.discount_amount)} VNĐ</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">{code.usage_count} lượt</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountUsageAnalytics;

