import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { DollarSign, Download, Filter, Building2, CreditCard, TrendingUp, Calendar } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface RevenueReport {
  totalRevenue: number;
  revenueByPeriod: {
    daily: Array<{ date: string; revenue: number }>;
    weekly: Array<{ week: string; revenue: number }>;
    monthly: Array<{ month: string; revenue: number }>;
    yearly: Array<{ year: string; revenue: number }>;
  };
  revenueByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByCity: Array<{
    city: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByRoomType: Array<{
    room_type: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByPaymentMethod: Array<{
    method: string;
    revenue: number;
    percentage: number;
  }>;
  revenueByPackage: Array<{
    package_name: string;
    revenue: number;
    percentage: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const RevenueReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<RevenueReport | null>(null);
  const [filters, setFilters] = useState({
    period: "month",
    startDate: "",
    endDate: "",
    hotel: "",
    paymentMethod: "",
    viewType: "monthly" as "daily" | "weekly" | "monthly" | "yearly",
  });

  useEffect(() => {
    fetchRevenueReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.startDate, filters.endDate, filters.hotel, filters.paymentMethod, filters.viewType]);

  const fetchRevenueReport = async () => {
    setLoading(true);
    try {
      const params: any = {
        viewType: filters.viewType,
      };
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.hotel) params.hotel_id = filters.hotel;
      if (filters.paymentMethod) params.paymentMethod = filters.paymentMethod;

      const result = await adminService.getRevenueReports(params);
      if (result.success && result.data) {
        setReport(result.data);
      } else {
        showToast("error", result.message || "Không thể tải báo cáo doanh thu");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải báo cáo doanh thu");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "EXCEL" | "PDF") => {
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
    return <Loading message="Đang tải báo cáo doanh thu..." />;
  }

  if (!report) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getRevenueData = () => {
    switch (filters.viewType) {
      case "daily":
        return report.revenueByPeriod.daily;
      case "weekly":
        return report.revenueByPeriod.weekly;
      case "monthly":
        return report.revenueByPeriod.monthly;
      case "yearly":
        return report.revenueByPeriod.yearly;
      default:
        return report.revenueByPeriod.monthly;
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Doanh thu</h1>
          <p className="text-gray-600 mt-1">Theo dõi và phân tích doanh thu theo nhiều chiều</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("EXCEL")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Excel
          </button>
          <button
            onClick={() => handleExport("PDF")}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      {/* Total Revenue Card */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-green-100 text-sm font-medium mb-2">Tổng doanh thu toàn hệ thống</p>
            <p className="text-4xl font-bold">{formatPrice(report.totalRevenue)}</p>
          </div>
          <div className="bg-white bg-opacity-20 rounded-full p-4">
            <DollarSign size={48} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <select
            value={filters.viewType}
            onChange={(e) => setFilters({ ...filters, viewType: e.target.value as any })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="daily">Theo ngày</option>
            <option value="weekly">Theo tuần</option>
            <option value="monthly">Theo tháng</option>
            <option value="yearly">Theo năm</option>
          </select>
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
          </select>
          <select
            value={filters.paymentMethod}
            onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả phương thức</option>
            <option value="VNPay">VNPay</option>
            <option value="Momo">Momo</option>
            <option value="Cash">Cash</option>
            <option value="Bank Transfer">Bank Transfer</option>
          </select>
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
        </div>
      </div>

      {/* Revenue Trend Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          Doanh thu theo thời gian
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={getRevenueData()}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={filters.viewType === "daily" ? "date" : filters.viewType === "weekly" ? "week" : filters.viewType === "monthly" ? "month" : filters.viewType === "yearly" ? "year" : "month"} />
            <YAxis />
            <Tooltip formatter={(value: number) => formatPrice(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={{ fill: "#10b981", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Hotel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-blue-600" size={20} />
            Top 10 khách sạn có doanh thu cao nhất
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={report.revenueByHotel} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="hotel_name" type="category" width={150} />
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={20} />
            Doanh thu theo phương thức thanh toán
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={report.revenueByPaymentMethod}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, percentage }) => `${method}: ${percentage}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="revenue"
              >
                {report.revenueByPaymentMethod.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatPrice(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue by City */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo thành phố</h3>
          <div className="space-y-3">
            {report.revenueByCity.map((city) => (
              <div key={city.city}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{city.city}</span>
                  <span className="text-sm text-gray-600">{city.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${city.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatPrice(city.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Room Type */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo loại phòng</h3>
          <div className="space-y-3">
            {report.revenueByRoomType.map((type) => (
              <div key={type.room_type}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{type.room_type}</span>
                  <span className="text-sm text-gray-600">{type.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${type.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatPrice(type.revenue)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue by Package */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo gói tài khoản</h3>
          <div className="space-y-3">
            {report.revenueByPackage.map((pkg) => (
              <div key={pkg.package_name}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{pkg.package_name}</span>
                  <span className="text-sm text-gray-600">{pkg.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${pkg.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{formatPrice(pkg.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueReports;

