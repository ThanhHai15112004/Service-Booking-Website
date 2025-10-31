import React, { useState } from 'react';
import { Star, Check, Calendar, User, Users, Baby, Building2, MapPin, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Review, ReviewCategory } from '../../types';

interface HotelReviewsDetailedProps {
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
  reviews?: Review[];
  reviewTags?: Array<{
    keyword: string;
    count: number;
  }>;
}

export default function HotelReviewsDetailed({
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
  reviews = [],
  reviewTags = []
}: HotelReviewsDetailedProps) {
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedGuestType, setSelectedGuestType] = useState<string>('all');
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [helpfulReviews, setHelpfulReviews] = useState<Set<string>>(new Set());
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  // ✅ FIX: Ensure overallRating is a number (handle string from backend)
  const numericRating = overallRating 
    ? (typeof overallRating === 'number' 
        ? overallRating 
        : (typeof overallRating === 'string' 
            ? parseFloat(overallRating) || 8.5 
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
  
  // Mock reviews if not provided
  const mockReviews: Review[] = reviews.length > 0 ? reviews : [
    {
      reviewId: '1',
      accountId: 'acc1',
      userName: 'Khánh',
      rating: 9.6,
      comment: 'Căn hộ rộng rãi, thoải mái. Vị trí tuyệt vời, gần biển và nhiều tiện ích xung quanh. Dịch vụ tốt, nhân viên thân thiện. 👍👍',
      createdAt: new Date('2025-06-19').toISOString(),
      helpful: 1
    },
    {
      reviewId: '2',
      accountId: 'acc2',
      userName: 'Ngọc',
      rating: 10.0,
      comment: 'Kỳ nghỉ lãng mạn tuyệt vời! Phòng sạch sẽ, view đẹp, đầy đủ tiện nghi. Sẽ quay lại!',
      createdAt: new Date('2025-06-18').toISOString(),
      helpful: 0
    }
  ];

  const displayedReviews = mockReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black mb-2">
          Bài đánh giá {hotelName} từ khách thật
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Check className="w-4 h-4 text-green-600" />
          <span>Đánh giá từ khách hàng đã xác thực trên agoda</span>
        </div>
      </div>

      {/* Overall Rating & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left: Overall Score */}
        <div className="lg:col-span-1">
          <div className="bg-blue-600 text-white rounded-lg p-6 text-center">
            <div className="text-5xl font-bold mb-2">{numericRating.toFixed(1)}</div>
            <div className="text-xl font-semibold mb-2">{getRatingText(numericRating)}</div>
            <div className="flex items-center justify-center gap-1 text-sm">
              <Check className="w-4 h-4" />
              <span>Dựa trên {numericReviewsCount.toLocaleString()} bài đánh giá</span>
            </div>
          </div>
        </div>

        {/* Middle: Category Ratings */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Đánh giá chi tiết</h3>
          <div className="space-y-3">
            {categoryRatings.map((category, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-gray-700">{category.label}</span>
                  <span className="text-xs font-bold text-gray-900">{category.score}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${(category.score / 10) * 100}%`,
                      backgroundColor: getRatingColor(category.score)
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-green-600 font-medium">
              Điểm cao đối với Vũng Tàu
            </div>
          </div>
        </div>

        {/* Right: Rating Distribution */}
        <div className="lg:col-span-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Xếp hạng:</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">9+ Hiếm Có (Rare)</span>
              <span className="text-gray-500 ml-auto">({ratingDistribution.excellent})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">8-9 Xuất Sắc (Excellent)</span>
              <span className="text-gray-500 ml-auto">({ratingDistribution.veryGood})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">7-8 Rất Tốt (Very Good)</span>
              <span className="text-gray-500 ml-auto">({ratingDistribution.good})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">6-7 Tốt (Good)</span>
              <span className="text-gray-500 ml-auto">({ratingDistribution.average})</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <input type="checkbox" className="w-4 h-4" defaultChecked />
              <span className="text-gray-700">&lt;6 Dưới Mức Mong Đợi (Below Expectations)</span>
              <span className="text-gray-500 ml-auto">({ratingDistribution.poor})</span>
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
            <option value="all">Tất cả mọi du khách ({numericReviewsCount})</option>
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

      {/* Reviews List */}
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
                    {reviewRating.toFixed(1)}
                  </div>
                  <div className="text-sm font-semibold mb-4" style={{ color: getRatingColor(reviewRating) }}>
                    {getRatingText(reviewRating)}
                  </div>
                
                <div className="space-y-2 text-xs text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center text-white text-[10px]">
                      VN
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
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-base font-bold text-gray-900">
                    "{review.comment.split('.')[0] || review.comment.substring(0, 30)}..."
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
                <p className="text-sm text-gray-700 mb-3 leading-relaxed whitespace-pre-line">
                  {review.comment}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            </div>
          </div>
          );
        })}
      </div>

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

