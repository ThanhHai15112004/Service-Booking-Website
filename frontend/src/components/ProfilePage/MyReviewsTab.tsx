import { useState, useEffect } from 'react';
import { Star, Filter, Edit2, Trash2, Clock, Hotel } from 'lucide-react';
import { getReviews, deleteReview } from '../../services/profileService';

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
  comment: string;
  createdAt: string;
  created_at: string;
}

interface MyReviewsTabProps {
  reviews?: Review[];
}

export default function MyReviewsTab({ reviews: initialReviews = [] }: MyReviewsTabProps) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Fetch reviews from API
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
            rating: r.rating, // Backend uses 1-5, frontend displays as 1-5 stars
            comment: r.comment || '',
            createdAt: r.created_at,
            created_at: r.created_at
          }));
          setReviews(normalizedReviews);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if no initial reviews provided
    if (initialReviews.length === 0) {
      fetchReviews();
    } else {
      setLoading(false);
    }
  }, [initialReviews]);

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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-5 h-5 ${
          index < rating
            ? 'text-yellow-400 fill-yellow-400'
            : 'text-gray-300'
        }`}
      />
    ));
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
          <div className="space-y-4">
            {filteredAndSortedReviews.map((review) => (
              <div
                key={review.id}
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
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {review.hotelName || review.hotel_name}
                        </h3>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-1">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm text-gray-500">
                            <Clock className="w-4 h-4 inline mr-1" />
                            {formatDate(review.createdAt || review.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const hotelId = review.hotelId || review.hotel_id;
                            if (hotelId) {
                              window.location.href = `/hotels/${hotelId}`;
                            }
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Xem khách sạn"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id || review.review_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Xóa đánh giá"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                  </div>
                </div>
              </div>
            ))}
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

      {/* Statistics */}
      {reviews.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thống kê đánh giá</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = reviews.filter(r => r.rating === rating).length;
              const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
              return (
                <div key={rating} className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                    <span className="font-bold text-gray-900">{rating}</span>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{count}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

