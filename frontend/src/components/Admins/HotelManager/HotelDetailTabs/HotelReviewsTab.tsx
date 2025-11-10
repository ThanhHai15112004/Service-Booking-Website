import { useState, useEffect } from "react";
import { Star, User, Calendar, MessageSquare } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface HotelReviewsTabProps {
  hotelId: string;
}

interface Review {
  review_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  created_at: string;
  location_rating?: number | null;
  facilities_rating?: number | null;
  service_rating?: number | null;
  cleanliness_rating?: number | null;
  value_rating?: number | null;
  full_name?: string;
  email?: string;
  avatar_url?: string;
  reply?: {
    reply_id: string;
    reply_text: string;
    replied_by: string;
    replied_by_name: string;
    replied_at: string;
  };
}

const HotelReviewsTab = ({ hotelId }: HotelReviewsTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filters, setFilters] = useState({
    rating: "",
    status: "",
  });
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    fetchReviews();
  }, [hotelId, currentPage, filters]);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await adminService.getHotelReviews(hotelId, {
        ...filters,
        page: currentPage,
        limit: itemsPerPage,
      });

      if (response.success && response.data) {
        setReviews(response.data);
        setTotalReviews(response.total || 0);
      } else {
        showToast("error", response.message || "Không thể tải danh sách đánh giá");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải danh sách đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
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
        fetchReviews(); // Reload reviews to show the new reply
      } else {
        showToast("error", result.message || "Không thể gửi phản hồi");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể gửi phản hồi");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Hiển thị</span>;
      case "HIDDEN":
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Ẩn</span>;
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
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}
          />
        ))}
        <span className="ml-1 text-sm font-medium text-gray-700">{displayRating}/10</span>
      </div>
    );
  };

  // Sanitize HTML để tránh XSS nhưng vẫn render HTML từ editor
  const sanitizeHTML = (html: string): string => {
    if (!html) return '';
    // Remove potentially dangerous scripts but keep safe HTML
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const totalPages = Math.ceil(totalReviews / itemsPerPage);

  if (loading && reviews.length === 0) {
    return <Loading message="Đang tải danh sách đánh giá..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Lọc theo rating</label>
          <select
            value={filters.rating}
            onChange={(e) => {
              setFilters({ ...filters, rating: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
          <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({ ...filters, status: e.target.value });
              setCurrentPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả</option>
            <option value="ACTIVE">Hiển thị</option>
            <option value="HIDDEN">Ẩn</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Chưa có đánh giá nào</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.review_id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                    {review.avatar_url ? (
                      <img src={review.avatar_url} alt={review.full_name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <User className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{review.full_name || "Khách hàng"}</div>
                    <div className="text-sm text-gray-500">{review.email}</div>
                    <div className="mt-1">{renderStars(review.rating)}</div>
                  </div>
                </div>
                <div className="text-right">
                  {getStatusBadge(review.status)}
                  <div className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(review.created_at).toLocaleDateString('vi-VN', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit'
                    })}
                  </div>
                </div>
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{review.title}</h4>
              )}

              {/* Review Content - HTML from WYSIWYG editor */}
              {review.comment ? (
                <div 
                  className="text-gray-700 mb-4 leading-relaxed review-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.comment) }}
                  style={{ wordBreak: 'break-word' }}
                />
              ) : (
                <p className="text-gray-500 italic mb-4">Không có bình luận</p>
              )}
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
                }
                .review-content strong,
                .review-content b {
                  font-weight: 600;
                }
                .review-content em,
                .review-content i {
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
                .review-content br {
                  display: block;
                  margin: 4px 0;
                }
              `}</style>

              {/* Detailed Ratings */}
              {(review.location_rating || review.facilities_rating || review.service_rating || review.cleanliness_rating || review.value_rating) && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
                  {review.location_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Vị trí</div>
                      {renderStars(review.location_rating)}
                    </div>
                  )}
                  {review.facilities_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Tiện nghi</div>
                      {renderStars(review.facilities_rating)}
                    </div>
                  )}
                  {review.service_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Dịch vụ</div>
                      {renderStars(review.service_rating)}
                    </div>
                  )}
                  {review.cleanliness_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Sạch sẽ</div>
                      {renderStars(review.cleanliness_rating)}
                    </div>
                  )}
                  {review.value_rating && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Giá trị</div>
                      {renderStars(review.value_rating)}
                    </div>
                  )}
                </div>
              )}

              {/* Reply Section */}
              {review.reply && (
                <div className="mt-4 pt-4 border-t border-gray-200 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                        {review.reply.replied_by_name?.charAt(0)?.toUpperCase() || 'A'}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {review.reply.replied_by_name || 'Quản lý khách sạn'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(review.reply.replied_at).toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })}
                        </span>
                      </div>
                      <div 
                        className="text-sm text-gray-700 leading-relaxed review-content"
                        dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.reply.reply_text) }}
                        style={{ wordBreak: 'break-word' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Reply Button */}
              {review.status === "ACTIVE" && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedReview(review);
                      setReplyText(review.reply?.reply_text || "");
                      setShowReplyModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <MessageSquare size={16} />
                    {review.reply ? "Sửa phản hồi" : "Trả lời review"}
                  </button>
                </div>
              )}
            </div>
          ))}
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
                <p className="text-sm text-gray-600 mb-2">Review từ {selectedReview.full_name || "Khách hàng"}</p>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                {selectedReview.reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalReviews)} của {totalReviews} đánh giá
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Trước
            </button>
            <span className="px-4 py-2 text-sm text-gray-700">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelReviewsTab;

