import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Bed, Hotel, DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface DashboardStats {
  totalRoomTypes: number;
  totalRooms: number;
  activeRooms: number;
  maintenanceRooms: number;
  fullRooms: number;
  availableRooms: number;
  avgBasePrice: number;
  avgOccupancyRate: number;
  roomsByHotel: Array<{ hotel: string; count: number }>;
  bedsByType: Array<{ bedType: string; count: number }>;
  occupancyTrends: Array<{ month: string; rate: number }>;
  topRevenueRoomTypes: Array<{
    room_type_id: string;
    name: string;
    revenue: number;
    hotel_name: string;
  }>;
  topBookedRooms: Array<{
    room_id: string;
    room_number: string;
    room_type: string;
    booking_count: number;
    hotel_name: string;
  }>;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface DashboardProps {
  onSelectHotel?: (hotelId: string) => void;
}

const Dashboard = ({ onSelectHotel: _onSelectHotel }: DashboardProps = {}) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getRoomDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu dashboard");
      }
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu dashboard");
    } finally {
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Phòng</h1>
          <p className="text-gray-600 mt-1">Tổng quan hệ thống quản lý phòng</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số loại phòng</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalRoomTypes}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Bed className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số phòng vật lý</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.totalRooms}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.activeRooms} đang hoạt động</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Hotel className="text-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Giá trung bình</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {(stats.avgBasePrice / 1000).toFixed(0)}K
              </p>
              <p className="text-xs text-gray-500 mt-1">VNĐ/phòng/đêm</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <DollarSign className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ công suất</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.avgOccupancyRate}%</p>
              <p className="text-xs text-gray-500 mt-1">trung bình</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Room Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 rounded-full p-2">
              <CheckCircle className="text-green-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đang hoạt động</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 rounded-full p-2">
              <Clock className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Bảo trì</p>
              <p className="text-2xl font-bold text-gray-900">{stats.maintenanceRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 rounded-full p-2">
              <AlertCircle className="text-red-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Đầy</p>
              <p className="text-2xl font-bold text-gray-900">{stats.fullRooms}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 rounded-full p-2">
              <CheckCircle className="text-blue-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Còn trống</p>
              <p className="text-2xl font-bold text-gray-900">{stats.availableRooms}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rooms by Hotel - Bar Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Hotel className="text-blue-600" size={20} />
            Số lượng phòng theo khách sạn
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.roomsByHotel}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hotel" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Beds by Type - Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="text-green-600" size={20} />
            Phân bố loại giường
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.bedsByType}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ bedType, count }) => `${bedType}: ${count}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.bedsByType.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupancy Trends */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-purple-600" size={20} />
          Tỷ lệ công suất phòng theo tháng (12 tháng gần nhất)
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.occupancyTrends}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis domain={[0, 100]} />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Revenue Room Types */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="text-green-600" size={20} />
            Top loại phòng có doanh thu cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topRevenueRoomTypes.map((roomType, index) => (
              <div key={roomType.room_type_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{roomType.name}</p>
                  <p className="text-sm text-gray-600">{roomType.hotel_name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {(roomType.revenue / 1000000).toFixed(1)}M VNĐ
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Booked Rooms */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Bed className="text-blue-600" size={20} />
            Top phòng có giá trị booking cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topBookedRooms.map((room, index) => (
              <div key={room.room_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    Phòng {room.room_number} - {room.room_type}
                  </p>
                  <p className="text-sm text-gray-600">{room.hotel_name}</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {room.booking_count} bookings
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

