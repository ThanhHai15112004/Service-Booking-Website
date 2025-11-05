import { Star } from 'lucide-react';

interface HotelReviewsProps {
  rating: number;
  reviewsCount: number;
  categories?: {
    label: string;
    score: number;
  }[];
}

export default function HotelReviews({ 
  rating, 
  reviewsCount,
  categories = [
    { label: 'Sự thoải mái và chất lượng phòng', score: 8.5 },
    { label: 'Đồ sạch sẽ', score: 8.3 },
    { label: 'Dịch vụ', score: 8.2 },
    { label: 'Đáng giá tiền', score: 8.2 }
  ]
}: HotelReviewsProps) {
  // Convert rating to number (in case it comes as string from API)
  // hotel.avgRating từ backend có thể chưa convert (1-5) hoặc đã convert (1-10)
  // Nếu rating < 5 thì convert, nếu >= 5 thì đã là thang điểm 10 rồi
  const rawRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  const numericRating = rawRating < 5 ? rawRating * 2 : rawRating; // Chỉ convert nếu < 5
  
  const getRatingText = (score: number) => {
    if (score >= 9) return 'Tuyệt vời';
    if (score >= 8) return 'Rất tốt';
    if (score >= 7) return 'Tốt';
    if (score >= 6) return 'Khá tốt';
    return 'Bình thường';
  };

  const getRatingColor = (score: number) => {
    if (score >= 9) return 'bg-green-600';
    if (score >= 8) return 'bg-green-500';
    if (score >= 7) return '#2067da';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-4">
      <h3 className="text-lg font-bold text-black mb-3">Đánh giá</h3>
      
      {/* Overall Rating */}
      <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-gray-200">
        <div className={`${getRatingColor(numericRating)} text-white px-2.5 py-1.5 rounded flex flex-col items-center min-w-[60px]`}
             style={numericRating >= 7 && numericRating < 8 ? { backgroundColor: '#2067da' } : {}}>
          <div className="text-xl font-bold leading-tight">{numericRating.toFixed(1)}<span className="text-sm">/10</span></div>
          <div className="text-[10px] font-medium mt-0.5">{getRatingText(numericRating)}</div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-0.5 mb-0.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${i < Math.floor(numericRating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
              {/* Rating trên thang điểm 10, 5 sao = 10 điểm, mỗi sao = 2 điểm */}
            </div>
          </div>
          <p className="text-[10px] text-gray-600">
            {reviewsCount.toLocaleString()} bài đánh giá
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-2.5">
        {categories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-700">{category.label}</span>
              <span className="text-[10px] font-bold text-gray-900">{category.score.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1">
              <div
                className="h-1 rounded-full transition-all"
                style={{ width: `${(category.score / 10) * 100}%`, backgroundColor: '#2067da' }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

