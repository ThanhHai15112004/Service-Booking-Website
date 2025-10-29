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
  const numericRating = typeof rating === 'string' ? parseFloat(rating) : rating;
  
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
    if (score >= 7) return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Đánh giá</h3>
      
      {/* Overall Rating */}
      <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-200">
        <div className={`${getRatingColor(numericRating)} text-white px-4 py-2 rounded-lg flex flex-col items-center min-w-[80px]`}>
          <div className="text-3xl font-bold">{numericRating.toFixed(1)}</div>
          <div className="text-xs">{getRatingText(numericRating)}</div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${i < Math.floor(numericRating / 2) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{reviewsCount}</span> bài đánh giá
          </p>
        </div>
      </div>

      {/* Category Scores */}
      <div className="space-y-3">
        {categories.map((category, index) => (
          <div key={index}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-700">{category.label}</span>
              <span className="text-sm font-semibold text-gray-900">{category.score}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${(category.score / 10) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Read all reviews button */}
      <button className="w-full mt-6 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        Đọc mọi bài đánh giá
      </button>
    </div>
  );
}

