import { useState, useEffect } from "react";
import { Star, Eye, EyeOff, Trash2, Hotel, Filter } from "lucide-react";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface AccountReviewsTabProps {
  accountId: string;
}

const AccountReviewsTab = ({ accountId }: AccountReviewsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    hotel: "",
    rating: "",
    status: "",
  });

  useEffect(() => {
    fetchReviews();
  }, [accountId, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccountReviews(accountId, {
        hotelName: filters.hotel,
        rating: filters.rating,
        status: filters.status,
        page: 1,
        limit: 100,
      });
      setReviews(response.data || []);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
      await adminService.toggleReviewVisibility(reviewId, newStatus);
      fetchReviews();
    } catch (error) {
      console.error("Error toggling review visibility:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa review này không?")) return;
    try {
      await adminService.deleteReview(reviewId);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={16}
        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ));
  };

  if (loading) {
    return <Loading message="Đang tải danh sách reviews..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Khách sạn</label>
            <input
              type="text"
              value={filters.hotel}
              onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
              placeholder="Tìm theo tên khách sạn..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            >
              <option value="">Tất cả</option>
              <option value="5">5 sao</option>
              <option value="4">4 sao</option>
              <option value="3">3 sao</option>
              <option value="2">2 sao</option>
              <option value="1">1 sao</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            >
              <option value="">Tất cả</option>
              <option value="ACTIVE">Active</option>
              <option value="HIDDEN">Hidden</option>
              <option value="DELETED">Deleted</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reviews Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Hotel</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Rating</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Tiêu đề</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Nội dung</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reviews.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có review nào.
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hotel size={16} className="text-gray-400" />
                        <span className="text-sm">{review.hotel_name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating || 0)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium">{review.title || "Không có tiêu đề"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {review.comment || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(review.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        review.status === "ACTIVE" ? "bg-green-100 text-green-800" :
                        review.status === "HIDDEN" ? "bg-yellow-100 text-yellow-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {review.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleVisibility(review.review_id, review.status)}
                          className="p-2 hover:bg-blue-50 rounded transition-colors duration-200"
                          title={review.status === "ACTIVE" ? "Ẩn review" : "Hiện review"}
                        >
                          {review.status === "ACTIVE" ? (
                            <EyeOff size={16} className="text-yellow-600" />
                          ) : (
                            <Eye size={16} className="text-green-600" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(review.review_id)}
                          className="p-2 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Xóa review"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AccountReviewsTab;

