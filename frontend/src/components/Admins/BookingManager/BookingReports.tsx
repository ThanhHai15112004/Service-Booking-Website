import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, DollarSign, TrendingUp, Users, Hotel, XCircle, CreditCard, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface ReportStats {
  totalBookings: number;
  totalRevenue: number;
  cancelledRate: number;
  paymentMethods: Array<{ method: string; count: number; revenue: number }>;
  topCustomers: Array<{
    account_id: string;
    full_name: string;
    total_spent: number;
    booking_count: number;
  }>;
  topHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    booking_count: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  cancellationTrend: Array<{ month: string; cancelled: number; total: number }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const BookingReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [filters, setFilters] = useState({
    period: "month", // 7days, month, quarter
    city: "",
    hotel: "",
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Mock data
      setTimeout(() => {
        setStats({
          totalBookings: 1245,
          totalRevenue: 3450000000,
          cancelledRate: 3.8,
          paymentMethods: [
            { method: "VNPAY", count: 456, revenue: 1200000000 },
            { method: "MOMO", count: 389, revenue: 980000000 },
            { method: "CASH", count: 245, revenue: 650000000 },
            { method: "BANK", count: 155, revenue: 620000000 },
          ],
          topCustomers: [
            { account_id: "ACC001", full_name: "Nguyễn Văn A", total_spent: 45000000, booking_count: 12 },
            { account_id: "ACC002", full_name: "Trần Thị B", total_spent: 32000000, booking_count: 9 },
            { account_id: "ACC003", full_name: "Lê Văn C", total_spent: 28000000, booking_count: 8 },
            { account_id: "ACC004", full_name: "Phạm Thị D", total_spent: 25000000, booking_count: 7 },
            { account_id: "ACC005", full_name: "Hoàng Văn E", total_spent: 22000000, booking_count: 6 },
          ],
          topHotels: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", booking_count: 245, revenue: 680000000 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", booking_count: 198, revenue: 750000000 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", booking_count: 167, revenue: 520000000 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", booking_count: 134, revenue: 580000000 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", booking_count: 98, revenue: 320000000 },
          ],
          revenueByMonth: [
            { month: "Th1", revenue: 280000000 },
            { month: "Th2", revenue: 320000000 },
            { month: "Th3", revenue: 380000000 },
            { month: "Th4", revenue: 420000000 },
            { month: "Th5", revenue: 480000000 },
            { month: "Th6", revenue: 550000000 },
            { month: "Th7", revenue: 620000000 },
            { month: "Th8", revenue: 580000000 },
            { month: "Th9", revenue: 540000000 },
            { month: "Th10", revenue: 500000000 },
            { month: "Th11", revenue: 460000000 },
            { month: "Th12", revenue: 380000000 },
          ],
          cancellationTrend: [
            { month: "Th1", cancelled: 5, total: 85 },
            { month: "Th2", cancelled: 4, total: 92 },
            { month: "Th3", cancelled: 6, total: 108 },
            { month: "Th4", cancelled: 3, total: 125 },
            { month: "Th5", cancelled: 5, total: 142 },
            { month: "Th6", cancelled: 7, total: 168 },
            { month: "Th7", cancelled: 8, total: 195 },
            { month: "Th8", cancelled: 6, total: 178 },
            { month: "Th9", cancelled: 4, total: 165 },
            { month: "Th10", cancelled: 5, total: 152 },
            { month: "Th11", cancelled: 3, total: 138 },
            { month: "Th12", cancelled: 4, total: 97 },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu báo cáo");
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

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo Booking</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất kinh doanh từ các booking</p>
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
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả thành phố</option>
            <option value="Hanoi">Hà Nội</option>
            <option value="DaNang">Đà Nẵng</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
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
              <p className="text-sm font-medium text-gray-600">Tổng số booking</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalBookings}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {(stats.totalRevenue / 1000000).toFixed(0)}M
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
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hủy booking</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelledRate}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Phương thức phổ biến</p>
              <p className="text-xl font-bold text-purple-600 mt-2">{stats.paymentMethods[0]?.method}</p>
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
            Phương thức thanh toán phổ biến
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.paymentMethods}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ method, count }) => `${method}: ${count}`}
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

      {/* Cancellation Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <XCircle className="text-red-600" size={20} />
          Tỷ lệ hủy đặt / hoàn tiền
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.cancellationTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="cancelled" stroke="#ef4444" strokeWidth={2} name="Hủy" dot={{ fill: "#ef4444", r: 4 }} />
            <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2} name="Tổng" dot={{ fill: "#3b82f6", r: 4 }} />
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
                  <p className="text-sm text-gray-600">{customer.booking_count} bookings</p>
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
            Top khách sạn có nhiều booking
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
                  <p className="text-sm text-gray-600">{hotel.booking_count} bookings</p>
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
    </div>
  );
};

export default BookingReports;
