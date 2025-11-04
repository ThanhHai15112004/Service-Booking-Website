import { useState, useEffect } from "react";
import { Star, Eye, EyeOff, Trash2, Hotel, Filter, Search, X, Calendar, ChevronLeft, ChevronRight, MapPin, Wrench, Users, Sparkles, DollarSign } from "lucide-react";
import Loading from "../../Loading";
import Toast from "../../Toast";
import { adminService } from "../../../services/adminService";

interface AccountReviewsProps {
  accountId: string;
  showHeader?: boolean;
}

interface Review {
  review_id: string;
  hotel_id: string;
  hotel_name: string;
  booking_id: string | null;
  rating: number;
  title: string | null;
  comment: string | null;
  status: "ACTIVE" | "HIDDEN" | "DELETED";
  created_at: string;
  updated_at: string;
  location_rating?: number | null;
  facilities_rating?: number | null;
  service_rating?: number | null;
  cleanliness_rating?: number | null;
  value_rating?: number | null;
}

const AccountReviews = ({ accountId, showHeader = true }: AccountReviewsProps) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    hotelName: "",
    rating: "",
    status: "",
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
  });

  useEffect(() => {
    fetchReviews();
  }, [accountId, filters, pagination.page, pagination.limit]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccountReviews(accountId, {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });
      setReviews(response.data || []);
      setPagination({ ...pagination, total: response.total });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("error", "Lỗi khi tải danh sách reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleVisibility = async (reviewId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === "ACTIVE" ? "HIDDEN" : "ACTIVE";
      await adminService.toggleReviewVisibility(reviewId, newStatus);
      showToast("success", newStatus === "ACTIVE" ? "Đã hiện review" : "Đã ẩn review");
      fetchReviews();
    } catch (error) {
      console.error("Error toggling review visibility:", error);
      showToast("error", "Lỗi khi cập nhật review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa review này?")) return;
    
    try {
      await adminService.deleteReview(reviewId);
      showToast("success", "Xóa review thành công");
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
      showToast("error", "Lỗi khi xóa review");
    }
  };

  const renderStars = (rating: number, size: number = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        size={size}
        className={i < rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
      />
    ));
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      HIDDEN: "bg-yellow-100 text-yellow-800",
      DELETED: "bg-gray-100 text-gray-800",
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.ACTIVE}`}>
        {status}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString("vi-VN");
  };

  const clearFilters = () => {
    setFilters({
      hotelName: "",
      rating: "",
      status: "",
    });
    setPagination({ ...pagination, page: 1 });
  };

  const totalPages = Math.ceil(pagination.total / pagination.limit);

  if (loading && reviews.length === 0) {
    return <Loading message="Đang tải danh sách reviews..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Quản lý Reviews</h2>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Filter size={20} className="text-gray-600" />
            <h3 className="text-sm font-medium text-gray-700">Bộ lọc</h3>
          </div>
          {(filters.hotelName || filters.rating || filters.status) && (
            <button
              onClick={clearFilters}
              className="text-xs text-gray-600 hover:text-black flex items-center gap-1"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Khách sạn</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={filters.hotelName}
                onChange={(e) => {
                  setFilters({ ...filters, hotelName: e.target.value });
                  setPagination({ ...pagination, page: 1 });
                }}
                placeholder="Tìm theo tên khách sạn..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Rating</label>
            <select
              value={filters.rating}
              onChange={(e) => {
                setFilters({ ...filters, rating: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
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
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value });
                setPagination({ ...pagination, page: 1 });
              }}
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
                    <div className="flex flex-col items-center gap-2">
                      <Star size={32} className="text-gray-400" />
                      <span>Chưa có review nào</span>
                    </div>
                  </td>
                </tr>
              ) : (
                reviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hotel size={16} className="text-gray-400" />
                        <span className="text-sm font-medium">{review.hotel_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        {renderStars(review.rating)}
                        <span className="text-xs text-gray-500 ml-1">({review.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDetailModal(true);
                        }}
                        className="text-sm font-medium text-left hover:text-blue-600 transition-colors duration-200"
                      >
                        {review.title || "Không có tiêu đề"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                      {review.comment || "N/A"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(review.created_at)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(review.status)}
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
                          onClick={() => handleDeleteReview(review.review_id)}
                          disabled={review.status === "DELETED"}
                          className="p-2 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Hiển thị {(pagination.page - 1) * pagination.limit + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} trong tổng số {pagination.total} review
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronLeft size={16} />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setPagination({ ...pagination, page })}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors duration-200 ${
                      pagination.page === page
                        ? "bg-black text-white"
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <select
              value={pagination.limit}
              onChange={(e) => setPagination({ ...pagination, limit: Number(e.target.value), page: 1 })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            >
              <option value={10}>10 / trang</option>
              <option value={15}>15 / trang</option>
              <option value={20}>20 / trang</option>
              <option value={50}>50 / trang</option>
            </select>
          </div>
        )}
      </div>

      {/* Review Detail Modal */}
      {showDetailModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Chi tiết Review</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Review Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Mã review</p>
                    <p className="font-mono font-medium">{selectedReview.review_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(selectedReview.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Khách sạn</p>
                    <p className="font-medium flex items-center gap-2">
                      <Hotel size={16} className="text-gray-400" />
                      {selectedReview.hotel_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ngày đăng</p>
                    <p className="text-sm">{formatDateTime(selectedReview.created_at)}</p>
                  </div>
                </div>
              </div>

              {/* Overall Rating */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">Đánh giá tổng thể</h4>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {renderStars(selectedReview.rating, 24)}
                  </div>
                  <span className="text-2xl font-bold">{selectedReview.rating}/5</span>
                </div>
              </div>

              {/* Title & Comment */}
              <div>
                <h4 className="text-lg font-bold text-black mb-3">Nội dung review</h4>
                {selectedReview.title && (
                  <h5 className="text-xl font-medium text-black mb-2">{selectedReview.title}</h5>
                )}
                {selectedReview.comment && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 whitespace-pre-wrap">{selectedReview.comment}</p>
                  </div>
                )}
              </div>

              {/* Detailed Ratings */}
              {(selectedReview.location_rating || selectedReview.facilities_rating || selectedReview.service_rating || selectedReview.cleanliness_rating || selectedReview.value_rating) && (
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Đánh giá chi tiết</h4>
                  <div className="space-y-3">
                    {selectedReview.location_rating && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <MapPin size={18} className="text-blue-600" />
                          <span className="font-medium">Vị trí</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedReview.location_rating)}
                          <span className="text-sm font-medium">{selectedReview.location_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedReview.facilities_rating && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Wrench size={18} className="text-green-600" />
                          <span className="font-medium">Tiện nghi</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedReview.facilities_rating)}
                          <span className="text-sm font-medium">{selectedReview.facilities_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedReview.service_rating && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Users size={18} className="text-purple-600" />
                          <span className="font-medium">Dịch vụ</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedReview.service_rating)}
                          <span className="text-sm font-medium">{selectedReview.service_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedReview.cleanliness_rating && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <Sparkles size={18} className="text-yellow-600" />
                          <span className="font-medium">Vệ sinh</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedReview.cleanliness_rating)}
                          <span className="text-sm font-medium">{selectedReview.cleanliness_rating}/5</span>
                        </div>
                      </div>
                    )}
                    {selectedReview.value_rating && (
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2">
                          <DollarSign size={18} className="text-red-600" />
                          <span className="font-medium">Giá trị</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {renderStars(selectedReview.value_rating)}
                          <span className="text-sm font-medium">{selectedReview.value_rating}/5</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleToggleVisibility(selectedReview.review_id, selectedReview.status);
                    setShowDetailModal(false);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedReview.status === "ACTIVE"
                      ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                      : "bg-green-100 text-green-800 hover:bg-green-200"
                  }`}
                >
                  {selectedReview.status === "ACTIVE" ? (
                    <>
                      <EyeOff size={16} className="inline mr-2" />
                      Ẩn review
                    </>
                  ) : (
                    <>
                      <Eye size={16} className="inline mr-2" />
                      Hiện review
                    </>
                  )}
                </button>
                {selectedReview.status !== "DELETED" && (
                  <button
                    onClick={() => {
                      handleDeleteReview(selectedReview.review_id);
                      setShowDetailModal(false);
                    }}
                    className="flex-1 px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    <Trash2 size={16} className="inline mr-2" />
                    Xóa review
                  </button>
                )}
              </div>

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Ngày tạo: {formatDateTime(selectedReview.created_at)}</p>
                <p>Cập nhật lần cuối: {formatDateTime(selectedReview.updated_at)}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountReviews;

