import { useState, useEffect } from 'react';
import { Star, Check, Calendar, Users, Building2, ChevronLeft, ChevronRight, Edit, Trash2 } from 'lucide-react';
import { Review } from '../../types';
import { getHotelReviews } from '../../services/hotelService';
import { getUserHotelReview, deleteReview } from '../../services/profileService';
import WriteReviewForm from './WriteReviewForm';
import { useAuth } from '../../contexts/AuthContext';

interface HotelReviewsDetailedProps {
  hotelId: string;
  hotelName: string;
  overallRating?: number;
  reviewsCount?: number;
  categoryRatings?: Array<{
    label: string;
    score: number;
  }>;
  ratingDistribution?: {
    excellent: number; // 9+
    veryGood: number; // 8-9
    good: number; // 7-8
    average: number; // 6-7
    poor: number; // <6
  };
  reviewTags?: Array<{
    keyword: string;
    count: number;
  }>;
}

export default function HotelReviewsDetailed({
  hotelId,
  hotelName,
  overallRating = 8.5,
  reviewsCount = 2748,
  categoryRatings = [
    { label: 'Vị trí', score: 8.8 },
    { label: 'Cơ sở vật chất', score: 8.7 },
    { label: 'Dịch vụ', score: 8.5 },
    { label: 'Độ sạch sẽ', score: 8.7 },
    { label: 'Đáng giá tiền', score: 8.7 }
  ],
  ratingDistribution = {
    excellent: 523,
    veryGood: 182,
    good: 101,
    average: 26,
    poor: 153
  },
  reviewTags = []
}: HotelReviewsDetailedProps) {
  const { user } = useAuth();
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedGuestType, setSelectedGuestType] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  const [loadingReviews, setLoadingReviews] = useState(true); // Start with true to show loading
  const [reviewsData, setReviewsData] = useState<Review[]>([]);
  const [reviewsStats, setReviewsStats] = useState<any>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);
  const [editingUserReview, setEditingUserReview] = useState(false);
  const [loadingUserReview, setLoadingUserReview] = useState(false);
  
  // Rating filter states - mặc định tất cả đều được chọn
  const [selectedRatingFilters, setSelectedRatingFilters] = useState<Set<string>>(
    new Set(['excellent', 'veryGood', 'good', 'average', 'poor'])
  );
  
  const itemsPerPage = 10;

  // Filter reviews based on selected rating ranges
  const filteredReviewsByRating = reviewsData.filter((review) => {
    const reviewRating = typeof review.rating === 'number' 
      ? review.rating 
      : (typeof review.rating === 'string' ? parseFloat(review.rating) || 0 : 0);
    
    // Check if review rating matches any selected filter
    if (selectedRatingFilters.has('excellent') && reviewRating >= 9) return true;
    if (selectedRatingFilters.has('veryGood') && reviewRating >= 8 && reviewRating < 9) return true;
    if (selectedRatingFilters.has('good') && reviewRating >= 7 && reviewRating < 8) return true;
    if (selectedRatingFilters.has('average') && reviewRating >= 6 && reviewRating < 7) return true;
    if (selectedRatingFilters.has('poor') && reviewRating < 6) return true;
    
    return false;
  });

  // Apply all filters (rating, guest type, room type, language, tag)
  const filteredReviews = filteredReviewsByRating.filter((review) => {
    // Guest type filter
    if (selectedGuestType !== 'all') {
      const guestsCount = review.bookingInfo?.guests_count || 0;
      if (selectedGuestType === 'couple' && guestsCount !== 2) return false;
      if (selectedGuestType === 'solo' && guestsCount !== 1) return false;
      if (selectedGuestType === 'family' && guestsCount < 3) return false;
      if (selectedGuestType === 'business' && guestsCount < 1) return false;
    }

    // Room type filter
    if (selectedRoomType !== 'all') {
      const roomType = review.bookingInfo?.room_type_name?.toLowerCase() || '';
      if (selectedRoomType !== 'all' && !roomType.includes(selectedRoomType.toLowerCase())) {
        return false;
      }
    }

    // Language filter (if implemented)
    // Tag filter (if implemented)
    
    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);
  const displayedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle rating filter toggle
  const toggleRatingFilter = (filterKey: string) => {
    setSelectedRatingFilters(prev => {
      const next = new Set(prev);
      if (next.has(filterKey)) {
        next.delete(filterKey);
      } else {
        next.add(filterKey);
      }
      // Reset to page 1 when filter changes
      setCurrentPage(1);
      return next;
    });
  };

  // Fetch user's review for this hotel
  useEffect(() => {
    const fetchUserReview = async () => {
      if (!user || !hotelId) return;
      
      setLoadingUserReview(true);
      try {
        const response = await getUserHotelReview(hotelId);
        if (response.success && response.data) {
          const r = response.data;
          setUserReview({
            reviewId: r.review_id,
            accountId: r.account_id,
            userName: r.user_name || user.full_name || 'Người dùng',
            userAvatar: r.user_avatar || user.avatar_url || undefined,
            rating: r.rating * 2, // Convert 1-5 to 1-10
            title: r.title || '',
            comment: r.comment || '',
            createdAt: r.created_at,
            locationRating: r.location_rating ? r.location_rating * 2 : undefined,
            facilitiesRating: r.facilities_rating ? r.facilities_rating * 2 : undefined,
            serviceRating: r.service_rating ? r.service_rating * 2 : undefined,
            cleanlinessRating: r.cleanliness_rating ? r.cleanliness_rating * 2 : undefined,
            valueRating: r.value_rating ? r.value_rating * 2 : undefined
          });
        } else {
          setUserReview(null);
        }
      } catch (error) {
        console.error('Error fetching user review:', error);
        setUserReview(null);
      } finally {
        setLoadingUserReview(false);
      }
    };

    fetchUserReview();
  }, [hotelId, user]);

  // Fetch reviews from API (excluding user's review)
  useEffect(() => {
    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        const response = await getHotelReviews(hotelId, 100, 0);
        if (response.success && response.data) {
          // Convert backend reviews to frontend format
          // Backend rating is 1-5, convert to 1-10 for display
          const convertedReviews: Review[] = response.data.reviews.map((r: any) => ({
            reviewId: r.review_id,
            accountId: r.account_id,
            userName: r.user_name || 'Người dùng',
            userAvatar: r.user_avatar || undefined,
            rating: r.rating * 2, // Convert 1-5 to 1-10
            title: r.title || '',
            comment: r.comment || '',
            createdAt: r.created_at,
            locationRating: r.location_rating ? r.location_rating * 2 : undefined,
            facilitiesRating: r.facilities_rating ? r.facilities_rating * 2 : undefined,
            serviceRating: r.service_rating ? r.service_rating * 2 : undefined,
            cleanlinessRating: r.cleanliness_rating ? r.cleanliness_rating * 2 : undefined,
            valueRating: r.value_rating ? r.value_rating * 2 : undefined
          }));
          
          // Show ALL reviews, don't filter anything
          setReviewsData(convertedReviews);
          
          // Update stats
          if (response.data.stats) {
            setReviewsStats(response.data.stats);
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoadingReviews(false);
      }
    };

    if (hotelId) {
      fetchReviews();
    }
  }, [hotelId, userReview]);

  const handleReviewSuccess = async () => {
    setEditingUserReview(false);
    
    // Reload user review first
    let newUserReview: Review | null = null;
    if (user && hotelId) {
      const userReviewResponse = await getUserHotelReview(hotelId);
      if (userReviewResponse.success && userReviewResponse.data) {
        const r = userReviewResponse.data;
        newUserReview = {
          reviewId: r.review_id,
          accountId: r.account_id,
          userName: r.user_name || user.full_name || 'Người dùng',
          userAvatar: r.user_avatar || user.avatar_url || undefined,
          rating: r.rating * 2,
          title: r.title || '',
          comment: r.comment || '',
          createdAt: r.created_at,
          locationRating: r.location_rating ? r.location_rating * 2 : undefined,
          facilitiesRating: r.facilities_rating ? r.facilities_rating * 2 : undefined,
          serviceRating: r.service_rating ? r.service_rating * 2 : undefined,
          cleanlinessRating: r.cleanliness_rating ? r.cleanliness_rating * 2 : undefined,
          valueRating: r.value_rating ? r.value_rating * 2 : undefined
        };
        setUserReview(newUserReview);
      } else {
        setUserReview(null);
      }
    }
    
    // Reload all reviews (show ALL, don't filter)
    const response = await getHotelReviews(hotelId, 100, 0);
    if (response.success && response.data) {
        const convertedReviews: Review[] = response.data.reviews.map((r: any) => ({
          reviewId: r.review_id,
          accountId: r.account_id,
          userName: r.user_name || 'Người dùng',
          userAvatar: r.user_avatar || undefined,
          rating: r.rating * 2,
          title: r.title || '',
          comment: r.comment || '',
          createdAt: r.created_at,
          locationRating: r.location_rating ? r.location_rating * 2 : undefined,
          facilitiesRating: r.facilities_rating ? r.facilities_rating * 2 : undefined,
          serviceRating: r.service_rating ? r.service_rating * 2 : undefined,
          cleanlinessRating: r.cleanliness_rating ? r.cleanliness_rating * 2 : undefined,
          valueRating: r.value_rating ? r.value_rating * 2 : undefined
        }));
      
      // Show ALL reviews, don't filter anything
      setReviewsData(convertedReviews);
      if (response.data.stats) {
        setReviewsStats(response.data.stats);
      }
    }
  };

  const handleDeleteReview = async () => {
    if (!userReview) return;
    
    if (window.confirm('Bạn có chắc muốn xóa đánh giá này?')) {
      try {
        const response = await deleteReview(userReview.reviewId);
        if (response.success) {
          setUserReview(null);
          setEditingUserReview(false);
          handleReviewSuccess();
        } else {
          alert(response.message || 'Không thể xóa đánh giá');
        }
      } catch (error) {
        console.error('Error deleting review:', error);
        alert('Có lỗi xảy ra khi xóa đánh giá');
      }
    }
  };

  // ✅ FIX: Ensure overallRating is a number (handle string from backend)
  // hotel.avgRating từ props là trên thang điểm 1-5 (chưa convert)
  // Chỉ convert nếu rating < 5 (đảm bảo không convert 2 lần)
  const numericRating = overallRating 
    ? (typeof overallRating === 'number' 
        ? (overallRating < 5 ? overallRating * 2 : overallRating) // Chỉ convert nếu < 5
        : (typeof overallRating === 'string' 
            ? (() => {
                const parsed = parseFloat(overallRating);
                return isNaN(parsed) ? 8.5 : (parsed < 5 ? parsed * 2 : parsed);
              })()
            : 8.5))
    : 8.5;
  const numericReviewsCount = reviewsCount 
    ? (typeof reviewsCount === 'number' 
        ? reviewsCount 
        : (typeof reviewsCount === 'string' 
            ? parseInt(reviewsCount, 10) || 0 
            : 0))
    : 0;

  const getRatingText = (score: number) => {
    if (score >= 9.5) return 'Trên cả tuyệt vời';
    if (score >= 9) return 'Tuyệt vời';
    if (score >= 8.5) return 'Xuất sắc';
    if (score >= 8) return 'Rất tốt';
    if (score >= 7) return 'Tốt';
    if (score >= 6) return 'Khá tốt';
    return 'Bình thường';
  };

  const getRatingColor = (score: number) => {
    if (score >= 9) return '#2067da';
    if (score >= 8) return '#06c167';
    if (score >= 7) return '#2067da';
    return '#f59e0b';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const months = [
      'tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6',
      'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'
    ];
    return `Đã nhận xét vào ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const toggleHelpful = (reviewId: string) => {
    setHelpfulReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
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

  // Default review tags if not provided
  const defaultTags = [
    { keyword: 'Tất cả các nhận xét', count: numericReviewsCount },
    { keyword: 'Độ sạch sẽ', count: 155 },
    { keyword: 'Dịch vụ', count: 117 },
    { keyword: 'Nhận phòng', count: 83 },
    { keyword: 'Tiện nghi trong phòng', count: 79 },
    { keyword: 'Độ thoải mái của phòng', count: 74 },
    { keyword: 'Đáng tiền', count: 61 },
    { keyword: 'Địa điểm', count: 57 }
  ];

  const tags = reviewTags.length > 0 ? reviewTags : defaultTags;

  // Use stats from API if available
  // Use actual rating distribution from API if available
  const displayRatingDistribution = reviewsStats ? {
    excellent: reviewsStats.excellent_count || 0,
    veryGood: reviewsStats.very_good_count || 0,
    good: reviewsStats.good_count || 0,
    average: reviewsStats.average_count || 0,
    poor: reviewsStats.poor_count || 0
  } : ratingDistribution;

  // reviewsStats.avg_rating đã được backend convert sang thang điểm 10 rồi, không cần convert thêm
  const actualOverallRating = reviewsStats?.avg_rating || numericRating;
  const actualReviewsCount = reviewsStats?.total_reviews || numericReviewsCount;
  
  // Use actual stats if available, otherwise use props
  const displayRating = actualOverallRating;
  const displayCount = actualReviewsCount;

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black mb-2">
          Bài đánh giá {hotelName} từ khách hàng
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-600" />
          <span>Đánh giá từ khách hàng đã xác thực</span>
        </div>
      </div>

      {/* Overall Rating & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Overall Score */}
        <div className="lg:col-span-1">
          <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
            <div className="text-5xl font-bold mb-2">{displayRating.toFixed(1)}<span className="text-3xl">/10</span></div>
            <div className="text-xl font-semibold mb-2">{getRatingText(displayRating)}</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <Check className="w-4 h-4" />
              <span>Dựa trên {displayCount.toLocaleString()} bài đánh giá</span>
            </div>
          </div>
        </div>

        {/* Middle: Category Ratings */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Đánh giá chi tiết</h3>
          <div className="space-y-3">
            {([
              { key: 'location', label: 'Vị trí', score: reviewsStats?.avg_location_rating || categoryRatings.find(c => c.label === 'Vị trí')?.score || 0 },
              { key: 'facilities', label: 'Cơ sở vật chất', score: reviewsStats?.avg_facilities_rating || categoryRatings.find(c => c.label === 'Cơ sở vật chất')?.score || 0 },
              { key: 'service', label: 'Dịch vụ', score: reviewsStats?.avg_service_rating || categoryRatings.find(c => c.label === 'Dịch vụ')?.score || 0 },
              { key: 'cleanliness', label: 'Độ sạch sẽ', score: reviewsStats?.avg_cleanliness_rating || categoryRatings.find(c => c.label === 'Độ sạch sẽ')?.score || 0 },
              { key: 'value', label: 'Đáng giá tiền', score: reviewsStats?.avg_value_rating || categoryRatings.find(c => c.label === 'Đáng giá tiền')?.score || 0 }
            ]).map((category) => {
              // reviewsStats ratings đã được backend convert sang thang điểm 10 rồi
              // categoryRatings từ props có thể là hardcoded trên thang điểm 10
              const rawScore = typeof category.score === 'number' ? category.score : (typeof category.score === 'string' ? parseFloat(category.score) : 0);
              // Nếu score từ reviewsStats (đã convert) hoặc từ categoryRatings (đã là 1-10), không cần convert
              // Chỉ convert nếu score < 5 (có thể là từ 1-5 scale)
              const safeScore = isNaN(rawScore) ? 0 : (rawScore < 5 ? rawScore * 2 : rawScore);
              
              return (
                <div key={category.key}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-700">{category.label}</span>
                    <span className="text-xs font-bold text-gray-900">{safeScore.toFixed(1)}/10</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                        width: `${(safeScore / 10) * 100}%`,
                        backgroundColor: getRatingColor(safeScore)
                    }}
                  />
                </div>
              </div>
              );
            })}
          </div>
          {reviewsStats && reviewsStats.total_reviews > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-green-600 font-medium">
                Điểm cao đối với {hotelName}
              </div>
            </div>
          )}
        </div>

        {/* Right: Rating Distribution */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Xếp hạng:</h3>
          <div className="space-y-2">
            <div 
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              onClick={() => toggleRatingFilter('excellent')}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={selectedRatingFilters.has('excellent')}
                onChange={() => toggleRatingFilter('excellent')}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-gray-700 flex-1">9+ Hiếm Có (Rare)</span>
              <span className="text-gray-500">({displayRatingDistribution.excellent})</span>
            </div>
            <div 
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              onClick={() => toggleRatingFilter('veryGood')}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={selectedRatingFilters.has('veryGood')}
                onChange={() => toggleRatingFilter('veryGood')}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-gray-700 flex-1">8-9 Xuất Sắc (Excellent)</span>
              <span className="text-gray-500">({displayRatingDistribution.veryGood})</span>
            </div>
            <div 
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              onClick={() => toggleRatingFilter('good')}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={selectedRatingFilters.has('good')}
                onChange={() => toggleRatingFilter('good')}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-gray-700 flex-1">7-8 Rất Tốt (Very Good)</span>
              <span className="text-gray-500">({displayRatingDistribution.good})</span>
            </div>
            <div 
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              onClick={() => toggleRatingFilter('average')}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={selectedRatingFilters.has('average')}
                onChange={() => toggleRatingFilter('average')}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-gray-700 flex-1">6-7 Tốt (Good)</span>
              <span className="text-gray-500">({displayRatingDistribution.average})</span>
            </div>
            <div 
              className="flex items-center gap-2 text-xs cursor-pointer hover:bg-gray-50 p-1 rounded transition-colors"
              onClick={() => toggleRatingFilter('poor')}
            >
              <input 
                type="checkbox" 
                className="w-4 h-4 cursor-pointer" 
                checked={selectedRatingFilters.has('poor')}
                onChange={() => toggleRatingFilter('poor')}
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-gray-700 flex-1">&lt;6 Dưới Mức Mong Đợi (Below Expectations)</span>
              <span className="text-gray-500">({displayRatingDistribution.poor})</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <select
            value={selectedGuestType}
            onChange={(e) => setSelectedGuestType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tất cả mọi du khách ({displayCount})</option>
            <option value="couple">Cặp đôi</option>
            <option value="family">Gia đình</option>
            <option value="solo">Du lịch một mình</option>
            <option value="business">Công tác</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={selectedRoomType}
            onChange={(e) => setSelectedRoomType(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Mọi loại phòng</option>
            <option value="deluxe">Deluxe Room</option>
            <option value="suite">Suite</option>
            <option value="apartment">Apartment</option>
          </select>
        </div>
        <div className="relative">
          <select
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Mọi ngôn ngữ</option>
            <option value="vi">Tiếng Việt</option>
            <option value="en">English</option>
            <option value="ko">한국어</option>
            <option value="zh">中文</option>
          </select>
        </div>
      </div>

      {/* Review Tags */}
      {tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Hiển thị nhận xét có đề cập đến
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <button
                key={index}
                onClick={() => setSelectedTag(tag.keyword)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-colors ${
                  selectedTag === tag.keyword
                    ? 'bg-blue-600 text-white border-2 border-blue-600'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-500'
                }`}
              >
                {tag.keyword} ({tag.count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* User's Review Section - Always at top if user is logged in */}
      {user && (
        <div className="mb-6">
          {loadingUserReview ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : editingUserReview && userReview ? (
            // Edit mode: Show form
            <WriteReviewForm
              hotelId={hotelId}
              hotelName={hotelName}
              reviewId={userReview.reviewId}
              initialRating={userReview.rating / 2} // Convert back to 1-5
              initialLocationRating={userReview.locationRating ? userReview.locationRating / 2 : 0}
              initialFacilitiesRating={userReview.facilitiesRating ? userReview.facilitiesRating / 2 : 0}
              initialServiceRating={userReview.serviceRating ? userReview.serviceRating / 2 : 0}
              initialCleanlinessRating={userReview.cleanlinessRating ? userReview.cleanlinessRating / 2 : 0}
              initialValueRating={userReview.valueRating ? userReview.valueRating / 2 : 0}
              initialTitle={userReview.title || ''}
              initialComment={userReview.comment || ''}
              onSuccess={handleReviewSuccess}
              onCancel={() => setEditingUserReview(false)}
            />
          ) : userReview ? (
            // User has reviewed: Show review with edit button
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Đánh giá của bạn</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingUserReview(true)}
                    className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <Edit className="w-4 h-4" />
                    Chỉnh sửa
                  </button>
                  <button
                    onClick={handleDeleteReview}
                    className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Xóa
                  </button>
                </div>
              </div>
              {/* Show user's review card */}
              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {/* Left: Rating & Reviewer Info */}
                  <div className="md:col-span-1">
                  <div className="text-4xl font-bold mb-2" style={{ color: getRatingColor(userReview.rating) }}>
                    {userReview.rating.toFixed(1)}<span className="text-2xl">/10</span>
                  </div>
                    <div className="text-sm font-semibold mb-4" style={{ color: getRatingColor(userReview.rating) }}>
                      {getRatingText(userReview.rating)}
                    </div>
                  </div>
                  
                  {/* Right: Review Content */}
                  <div className="md:col-span-3">
                    <h4 className="text-lg font-bold text-gray-900 mb-3">
                      {userReview.title || 'Đánh giá'}
                    </h4>
                    <div 
                      className="text-sm text-gray-700 mb-3 leading-relaxed review-content"
                      dangerouslySetInnerHTML={{ __html: sanitizeHTML(userReview.comment) }}
                      style={{ wordBreak: 'break-word' }}
                    />
                    <p className="text-xs text-gray-500">
                      {formatDate(userReview.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // User hasn't reviewed: Show form to write review
            <div className="mb-6">
              <WriteReviewForm
                hotelId={hotelId}
                hotelName={hotelName}
                onSuccess={handleReviewSuccess}
              />
            </div>
          )}
        </div>
      )}

      {/* Divider và tiêu đề ngăn cách */}
      {user && (
        <div className="border-t border-gray-300 my-6 pt-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Các bài đánh giá</h3>
        </div>
      )}

      {/* Reviews List */}
      {loadingReviews ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có đánh giá nào</h3>
          <p className="text-gray-600">Hãy là người đầu tiên đánh giá khách sạn này!</p>
        </div>
      ) : (
      <div className="space-y-6 mb-6">
        {displayedReviews.map((review) => {
          // ✅ FIX: Ensure review.rating is a number
          const reviewRating = typeof review.rating === 'number' 
            ? review.rating 
            : (typeof review.rating === 'string' 
                ? parseFloat(review.rating) || 0 
                : 0);
          
          return (
            <div
              key={review.reviewId}
              className="bg-gray-50 rounded-lg p-6 border border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Left: Rating & Reviewer Info */}
                <div className="md:col-span-1">
                  <div className="text-4xl font-bold mb-2" style={{ color: getRatingColor(reviewRating) }}>
                    {reviewRating.toFixed(1)}<span className="text-2xl">/10</span>
                  </div>
                  <div className="text-sm font-semibold mb-4" style={{ color: getRatingColor(reviewRating) }}>
                    {getRatingText(reviewRating)}
                  </div>
                
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    {review.userAvatar ? (
                      <img 
                        src={review.userAvatar.startsWith('http') 
                          ? review.userAvatar 
                          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${review.userAvatar}`}
                        alt={review.userName}
                        className="w-5 h-5 rounded-full object-cover border border-gray-300"
                        onError={(e) => {
                          // Fallback to initial if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <span 
                      className={`w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-semibold ${review.userAvatar ? 'hidden' : ''}`}
                      style={{ display: review.userAvatar ? 'none' : 'flex' }}
                    >
                      {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                    <span className="font-semibold">{review.userName}</span>
                    <span className="text-gray-500">từ Việt Nam</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-3 h-3 text-gray-400" />
                    <span>Cặp đôi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3 h-3 text-gray-400" />
                    <span>Căn hộ 1 phòng ngủ có ban công</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>Đã ở 2 đêm vào Tháng 6 năm 2025</span>
                  </div>
                </div>
              </div>

              {/* Right: Review Content */}
              <div className="md:col-span-3">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="text-lg font-bold text-gray-900">
                    {review.title || 'Đánh giá'}
                  </h4>
                  <button
                    onClick={() => toggleHelpful(review.reviewId)}
                    className="text-xs text-gray-500 hover:text-blue-600"
                  >
                    {helpfulReviews.has(review.reviewId) ? (
                      <span className="text-blue-600">CÓ</span>
                    ) : (
                      <>
                        <span className="text-blue-600">CÓ</span>
                        <span className="mx-1">|</span>
                        <span className="text-gray-400">KHÔNG</span>
                      </>
                    )}
                  </button>
                </div>
                {/* Review Content - HTML from WYSIWYG editor */}
                <div 
                  className="text-sm text-gray-700 mb-3 leading-relaxed review-content"
                  dangerouslySetInnerHTML={{ __html: sanitizeHTML(review.comment) }}
                  style={{
                    wordBreak: 'break-word'
                  }}
                />
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
                <p className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
          </div>
          );
        })}
      </div>
      )}


      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  currentPage === pageNum
                    ? 'bg-blue-600 text-white'
                    : 'border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          {totalPages > 5 && currentPage < totalPages - 2 && (
            <>
              <span className="px-2">...</span>
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

