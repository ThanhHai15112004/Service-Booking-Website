import { Star, StarHalf, MapPin } from 'lucide-react';

interface HotelHeaderProps {
  name: string;
  address: string;
  city: string;
  starRating: number;
}

export default function HotelHeader({
  name,
  address,
  city,
  starRating
}: HotelHeaderProps) {
  // Render stars với hỗ trợ nửa sao
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(starRating);
    const hasHalfStar = starRating % 1 >= 0.5;

    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={`full-${i}`} className="w-5 h-5 fill-amber-500 text-amber-500" />
      );
    }

    // Half star
    if (hasHalfStar) {
      stars.push(
        <StarHalf key="half" className="w-5 h-5 fill-amber-500 text-amber-500" />
      );
    }

    return stars;
  };

  return (
    <div className="mb-6 p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Badges/Hashtags - Nằm trên cùng */}
      <div className="flex items-center gap-2 mb-3">
        <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-md">
          🎃 HALLOWEEN
        </span>
        <span className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-md">
          ⭐ 2024
        </span>
        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
          💎 Agoda Preferred
        </span>
      </div>

      {/* Tên khách sạn + Star Rating */}
      <div className="flex items-center gap-3 flex-wrap mb-4">
        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
          {name}
        </h1>
        
        {/* Star Rating - Bên phải tên */}
        <div className="flex items-center gap-1">
          {renderStars()}
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="flex items-start gap-2.5 text-sm text-gray-700">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#2067da' }} />
        <div className="flex-1 leading-relaxed">
          <span className="text-gray-800">{address}, {city}, Việt Nam, 78000</span>
          <span className="mx-2 text-gray-300">-</span>
          <a 
            href="#location" 
            className="font-bold hover:underline transition-all"
            style={{ color: '#2067da' }}
          >
            TRÊN BẢN ĐỒ
          </a>
        </div>
      </div>
    </div>
  );
}

