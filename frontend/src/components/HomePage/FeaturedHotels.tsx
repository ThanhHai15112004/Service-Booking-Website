import HotelCard from '../HotelsListPage/HotelCard';
import { Hotel } from '../../types';

interface FeaturedHotelsProps {
  hotels: Hotel[];
  onViewAll?: () => void;
}

export default function FeaturedHotels({ hotels, onViewAll }: FeaturedHotelsProps) {
  return (
    <div>
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
        Khách sạn nổi bật
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
        Những lựa chọn được đánh giá cao nhất
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {hotels.map((hotel) => (
          <HotelCard
            key={hotel.id}
            hotel={hotel}
          />
        ))}
      </div>

      {onViewAll && (
        <div className="text-center mt-6 md:mt-8">
          <button
            onClick={onViewAll}
            className="bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm md:text-base"
          >
            Xem tất cả khách sạn
          </button>
        </div>
      )}
    </div>
  );
}

