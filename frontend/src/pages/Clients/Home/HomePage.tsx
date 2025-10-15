import { TrendingUp, Award, Shield, Headphones } from 'lucide-react';
import SearchBar from '../../../components/HomePage/SearchBarBooking';
import Header from '../../../components/Include/Header';
import Footer from '../../../components/Include/Footer';

// Định nghĩa interface cho khách sạn
interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
}

// Component Card khách sạn
const HotelCard = ({ hotel, onSelect }: { hotel: Hotel; onSelect: (id: string) => void }) => {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
      onClick={() => onSelect(hotel.id)}
    >
      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{hotel.price.toLocaleString('vi-VN')} đ</span>
          <span className="bg-black text-white px-2 py-1 rounded-md text-sm">{hotel.rating}/5</span>
        </div>
      </div>
    </div>
  );
};

export default function HomePage() {
  // Danh sách khách sạn mẫu
  const featuredHotels: Hotel[] = [
    {
      id: '1',
      name: 'Khách sạn Luxury Palace',
      location: 'Hà Nội',
      price: 1200000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '2',
      name: 'Sea View Resort',
      location: 'Đà Nẵng',
      price: 950000,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '3',
      name: 'Mountain Retreat',
      location: 'Đà Lạt',
      price: 850000,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '4',
      name: 'City Comfort Hotel',
      location: 'TP. Hồ Chí Minh',
      price: 780000,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
  ];

  const handleHotelSelect = (id: string) => {
    console.log('Selected hotel:', id);
  };
  
  const handleSearch = (criteria: any) => {
    console.log('Search criteria:', criteria);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="relative bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              Tìm kiếm & Đặt phòng
            </h1>
            <p className="text-xl text-gray-300">
              Khám phá hàng nghìn khách sạn tuyệt vời với giá tốt nhất
            </p>
          </div>
          <div className="max-w-5xl mx-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Giá tốt nhất</h3>
            <p className="text-gray-600 text-sm">Đảm bảo giá tốt nhất trên thị trường</p>
          </div>
          <div className="text-center">
            <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Chất lượng cao</h3>
            <p className="text-gray-600 text-sm">Hàng nghìn khách sạn đạt chuẩn</p>
          </div>
          <div className="text-center">
            <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Thanh toán an toàn</h3>
            <p className="text-gray-600 text-sm">Bảo mật thông tin 100%</p>
          </div>
          <div className="text-center">
            <div className="bg-black text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Headphones className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
            <p className="text-gray-600 text-sm">Đội ngũ tận tâm luôn sẵn sàng</p>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Khách sạn nổi bật</h2>
          <p className="text-gray-600">Những lựa chọn được yêu thích nhất</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredHotels.map((hotel) => (
            <HotelCard key={hotel.id} hotel={hotel} onSelect={handleHotelSelect} />
          ))}
        </div>

        <div className="mt-16 bg-black text-white rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Đăng ký nhận ưu đãi đặc biệt</h2>
          <p className="text-gray-300 mb-6">
            Nhận ngay mã giảm giá 10% cho lần đặt phòng đầu tiên
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Nhập email của bạn"
              className="flex-1 px-4 py-3 rounded-lg text-gray-900"
            />
            <button className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition">
              Đăng ký
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
