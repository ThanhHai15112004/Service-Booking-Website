import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, EyeOff, Trash2, MessageSquare, Star, History, User, Building2 } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface ReviewDetail {
  review_id: string;
  account_id: string;
  customer_name: string;
  customer_email: string;
  provider: string;
  customer_total_reviews: number;
  hotel_id: string;
  hotel_name: string;
  hotel_address: string;
  hotel_average_rating: number;
  overall_rating: number;
  location_rating: number | null;
  service_rating: number | null;
  facilities_rating: number | null;
  cleanliness_rating: number | null;
  value_rating: number | null;
  title: string | null;
  comment: string | null;
  images?: string[];
  status: "ACTIVE" | "HIDDEN" | "DELETED";
  created_at: string;
  updated_at?: string;
  booking_id?: string;
  history: Array<{
    id: number;
    date: string;
    action: string;
    admin_name: string;
    note?: string;
  }>;
  reply?: {
    id?: string;
    reply_id?: string;
    reply_text: string;
    replied_by: string;
    replied_by_name?: string;
    replied_at: string;
  };
}

const ReviewDetail = () => {
  const { reviewId } = useParams<{ reviewId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [review, setReview] = useState<ReviewDetail | null>(null);
  const [showHideModal, setShowHideModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");

  useEffect(() => {
    if (reviewId) {
      fetchReviewDetail();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reviewId]);

  const fetchReviewDetail = async () => {
    if (!reviewId) return;
    
    setLoading(true);
    try {
      const result = await adminService.getReviewDetail(reviewId);
      if (result.success && result.data) {
        // Fetch activity log
        const activityResult = await adminService.getReviewActivityLog(reviewId);
        const history = activityResult.success && activityResult.data ? activityResult.data.map((log, index) => ({
          id: index + 1,
          date: log.date,
          action: log.action,
          admin_name: log.admin_name,
          note: log.note
        })) : [];

        setReview({
          ...result.data,
          history,
          images: [], // Backend doesn't return images yet
          status: result.data.status as "ACTIVE" | "HIDDEN" | "DELETED",
          updated_at: result.data.updated_at || undefined,
          booking_id: result.data.booking_id || undefined,
          reply: result.data.reply ? {
            id: result.data.reply.reply_id,
            reply_id: result.data.reply.reply_id,
            reply_text: result.data.reply.reply_text,
            replied_by: result.data.reply.replied_by,
            replied_by_name: result.data.reply.replied_by_name,
            replied_at: result.data.reply.replied_at
          } : undefined
        });
      } else {
        showToast("error", result.message || "Không thể tải chi tiết review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải chi tiết review");
    } finally {
      setLoading(false);
    }
  };

  const handleHide = async () => {
    if (!review) return;

    try {
      const result = await adminService.updateReviewStatus(review.review_id, "HIDDEN");
      if (result.success) {
        showToast("success", result.message || "Đã ẩn review thành công");
        setShowHideModal(false);
        fetchReviewDetail();
      } else {
        showToast("error", result.message || "Không thể ẩn review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể ẩn review");
    }
  };

  const handleDelete = async () => {
    if (!review) return;

    try {
      const result = await adminService.deleteReview(review.review_id);
      if (result.success) {
        showToast("success", result.message || "Đã xóa review thành công");
        setShowDeleteModal(false);
        navigate("/admin/reviews");
      } else {
        showToast("error", result.message || "Không thể xóa review");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa review");
    }
  };

  const handleReply = async () => {
    if (!review || !replyText.trim()) {
      showToast("error", "Vui lòng nhập nội dung phản hồi");
      return;
    }

    try {
      const result = await adminService.createReviewReply(review.review_id, replyText);
      if (result.success) {
        showToast("success", result.message || "Đã gửi phản hồi review thành công");
        setShowReplyModal(false);
        setReplyText("");
        fetchReviewDetail();
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
            size={18}
            className={i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
          />
        ))}
        {showScore && (
          <span className="ml-1 text-sm font-medium text-gray-700">{displayRating}/10</span>
        )}
      </div>
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">Hiển thị</span>;
      case "HIDDEN":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">Đã ẩn</span>;
      case "DELETED":
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">Đã xóa</span>;
      default:
        return null;
    }
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

  if (loading) {
    return <Loading message="Đang tải chi tiết review..." />;
  }

  if (!review) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Không tìm thấy review</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/reviews")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-gray-900">Chi tiết review</h1>
              {getStatusBadge(review.status)}
            </div>
            <p className="text-gray-600 mt-1">Review ID: {review.review_id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {review.status === "ACTIVE" && (
            <>
              <button
                onClick={() => setShowHideModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <EyeOff size={18} />
                Ẩn review
              </button>
              <button
                onClick={() => {
                  setReplyText(review.reply?.reply_text || "");
                  setShowReplyModal(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <MessageSquare size={18} />
                {review.reply ? "Sửa phản hồi" : "Trả lời"}
              </button>
            </>
          )}
          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 size={18} />
            Xóa
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <Star className="text-yellow-600 fill-yellow-600" size={24} />
          Thông tin cơ bản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mã Review</label>
              <p className="text-gray-900 font-mono">{review.review_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
              <p className="text-gray-900">{formatDateTime(review.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Điểm tổng</label>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center">
                  {renderStars(review.overall_rating)}
                </div>
                <span className="text-2xl font-bold text-gray-900">{convertRatingTo10(review.overall_rating)}/10</span>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <div className="mt-1">{getStatusBadge(review.status)}</div>
            </div>
            {review.updated_at && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày cập nhật</label>
                <p className="text-gray-900">{formatDateTime(review.updated_at)}</p>
              </div>
            )}
            {review.booking_id && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã Booking</label>
                <button
                  onClick={() => navigate(`/admin/bookings/${review.booking_id}`)}
                  className="text-blue-600 hover:text-blue-800 hover:underline font-mono"
                >
                  {review.booking_id}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rating Breakdown */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Chi tiết điểm đánh giá</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Vị trí", rating: review.location_rating },
              { label: "Dịch vụ", rating: review.service_rating },
              { label: "Cơ sở vật chất", rating: review.facilities_rating },
              { label: "Vệ sinh", rating: review.cleanliness_rating },
              { label: "Giá trị", rating: review.value_rating },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">{item.label}</p>
                {item.rating ? (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center">
                      {renderStars(item.rating)}
                    </div>
                    <span className="text-lg font-bold text-gray-900">{convertRatingTo10(item.rating)}/10</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Chưa đánh giá</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Review Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nội dung đánh giá</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề</label>
            <p className="text-lg font-medium text-gray-900">{review.title || 'Không có tiêu đề'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bình luận</label>
            {review.comment ? (
              <div 
                className="text-gray-900 leading-relaxed review-content"
                dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.comment) }}
                style={{ wordBreak: 'break-word' }}
              />
            ) : (
              <p className="text-gray-500 italic">Không có bình luận</p>
            )}
          </div>
          {review.images && review.images.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {review.images.map((image, index) => (
                  <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img
                      src={image}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Customer & Hotel Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Người đánh giá
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng</label>
              <p className="text-gray-900">{review.customer_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <p className="text-gray-900">{review.customer_email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
              <p className="text-gray-900">{review.provider}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tổng số review</label>
              <p className="text-gray-900">{review.customer_total_reviews} reviews</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Building2 className="text-green-600" size={24} />
            Thông tin khách sạn
          </h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách sạn</label>
              <button
                onClick={() => navigate(`/admin/hotels/${review.hotel_id}`)}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                {review.hotel_name}
              </button>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
              <p className="text-gray-900">{review.hotel_address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating trung bình</label>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center">
                  {renderStars(Math.round(review.hotel_average_rating))}
                </div>
                <span className="text-lg font-bold text-gray-900">{convertRatingTo10(review.hotel_average_rating).toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Reply */}
      {review.reply && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="text-purple-600" size={24} />
            Phản hồi của khách sạn
          </h2>
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-purple-900">{review.reply.replied_by_name || review.reply.replied_by || 'Quản lý khách sạn'}</p>
              <p className="text-sm text-purple-600">{formatDateTime(review.reply.replied_at)}</p>
            </div>
            <div 
              className="text-gray-900 review-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.reply.reply_text) }}
              style={{ wordBreak: 'break-word' }}
            />
          </div>
        </div>
      )}

      {/* History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <History className="text-orange-600" size={24} />
          Lịch sử thay đổi
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hành động</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Admin thực hiện</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ghi chú</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {review.history.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    Không có lịch sử thay đổi
                  </td>
                </tr>
              ) : (
                review.history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">{formatDateTime(item.date)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.action}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{item.admin_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{item.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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

      {/* Modals */}
      {showHideModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowHideModal(false);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận ẩn review</h3>
            <p className="text-gray-600 mb-6">
              Review sẽ không hiển thị công khai nhưng vẫn được lưu trong hệ thống.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowHideModal(false)}
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

      {showDeleteModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowDeleteModal(false);
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Xác nhận xóa review</h3>
            <p className="text-gray-600 mb-6">
              Hành động này không thể hoàn tác. Review sẽ bị xóa vĩnh viễn.
            </p>
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
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

      {showReplyModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => {
            setShowReplyModal(false);
            setReplyText(review?.reply?.reply_text || "");
          }}
        >
          <div 
            className="bg-white rounded-xl p-6 max-w-lg w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-gray-900 mb-4">Trả lời review</h3>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-2">Review từ {review.customer_name}</p>
                {review.title && (
                  <p className="text-gray-900 font-medium mb-2">{review.title}</p>
                )}
                {review.comment ? (
                  <div 
                    className="text-gray-700 mt-2 review-content"
                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.comment) }}
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
                  // Reset to current reply text if exists, otherwise empty
                  setReplyText(review?.reply?.reply_text || "");
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
                {review?.reply ? "Cập nhật phản hồi" : "Gửi phản hồi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetail;

