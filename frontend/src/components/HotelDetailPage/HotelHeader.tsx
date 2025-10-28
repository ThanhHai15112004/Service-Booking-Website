import { Star, MapPin } from 'lucide-react';

interface HotelHeaderProps {
  name: string;
  address: string;
  city: string;
  starRating: number;
  rating?: number;
  reviewsCount?: number;
}

export default function HotelHeader({
  name,
  address,
  city,
  starRating,
  rating,
  reviewsCount
}: HotelHeaderProps) {
  return (
    <div className="mb-4">
      <button
        onClick={() => window.history.back()}
        className="text-black hover:underline mb-2"
      >
        ← Quay lại
      </button>
      <h1 className="text-3xl font-bold text-black mb-2">{name}</h1>
      <div className="flex items-center gap-4 text-gray-600">
        <div className="flex items-center gap-1">
          {[...Array(starRating)].map((_, i) => (
            <Star key={i} className="w-4 h-4 fill-black text-black" />
          ))}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-4 h-4" />
          <span>{address}, {city}</span>
        </div>
        {rating && (
          <div className="flex items-center gap-2">
            <div className="bg-black text-white px-2 py-1 rounded text-sm font-bold">
              {rating}
            </div>
            <span className="text-sm">({reviewsCount} đánh giá)</span>
          </div>
        )}
      </div>
    </div>
  );
}

