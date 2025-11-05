import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Star, TrendingUp, Download, Filter, Building2, TrendingDown } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface ReviewAnalytics {
  totalReviews: number;
  averageRating: number;
  averageRatingByHotel: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  averageRatingByCity: Array<{
    city: string;
    average_rating: number;
    review_count: number;
  }>;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  positiveRate: number;
  negativeRate: number;
  ratingByCriteria: Array<{
    criteria: string;
    average_rating: number;
  }>;
  topRatedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  reviewsByMonth: Array<{ month: string; count: number }>;
}

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];

const ReviewAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    hotel: "",
    city: "",
  });

  useEffect(() => {
    fetchReviewAnalytics();
  }, [filters]);

  const fetchReviewAnalytics = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setAnalytics({
          totalReviews: 12456,
          averageRating: 4.3,
          averageRatingByHotel: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", average_rating: 4.8, review_count: 456 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", average_rating: 4.7, review_count: 389 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", average_rating: 4.6, review_count: 298 },
          ],
          averageRatingByCity: [
            { city: "Hà Nội", average_rating: 4.5, review_count: 5234 },
            { city: "TP. Hồ Chí Minh", average_rating: 4.3, review_count: 4123 },
            { city: "Đà Nẵng", average_rating: 4.2, review_count: 2678 },
            { city: "Khác", average_rating: 4.0, review_count: 421 },
          ],
          ratingDistribution: [
            { rating: 5, count: 8532, percentage: 68.5 },
            { rating: 4, count: 2491, percentage: 20.0 },
            { rating: 3, count: 747, percentage: 6.0 },
            { rating: 2, count: 373, percentage: 3.0 },
            { rating: 1, count: 313, percentage: 2.5 },
          ],
          positiveRate: 88.5,
          negativeRate: 11.5,
          ratingByCriteria: [
            { criteria: "Vị trí", average_rating: 4.5 },
            { criteria: "Dịch vụ", average_rating: 4.3 },
            { criteria: "Cơ sở vật chất", average_rating: 4.2 },
            { criteria: "Vệ sinh", average_rating: 4.4 },
            { criteria: "Giá trị", average_rating: 4.1 },
          ],
          topRatedHotels: [
            { hotel_id: "H001", hotel_name: "Hanoi Old Quarter Hotel", average_rating: 4.8, review_count: 456 },
            { hotel_id: "H002", hotel_name: "My Khe Beach Resort", average_rating: 4.7, review_count: 389 },
            { hotel_id: "H003", hotel_name: "Saigon Riverside Hotel", average_rating: 4.6, review_count: 298 },
            { hotel_id: "H004", hotel_name: "Sofitel Metropole", average_rating: 4.5, review_count: 234 },
            { hotel_id: "H005", hotel_name: "Da Nang Beach Hotel", average_rating: 4.4, review_count: 187 },
          ],
          reviewsByMonth: [
            { month: "Th1", count: 856 },
            { month: "Th2", count: 924 },
            { month: "Th3", count: 1088 },
            { month: "Th4", count: 1256 },
            { month: "Th5", count: 1420 },
            { month: "Th6", count: 1680 },
          ],
        });
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải báo cáo đánh giá");
      setLoading(false);
    }
  };

  const handleExport = async (format: "EXCEL" | "PDF") => {
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
    return <Loading message="Đang tải báo cáo đánh giá..." />;
  }

  if (!analytics) {
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

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo cáo Đánh giá</h1>
          <p className="text-gray-600 mt-1">Theo dõi chất lượng khách sạn dựa trên đánh giá thực tế</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("EXCEL")}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download size={18} />
            Excel
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tổng số review</p>
          <p className="text-3xl font-bold text-blue-600">{analytics.totalReviews.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Điểm trung bình</p>
          <div className="flex items-center gap-2">
            <p className="text-3xl font-bold text-yellow-600">{convertRatingTo10(analytics.averageRating).toFixed(1)}/10</p>
            <div className="flex items-center">{renderStars(Math.round(analytics.averageRating))}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ tích cực</p>
          <p className="text-3xl font-bold text-green-600">{analytics.positiveRate}%</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-2">Tỷ lệ tiêu cực</p>
          <p className="text-3xl font-bold text-red-600">{analytics.negativeRate}%</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center gap-4">
          <Filter className="text-gray-400" size={20} />
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
            placeholder="Đến ngày"
          />
          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
          </select>
          <select
            value={filters.city}
            onChange={(e) => setFilters({ ...filters, city: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Tất cả thành phố</option>
            <option value="Hanoi">Hà Nội</option>
            <option value="HCM">TP. Hồ Chí Minh</option>
            <option value="DaNang">Đà Nẵng</option>
          </select>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rating Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-600 fill-yellow-600" size={20} />
            Phân bổ điểm theo sao
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.ratingDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ rating, percentage }) => `${rating}⭐: ${percentage}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.ratingDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Reviews by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Tổng review theo tháng
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.reviewsByMonth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="text-purple-600" size={20} />
          So sánh điểm theo tiêu chí
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={analytics.ratingByCriteria}>
            <PolarGrid />
            <PolarAngleAxis dataKey="criteria" />
            <PolarRadiusAxis angle={90} domain={[0, 5]} />
            <Radar name="Rating" dataKey="average_rating" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Rated Hotels */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="text-green-600" size={20} />
          Top 10 khách sạn được đánh giá cao nhất
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={analytics.topRatedHotels} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" domain={[0, 5]} />
            <YAxis dataKey="hotel_name" type="category" width={150} />
            <Tooltip formatter={(value: number) => value.toFixed(1)} />
            <Legend />
            <Bar dataKey="average_rating" fill="#10b981" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Average Rating by City */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm trung bình theo thành phố</h3>
          <div className="space-y-3">
            {analytics.averageRatingByCity.map((city) => (
              <div key={city.city}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900">{city.city}</span>
                  <span className="text-sm text-gray-600">{convertRatingTo10(city.average_rating).toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${(convertRatingTo10(city.average_rating) / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{city.review_count} reviews</p>
              </div>
            ))}
          </div>
        </div>

        {/* Average Rating by Hotel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Điểm trung bình theo khách sạn</h3>
          <div className="space-y-3">
            {analytics.averageRatingByHotel.map((hotel) => (
              <div key={hotel.hotel_id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 truncate">{hotel.hotel_name}</span>
                  <span className="text-sm text-gray-600">{convertRatingTo10(hotel.average_rating).toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-600 h-2 rounded-full"
                    style={{ width: `${(convertRatingTo10(hotel.average_rating) / 10) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">{hotel.review_count} reviews</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewAnalytics;

