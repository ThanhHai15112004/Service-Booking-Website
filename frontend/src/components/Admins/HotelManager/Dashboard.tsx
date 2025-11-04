import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Building2, TrendingUp, Star, Calendar, MapPin, Hotel, CheckCircle, Clock } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface DashboardStats {
  totalHotels: number;
  activeHotels: number;
  inactiveHotels: number;
  pendingHotels: number;
  topRatedHotels: number;
  avgBookingsPerHotel: number;
  hotelsByCity: Array<{ city: string; count: number }>;
  hotelsByCategory: Array<{ category: string; count: number }>;
  bookingTrends: Array<{ month: string; bookings: number }>;
  topBookedHotels: Array<{
    hotel_id: string;
    name: string;
    booking_count: number;
    main_image?: string;
  }>;
  topRatedHotelsList: Array<{
    hotel_id: string;
    name: string;
    avg_rating: number;
    review_count: number;
    main_image?: string;
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
      // const response = await adminService.getHotelDashboardStats();
      // setStats(response.data);

      // Mock data for now
      setTimeout(() => {
        setStats({
          totalHotels: 156,
          activeHotels: 142,
          inactiveHotels: 8,
          pendingHotels: 6,
          topRatedHotels: 24,
          avgBookingsPerHotel: 45.8,
          hotelsByCity: [
            { city: "Hà Nội", count: 42 },
            { city: "Hồ Chí Minh", count: 38 },
            { city: "Đà Nẵng", count: 28 },
            { city: "Nha Trang", count: 22 },
            { city: "Phú Quốc", count: 16 },
            { city: "Hội An", count: 10 },
          ],
          hotelsByCategory: [
            { category: "Khách sạn", count: 89 },
            { category: "Resort", count: 45 },
            { category: "Homestay", count: 22 },
          ],
          bookingTrends: [
            { month: "Th1", bookings: 1240 },
            { month: "Th2", bookings: 1380 },
            { month: "Th3", bookings: 1520 },
            { month: "Th4", bookings: 1690 },
            { month: "Th5", bookings: 1820 },
            { month: "Th6", bookings: 1950 },
            { month: "Th7", bookings: 2100 },
            { month: "Th8", bookings: 2240 },
            { month: "Th9", bookings: 2380 },
            { month: "Th10", bookings: 2520 },
            { month: "Th11", bookings: 2680 },
            { month: "Th12", bookings: 2850 },
          ],
          topBookedHotels: [
            { hotel_id: "H001", name: "Hanoi Old Quarter Hotel", booking_count: 342, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H002", name: "My Khe Beach Resort", booking_count: 289, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H003", name: "Saigon Riverside Hotel", booking_count: 256, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H004", name: "Sofitel Legend Metropole", booking_count: 234, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H005", name: "Da Nang Beachfront Hotel", booking_count: 198, main_image: "https://via.placeholder.com/150" },
          ],
          topRatedHotelsList: [
            { hotel_id: "H004", name: "Sofitel Legend Metropole", avg_rating: 9.3, review_count: 450, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H002", name: "My Khe Beach Resort", avg_rating: 8.7, review_count: 312, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H003", name: "Saigon Riverside Hotel", avg_rating: 8.5, review_count: 289, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H001", name: "Hanoi Old Quarter Hotel", avg_rating: 8.2, review_count: 256, main_image: "https://via.placeholder.com/150" },
            { hotel_id: "H005", name: "Da Nang Beachfront Hotel", avg_rating: 8.0, review_count: 198, main_image: "https://via.placeholder.com/150" },
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Khách Sạn</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý khách sạn</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số khách sạn</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalHotels}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Building2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang hoạt động</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.activeHotels}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.inactiveHotels} không hoạt động</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Đang chờ duyệt</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.pendingHotels}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Booking trung bình</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.avgBookingsPerHotel}</p>
              <p className="text-xs text-gray-500 mt-1">mỗi khách sạn</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <TrendingUp className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Hotels by City - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin className="text-blue-600" size={20} />
            Số lượng khách sạn theo thành phố
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.hotelsByCity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="city" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Hotels by Category - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="text-green-600" size={20} />
            Phân bố theo danh mục
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.hotelsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, count }) => `${category}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.hotelsByCategory.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Booking Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={20} />
          Xu hướng booking theo tháng (12 tháng gần nhất)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.bookingTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="bookings" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Hotels Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Booked Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Top khách sạn được đặt nhiều nhất
          </h3>
          <div className="space-y-3">
            {stats.topBookedHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                {hotel.main_image && (
                  <img src={hotel.main_image} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.name}</p>
                  <p className="text-sm text-gray-600">{hotel.booking_count} lượt đặt</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {hotel.booking_count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Rated Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-600" size={20} />
            Top khách sạn có rating cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topRatedHotelsList.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                {hotel.main_image && (
                  <img src={hotel.main_image} alt={hotel.name} className="w-16 h-16 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="text-yellow-500 fill-yellow-500" size={14} />
                    <span className="text-sm font-semibold text-gray-900">{hotel.avg_rating}</span>
                    <span className="text-xs text-gray-500">({hotel.review_count} reviews)</span>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    {hotel.avg_rating}
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

