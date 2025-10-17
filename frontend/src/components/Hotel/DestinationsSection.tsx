import { ArrowRight } from 'lucide-react';

interface Destination {
  city: string;
  image: string;
  hotels_count: number;
  description?: string;
}

interface DestinationsSectionProps {
  destinations: Destination[];
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  return (
    <div className="py-12 md:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <div>
            <h2 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">
              Điểm đến phổ biến
            </h2>
            <p className="text-sm md:text-base text-gray-600">
              Khám phá những địa điểm du lịch được yêu thích nhất Việt Nam
            </p>
          </div>
          <button className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors">
            <span>Xem tất cả</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {destinations.map((destination, index) => (
            <a
              key={index}
              href={`/hotels/search?destination=${destination.city}`}
              className="group relative rounded-xl md:rounded-2xl overflow-hidden cursor-pointer h-32 md:h-48 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <img
                src={destination.image}
                alt={destination.city}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                <h3 className="text-white font-bold text-sm md:text-lg mb-0.5 md:mb-1">
                  {destination.city}
                </h3>
                <p className="text-white/90 text-xs md:text-sm">
                  {destination.hotels_count} khách sạn
                </p>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/10 transition-colors duration-300" />
            </a>
          ))}
        </div>

        <button className="md:hidden mt-6 w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-semibold py-3 border border-blue-600 rounded-lg transition-colors">
          <span>Xem tất cả điểm đến</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
