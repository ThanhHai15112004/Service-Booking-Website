import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DollarSign, TrendingUp, CreditCard, XCircle, Calendar, Users, Hotel, FileText } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface PaymentDashboardStats {
  totalRevenue: number;
  todayRevenue: number;
  monthlyRevenue: number;
  totalTransactions: number;
  failedTransactions: number;
  refundedTransactions: number;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  paymentMethods: Array<{ method: string; count: number; revenue: number; percentage: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  topCustomers: Array<{
    account_id: string;
    full_name: string;
    total_spent: number;
  }>;
  topHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    revenue: number;
  }>;
  recentPayments: Array<{
    payment_id: string;
    booking_id: string;
    amount: number;
    method: string;
    status: string;
    created_at: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const PaymentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<PaymentDashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setStats({
          totalRevenue: 12450000000,
          todayRevenue: 45000000,
          monthlyRevenue: 2450000000,
          totalTransactions: 3456,
          failedTransactions: 87,
          refundedTransactions: 23,
          revenueByMonth: [
            { month: "Th1", revenue: 850000000 },
            { month: "Th2", revenue: 920000000 },
            { month: "Th3", revenue: 1080000000 },
            { month: "Th4", revenue: 1250000000 },
            { month: "Th5", revenue: 1420000000 },
            { month: "Th6", revenue: 1680000000 },
            { month: "Th7", revenue: 1950000000 },
            { month: "Th8", revenue: 1780000000 },
            { month: "Th9", revenue: 1650000000 },
            { month: "Th10", revenue: 1520000000 },
            { month: "Th11", revenue: 2450000000 },
            { month: "Th12", revenue: 0 },
          ],
          paymentMethods: [
            { method: "VNPAY", count: 1456, revenue: 4800000000, percentage: 38.5 },
            { method: "MOMO", count: 1234, revenue: 3900000000, percentage: 31.3 },
            { method: "CASH", count: 456, revenue: 1850000000, percentage: 14.9 },
            { method: "BANK", count: 310, revenue: 1900000000, percentage: 15.3 },
          ],
          revenueTrend: [
            { date: "01/11", revenue: 18000000 },
            { date: "05/11", revenue: 22000000 },
            { date: "10/11", revenue: 19500000 },
            { date: "15/11", revenue: 24500000 },
            { date: "20/11", revenue: 28000000 },
            { date: "25/11", revenue: 26500000 },
            { date: "30/11", revenue: 45000000 },
          ],
          topCustomers: [
            { account_id: "ACC001", full_name: "Nguyễn Văn A", total_spent: 45000000 },
            { account_id: "ACC002", full_name: "Trần Thị B", total_spent: 32000000 },
            { account_id: "ACC003", full_name: "Lê Văn C", total_spent: 28000000 },
            { account_id: "ACC004", full_name: "Phạm Thị D", total_spent: 25000000 },
            { account_id: "ACC005", full_name: "Hoàng Văn E", total_spent: 22000000 },
          ],
          topHotels: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", revenue: 680000000 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", revenue: 750000000 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", revenue: 520000000 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", revenue: 580000000 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", revenue: 320000000 },
          ],
          recentPayments: [
            { payment_id: "PAY001", booking_id: "BK001", amount: 3650000, method: "VNPAY", status: "SUCCESS", created_at: "2025-11-03T14:30:00" },
            { payment_id: "PAY002", booking_id: "BK002", amount: 8500000, method: "MOMO", status: "SUCCESS", created_at: "2025-11-03T13:20:00" },
            { payment_id: "PAY003", booking_id: "BK003", amount: 4200000, method: "CASH", status: "PENDING", created_at: "2025-11-03T12:15:00" },
            { payment_id: "PAY004", booking_id: "BK004", amount: 3200000, method: "BANK", status: "SUCCESS", created_at: "2025-11-03T11:00:00" },
            { payment_id: "PAY005", booking_id: "BK005", amount: 5500000, method: "VNPAY", status: "FAILED", created_at: "2025-11-03T10:30:00" },
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Thành công</span>;
      case "PENDING":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ</span>;
      case "FAILED":
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Thất bại</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Thanh toán</h1>
          <p className="text-gray-600 mt-1">Tổng quan tài chính và trạng thái thanh toán</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {(stats.totalRevenue / 1000000000).toFixed(1)}B
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu hôm nay</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {(stats.todayRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
              <p className="text-2xl font-bold text-purple-600 mt-2">
                {(stats.monthlyRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Số lượng giao dịch</p>
              <p className="text-2xl font-bold text-orange-600 mt-2">{stats.totalTransactions}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <CreditCard className="text-orange-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Giao dịch thất bại</p>
              <p className="text-2xl font-bold text-red-600 mt-2">{stats.failedTransactions}</p>
              <p className="text-xs text-gray-500 mt-1">Hoàn tiền: {stats.refundedTransactions}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-green-600" size={20} />
            Doanh thu theo tháng
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={20} />
            Tỷ lệ phương thức thanh toán
          </h3>
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

      {/* Revenue Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-blue-600" size={20} />
          Xu hướng doanh thu (30 ngày gần nhất)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Top khách hàng chi tiêu cao nhất
          </h3>
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

        {/* Top Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="text-green-600" size={20} />
            Top khách sạn có doanh thu cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.hotel_name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {(hotel.revenue / 1000000).toFixed(0)}M VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="text-purple-600" size={20} />
          Các giao dịch gần nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Payment</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phương thức</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số tiền</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentPayments.map((payment) => (
                <tr key={payment.payment_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{payment.payment_id}</td>
                  <td className="px-4 py-3 text-sm text-blue-600">{payment.booking_id}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{payment.method}</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{formatPrice(payment.amount)} VNĐ</td>
                  <td className="px-4 py-3">{getStatusBadge(payment.status)}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(payment.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDashboard;

