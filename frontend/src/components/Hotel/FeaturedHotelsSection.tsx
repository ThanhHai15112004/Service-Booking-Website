import HotelCard from '../HotelCard';
import { ArrowRight } from 'lucide-react';
import { Hotel } from '../../types';

interface FeaturedHotelsSectionProps {
  hotels: Hotel[];
  title?: string;
  subtitle?: string;
}

export default function FeaturedHotelsSection({ 
  hotels, 
  title = "Khách sạn nổi bật",
  subtitle = "Những lựa chọn được đánh giá cao nhất từ khách hàng"
}: FeaturedHotelsSectionProps) {
  return (
    <div className="py-12 md:py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 md:mb-12">
          <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3">
            {title}
          </h2>
          <p className="text-sm md:text-base text-gray-600 max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {hotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} />
          ))}
        </div>

        <div className="text-center mt-8 md:mt-12">
          <a
            href="/hotels/search"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-2.5 md:py-3 rounded-lg transition-colors font-semibold text-sm md:text-base shadow-md hover:shadow-lg"
          >
            <span>Xem tất cả khách sạn</span>
            <ArrowRight className="w-4 md:w-5 h-4 md:h-5" />
          </a>
        </div>
      </div>
    </div>
  );
}
