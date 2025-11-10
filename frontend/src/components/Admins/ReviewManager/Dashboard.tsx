import { useState, useEffect } from "react";
import { BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Star, MessageSquare, TrendingUp, AlertCircle, Clock, Building2 } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface ReviewDashboardStats {
  totalReviews: number;
  monthlyNewReviews: number;
  averageRating: number;
  fiveStarRate: number;
  pendingReviews: number;
  reviewsByMonth: Array<{ month: string; count: number }>;
  ratingDistribution: Array<{ rating: number; count: number; percentage: number }>;
  averageRatingTrend: Array<{ date: string; rating: number }>;
  topRatedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    average_rating: number;
    review_count: number;
  }>;
  topComplainedHotels: Array<{
    hotel_id: string;
    hotel_name: string;
    low_rating_count: number;
    average_rating: number;
  }>;
  recentReviews: Array<{
    review_id: string;
    customer_name: string;
    hotel_name: string;
    rating: number;
    title: string;
    created_at: string;
  }>;
}

const COLORS = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#10b981'];

const ReviewDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [stats, setStats] = useState<ReviewDashboardStats | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const result = await adminService.getReviewDashboardStats();
      if (result.success && result.data) {
        setStats(result.data);
      } else {
        showToast("error", result.message || "Không thể tải dữ liệu dashboard");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu dashboard");
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

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
            size={16}
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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Đánh giá</h1>
          <p className="text-gray-600 mt-1">Tổng quan về toàn bộ review trong hệ thống</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tổng số review</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalReviews.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <MessageSquare className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Review mới tháng này</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.monthlyNewReviews}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Điểm trung bình</p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-3xl font-bold text-yellow-600">{stats.averageRating}</p>
                <div className="flex items-center">
                  {renderStars(Math.round(stats.averageRating))}
                </div>
              </div>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Star className="text-yellow-600 fill-yellow-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tỷ lệ review 5⭐</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{stats.fiveStarRate}%</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Star className="text-purple-600 fill-purple-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Review chờ duyệt</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{stats.pendingReviews}</p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Clock className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reviews by Month */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="text-blue-600" size={20} />
            Số lượng review theo tháng
          </h3>
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
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Star className="text-yellow-600 fill-yellow-600" size={20} />
            Phân bổ theo số sao (1–5⭐)
          </h3>
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

      {/* Average Rating Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="text-green-600" size={20} />
          Xu hướng điểm trung bình theo thời gian
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={stats.averageRatingTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis domain={[0, 5]} />
            <Tooltip formatter={(value: number) => value.toFixed(1)} />
            <Legend />
            <Line type="monotone" dataKey="rating" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981", r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Rated Hotels */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-green-600" size={20} />
            Top khách sạn có điểm đánh giá cao nhất
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
            Top khách sạn bị phàn nàn nhiều nhất
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

      {/* Recent Reviews */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <MessageSquare className="text-purple-600" size={20} />
          Review mới nhất
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.recentReviews.map((review) => (
                <tr key={review.review_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{review.customer_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{review.hotel_name}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      {renderStars(review.rating)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{review.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(review.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ReviewDashboard;

