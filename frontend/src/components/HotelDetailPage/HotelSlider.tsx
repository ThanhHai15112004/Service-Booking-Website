import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Star, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getSimilarHotelsInCity } from '../../services/hotelService';

interface HotelSliderProps {
  city: string;
  currentHotelId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
}

interface SimilarHotel {
  hotelId: string;
  name: string;
  starRating?: number;
  avgRating?: number;
  reviewCount?: number;
  mainImage?: string;
  city?: string;
  distanceCenter?: number;
  categoryName?: string;
  sumPrice?: number; // ✅ Giá tổng (sau discount)
  originalPrice?: number; // ✅ Giá gốc (trước discount)
  avgDiscountPercent?: number; // ✅ Phần trăm giảm giá
  capacity?: number;
  roomName?: string;
}

export default function HotelSlider({
  city,
  currentHotelId,
  checkIn,
  checkOut,
  guests,
  rooms,
  children
}: HotelSliderProps) {
  const [hotels, setHotels] = useState<SimilarHotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // ✅ Load similar hotels
  useEffect(() => {
    const loadSimilarHotels = async () => {
      if (!city || !currentHotelId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const result = await getSimilarHotelsInCity({
          city,
          excludeHotelId: currentHotelId,
          checkIn,
          checkOut,
          guests,
          rooms,
          children,
          limit: 12 // ✅ Lấy 12 khách sạn để scroll
        });

        if (result.success && result.data) {
          setHotels(result.data);
        }
      } catch (error) {
        console.error('Error loading similar hotels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSimilarHotels();
  }, [city, currentHotelId, checkIn, checkOut, guests, rooms, children]);

  // ✅ Format price
  const formatPrice = (price?: number) => {
    if (!price || price === 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  // ✅ Calculate nights
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 1;
  };

  // ✅ Calculate price per night
  const calculatePricePerNight = (totalPrice?: number) => {
    if (!totalPrice) return 0;
    const nights = calculateNights();
    return nights > 0 ? Math.round(totalPrice / nights / rooms) : 0;
  };

  // ✅ Scroll functions - Scroll nhiều hơn để trượt tốt hơn
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // ✅ Scroll ~80% chiều rộng
      container.scrollBy({
        left: -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8; // ✅ Scroll ~80% chiều rộng
      container.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // ✅ Check if can scroll left/right
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const checkScrollability = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10); // 10px threshold
    };

    checkScrollability();
    container.addEventListener('scroll', checkScrollability);
    
    // ✅ Check on resize
    const resizeObserver = new ResizeObserver(checkScrollability);
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', checkScrollability);
      resizeObserver.disconnect();
    };
  }, [hotels]);

  // ✅ Navigate to hotel detail
  const handleHotelClick = (hotelId: string) => {
    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests.toString());
    params.set('rooms', rooms.toString());
    params.set('children', children.toString());
    navigate(`/hotel/${hotelId}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
        <h2 className="text-xl font-bold text-black mb-4">Các khách sạn khác tại {city}</h2>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (hotels.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black mb-1">
          Các khách sạn khác tại {city}
        </h2>
        <p className="text-sm text-gray-600">
          Khám phá thêm các lựa chọn tuyệt vời khác trong khu vực
        </p>
      </div>

      {/* Slider Container */}
      <div className="relative">
        {/* Scroll Container - Cho phép scroll mượt hơn */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide p-5 scroll-smooth snap-x snap-mandatory"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            WebkitOverflowScrolling: 'touch' // ✅ Smooth scroll trên mobile
          }}
        >
          {hotels.map((hotel) => {
            const pricePerNight = calculatePricePerNight(hotel.sumPrice);
            const hasDiscount = hotel.avgDiscountPercent && hotel.avgDiscountPercent > 0;

            return (
              <div
                key={hotel.hotelId}
                onClick={() => handleHotelClick(hotel.hotelId)}
                className="flex-shrink-0 w-80 bg-white rounded-lg border border-gray-200 overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-blue-500 snap-start"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-gray-200 group">
                  <img
                    src={hotel.mainImage || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'}
                    alt={hotel.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                    }}
                  />
                  {hasDiscount && hotel.avgDiscountPercent && (
                    <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                      -{Math.round(hotel.avgDiscountPercent)}%
                    </div>
                  )}
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Hotel Name & Rating */}
                  <div className="mb-3">
                    <h3 className="text-base font-bold text-black mb-2 line-clamp-2 min-h-[3rem]">
                      {hotel.name}
                    </h3>
                    <div className="flex items-center gap-2">
                      {hotel.starRating && (
                        <div className="flex items-center gap-1">
                          {Array.from({ length: Math.floor(hotel.starRating) }, (_, i) => (
                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                      {hotel.avgRating && (
                        <span className="text-sm font-semibold text-black">
                          {hotel.avgRating.toFixed(1)}
                        </span>
                      )}
                      {hotel.reviewCount && (
                        <span className="text-xs text-gray-500">
                          ({hotel.reviewCount.toLocaleString()} đánh giá)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  {hotel.city && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{hotel.city}</span>
                      {hotel.distanceCenter !== undefined && (
                        <span className="text-gray-500">
                          • {hotel.distanceCenter.toFixed(1)} km từ trung tâm
                        </span>
                      )}
                    </div>
                  )}

                  {/* Room Info */}
                  {hotel.roomName && (
                    <div className="flex items-center gap-2 text-xs text-gray-600 mb-3">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{hotel.roomName}</span>
                      {hotel.capacity && (
                        <span className="text-gray-500">• Tối đa {hotel.capacity} người</span>
                      )}
                    </div>
                  )}

                  {/* Price - QUAN TRỌNG NHẤT */}
                  <div className="mt-4 pt-4 border-t-2 border-gray-200">
                    {hotel.sumPrice ? (
                      <div>
                        {hasDiscount && hotel.originalPrice && (
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(hotel.originalPrice)}
                            </span>
                            {hotel.avgDiscountPercent && (
                              <span className="text-xs font-bold text-white bg-red-600 px-2 py-1 rounded">
                                -{Math.round(hotel.avgDiscountPercent)}%
                              </span>
                            )}
                          </div>
                        )}
                        <div className="space-y-1">
                          {/* Tổng giá - Nổi bật */}
                          <div className="text-2xl font-bold text-red-600 leading-tight">
                            {formatPrice(hotel.sumPrice)}
                          </div>
                          {/* Giá chi tiết */}
                          <div className="space-y-0.5">
                            {pricePerNight > 0 && (
                              <div className="text-sm font-semibold text-gray-700">
                                {formatPrice(pricePerNight)}/đêm/phòng
                              </div>
                            )}
                            <div className="text-xs text-gray-500">
                              Cho {rooms > 1 ? `${rooms} phòng` : '1 phòng'} • {calculateNights()} đêm
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-base font-semibold text-gray-700 py-2">
                        Liên hệ để biết giá
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Navigation Buttons - Hiển thị rõ ràng hơn */}
        {hotels.length > 1 && (
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

