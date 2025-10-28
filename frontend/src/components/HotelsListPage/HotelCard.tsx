import { MapPin, Star } from 'lucide-react';
import { Hotel } from '../../types';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const handleClick = () => {
    window.location.href = `/hotel/${hotel.id}`;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={hotel.main_image}
          alt={hotel.name}
          className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
        />
        {hotel.star_rating && (
          <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-md flex items-center gap-1">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
            <span className="text-sm font-semibold text-black">{hotel.star_rating}</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-bold text-black mb-2 line-clamp-1">{hotel.name}</h3>
        
        <div className="flex items-start gap-1 text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">{hotel.address}, {hotel.city}</span>
        </div>
        
        {hotel.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{hotel.description}</p>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div>
            {hotel.rating && (
              <div className="flex items-center gap-1 mb-1">
                <div className="bg-black text-white px-2 py-0.5 rounded text-sm font-bold">
                  {hotel.rating}
                </div>
                {hotel.reviews_count && (
                  <span className="text-xs text-gray-500">
                    ({hotel.reviews_count} đánh giá)
                  </span>
                )}
              </div>
            )}
          </div>
          
          <div className="text-right">
            <div className="text-sm text-gray-500 mb-0.5">Giá từ</div>
            <div className="text-xl font-bold text-black">
              {hotel.price_per_night.toLocaleString('vi-VN')}₫
            </div>
            <div className="text-xs text-gray-500">/ đêm</div>
          </div>
        </div>
      </div>
    </div>
  );
}
