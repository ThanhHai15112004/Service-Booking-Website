import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Globe } from 'lucide-react';

interface TopDestinationsSliderProps {
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
}

interface Destination {
  countryId: string;
  country: string;
  image: string;
}

export default function TopDestinationsSlider({
  checkIn,
  checkOut,
  guests,
  rooms,
  children
}: TopDestinationsSliderProps) {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const navigate = useNavigate();

  // ✅ Load top destinations (countries)
  useEffect(() => {
    const loadTopDestinations = async () => {
      try {
        setIsLoading(true);
        // ✅ TODO: Call API when backend is ready
        // const res = await api.get('/api/destinations/top-countries');
        
        // ✅ Mock data for countries
        const mockDestinations: Destination[] = [
          { countryId: 'vietnam', country: 'Việt Nam', image: 'https://images.pexels.com/photos/1007427/pexels-photo-1007427.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'thailand', country: 'Thái Lan', image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'singapore', country: 'Singapore', image: 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'japan', country: 'Nhật Bản', image: 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'south-korea', country: 'Hàn Quốc', image: 'https://images.pexels.com/photos/258154/pexels-photo-258154.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'malaysia', country: 'Malaysia', image: 'https://images.pexels.com/photos/271639/pexels-photo-271639.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'indonesia', country: 'Indonesia', image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
          { countryId: 'philippines', country: 'Philippines', image: 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' },
        ];
        
        setDestinations(mockDestinations);
      } catch (error) {
        console.error('Error loading top destinations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTopDestinations();
  }, []);

  // ✅ Scroll functions
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // ✅ Check scrollability
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    checkScrollability();
    container.addEventListener('scroll', checkScrollability);
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [destinations]);

  // ✅ Navigate to search page with country filter
  const handleDestinationClick = (country: string) => {
    const params = new URLSearchParams();
    params.set('destination', country); // ✅ Search by country
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    params.set('rooms', rooms.toString());
    params.set('children', children.toString());
    navigate(`/hotels?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="mb-8 bg-white rounded-lg border border-gray-200 p-5">
        <h2 className="text-xl font-bold text-black mb-4">Những điểm đến hàng đầu</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (destinations.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black mb-1">
          Những điểm đến hàng đầu
        </h2>
        <p className="text-sm text-gray-600">
          Khám phá các quốc gia được yêu thích nhất
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide p-5 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          {destinations.map((destination) => (
            <div
              key={destination.countryId}
              onClick={() => handleDestinationClick(destination.country)}
              className="flex-shrink-0 w-64 bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 hover:border-blue-500 snap-start group"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gray-200">
                <img
                  src={destination.image}
                  alt={destination.country}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                  }}
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Country Name - Overlay on image */}
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 flex-shrink-0" />
                    <h3 className="text-lg font-bold line-clamp-1">
                      {destination.country}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation Buttons */}
        {destinations.length > 1 && (
          <>
            <button
              onClick={scrollLeft}
              disabled={!canScrollLeft}
              className={`absolute left-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-blue-50 transition-all duration-200 z-10 border-2 ${
                canScrollLeft 
                  ? 'border-blue-500 hover:border-blue-600 cursor-pointer' 
                  : 'border-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className={`w-6 h-6 ${canScrollLeft ? 'text-blue-600' : 'text-gray-400'}`} />
            </button>
            <button
              onClick={scrollRight}
              disabled={!canScrollRight}
              className={`absolute right-4 top-1/2 -translate-y-1/2 bg-white shadow-xl rounded-full p-3 hover:bg-blue-50 transition-all duration-200 z-10 border-2 ${
                canScrollRight 
                  ? 'border-blue-500 hover:border-blue-600 cursor-pointer' 
                  : 'border-gray-300 cursor-not-allowed opacity-50'
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className={`w-6 h-6 ${canScrollRight ? 'text-blue-600' : 'text-gray-400'}`} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
