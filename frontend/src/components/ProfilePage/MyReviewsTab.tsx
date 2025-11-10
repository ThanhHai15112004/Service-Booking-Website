import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Filter, Edit2, Trash2, Clock, Hotel, Check, X, Loader } from 'lucide-react';
import { getReviews, deleteReview, updateReview } from '../../services/profileService';
import { RichTextEditor } from '../common';

interface Review {
  id: string;
  review_id: string;
  hotelId: string;
  hotel_id: string;
  hotelName: string;
  hotel_name: string;
  hotelImage?: string;
  hotel_image?: string;
  rating: number;
  title?: string;
  comment: string;
  location_rating?: number | null;
  facilities_rating?: number | null;
  service_rating?: number | null;
  cleanliness_rating?: number | null;
  value_rating?: number | null;
  createdAt: string;
  created_at: string;
  reply?: {
    reply_id: string;
    reply_text: string;
    replied_by: string;
    replied_by_name: string;
    replied_at: string;
  };
}

interface MyReviewsTabProps {
  reviews?: Review[];
}

export default function MyReviewsTab({ reviews: initialReviews = [] }: MyReviewsTabProps) {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  
  // Inline editing state
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editComment, setEditComment] = useState<string>('');
  const [editLocationRating, setEditLocationRating] = useState<number>(0);
  const [editFacilitiesRating, setEditFacilitiesRating] = useState<number>(0);
  const [editServiceRating, setEditServiceRating] = useState<number>(0);
  const [editCleanlinessRating, setEditCleanlinessRating] = useState<number>(0);
  const [editValueRating, setEditValueRating] = useState<number>(0);
  const [hoverRatings, setHoverRatings] = useState<{ [key: string]: number }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch reviews from API - chỉ chạy 1 lần khi component mount
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      try {
        const response = await getReviews();
        if (response.success && response.data) {
          // Normalize review data
          const normalizedReviews: Review[] = response.data.map((r: any) => ({
            id: r.review_id,
            review_id: r.review_id,
            hotelId: r.hotel_id,
            hotel_id: r.hotel_id,
            hotelName: r.hotel_name || 'Khách sạn',
            hotel_name: r.hotel_name || 'Khách sạn',
            hotelImage: r.hotel_image || undefined,
            hotel_image: r.hotel_image || undefined,
            rating: r.rating || 0, // Backend uses 1-5
            title: r.title || '',
            comment: r.comment || '',
            location_rating: r.location_rating || null,
            facilities_rating: r.facilities_rating || null,
            service_rating: r.service_rating || null,
            cleanliness_rating: r.cleanliness_rating || null,
            value_rating: r.value_rating || null,
            createdAt: r.created_at,
            created_at: r.created_at,
            reply: r.reply || undefined
          }));
          setReviews(normalizedReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    // Chỉ fetch nếu không có initial reviews hoặc initial reviews rỗng
    if (!initialReviews || initialReviews.length === 0) {
      fetchReviews();
    } else {
      // Nếu có initial reviews, set vào state và không loading
      setReviews(initialReviews);
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - chỉ chạy khi component mount

  const filteredAndSortedReviews = reviews
    .filter(review => ratingFilter === null || review.rating === ratingFilter)
    .sort((a, b) => {
      const dateA = new Date(a.createdAt || a.created_at).getTime();
      const dateB = new Date(b.createdAt || b.created_at).getTime();
      return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        const response = await deleteReview(id);
        if (response.success) {
          setReviews(reviews.filter(review => review.id !== id && review.review_id !== id));
        } else {
          alert(response.message || 'Không thể xóa đánh giá');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Có lỗi xảy ra khi xóa đánh giá');
      }
    }
  };

  const handleStartEdit = (review: Review) => {
    const reviewId = review.id || review.review_id;
    setEditingReviewId(reviewId);
    setEditTitle(review.title || '');
    setEditComment(review.comment || '');
    setEditLocationRating(review.location_rating || 0);
    setEditFacilitiesRating(review.facilities_rating || 0);
    setEditServiceRating(review.service_rating || 0);
    setEditCleanlinessRating(review.cleanliness_rating || 0);
    setEditValueRating(review.value_rating || 0);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditTitle('');
    setEditComment('');
    setEditLocationRating(0);
    setEditFacilitiesRating(0);
    setEditServiceRating(0);
    setEditCleanlinessRating(0);
    setEditValueRating(0);
    setHoverRatings({});
    setError('');
  };

  const handleSaveEdit = async (reviewId: string) => {
    // Validate
    if (!editTitle.trim()) {
      setError('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    const formattedComment = editComment;
    if (!formattedComment.trim() || formattedComment === '<br>' || formattedComment === '<div><br></div>') {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    // Validate: Phải có ít nhất 1 category rating
    const hasAnyRating = editLocationRating > 0 || editFacilitiesRating > 0 || editServiceRating > 0 || 
                         editCleanlinessRating > 0 || editValueRating > 0;
    if (!hasAnyRating) {
      setError('Vui lòng chọn đánh giá cho ít nhất một hạng mục');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const reviewData: any = {
        title: editTitle.trim(),
        comment: formattedComment
      };

      // Add category ratings if provided
      if (editLocationRating > 0) reviewData.location_rating = editLocationRating;
      if (editFacilitiesRating > 0) reviewData.facilities_rating = editFacilitiesRating;
      if (editServiceRating > 0) reviewData.service_rating = editServiceRating;
      if (editCleanlinessRating > 0) reviewData.cleanliness_rating = editCleanlinessRating;
      if (editValueRating > 0) reviewData.value_rating = editValueRating;

      const response = await updateReview(reviewId, reviewData);

      if (response.success) {
        // Reload reviews to get updated data
        const response = await getReviews();
        if (response.success && response.data) {
          const normalizedReviews: Review[] = response.data.map((r: any) => ({
            id: r.review_id,
            review_id: r.review_id,
            hotelId: r.hotel_id,
            hotel_id: r.hotel_id,
            hotelName: r.hotel_name || 'Khách sạn',
            hotel_name: r.hotel_name || 'Khách sạn',
            hotelImage: r.hotel_image || undefined,
            hotel_image: r.hotel_image || undefined,
            rating: r.rating || 0,
            title: r.title || '',
            comment: r.comment || '',
            location_rating: r.location_rating || null,
            facilities_rating: r.facilities_rating || null,
            service_rating: r.service_rating || null,
            cleanliness_rating: r.cleanliness_rating || null,
            value_rating: r.value_rating || null,
            createdAt: r.created_at,
            created_at: r.created_at,
            reply: r.reply || undefined
          }));
          setReviews(normalizedReviews);
        }
        setEditingReviewId(null);
      } else {
        setError(response.message || 'Không thể cập nhật đánh giá');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      setError('Có lỗi xảy ra khi cập nhật đánh giá');
    } finally {
      setSaving(false);
    }
  };


  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Sanitize HTML
  const sanitizeHTML = (html: string): string => {
    if (!html) return '';
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const renderCategoryRating = (
    reviewId: string,
    key: string,
    label: string,
    rating: number,
    setRating: (value: number) => void
  ) => {
    const isEditing = editingReviewId === reviewId;
    const currentRating = isEditing ? rating : (0);
    const hoverRating = hoverRatings[key] || 0;
    const displayRating = hoverRating || currentRating;

    return (
      <div className="flex items-center gap-2 mb-2">
        <label className="text-xs text-gray-700 w-24 flex-shrink-0">{label}</label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => isEditing && setRating(star)}
              onMouseEnter={() => isEditing && setHoverRatings(prev => ({ ...prev, [key]: star }))}
              onMouseLeave={() => isEditing && setHoverRatings(prev => ({ ...prev, [key]: 0 }))}
              disabled={!isEditing}
              className={`focus:outline-none transition-transform ${isEditing ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
            >
              <Star
                className={`w-4 h-4 ${
                  star <= displayRating
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          {currentRating > 0 && (
            <span className="ml-2 text-xs text-gray-500">
              {currentRating === 1 && 'Rất tệ'}
              {currentRating === 2 && 'Tệ'}
              {currentRating === 3 && 'Bình thường'}
              {currentRating === 4 && 'Tốt'}
              {currentRating === 5 && 'Rất tốt'}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderStars = (rating: number) => {
    // Convert 1-5 to display (show as 1-10 scale visually)
    const displayRating = rating * 2; // Convert to 1-10 for display
    return (
      <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, index) => {
          const starRating = (index + 1) * 2; // 2, 4, 6, 8, 10
          return (
            <Star
              key={index}
              className={`w-4 h-4 ${
                starRating <= displayRating
                  ? 'text-yellow-400 fill-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          );
        })}
        <span className="ml-1 text-sm font-medium text-gray-700">{displayRating.toFixed(1)}/10</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Đánh giá của tôi</h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Lọc theo:</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRatingFilter(null)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                ratingFilter === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            {[5, 4, 3, 2, 1].map((rating) => (
              <button
                key={rating}
                onClick={() => setRatingFilter(rating)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-1 ${
                  ratingFilter === rating
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Star className={`w-4 h-4 ${ratingFilter === rating ? 'text-yellow-300' : 'text-yellow-400'} fill-current`} />
                {rating}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-700">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
            </select>
          </div>
        </div>

        {/* Reviews List */}
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : filteredAndSortedReviews.length > 0 ? (
          <div className="space-y-6">
            {filteredAndSortedReviews.map((review) => {
              const reviewId = review.id || review.review_id;
              const isEditing = editingReviewId === reviewId;

              return (
                <div
                  key={reviewId}
                  className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex gap-4">
                    {/* Hotel Image */}
                    <div className="w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                      {(review.hotelImage || review.hotel_image) ? (
                        <img
                          src={review.hotelImage || review.hotel_image}
                          alt={review.hotelName || review.hotel_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Hotel className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Review Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-lg mb-1">
                            {review.hotelName || review.hotel_name}
                          </h3>
                          <div className="flex items-center gap-3 mb-2">
                            {renderStars(review.rating || 0)}
                            <span className="text-sm text-gray-500">
                              <Clock className="w-4 h-4 inline mr-1" />
                              {formatDate(review.createdAt || review.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isEditing ? (
                            <>
                              <button
                                onClick={() => handleSaveEdit(reviewId)}
                                disabled={saving}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                                title="Lưu"
                              >
                                {saving ? (
                                  <>
                                    <Loader className="w-4 h-4 animate-spin" />
                                    Đang lưu...
                                  </>
                                ) : (
                                  <>
                                    <Check className="w-4 h-4" />
                                    Lưu
                                  </>
                                )}
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                disabled={saving}
                                className="px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
                                title="Hủy"
                              >
                                <X className="w-4 h-4" />
                                Hủy
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                onClick={() => {
                                  const hotelId = review.hotelId || review.hotel_id;
                                  if (hotelId) {
                                    navigate(`/hotel/${hotelId}`);
                                  }
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Xem khách sạn"
                              >
                                <Hotel className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleStartEdit(review)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                title="Chỉnh sửa"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(reviewId)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                title="Xóa đánh giá"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Rating Breakdown - Chỉ hiển thị khi đang edit */}
                      {isEditing && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-xs font-semibold text-gray-700 mb-2">Đánh giá chi tiết:</h4>
                          {renderCategoryRating(reviewId, `${reviewId}-location`, 'Vị trí', 
                            editLocationRating,
                            setEditLocationRating)}
                          {renderCategoryRating(reviewId, `${reviewId}-facilities`, 'Cơ sở vật chất', 
                            editFacilitiesRating,
                            setEditFacilitiesRating)}
                          {renderCategoryRating(reviewId, `${reviewId}-service`, 'Dịch vụ', 
                            editServiceRating,
                            setEditServiceRating)}
                          {renderCategoryRating(reviewId, `${reviewId}-cleanliness`, 'Độ sạch sẽ', 
                            editCleanlinessRating,
                            setEditCleanlinessRating)}
                          {renderCategoryRating(reviewId, `${reviewId}-value`, 'Đáng giá tiền', 
                            editValueRating,
                            setEditValueRating)}
                        </div>
                      )}

                      {/* Title */}
                      {isEditing ? (
                        <div className="mb-3">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Nhập tiêu đề đánh giá..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            maxLength={100}
                            disabled={saving}
                          />
                        </div>
                      ) : review.title ? (
                        <h4 className="text-lg font-bold text-gray-900 mb-2">
                          {review.title}
                        </h4>
                      ) : null}

                      {/* Comment */}
                      {isEditing ? (
                        <div className="mb-3">
                          <RichTextEditor
                            key={reviewId}
                            value={editComment}
                            onChange={(value) => setEditComment(value)}
                            placeholder="Chia sẻ trải nghiệm của bạn..."
                            minHeight="120px"
                            uploadEndpoint="/api/upload/single"
                            uploadFieldName="image"
                            onUploadError={(errorMsg) => setError(errorMsg)}
                          />
                        </div>
                      ) : (
                        <>
                          <div 
                            className="text-gray-700 leading-relaxed review-content"
                            dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.comment) }}
                            style={{ wordBreak: 'break-word' }}
                          />
                          
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
                                      {formatDate(review.reply.replied_at)}
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
                        </>
                      )}

                      {/* Error Message */}
                      {isEditing && error && (
                        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-xs text-red-600">{error}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Bạn chưa viết đánh giá nào
            </h3>
            <p className="text-gray-600 mb-4">
              Chia sẻ trải nghiệm của bạn để giúp những người khác tìm được khách sạn phù hợp
            </p>
          </div>
        )}
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
    </div>
  );
}
