import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Eye, EyeOff, Trash2, MessageSquare, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface Review {
  review_id: string;
  customer_name: string;
  customer_email: string;
  hotel_id: string;
  hotel_name: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  status: "ACTIVE" | "HIDDEN" | "DELETED";
  has_reply: boolean;
}

const ReviewsList = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    hotel: "",
    rating: "",
    status: "",
    dateFrom: "",
    dateTo: "",
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, itemsPerPage, searchTerm, filters.hotel, filters.rating, filters.status, filters.dateFrom, filters.dateTo]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (searchTerm) params.search = searchTerm;
      if (filters.hotel) params.hotel_id = filters.hotel;
      if (filters.rating) params.rating = filters.rating;
      if (filters.status) params.status = filters.status;
      if (filters.dateFrom) params.dateFrom = filters.dateFrom;
      if (filters.dateTo) params.dateTo = filters.dateTo;

      const result = await adminService.getReviewManagerReviews(params);
      if (result.success && result.data) {
        setReviews(result.data);
        setTotalReviews(result.total || 0);
      } else {
        showToast("error", result.message || "Không thể tải danh sách review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách review");
    } finally {
      setLoading(false);
    }
  };

  // Filters are now handled by backend, no need for client-side filtering
  useEffect(() => {
    setFilteredReviews(reviews);
  }, [reviews]);

  const handleHide = async () => {
    if (!selectedReview) return;

    try {
      const result = await adminService.updateReviewStatus(selectedReview.review_id, "HIDDEN");
      if (result.success) {
        showToast("success", result.message || `Đã ẩn review ${selectedReview.review_id}`);
        setShowHideModal(false);
        setSelectedReview(null);
        fetchReviews();
      } else {
        showToast("error", result.message || "Không thể ẩn review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể ẩn review");
    }
  };

  const handleDelete = async () => {
    if (!selectedReview) return;

    try {
      const result = await adminService.deleteReview(selectedReview.review_id);
      if (result.success) {
        showToast("success", result.message || `Đã xóa review ${selectedReview.review_id}`);
        setShowDeleteModal(false);
        setSelectedReview(null);
        fetchReviews();
      } else {
        showToast("error", result.message || "Không thể xóa review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa review");
    }
  };

  const handleReply = async () => {
    if (!selectedReview || !replyText.trim()) {
      showToast("error", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      const result = await adminService.createReviewReply(selectedReview.review_id, replyText);
      if (result.success) {
        showToast("success", result.message || "Đã gửi phản hồi review thành công");
        setShowReplyModal(false);
        setSelectedReview(null);
        setReplyText("");
        fetchReviews();
      } else {
        showToast("error", result.message || "Không thể gửi phản hồi");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể gửi phản hồi");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  // Pagination is handled by backend
  const currentReviews = filteredReviews;
  const totalPages = Math.ceil(totalReviews / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalReviews);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hiển thị</span>;
      case "HIDDEN":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Đã ẩn</span>;
      case "DELETED":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Đã xóa</span>;
      default:
        return null;
    }
  };

  // Convert rating from backend (1-5) to display (1-10) - nhân đôi để hiển thị trên thang điểm 10
  const convertRatingTo10 = (rating: number): number => {
    return rating * 2;
  };

  const renderStars = (rating: number) => {
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
        <span className="ml-1 text-xs font-medium text-gray-700">{displayRating}/10</span>
      </div>
    );
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN");
  };

  // Sanitize HTML (comment đã là HTML từ WYSIWYG editor)
  const sanitizeHTML = (html: string): string => {
    if (!html) return '';
    // Remove potentially dangerous scripts but keep safe HTML
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
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
          </select>
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
                      <p className="text-sm text-gray-900 max-w-xs truncate">{review.title || 'Không có tiêu đề'}</p>
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
                Hiển thị {startIndex + 1}-{endIndex} trong tổng số {totalReviews} review
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowHideModal(false);
            setSelectedReview(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDeleteModal(false);
            setSelectedReview(null);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowReplyModal(false);
            setSelectedReview(null);
            setReplyText("");
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trả lời review</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Review từ {selectedReview.customer_name}</p>
                {selectedReview.title && (
                  <p className="text-gray-900 font-medium mb-2">{selectedReview.title}</p>
                )}
                {selectedReview.comment ? (
                  <div 
                    className="text-gray-700 mt-2 review-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedReview.comment) }}
                    style={{ wordBreak: 'break-word' }}
                  />
                ) : (
                  <p className="text-gray-500 italic mt-2">Không có bình luận</p>
                )}
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

      {/* Styles for HTML content */}
      <style>{`
        .review-content {
          line-height: 1.6;
        }
        .review-content img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 12px 0;
          border: 1px solid #e5e7eb;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .review-content img:hover {
          opacity: 0.9;
        }
        .review-content strong {
          font-weight: 600;
        }
        .review-content em {
          font-style: italic;
        }
        .review-content u {
          text-decoration: underline;
        }
        .review-content s,
        .review-content strike {
          text-decoration: line-through;
        }
        .review-content h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin: 12px 0 8px 0;
          line-height: 1.3;
        }
        .review-content h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 10px 0 6px 0;
          line-height: 1.3;
        }
        .review-content h3 {
          font-size: 1.125rem;
          font-weight: 600;
          margin: 8px 0 4px 0;
          line-height: 1.3;
        }
        .review-content ul,
        .review-content ol {
          margin: 8px 0;
          padding-left: 24px;
        }
        .review-content ul {
          list-style-type: disc;
        }
        .review-content ol {
          list-style-type: decimal;
        }
        .review-content li {
          margin: 4px 0;
        }
        .review-content blockquote {
          border-left: 4px solid #3b82f6;
          padding-left: 16px;
          margin: 12px 0;
          font-style: italic;
          color: #6b7280;
          background-color: #f9fafb;
          padding: 12px 16px;
          border-radius: 4px;
        }
        .review-content a {
          color: #2563eb;
          text-decoration: underline;
        }
        .review-content a:hover {
          color: #1d4ed8;
        }
      `}</style>
    </div>
  );
};

export default ReviewsList;

