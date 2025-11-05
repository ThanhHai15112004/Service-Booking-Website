import { useState, useEffect } from "react";
import { TrendingUp, Calendar, DollarSign, Star, BarChart3 } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface HotelStatsTabProps {
  hotelId: string;
}

const HotelStatsTab = ({ hotelId }: HotelStatsTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, [hotelId]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelStatistics(hotelId);
      if (response.success && response.data) {
        setStats(response.data);
      } else {
        showToast("error", response.message || "Không thể tải thống kê");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải thống kê");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải thống kê..." />;
  }

  if (!stats) {
    return <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
                {(stats.totalRevenue / 1000000).toFixed(1)}M
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
              <p className="text-sm font-medium text-gray-600">Rating trung bình</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{stats.avgRating}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.reviewCount} reviews</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Star className="text-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ hủy</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.cancellationRate}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <TrendingUp className="text-red-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Booking Trends Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="text-blue-600" size={20} />
          Xu hướng booking theo tháng
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={stats.monthlyBookings}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HotelStatsTab;

