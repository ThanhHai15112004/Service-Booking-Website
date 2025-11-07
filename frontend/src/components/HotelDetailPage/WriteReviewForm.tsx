import { useState, useEffect } from 'react';
import { Star, X, Send } from 'lucide-react';
import { createReview, updateReview } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { RichTextEditor } from '../common';

interface WriteReviewFormProps {
  hotelId: string;
  hotelName: string;
  bookingId?: string;
  reviewId?: string;
  initialRating?: number;
  initialLocationRating?: number;
  initialFacilitiesRating?: number;
  initialServiceRating?: number;
  initialCleanlinessRating?: number;
  initialValueRating?: number;
  initialTitle?: string;
  initialComment?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function WriteReviewForm({ 
  hotelId, 
  hotelName, 
  bookingId, 
  reviewId,
  initialRating = 0,
  initialLocationRating = 0,
  initialFacilitiesRating = 0,
  initialServiceRating = 0,
  initialCleanlinessRating = 0,
  initialValueRating = 0,
  initialTitle = '',
  initialComment = '',
  onSuccess, 
  onCancel 
}: WriteReviewFormProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(initialRating);
  const [locationRating, setLocationRating] = useState<number>(initialLocationRating);
  const [facilitiesRating, setFacilitiesRating] = useState<number>(initialFacilitiesRating);
  const [serviceRating, setServiceRating] = useState<number>(initialServiceRating);
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(initialCleanlinessRating);
  const [valueRating, setValueRating] = useState<number>(initialValueRating);
  const [hoverRatings, setHoverRatings] = useState<{ [key: string]: number }>({});
  const [title, setTitle] = useState<string>(initialTitle);
  const [comment, setComment] = useState<string>(initialComment);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (initialRating) setRating(initialRating);
    if (initialLocationRating) setLocationRating(initialLocationRating);
    if (initialFacilitiesRating) setFacilitiesRating(initialFacilitiesRating);
    if (initialServiceRating) setServiceRating(initialServiceRating);
    if (initialCleanlinessRating) setCleanlinessRating(initialCleanlinessRating);
    if (initialValueRating) setValueRating(initialValueRating);
    if (initialTitle) setTitle(initialTitle);
    if (initialComment) {
      setComment(initialComment);
    }
  }, [initialRating, initialLocationRating, initialFacilitiesRating, initialServiceRating, initialCleanlinessRating, initialValueRating, initialTitle, initialComment]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate: Phải có ít nhất 1 category rating
    const hasAnyRating = locationRating > 0 || facilitiesRating > 0 || serviceRating > 0 || 
                         cleanlinessRating > 0 || valueRating > 0 || rating > 0;
    if (!hasAnyRating) {
      setError('Vui lòng chọn đánh giá cho ít nhất một hạng mục');
      return;
    }

    if (!title.trim()) {
      setError('Vui lòng nhập tiêu đề đánh giá');
      return;
    }

    const formattedComment = comment;
    if (!formattedComment.trim() || formattedComment === '<br>' || formattedComment === '<div><br></div>') {
      setError('Vui lòng nhập nội dung đánh giá');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      let response;
      const reviewData: any = {
        title: title.trim(),
        comment: formattedComment
      };
      
      // Add category ratings if provided
      if (locationRating > 0) reviewData.location_rating = locationRating;
      if (facilitiesRating > 0) reviewData.facilities_rating = facilitiesRating;
      if (serviceRating > 0) reviewData.service_rating = serviceRating;
      if (cleanlinessRating > 0) reviewData.cleanliness_rating = cleanlinessRating;
      if (valueRating > 0) reviewData.value_rating = valueRating;
      
      // Overall rating is optional (will be calculated from category ratings)
      if (rating > 0) reviewData.rating = rating;
      
      if (reviewId) {
        // Update existing review
        response = await updateReview(reviewId, reviewData);
      } else {
        // Create new review
        response = await createReview({
          hotel_id: hotelId,
          booking_id: bookingId || null,
          ...reviewData
        });
      }

      if (response.success) {
        if (!reviewId) {
          // Only reset if creating new review
          setRating(0);
          setLocationRating(0);
          setFacilitiesRating(0);
          setServiceRating(0);
          setCleanlinessRating(0);
          setValueRating(0);
          setTitle('');
          setComment('');
        }
        setError('');
        if (onSuccess) {
          onSuccess();
        }
      } else {
        setError(response.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi gửi đánh giá');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <p className="text-gray-600 text-center">
          Vui lòng <a href="/login" className="text-blue-600 hover:underline">đăng nhập</a> để viết đánh giá
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">
          {reviewId ? 'Chỉnh sửa đánh giá' : 'Viết đánh giá cho'} {!reviewId && hotelName}
        </h3>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Category Star Ratings */}
        <div className="mb-6 space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Đánh giá chi tiết *
          </label>
          
          {/* Category Rating Component */}
          {([
            { key: 'location', label: 'Vị trí', rating: locationRating, setRating: setLocationRating },
            { key: 'facilities', label: 'Cơ sở vật chất', rating: facilitiesRating, setRating: setFacilitiesRating },
            { key: 'service', label: 'Dịch vụ', rating: serviceRating, setRating: setServiceRating },
            { key: 'cleanliness', label: 'Độ sạch sẽ', rating: cleanlinessRating, setRating: setCleanlinessRating },
            { key: 'value', label: 'Đáng giá tiền', rating: valueRating, setRating: setValueRating }
          ] as const).map(({ key, label, rating: catRating, setRating: setCatRating }) => (
            <div key={key} className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 w-32 flex-shrink-0">
                {label}
              </label>
              <div className="flex items-center gap-1 flex-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setCatRating(star)}
                    onMouseEnter={() => setHoverRatings(prev => ({ ...prev, [key]: star }))}
                    onMouseLeave={() => setHoverRatings(prev => ({ ...prev, [key]: 0 }))}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        star <= (hoverRatings[key] || catRating)
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {catRating > 0 && (
                  <span className="ml-2 text-xs text-gray-500">
                    {catRating === 1 && 'Rất tệ'}
                    {catRating === 2 && 'Tệ'}
                    {catRating === 3 && 'Bình thường'}
                    {catRating === 4 && 'Tốt'}
                    {catRating === 5 && 'Rất tốt'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Title Field */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiêu đề đánh giá *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề đánh giá của bạn..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={100}
          />
        </div>

        {/* Comment with WYSIWYG Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung đánh giá *
          </label>
          <RichTextEditor
            value={comment}
            onChange={(value: string) => setComment(value)}
            placeholder="Chia sẻ trải nghiệm của bạn về khách sạn này..."
            minHeight="150px"
            uploadEndpoint="/api/upload/single"
            uploadFieldName="image"
            onUploadError={(errorMsg: string) => setError(errorMsg)}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting || (!locationRating && !facilitiesRating && !serviceRating && !cleanlinessRating && !valueRating) || !title.trim() || !comment.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                {reviewId ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
              </>
            )}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
            >
              Hủy
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
