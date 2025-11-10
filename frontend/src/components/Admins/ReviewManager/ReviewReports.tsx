import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { Star, TrendingUp, TrendingDown, Download, Filter, Building2, Users, AlertCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface ReviewReportStats {
  averageRatingByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  reviewsByMonth: Array<{ month: string; count: number }>;
  positiveRate: number;
  negativeRate: number;
  topRatedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  topComplainedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    low_rating_count: number;
  }>;
  ratingByCriteria: Array<{
    criteria: string;
    average_rating: number;
  }>;
}

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];

const ReviewReports = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<ReviewReportStats | null>(null);
  const [filters, setFilters] = useState({
    period: "month",
    city: "",
    category: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetchReports();
  }, [filters]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params: any = {
        period: filters.period,
      };

      if (filters.city) params.city = filters.city;
      if (filters.category) params.category = filters.category;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

      const result = await adminService.getReviewReports(params);
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu báo cáo");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu báo cáo");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: "CSV" | "PDF" | "EXCEL") => {
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
    return <Loading message="Đang tải dữ liệu báo cáo..." />;
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không có dữ liệu</p>
      </div>
    );
  }

  // Convert rating from backend (1-5) to display (1-10) - nhân đôi để hiển thị trên thang điểm 10
  const convertRatingTo10 = (rating: number): number => {
    return rating * 2;
  };

  const renderStars = (rating: number, showScore: boolean = false) => {
    // Rating từ backend là 1-5, hiển thị điểm trên thang 10
    const displayRating = convertRatingTo10(rating);
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        {showScore && (
          <span className="ml-1 text-xs font-medium text-gray-700">{displayRating.toFixed(1)}/10</span>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Thống kê & Báo cáo đánh giá</h1>
          <p className="text-gray-600 mt-1">Theo dõi chất lượng khách sạn và đánh giá tổng thể hệ thống</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("CSV")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            CSV
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
            <option value="custom">Tùy chọn</option>
          </select>
          {filters.period === "custom" && (
            <>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg"
              />
            </>
          )}
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
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả category</option>
            <option value="CAT001">Resort</option>
            <option value="CAT002">Boutique Hotel</option>
            <option value="CAT003">Business Hotel</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ review tích cực</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.positiveRate}%</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ review tiêu cực</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.negativeRate}%</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <TrendingDown className="text-red-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng review theo tháng</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">
                {stats.reviewsByMonth[stats.reviewsByMonth.length - 1]?.count || 0}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Star className="text-blue-600 fill-blue-600" size={24} />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Số lượng review theo sao</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.ratingDistribution.reduce((sum, item) => sum + item.count, 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Star className="text-yellow-600 fill-yellow-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tổng review theo tháng</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.reviewsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Số lượng review theo sao</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={stats.ratingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rating, percentage }) => `${rating}⭐: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {stats.ratingDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm trung bình theo tiêu chí</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={stats.ratingByCriteria}>
            <PolarGrid />
            <PolarAngleAxis dataKey="criteria" />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar name="Rating" dataKey="average_rating" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-green-600" size={20} />
            Top 10 khách sạn được đánh giá cao nhất
          </h3>
          <div className="space-y-3">
            {stats.topRatedHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.hotel_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {renderStars(Math.round(hotel.average_rating))}
                    </div>
                    <span className="text-sm text-gray-600">{hotel.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-gray-900">{hotel.review_count} reviews</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Complained Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="text-red-600" size={20} />
            Top 10 khách sạn bị chê nhiều nhất
          </h3>
          <div className="space-y-3">
            {stats.topComplainedHotels.map((hotel, index) => (
              <div key={hotel.hotel_id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-red-100 bg-red-50">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center font-bold text-white">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{hotel.hotel_name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center">
                      {renderStars(Math.round(hotel.average_rating))}
                    </div>
                    <span className="text-sm text-red-600">{hotel.average_rating.toFixed(1)}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-medium text-red-600">{hotel.low_rating_count} phàn nàn</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewReports;

