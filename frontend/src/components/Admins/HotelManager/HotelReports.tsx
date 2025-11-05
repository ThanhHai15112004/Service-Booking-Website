import { useState, useEffect } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Calendar, TrendingUp, Filter } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const HotelReports = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [filters, setFilters] = useState({
    period: "30",
    city: "",
    category: "",
  });
  const [reportData, setReportData] = useState<any>(null);

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelReports({
        period: filters.period,
        city: filters.city || undefined,
        category: filters.category || undefined,
      });

      if (response.success && response.data) {
        setReportData(response.data);
      } else {
        showToast("error", response.message || "Không thể tải báo cáo");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  if (loading) {
    return <Loading message="Đang tải báo cáo..." />;
  }

  if (!reportData) {
    return <div className="text-center py-12 text-gray-500">Không có dữ liệu</div>;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo</h1>
          <p className="text-gray-600 mt-1">Phân tích hiệu suất khách sạn</p>
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
            <option value="7">7 ngày qua</option>
            <option value="30">30 ngày qua</option>
            <option value="90">90 ngày qua</option>
            <option value="365">1 năm qua</option>
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả thành phố</option>
            <option value="Hà Nội">Hà Nội</option>
            <option value="Hồ Chí Minh">Hồ Chí Minh</option>
            <option value="Đà Nẵng">Đà Nẵng</option>
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả danh mục</option>
            <option value="Khách sạn">Khách sạn</option>
            <option value="Resort">Resort</option>
            <option value="Homestay">Homestay</option>
          </select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Tổng số booking</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{reportData.summary.totalBookings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Tổng doanh thu</p>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {(reportData.summary.totalRevenue / 1000000000).toFixed(1)}B VNĐ
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Reviews mới</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">{reportData.summary.newReviews}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm font-medium text-gray-600">Rating trung bình</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{reportData.summary.avgRating}</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Doanh thu theo khách sạn</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reportData.revenueByHotel}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotel" />
            <YAxis />
            <Tooltip formatter={(value) => `${(value / 1000000).toFixed(1)}M VNĐ`} />
            <Legend />
            <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cancellation Rate Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tỷ lệ hủy đặt</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={reportData.cancellationRate}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hotel" />
            <YAxis />
            <Tooltip formatter={(value) => `${value}%`} />
            <Legend />
            <Line type="monotone" dataKey="rate" stroke="#ef4444" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Hotels Detail Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <h3 className="text-lg font-semibold text-gray-900 p-6 pb-0">Chi tiết theo khách sạn</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reviews</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Doanh thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reportData.hotelsDetail.map((hotel: any, index: number) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{hotel.hotel}</td>
                  <td className="px-6 py-4 text-gray-600">{hotel.bookings}</td>
                  <td className="px-6 py-4 text-gray-600">{hotel.reviews}</td>
                  <td className="px-6 py-4 text-gray-600">{hotel.avgRating}</td>
                  <td className="px-6 py-4 text-gray-900 font-medium">
                    {(hotel.revenue / 1000000).toFixed(1)}M VNĐ
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top khách sạn nổi bật</h3>
        <div className="space-y-3">
          {reportData.topHotels.map((hotel: any, index: number) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">{hotel.hotel}</p>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={20} />
                <span className="text-lg font-bold text-gray-900">{hotel.score}</span>
                <span className="text-sm text-gray-500">/100</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HotelReports;

