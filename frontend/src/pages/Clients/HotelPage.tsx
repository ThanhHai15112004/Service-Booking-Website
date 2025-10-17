import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import HeroSection from '../../components/Hotel/HeroSection';
import FeaturesSection from '../../components/Hotel/FeaturesSection';
import DestinationsSection from '../../components/Hotel/DestinationsSection';
import FeaturedHotelsSection from '../../components/Hotel/FeaturedHotelsSection';
import SearchBar from '../../components/Search';
import { mockHotels, popularDestinations } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';

export default function HotelLandingPage() {
  const navigate = useNavigate();

  const handleSearch = (params: any) => {
    // Chuyển đến trang search với query params
    const queryParams = new URLSearchParams({
      destination: params.destination || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: params.guests?.toString() || '2',
      rooms: params.rooms?.toString() || '1',
      children: params.children?.toString() || '0',
      tab: params.tab || 'overnight'
    });
    
    navigate(`/hotels/search?${queryParams.toString()}`);
  };

  // Lọc khách sạn nổi bật (4-5 sao)
  const featuredHotels = mockHotels.filter(h => h.star_rating >= 4).slice(0, 6);

  return (
    <MainLayout>
      {/* Hero Section with Search */}
      <HeroSection
        title="Tìm kiếm & Đặt phòng khách sạn"
        subtitle="Hơn 2 triệu khách sạn trên toàn thế giới. Hãy so sánh giá và tìm ưu đãi tốt nhất cho chuyến đi của bạn"
        backgroundImage="https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png"
      >
        <SearchBar onSearch={handleSearch} />
      </HeroSection>

      {/* Spacing after hero */}
      <div className="pt-20 md:pt-40" />

      {/* Features Section */}
      <FeaturesSection />

      {/* Destinations Section */}
      <DestinationsSection destinations={popularDestinations} />

      {/* Featured Hotels Section */}
      <FeaturedHotelsSection 
        hotels={featuredHotels}
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
