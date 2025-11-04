import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, DollarSign, CheckCircle, XCircle, Clock, TrendingUp, Users, Hotel } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  paidBookings: number;
  cancelledBookings: number;
  monthlyRevenue: number;
  bookingsByMonth: Array<{ month: string; count: number }>;
  bookingsByStatus: Array<{ status: string; count: number }>;
  revenueTrend: Array<{ date: string; revenue: number }>;
  topCustomers: Array<{
    account_id: string;
    full_name: string;
    email: string;
    booking_count: number;
    total_spent: number;
  }>;
  topHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    booking_count: number;
    revenue: number;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

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
          totalBookings: 1245,
          activeBookings: 342,
          paidBookings: 856,
          cancelledBookings: 47,
          monthlyRevenue: 2450000000,
          bookingsByMonth: [
            { month: "Th1", count: 85 },
            { month: "Th2", count: 92 },
            { month: "Th3", count: 108 },
            { month: "Th4", count: 125 },
            { month: "Th5", count: 142 },
            { month: "Th6", count: 168 },
            { month: "Th7", count: 195 },
            { month: "Th8", count: 178 },
            { month: "Th9", count: 165 },
            { month: "Th10", count: 152 },
            { month: "Th11", count: 138 },
            { month: "Th12", count: 97 },
          ],
          bookingsByStatus: [
            { status: "Paid", count: 856 },
            { status: "Confirmed", count: 342 },
            { status: "Created", count: 47 },
            { status: "Cancelled", count: 47 },
          ],
          revenueTrend: [
            { date: "01/11", revenue: 180000000 },
            { date: "05/11", revenue: 220000000 },
            { date: "10/11", revenue: 195000000 },
            { date: "15/11", revenue: 245000000 },
            { date: "20/11", revenue: 280000000 },
            { date: "25/11", revenue: 265000000 },
            { date: "30/11", revenue: 300000000 },
          ],
          topCustomers: [
            { account_id: "ACC001", full_name: "Nguyễn Văn A", email: "nguyenvana@email.com", booking_count: 12, total_spent: 45000000 },
            { account_id: "ACC002", full_name: "Trần Thị B", email: "tranthib@email.com", booking_count: 9, total_spent: 32000000 },
            { account_id: "ACC003", full_name: "Lê Văn C", email: "levanc@email.com", booking_count: 8, total_spent: 28000000 },
            { account_id: "ACC004", full_name: "Phạm Thị D", email: "phamthid@email.com", booking_count: 7, total_spent: 25000000 },
            { account_id: "ACC005", full_name: "Hoàng Văn E", email: "hoangvane@email.com", booking_count: 6, total_spent: 22000000 },
          ],
          topHotels: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", booking_count: 245, revenue: 680000000 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", booking_count: 198, revenue: 750000000 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", booking_count: 167, revenue: 520000000 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", booking_count: 134, revenue: 580000000 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", booking_count: 98, revenue: 320000000 },
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

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Booking</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống đặt phòng và doanh thu</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
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

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booking đang active</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeBookings}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <Clock className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booking đã thanh toán</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.paidBookings}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <CheckCircle className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booking bị hủy</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancelledBookings}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <XCircle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Doanh thu tháng này</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {(stats.monthlyRevenue / 1000000).toFixed(0)}M
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <DollarSign className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bookings by Month - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Số lượng booking theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.bookingsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Status - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Phân bổ booking theo trạng thái
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bookingsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, count }) => `${status}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.bookingsByStatus.map((_, index) => (
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
          <TrendingUp className="text-purple-600" size={20} />
          Doanh thu theo thời gian (tháng này)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.revenueTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => `${(value / 1000000).toFixed(0)}M VNĐ`} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Customers */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-blue-600" size={20} />
            Top 5 khách hàng đặt nhiều nhất
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
                  <p className="text-sm text-gray-600">{customer.email}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">{customer.booking_count} bookings</p>
                  <p className="text-xs text-gray-600">{(customer.total_spent / 1000000).toFixed(1)}M VNĐ</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="text-green-600" size={20} />
            Top 5 khách sạn có lượng booking cao nhất
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

export default Dashboard;

