import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { FileText, Calendar, Filter, TrendingUp } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

interface PromotionReportsData {
  total_promotions: number;
  active_count: number;
  inactive_count: number;
  expired_count: number;
  top_promotions: Array<{
    promotion_id: string;
    name: string;
    total_discount_amount: number;
    affected_schedules: number;
  }>;
  by_type: Array<{
    type: string;
    count: number;
    active_count: number;
  }>;
}

const PromotionReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reports, setReports] = useState<PromotionReportsData | null>(null);
  const [filters, setFilters] = useState({
    period: "month",
    startDate: "",
    endDate: "",
    type: "",
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {
        period: filters.period,
      };

      if (filters.startDate && filters.endDate) {
        params.startDate = filters.startDate;
        params.endDate = filters.endDate;
        delete params.period;
      }

      if (filters.type) {
        params.type = filters.type;
      }

      const result = await adminService.getPromotionReports(params);
      if (result.success && result.data) {
        setReports(result.data);
      } else {
        showToast("error", result.message || "Không thể tải báo cáo");
      }
    } catch (error: any) {
      console.error("[PromotionReports] fetchReports error:", error);
      showToast("error", error.message || "Không thể tải báo cáo");
    } finally {
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

  if (loading) {
    return <Loading message="Đang tải báo cáo..." />;
  }

  if (!reports) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const typeDistribution = reports.by_type.map((item, index) => ({
    name: item.type,
    value: item.count,
    color: COLORS[index % COLORS.length],
  }));

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Promotion</h1>
          <p className="text-gray-600 mt-1">Thống kê và phân tích các chiến dịch khuyến mãi</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <select
            value={filters.period}
            onChange={(e) => setFilters({ ...filters, period: e.target.value, startDate: "", endDate: "" })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="today">Hôm nay</option>
            <option value="week">7 ngày qua</option>
            <option value="month">30 ngày qua</option>
            <option value="year">365 ngày qua</option>
            <option value="custom">Tùy chọn</option>
          </select>

          {filters.period === "custom" && (
            <>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ngày bắt đầu"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ngày kết thúc"
              />
            </>
          )}

          <select
            value={filters.type}
            onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả loại</option>
            <option value="PROVIDER">Provider</option>
            <option value="SYSTEM">System</option>
            <option value="BOTH">Both</option>
          </select>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số promotion</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{reports.total_promotions}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <FileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{reports.active_count}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tạm ngưng</p>
              <p className="text-3xl font-bold text-gray-600 mt-2">{reports.inactive_count}</p>
            </div>
            <div className="bg-gray-100 rounded-full p-3">
              <Calendar className="text-gray-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Hết hạn</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{reports.expired_count}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <Calendar className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Type Distribution */}
        {typeDistribution.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Phân bố theo loại</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top Promotions */}
        {reports.top_promotions && reports.top_promotions.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Promotions</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reports.top_promotions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value: number) => formatPrice(value)} />
                <Legend />
                <Bar dataKey="total_discount_amount" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Top Promotions Table */}
      {reports.top_promotions && reports.top_promotions.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Promotions theo tiền giảm</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên promotion</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số schedules</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng tiền giảm</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reports.top_promotions.map((promo) => (
                  <tr key={promo.promotion_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{promo.name}</td>
                    <td className="px-4 py-3 text-gray-600">{promo.affected_schedules}</td>
                    <td className="px-4 py-3 text-gray-900 font-medium">{formatPrice(promo.total_discount_amount)} VNĐ</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromotionReports;

