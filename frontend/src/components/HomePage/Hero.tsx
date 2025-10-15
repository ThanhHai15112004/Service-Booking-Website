import Search from './Search';
import type { HotelSearchParams } from './Search/HotelSearch/types/hotel.types';

interface HeroProps {
  onSearch: (criteria: HotelSearchParams) => void;
}

export default function Hero({ onSearch }: HeroProps) {
  return (
    <div 
      className="relative bg-gradient-to-br from-gray-900/80 to-black/80 text-white h-[70vh]"
      style={{
        backgroundImage: 'url(https://cdn6.agoda.net/images/MVC/default/background_image/illustrations/bg-agoda-homepage.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay để làm mờ ảnh nền */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-black/60"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            Tìm kiếm & Đặt phòng
          </h1>
          <p className="text-lg text-gray-300">
            Khám phá hàng nghìn khách sạn tuyệt vời với giá tốt nhất
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Search onSearch={onSearch} />
        </div>
      </div>
    </div>
  );
}