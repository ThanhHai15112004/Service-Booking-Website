import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Tag, TrendingDown, Calendar, Users, DollarSign, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DiscountDashboardStats {
  totalActive: number;
  expiringSoon: number;
  expiredDisabled: number;
  monthlyUsage: number;
  totalDiscountAmount: number;
  codesCreatedByMonth: Array<{ month: string; count: number }>;
  discountTypeDistribution: Array<{ type: string; count: number; percentage: number }>;
  discountRevenueTrend: Array<{ date: string; amount: number }>;
  topCodes: Array<{
    code: string;
    usage_count: number;
    discount_amount: number;
  }>;
  topUsers: Array<{
    account_id: string;
    full_name: string;
    usage_count: number;
    total_saved: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const DiscountDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<DiscountDashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setStats({
          totalActive: 45,
          expiringSoon: 8,
          expiredDisabled: 23,
          monthlyUsage: 1245,
          totalDiscountAmount: 185000000,
          codesCreatedByMonth: [
            { month: "Th1", count: 5 },
            { month: "Th2", count: 8 },
            { month: "Th3", count: 12 },
            { month: "Th4", count: 15 },
            { month: "Th5", count: 18 },
            { month: "Th6", count: 22 },
            { month: "Th7", count: 25 },
            { month: "Th8", count: 20 },
            { month: "Th9", count: 18 },
            { month: "Th10", count: 15 },
            { month: "Th11", count: 45 },
            { month: "Th12", count: 0 },
          ],
          discountTypeDistribution: [
            { type: "Percent", count: 35, percentage: 58.3 },
            { type: "Fixed", count: 25, percentage: 41.7 },
          ],
          discountRevenueTrend: [
            { date: "01/11", amount: 12000000 },
            { date: "05/11", amount: 18000000 },
            { date: "10/11", amount: 15000000 },
            { date: "15/11", amount: 22000000 },
            { date: "20/11", amount: 25000000 },
            { date: "25/11", amount: 28000000 },
            { date: "30/11", amount: 35000000 },
          ],
          topCodes: [
            { code: "SUMMER2025", usage_count: 456, discount_amount: 68000000 },
            { code: "WELCOME10", usage_count: 389, discount_amount: 45000000 },
            { code: "BLACKFRIDAY", usage_count: 298, discount_amount: 52000000 },
            { code: "NEWUSER20", usage_count: 234, discount_amount: 38000000 },
            { code: "WEEKEND15", usage_count: 187, discount_amount: 28000000 },
          ],
          topUsers: [
            { account_id: "ACC001", full_name: "Nguyễn Văn A", usage_count: 12, total_saved: 4500000 },
            { account_id: "ACC002", full_name: "Trần Thị B", usage_count: 9, total_saved: 3200000 },
            { account_id: "ACC003", full_name: "Lê Văn C", usage_count: 8, total_saved: 2800000 },
            { account_id: "ACC004", full_name: "Phạm Thị D", usage_count: 7, total_saved: 2500000 },
            { account_id: "ACC005", full_name: "Hoàng Văn E", usage_count: 6, total_saved: 2200000 },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu dashboard");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu dashboard..." />;
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Mã giảm giá</h1>
          <p className="text-gray-600 mt-1">Tổng quan hoạt động và hiệu quả của mã giảm giá</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số mã đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalActive}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã sắp hết hạn</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.expiringSoon}</p>
              <p className="text-xs text-gray-500 mt-1">Trong 7 ngày tới</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <AlertCircle className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Mã hết hạn / vô hiệu</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.expiredDisabled}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lượt sử dụng tháng này</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.monthlyUsage}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Tag className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng tiền giảm giá</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {(stats.totalDiscountAmount / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingDown className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Codes Created by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Số lượng mã được tạo theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.codesCreatedByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Discount Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="text-green-600" size={20} />
            Tỷ lệ loại mã (Percent / Fixed)
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.discountTypeDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${type}: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.discountTypeDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Discount Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingDown className="text-red-600" size={20} />
          Doanh thu "giảm" theo thời gian
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.discountRevenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
            <Legend />
            <Line type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Codes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Tag className="text-purple-600" size={20} />
            Top 5 mã được dùng nhiều nhất
          </h3>
          <div className="space-y-3">
            {stats.topCodes.map((code, index) => (
              <div key={code.code} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white">
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
                  <p className="text-xs text-gray-500">Giảm giá</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Top user sử dụng mã nhiều nhất
          </h3>
          <div className="space-y-3">
            {stats.topUsers.map((user, index) => (
              <div key={user.account_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{user.full_name}</p>
                  <p className="text-sm text-gray-600">{user.usage_count} mã đã dùng</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-green-600">
                    {(user.total_saved / 1000000).toFixed(1)}M VNĐ
                  </p>
                  <p className="text-xs text-gray-500">Tiết kiệm</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscountDashboard;

