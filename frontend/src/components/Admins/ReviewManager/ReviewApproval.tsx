import { useState, useEffect } from "react";
import { CheckCircle, XCircle, Clock, Star, ChevronLeft, ChevronRight } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface PendingReview {
  review_id: string;
  customer_name: string;
  hotel_name: string;
  rating: number;
  title: string;
  comment: string;
  created_at: string;
}

const ReviewApproval = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<PendingReview[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    fetchPendingReviews();
  }, []);

  useEffect(() => {
    setFilteredReviews(reviews);
  }, [reviews]);

  const fetchPendingReviews = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call - filter by status PENDING
      setTimeout(() => {
        setReviews([
          {
            review_id: "RV003",
            customer_name: "Lê Văn C",
            hotel_name: "Saigon Riverside Hotel",
            rating: 3,
            title: "Ổn nhưng cần cải thiện",
            comment: "Phòng sạch nhưng dịch vụ còn chậm.",
            created_at: "2025-11-03T09:15:00",
          },
          {
            review_id: "RV004",
            customer_name: "Phạm Thị D",
            hotel_name: "Budget Hotel A",
            rating: 2,
            title: "Không hài lòng",
            comment: "Phòng nhỏ, dịch vụ kém.",
            created_at: "2025-11-03T08:00:00",
          },
        ]);
        setLoading(false);
      }, 800);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách review chờ duyệt");
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId: string) => {
    try {
      // TODO: API call to approve review (status: PENDING → ACTIVE)
      showToast("success", `Đã duyệt review ${reviewId}`);
      fetchPendingReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể duyệt review");
    }
  };

  const handleReject = async () => {
    if (!selectedReview || !rejectReason.trim()) {
      showToast("error", "Vui lòng nhập lý do từ chối");
      return;
    }

    try {
      // TODO: API call to reject/hide review
      showToast("success", `Đã từ chối review ${selectedReview.review_id}`);
      setShowRejectModal(false);
      setSelectedReview(null);
      setRejectReason("");
      fetchPendingReviews();
    } catch (error: any) {
      showToast("error", error.message || "Không thể từ chối review");
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

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải danh sách review chờ duyệt..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Duyệt và kiểm soát review</h1>
          <p className="text-gray-600 mt-1">Kiểm duyệt review trước khi hiển thị công khai</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Clock className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-yellow-900">
              Có {filteredReviews.length} review đang chờ duyệt
            </p>
            <p className="text-sm text-yellow-700 mt-1">
              Vui lòng kiểm tra nội dung và quyết định duyệt hoặc từ chối review.
            </p>
          </div>
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bình luận</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentReviews.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không có review nào chờ duyệt
                  </td>
                </tr>
              ) : (
                currentReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{review.review_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.customer_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{review.hotel_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {renderStars(review.rating)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{review.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">{review.comment}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatDateTime(review.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleApprove(review.review_id)}
                          className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                          title="Duyệt"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedReview(review);
                            setShowRejectModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                          title="Từ chối"
                        >
                          <XCircle size={18} />
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

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Từ chối review</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review ID</label>
                <p className="text-gray-900 font-mono">{selectedReview.review_id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Lý do từ chối *</label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Nhập lý do từ chối review..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg h-32 resize-none"
                  required
                />
              </div>
            </div>
            <div className="flex items-center gap-3 justify-end mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedReview(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
              >
                <XCircle size={18} />
                Từ chối
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewApproval;

