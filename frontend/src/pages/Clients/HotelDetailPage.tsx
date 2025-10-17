import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { mockHotels } from '../../data/mockData';
import { MapPin, Star, Wifi, Waves, Utensils, Car, Calendar, Users } from 'lucide-react';

export default function HotelDetailPage() {
  const { id } = useParams();
  const hotel = mockHotels.find(h => h.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  if (!hotel) {
    return (
      <MainLayout>
        <div className="bg-white flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">Không tìm thấy khách sạn</h2>
            <button
              onClick={() => window.location.href = '/'}
              className="text-black hover:underline"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const images = [
    hotel.main_image,
    'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
    'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
  ];

  const amenityIcons: Record<string, any> = {
    'WiFi miễn phí': Wifi,
    'Bể bơi': Waves,
    'Nhà hàng': Utensils,
    'Đỗ xe miễn phí': Car
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    window.location.href = `/booking/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <MainLayout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-4">
          <button
            onClick={() => window.history.back()}
            className="text-black hover:underline mb-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-black mb-2">{hotel.name}</h1>
          <div className="flex items-center gap-4 text-gray-600">
            <div className="flex items-center gap-1">
              {[...Array(hotel.star_rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-black text-black" />
              ))}
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{hotel.address}, {hotel.city}</span>
            </div>
            {hotel.rating && (
              <div className="flex items-center gap-2">
                <div className="bg-black text-white px-2 py-1 rounded text-sm font-bold">
                  {hotel.rating}
                </div>
                <span className="text-sm">({hotel.reviews_count} đánh giá)</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-8">
          <div className="lg:col-span-3">
            <img
              src={images[selectedImage]}
              alt={hotel.name}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-1 gap-2">
            {images.slice(0, 4).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${hotel.name} ${index + 1}`}
                onClick={() => setSelectedImage(index)}
                className={`w-full h-20 lg:h-24 object-cover rounded-lg cursor-pointer ${
                  selectedImage === index ? 'ring-2 ring-black' : 'opacity-70 hover:opacity-100'
                } transition-opacity`}
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Về khách sạn</h2>
              <p className="text-gray-600 leading-relaxed">{hotel.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Tiện nghi</h2>
              <div className="grid grid-cols-2 gap-4">
                {hotel.amenities?.map((amenity, index) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                      <Icon className="w-5 h-5 text-black" />
                      <span className="text-gray-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black mb-4">Chính sách khách sạn</h2>
              <div className="space-y-3 text-gray-600">
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Nhận phòng</span>
                  <span>Từ 14:00</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Trả phòng</span>
                  <span>Trước 12:00</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Hủy đặt phòng</span>
                  <span>Miễn phí hủy trước 48h</span>
                </div>
                <div className="flex justify-between py-3 border-b border-gray-200">
                  <span className="font-medium">Thú cưng</span>
                  <span>Không cho phép</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
              <div className="text-center mb-6 pb-6 border-b border-gray-200">
                <div className="text-sm text-gray-600 mb-1">Giá mỗi đêm từ</div>
                <div className="text-3xl font-bold text-black">
                  {formatPrice(hotel.price_per_night)}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Nhận phòng
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Trả phòng
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Số khách
                  </label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={(e) => setGuests(parseInt(e.target.value))}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    />
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Đặt phòng ngay
                </button>

                <p className="text-xs text-gray-600 text-center">
                  Bạn sẽ không bị tính phí ngay lập tức
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
