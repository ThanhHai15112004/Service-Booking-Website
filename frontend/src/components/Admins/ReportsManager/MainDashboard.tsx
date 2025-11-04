import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, DollarSign, Users, Building2, Bed, TrendingUp, TrendingDown, Clock, AlertCircle, CheckCircle, XCircle, MessageSquare, Wrench, FileText } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DashboardStats {
  bookings: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  revenue: {
    today: number;
    week: number;
    month: number;
    total: number;
  };
  newUsers: number;
  totalHotels: number;
  activeRooms: number;
  occupancyRate: number;
  cancellationRate: number;
  revenueByDate: Array<{ date: string; revenue: number }>;
  bookingsByStatus: Array<{ status: string; count: number; percentage: number }>;
  topBookedHotels: Array<{ hotel_id: string; hotel_name: string; bookings: number }>;
  newUsersTrend: Array<{ date: string; count: number }>;
  recentBookings: Array<{
    booking_id: string;
    customer_name: string;
    hotel_name: string;
    status: string;
    created_at: string;
  }>;
  upcomingCheckIns: Array<{
    booking_id: string;
    customer_name: string;
    hotel_name: string;
    check_in_date: string;
  }>;
  maintenanceRooms: Array<{
    room_id: string;
    room_number: string;
    hotel_name: string;
    room_type: string;
    maintenance_start: string;
  }>;
  pendingRequests: {
    newReviews: number;
    refunds: number;
    emailVerifications: number;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const MainDashboard = () => {
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
      setTimeout(() => {
        setStats({
          bookings: {
            today: 45,
            week: 312,
            month: 1245,
            total: 15678,
          },
          revenue: {
            today: 125000000,
            week: 850000000,
            month: 3450000000,
            total: 45678000000,
          },
          newUsers: 234,
          totalHotels: 156,
          activeRooms: 3420,
          occupancyRate: 78.5,
          cancellationRate: 8.2,
          revenueByDate: [
            { date: "01/11", revenue: 85000000 },
            { date: "02/11", revenue: 95000000 },
            { date: "03/11", revenue: 110000000 },
            { date: "04/11", revenue: 125000000 },
            { date: "05/11", revenue: 145000000 },
            { date: "06/11", revenue: 135000000 },
            { date: "07/11", revenue: 150000000 },
          ],
          bookingsByStatus: [
            { status: "PAID", count: 8567, percentage: 54.7 },
            { status: "CONFIRMED", count: 4234, percentage: 27.0 },
            { status: "CREATED", count: 1876, percentage: 12.0 },
            { status: "CANCELLED", count: 1001, percentage: 6.3 },
          ],
          topBookedHotels: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", bookings: 456 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", bookings: 389 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", bookings: 298 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", bookings: 234 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", bookings: 187 },
          ],
          newUsersTrend: [
            { date: "01/11", count: 45 },
            { date: "02/11", count: 52 },
            { date: "03/11", count: 48 },
            { date: "04/11", count: 61 },
            { date: "05/11", count: 58 },
            { date: "06/11", count: 55 },
            { date: "07/11", count: 62 },
          ],
          recentBookings: [
            { booking_id: "BK001", customer_name: "Nguyễn Văn A", hotel_name: "Hanoi Old Quarter Hotel", status: "PAID", created_at: "2025-11-07T14:30:00" },
            { booking_id: "BK002", customer_name: "Trần Thị B", hotel_name: "My Khe Beach Resort", status: "CONFIRMED", created_at: "2025-11-07T13:20:00" },
            { booking_id: "BK003", customer_name: "Lê Văn C", hotel_name: "Saigon Riverside Hotel", status: "CREATED", created_at: "2025-11-07T12:15:00" },
            { booking_id: "BK004", customer_name: "Phạm Thị D", hotel_name: "Sofitel Metropole", status: "PAID", created_at: "2025-11-07T11:00:00" },
            { booking_id: "BK005", customer_name: "Hoàng Văn E", hotel_name: "Da Nang Beach Hotel", status: "CANCELLED", created_at: "2025-11-07T10:30:00" },
          ],
          upcomingCheckIns: [
            { booking_id: "BK006", customer_name: "Nguyễn Văn F", hotel_name: "Hanoi Old Quarter Hotel", check_in_date: "2025-11-07" },
            { booking_id: "BK007", customer_name: "Trần Thị G", hotel_name: "My Khe Beach Resort", check_in_date: "2025-11-07" },
            { booking_id: "BK008", customer_name: "Lê Văn H", hotel_name: "Saigon Riverside Hotel", check_in_date: "2025-11-08" },
            { booking_id: "BK009", customer_name: "Phạm Thị I", hotel_name: "Sofitel Metropole", check_in_date: "2025-11-08" },
          ],
          maintenanceRooms: [
            { room_id: "R001", room_number: "101", hotel_name: "Hanoi Old Quarter Hotel", room_type: "Standard", maintenance_start: "2025-11-05" },
            { room_id: "R002", room_number: "205", hotel_name: "My Khe Beach Resort", room_type: "Deluxe", maintenance_start: "2025-11-06" },
            { room_id: "R003", room_number: "301", hotel_name: "Saigon Riverside Hotel", room_type: "Suite", maintenance_start: "2025-11-04" },
          ],
          pendingRequests: {
            newReviews: 23,
            refunds: 8,
            emailVerifications: 45,
          },
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
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      PAID: { bg: "bg-green-100", text: "text-green-800", label: "Đã thanh toán" },
      CONFIRMED: { bg: "bg-blue-100", text: "text-blue-800", label: "Đã xác nhận" },
      CREATED: { bg: "bg-yellow-100", text: "text-yellow-800", label: "Đã tạo" },
      CANCELLED: { bg: "bg-red-100", text: "text-red-800", label: "Đã hủy" },
    };
    const badge = badges[status] || badges.CREATED;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Tổng quan</h1>
          <p className="text-gray-600 mt-1">Tổng quan về tình hình vận hành toàn hệ thống</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 rounded-full p-3">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-2xl font-bold text-blue-600">{stats.bookings.today}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tuần này:</span>
              <span className="font-medium">{stats.bookings.week}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tháng này:</span>
              <span className="font-medium">{stats.bookings.month}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Tổng:</span>
              <span className="font-bold text-gray-900">{stats.bookings.total.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Hôm nay</p>
              <p className="text-2xl font-bold text-green-600">{formatPrice(stats.revenue.today)}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tuần này:</span>
              <span className="font-medium">{formatPrice(stats.revenue.week)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tháng này:</span>
              <span className="font-medium">{formatPrice(stats.revenue.month)}</span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
              <span className="text-gray-600 font-medium">Tổng:</span>
              <span className="font-bold text-gray-900">{formatPrice(stats.revenue.total)}</span>
            </div>
          </div>
        </div>

        {/* New Users */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Users className="text-purple-600" size={24} />
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">User mới</p>
              <p className="text-2xl font-bold text-purple-600">{stats.newUsers}</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tổng khách sạn:</span>
              <span className="font-medium">{stats.totalHotels}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Phòng hoạt động:</span>
              <span className="font-medium">{stats.activeRooms.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Occupancy & Cancellation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-yellow-100 rounded-full p-2">
                  <TrendingUp className="text-yellow-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Tỷ lệ lấp đầy</span>
              </div>
              <p className="text-2xl font-bold text-yellow-600">{stats.occupancyRate}%</p>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="bg-red-100 rounded-full p-2">
                  <TrendingDown className="text-red-600" size={20} />
                </div>
                <span className="text-sm text-gray-600">Tỷ lệ hủy</span>
              </div>
              <p className="text-xl font-bold text-red-600">{stats.cancellationRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Date */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Doanh thu theo ngày
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.revenueByDate}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatPrice(value)} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bookings by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Booking theo trạng thái
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bookingsByStatus}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, percentage }) => `${status}: ${percentage}%`}
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

      {/* Top Hotels & New Users Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Booked Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-purple-600" size={20} />
            Hotel được đặt nhiều nhất
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.topBookedHotels}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hotel_name" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="bookings" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* New Users Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="text-orange-600" size={20} />
            Xu hướng user mới đăng ký
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={stats.newUsersTrend}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b", r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Real-time Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="text-blue-600" size={20} />
            Booking gần đây
          </h3>
          <div className="space-y-3">
            {stats.recentBookings.map((booking) => (
              <div key={booking.booking_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{booking.booking_id}</p>
                  <p className="text-sm text-gray-600 truncate">{booking.customer_name} - {booking.hotel_name}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatDateTime(booking.created_at)}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  {getStatusBadge(booking.status)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Check-ins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={20} />
            Booking sắp check-in
          </h3>
          <div className="space-y-3">
            {stats.upcomingCheckIns.map((booking) => (
              <div key={booking.booking_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{booking.booking_id}</p>
                  <p className="text-sm text-gray-600 truncate">{booking.customer_name} - {booking.hotel_name}</p>
                  <p className="text-xs text-gray-500 mt-1">Check-in: {booking.check_in_date}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Sắp đến
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Maintenance & Pending Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Maintenance Rooms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Wrench className="text-orange-600" size={20} />
            Phòng cần bảo trì
          </h3>
          <div className="space-y-3">
            {stats.maintenanceRooms.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Không có phòng nào cần bảo trì</p>
            ) : (
              stats.maintenanceRooms.map((room) => (
                <div key={room.room_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-orange-100 bg-orange-50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{room.hotel_name}</p>
                    <p className="text-sm text-gray-600 truncate">Phòng {room.room_number} - {room.room_type}</p>
                    <p className="text-xs text-gray-500 mt-1">Bắt đầu: {room.maintenance_start}</p>
                  </div>
                  <div className="flex-shrink-0 ml-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      Bảo trì
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Requests */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-yellow-600" size={20} />
            Yêu cầu xử lý
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg border border-yellow-100 bg-yellow-50">
              <div className="flex items-center gap-3">
                <MessageSquare className="text-yellow-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Review mới</p>
                  <p className="text-xs text-gray-600">Cần duyệt</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-yellow-600">{stats.pendingRequests.newReviews}</span>
                <button className="text-yellow-600 hover:text-yellow-800">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-red-100 bg-red-50">
              <div className="flex items-center gap-3">
                <DollarSign className="text-red-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Hoàn tiền</p>
                  <p className="text-xs text-gray-600">Cần xử lý</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-600">{stats.pendingRequests.refunds}</span>
                <button className="text-red-600 hover:text-red-800">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-blue-100 bg-blue-50">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-600" size={24} />
                <div>
                  <p className="text-sm font-medium text-gray-900">Xác minh email</p>
                  <p className="text-xs text-gray-600">Đang chờ</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">{stats.pendingRequests.emailVerifications}</span>
                <button className="text-blue-600 hover:text-blue-800">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;

