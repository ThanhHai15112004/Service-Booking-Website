import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, EyeOff, Trash2, MessageSquare, Star, ChevronLeft, ChevronRight, Filter, Clock } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Review {
  review_id: string;
  customer_name: string;
  customer_email: string;
  hotel_id: string;
  hotel_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
  status: "ACTIVE" | "HIDDEN" | "DELETED" | "PENDING";
  has_reply: boolean;
}

const ReviewsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    hotel: "",
    rating: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    pendingOnly: false,
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [reviews, searchTerm, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setTimeout(() => {
        setReviews([
          {
            review_id: "RV001",
            customer_name: "Nguyễn Văn A",
            customer_email: "nguyenvana@email.com",
            hotel_id: "H001",
            hotel_name: "Hanoi Old Quarter Hotel",
            rating: 5,
            title: "Rất tuyệt vời!",
            comment: "Khách sạn rất đẹp, dịch vụ tốt, nhân viên thân thiện.",
            created_at: "2025-11-01T10:30:00",
            status: "ACTIVE",
            has_reply: false,
          },
          {
            review_id: "RV002",
            customer_name: "Trần Thị B",
            customer_email: "tranthib@email.com",
            hotel_id: "H002",
            hotel_name: "My Khe Beach Resort",
            rating: 4,
            title: "Khách sạn đẹp",
            comment: "View đẹp nhưng giá hơi cao.",
            created_at: "2025-11-02T14:20:00",
            status: "ACTIVE",
            has_reply: true,
          },
          {
            review_id: "RV003",
            customer_name: "Lê Văn C",
            customer_email: "levanc@email.com",
            hotel_id: "H003",
            hotel_name: "Saigon Riverside Hotel",
            rating: 3,
            title: "Ổn nhưng cần cải thiện",
            comment: "Phòng sạch nhưng dịch vụ còn chậm.",
            created_at: "2025-11-03T09:15:00",
            status: "PENDING",
            has_reply: false,
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách review");
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = [...reviews];

    if (searchTerm) {
      result = result.filter(
        (review) =>
          review.review_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.hotel_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          review.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filters.hotel) {
      result = result.filter((review) => review.hotel_id === filters.hotel);
    }

    if (filters.rating) {
      result = result.filter((review) => review.rating === Number(filters.rating));
    }

    if (filters.status) {
      result = result.filter((review) => review.status === filters.status);
    }

    if (filters.dateFrom) {
      result = result.filter((review) => review.created_at >= filters.dateFrom);
    }

    if (filters.dateTo) {
      result = result.filter((review) => review.created_at <= filters.dateTo);
    }

    if (filters.pendingOnly) {
      result = result.filter((review) => review.status === "PENDING");
    }

    setFilteredReviews(result);
    setCurrentPage(1);
  };

  const handleApprove = async (reviewId: string) => {
    try {
      // TODO: API call
      showToast("success", "Đã duyệt review thành công");
      fetchReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể duyệt review");
    }
  };

  const handleHide = async () => {
    if (!selectedReview) return;

    try {
      // TODO: API call
      showToast("success", `Đã ẩn review ${selectedReview.review_id}`);
      setShowHideModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể ẩn review");
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      // TODO: API call
      showToast("success", `Đã xóa review ${selectedReview.review_id}`);
      setShowDeleteModal(false);
      setSelectedReview(null);
      fetchReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa review");
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      showToast("error", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      // TODO: API call
      showToast("success", "Đã gửi phản hồi review thành công");
      setShowReplyModal(false);
      setSelectedReview(null);
      setReplyText("");
      fetchReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể gửi phản hồi");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentReviews = filteredReviews.slice(startIndex, endIndex);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hiển thị</span>;
      case "HIDDEN":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã ẩn</span>;
      case "DELETED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã xóa</span>;
      case "PENDING":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Chờ duyệt</span>;
      default:
        return null;
    }
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách review..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh sách review</h1>
          <p className="text-gray-600 mt-1">Quản lý toàn bộ đánh giá của khách hàng</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã review, khách hàng, hotel, tiêu đề..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={filters.hotel}
            onChange={(e) => setFilters({ ...filters, hotel: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả khách sạn</option>
            <option value="H001">Hanoi Old Quarter Hotel</option>
            <option value="H002">My Khe Beach Resort</option>
            <option value="H003">Saigon Riverside Hotel</option>
          </select>

          <select
            value={filters.rating}
            onChange={(e) => setFilters({ ...filters, rating: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả rating</option>
            <option value="5">5 ⭐</option>
            <option value="4">4 ⭐</option>
            <option value="3">3 ⭐</option>
            <option value="2">2 ⭐</option>
            <option value="1">1 ⭐</option>
          </select>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Hiển thị</option>
            <option value="HIDDEN">Đã ẩn</option>
            <option value="DELETED">Đã xóa</option>
            <option value="PENDING">Chờ duyệt</option>
          </select>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="pendingOnly"
              checked={filters.pendingOnly}
              onChange={(e) => setFilters({ ...filters, pendingOnly: e.target.checked })}
              className="w-4 h-4"
            />
            <label htmlFor="pendingOnly" className="text-sm text-gray-700 cursor-pointer">
              Chờ duyệt
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Từ ngày"
          />
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Đến ngày"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mã Review</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách hàng</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khách sạn</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tiêu đề</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy review nào
                  </td>
                </tr>
              ) : (
                currentReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.review_id}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{review.customer_name}</p>
                        <p className="text-sm text-gray-500">{review.customer_email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 max-w-xs truncate">{review.title}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(review.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(review.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => navigate(`/admin/reviews/${review.review_id}`)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {review.status === "PENDING" && (
                          <button
                            onClick={() => handleApprove(review.review_id)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Duyệt"
                          >
                            <Clock size={18} />
                          </button>
                        )}
                        {review.status === "ACTIVE" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowHideModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-900 p-1 rounded hover:bg-yellow-50"
                              title="Ẩn"
                            >
                              <EyeOff size={18} />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReview(review);
                                setShowReplyModal(true);
                              }}
                              className="text-purple-600 hover:text-purple-900 p-1 rounded hover:bg-purple-50"
                              title="Trả lời"
                            >
                              <MessageSquare size={18} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
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
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">
                Hiển thị {startIndex + 1}-{Math.min(endIndex, filteredReviews.length)} trong tổng số {filteredReviews.length} review
              </span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
              >
                <option value={10}>10 / trang</option>
                <option value={20}>20 / trang</option>
                <option value={50}>50 / trang</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm text-gray-700">
                Trang {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hide Modal */}
      {showHideModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận ẩn review</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn ẩn review này? Review sẽ không hiển thị công khai nhưng vẫn được lưu trong hệ thống.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowHideModal(false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleHide}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                Ẩn review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa review</h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa review này? Hành động này không thể hoàn tác.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReview(null);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Xóa review
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trả lời review</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Review từ {selectedReview.customer_name}</p>
                <p className="text-gray-900 font-medium">{selectedReview.title}</p>
                <p className="text-gray-700 mt-2">{selectedReview.comment}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nội dung phản hồi *</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Nhập phản hồi của bạn..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setSelectedReview(null);
                  setReplyText("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReply}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <MessageSquare size={18} />
                Gửi phản hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsList;

