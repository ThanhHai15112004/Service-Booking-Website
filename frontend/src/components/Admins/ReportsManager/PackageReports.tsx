import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Package, DollarSign, Users, TrendingUp, Download, Filter, TrendingDown } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface PackageReport {
  totalUsersByPackage: Array<{
    package_name: string;
    user_count: number;
    percentage: number;
  }>;
  revenueByPackage: Array<{
    package_name: string;
    revenue: number;
    percentage: number;
  }>;
  monthlyRecurringRevenue: Array<{
    month: string;
    revenue: number;
  }>;
  mostPopularPackage: {
    package_name: string;
    user_count: number;
    revenue: number;
  };
  renewalRate: number;
  cancellationRate: number;
  packageStats: Array<{
    package_name: string;
    total_users: number;
    active_users: number;
    cancelled_users: number;
    total_revenue: number;
    monthly_revenue: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PackageReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [report, setReport] = useState<PackageReport | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    package: "",
  });

  useEffect(() => {
    fetchPackageReport();
  }, [filters]);

  const fetchPackageReport = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReport({
          totalUsersByPackage: [
            { package_name: "Premium", user_count: 5234, percentage: 42.0 },
            { package_name: "Standard", user_count: 4123, percentage: 33.1 },
            { package_name: "Basic", user_count: 3099, percentage: 24.9 },
          ],
          revenueByPackage: [
            { package_name: "Premium", revenue: 22839000000, percentage: 50.0 },
            { package_name: "Standard", revenue: 13703400000, percentage: 30.0 },
            { package_name: "Basic", revenue: 9135600000, percentage: 20.0 },
          ],
          monthlyRecurringRevenue: [
            { month: "Th1", revenue: 2850000000 },
            { month: "Th2", revenue: 3200000000 },
            { month: "Th3", revenue: 3450000000 },
            { month: "Th4", revenue: 3800000000 },
            { month: "Th5", revenue: 3950000000 },
            { month: "Th6", revenue: 4100000000 },
          ],
          mostPopularPackage: {
            package_name: "Premium",
            user_count: 5234,
            revenue: 22839000000,
          },
          renewalRate: 85.5,
          cancellationRate: 14.5,
          packageStats: [
            {
              package_name: "Premium",
              total_users: 5234,
              active_users: 4456,
              cancelled_users: 778,
              total_revenue: 22839000000,
              monthly_revenue: 1903250000,
            },
            {
              package_name: "Standard",
              total_users: 4123,
              active_users: 3589,
              cancelled_users: 534,
              total_revenue: 13703400000,
              monthly_revenue: 1141950000,
            },
            {
              package_name: "Basic",
              total_users: 3099,
              active_users: 2678,
              cancelled_users: 421,
              total_revenue: 9135600000,
              monthly_revenue: 761300000,
            },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải báo cáo gói tài khoản");
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
    return <Loading message="Đang tải báo cáo gói tài khoản..." />;
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

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Gói Tài khoản</h1>
          <p className="text-gray-600 mt-1">Phân tích doanh thu & hành vi sử dụng gói tài khoản</p>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Gói phổ biến nhất</p>
          <p className="text-2xl font-bold text-blue-600">{report.mostPopularPackage.package_name}</p>
          <p className="text-sm text-gray-600 mt-1">{report.mostPopularPackage.user_count.toLocaleString()} users</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ gia hạn</p>
          <p className="text-3xl font-bold text-green-600">{report.renewalRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ hủy</p>
          <p className="text-3xl font-bold text-red-600">{report.cancellationRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Doanh thu gói hiện tại</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatPrice(report.monthlyRecurringRevenue[report.monthlyRecurringRevenue.length - 1]?.revenue || 0)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
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
          <select
            value={filters.package}
            onChange={(e) => setFilters({ ...filters, package: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả gói</option>
            <option value="Premium">Premium</option>
            <option value="Standard">Standard</option>
            <option value="Basic">Basic</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Package */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Số user theo gói
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={report.totalUsersByPackage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ package_name, percentage }) => `${package_name}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="user_count"
              >
                {report.totalUsersByPackage.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue by Package */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Doanh thu theo gói
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={report.revenueByPackage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="package_name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Legend />
              <Bar dataKey="revenue" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Recurring Revenue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={20} />
          Doanh thu gói theo tháng (Monthly Recurring Revenue)
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={report.monthlyRecurringRevenue}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatPrice(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} dot={{ fill: "#8b5cf6", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Package Stats Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết từng gói</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gói</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cancelled users</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tổng doanh thu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu/tháng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report.packageStats.map((pkg) => (
                <tr key={pkg.package_name} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Package className="text-blue-600" size={18} />
                      <span className="text-sm font-medium text-gray-900">{pkg.package_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{pkg.total_users.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {pkg.active_users.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {pkg.cancelled_users.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(pkg.total_revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-purple-600">{formatPrice(pkg.monthly_revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rate Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewal Rate */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp className="text-green-600" size={20} />
              Tỷ lệ gia hạn
            </h3>
            <p className="text-3xl font-bold text-green-600">{report.renewalRate}%</p>
          </div>
          <div className="w-full bg-green-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all"
              style={{ width: `${report.renewalRate}%` }}
            />
          </div>
        </div>

        {/* Cancellation Rate */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <TrendingDown className="text-red-600" size={20} />
              Tỷ lệ hủy
            </h3>
            <p className="text-3xl font-bold text-red-600">{report.cancellationRate}%</p>
          </div>
          <div className="w-full bg-red-200 rounded-full h-3">
            <div
              className="bg-red-600 h-3 rounded-full transition-all"
              style={{ width: `${report.cancellationRate}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackageReports;

