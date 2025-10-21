import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import HotelCard from '../../components/HotelCard';
import { mockHotels, popularDestinations } from '../../data/mockData';
import { SearchParams } from '../../types';
import { TrendingUp, Award, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MainSearchBar } from '../../components/Search';

export default function HomePage() {
  const [, setSearchParams] = useState<SearchParams | null>(null);
  const navigate = useNavigate();

  const handleSearch = (params: any) => {
    setSearchParams(params);
    
    // Tạo query params và chuyển đến /hotels/search
    const queryParams = new URLSearchParams({
      destination: params.destination || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: params.guests?.toString() || '2',
      rooms: params.rooms?.toString() || '1'
    });
    
    navigate(`/hotels/search?${queryParams.toString()}`);
  };

  const featuredHotels = mockHotels.filter(h => h.star_rating >= 4).slice(0, 6);

  return (
    <MainLayout>
      <div
        className="relative py-8 md:py-12 pb-2 md:pb-4 rounded-b-[40px] md:rounded-b-[80px] bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png)'
        }}
      >
        <div className="absolute inset-0 bg-black/20 rounded-b-[40px] md:rounded-b-[80px]"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-4 md:mb-6">
            <h1 className="text-xl md:text-3xl font-bold text-white mb-1 md:mb-2">
              Tìm kiếm khách sạn hoàn hảo cho chuyến đi của bạn
            </h1>
            <p className="text-xs md:text-base text-white">
              Hàng nghìn lựa chọn với giá tốt nhất
            </p>
          </div>

          <div className="relative -mb-16 md:-mb-32">
            <MainSearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-40 pb-8 md:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12 md:mb-16">
          <div className="text-center">
            <div className="bg-gray-100 w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <TrendingUp className="w-7 md:w-8 h-7 md:h-8 text-black" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">Giá tốt nhất</h3>
            <p className="text-sm md:text-base text-gray-600">
              So sánh giá từ nhiều nguồn để đảm bảo bạn có mức giá tốt nhất
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Award className="w-7 md:w-8 h-7 md:h-8 text-black" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">Đánh giá tin cậy</h3>
            <p className="text-sm md:text-base text-gray-600">
              Hàng triệu đánh giá thực từ khách hàng đã trải nghiệm
            </p>
          </div>
          <div className="text-center">
            <div className="bg-gray-100 w-14 md:w-16 h-14 md:h-16 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
              <Shield className="w-7 md:w-8 h-7 md:h-8 text-black" />
            </div>
            <h3 className="text-lg md:text-xl font-bold text-black mb-2">Đặt phòng an toàn</h3>
            <p className="text-sm md:text-base text-gray-600">
              Thanh toán bảo mật và chính sách hủy linh hoạt
            </p>
          </div>
        </div>

        <div className="mb-12 md:mb-16">
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Điểm đến phổ biến
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            Khám phá những địa điểm du lịch được yêu thích nhất
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
            {popularDestinations.map((destination, index) => (
              <div
                key={index}
                className="relative rounded-lg overflow-hidden cursor-pointer group h-28 md:h-40"
              >
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2 md:p-4">
                  <h3 className="text-white font-bold text-xs md:text-lg">
                    {destination.city}
                  </h3>
                  <p className="text-white text-xs md:text-sm">
                    {destination.hotels_count} khách sạn
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
            Khách sạn nổi bật
          </h2>
          <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
            Những lựa chọn được đánh giá cao nhất
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {featuredHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
              />
            ))}
          </div>

          <div className="text-center mt-6 md:mt-8">
            <button
              onClick={() => window.location.href = '/hotels'}
              className="bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium text-sm md:text-base"
            >
              Xem tất cả khách sạn
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
