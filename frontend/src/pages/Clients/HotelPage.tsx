import { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import HeroSection from '../../components/Hotel/HeroSection';
import FeaturesSection from '../../components/Hotel/FeaturesSection';
import DestinationsSection from '../../components/Hotel/DestinationsSection';
import FeaturedHotelsSection from '../../components/Hotel/FeaturedHotelsSection';
import { MainSearchBar } from '../../components/Search';
import { mockHotels, popularDestinations } from '../../data/mockData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { searchHotels } from '../../services/hotelService';

interface HotelSearchResult {
  hotel_id: string;
  name: string;
  star_rating: number;
  avg_rating: number;
  review_count: number;
  main_image: string;
  city: string;
  district: string;
  available_rooms: number;
  total_price: number;
  avg_price_per_night: number;
  room_name: string;
  capacity: number;
}

export default function HotelLandingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const rooms = searchParams.get('rooms');
    const children = searchParams.get('children');

    // Nếu có query params, gọi API để lấy dữ liệu
    if (destination && checkIn) {
      const fetchHotels = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const params = {
            destination: destination || '',
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            guests: parseInt(guests || '2'),
            rooms: parseInt(rooms || '1'),
            children: parseInt(children || '0'),
          };

          const res = await searchHotels(params);

          // Handle new response format: { success, data: { hotels, pagination, searchParams } }
          if (res.success && res.data && res.data.hotels) {
            setHotels(res.data.hotels);
          } else {
            setError(res.message || 'Không tìm thấy khách sạn nào');
            setHotels([]);
          }
        } catch (err: any) {
          console.error('Lỗi fetch hotels:', err);
          setError('Có lỗi xảy ra khi tìm kiếm');
          setHotels([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHotels();
    }
  }, [searchParams]);

  const handleSearch = (params: any) => {
    const queryParams = new URLSearchParams({
      destination: params.destination || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: params.guests?.toString() || '2',
      rooms: params.rooms?.toString() || '1',
      children: params.children?.toString() || '0',
      stayType: params.stayType || 'overnight'
    });
    
    navigate(`/hotels/search?${queryParams.toString()}`);
  };

  // Lọc khách sạn nổi bật từ API hoặc mock data
  const featuredHotels = hotels.length > 0
    ? hotels.filter((h: any) => h.star_rating >= 4).slice(0, 6)
    : mockHotels.filter(h => h.star_rating >= 4).slice(0, 6);

  return (
    <MainLayout>
      {/* Hero Section with Search */}
      <HeroSection
        title="Tìm kiếm & Đặt phòng khách sạn"
        subtitle="Hơn 2 triệu khách sạn trên toàn thế giới. Hãy so sánh giá và tìm ưu đãi tốt nhất cho chuyến đi của bạn"
        backgroundImage="https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png"
      >
        <MainSearchBar onSearch={handleSearch} />
      </HeroSection>

      {/* Spacing after hero */}
      <div className="pt-20 md:pt-40" />

      {/* Display search results if available */}
      {searchParams.get('destination') && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Kết quả tìm kiếm
          </h2>
          <p className="text-gray-600 mb-6">
            Điểm đến: <span className="font-semibold">{searchParams.get('destination')}</span>
          </p>

          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}

          {error && !isLoading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {error}
            </div>
          )}

          {!isLoading && hotels.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel) => (
                <div
                  key={hotel.hotel_id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="relative">
                    <img
                      src={hotel.main_image || 'https://via.placeholder.com/400x250'}
                      alt={hotel.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                      ⭐ {hotel.star_rating}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{hotel.name}</h3>
                    <p className="text-sm text-gray-600 mb-3">
                      {hotel.city}{hotel.district ? `, ${hotel.district}` : ''}
                    </p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-yellow-400">★</span>
                      <span className="text-sm font-semibold">{hotel.avg_rating}</span>
                      <span className="text-sm text-gray-500">({hotel.review_count} đánh giá)</span>
                    </div>
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{hotel.room_name}</p>
                      <p className="text-xs text-gray-500">Sức chứa: {hotel.capacity} người</p>
                    </div>
                    <div className="border-t pt-3">
                      <div className="flex justify-between items-end">
                        <div>
                          <p className="text-xs text-gray-600">Trung bình/đêm</p>
                          <p className="text-lg font-bold text-blue-600">
                            ₫{hotel.avg_price_per_night?.toLocaleString('vi-VN')}
                          </p>
                        </div>
                        <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors">
                          Xem chi tiết
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && hotels.length === 0 && !error && (
            <div className="text-center py-12">
              <p className="text-gray-500">Không tìm thấy khách sạn phù hợp với tiêu chí của bạn</p>
            </div>
          )}
        </div>
      )}

      {/* Features Section */}
      <FeaturesSection />

      {/* Destinations Section */}
      <DestinationsSection destinations={popularDestinations} />

      {/* Featured Hotels Section */}
      <FeaturedHotelsSection 
        hotels={featuredHotels as any}
        title="Khách sạn nổi bật"
        subtitle="Những lựa chọn được đánh giá cao nhất từ khách hàng của chúng tôi"
      />

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-white mb-3 md:mb-4">
            Sẵn sàng cho chuyến đi tiếp theo?
          </h2>
          <p className="text-sm md:text-lg text-white/90 mb-6 md:mb-8 max-w-2xl mx-auto">
            Đăng ký ngay để nhận thông báo về các ưu đãi độc quyền và giảm giá đặc biệt
          </p>
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 md:px-6 py-2.5 md:py-3 rounded-lg text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-6 md:px-8 py-2.5 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base whitespace-nowrap">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
