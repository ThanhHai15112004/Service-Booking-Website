import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { mockHotels } from '../../data/mockData';
import { Calendar, Users, CreditCard, User, Mail, Phone, CheckCircle } from 'lucide-react';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const hotel = mockHotels.find(h => h.id === id);

  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests') || '2'),
    specialRequests: ''
  });

  const [bookingComplete, setBookingComplete] = useState(false);

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
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
    );
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const subtotal = hotel.price_per_night * nights;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setBookingComplete(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (bookingComplete) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-black mb-4">
              Đặt phòng thành công!
            </h1>
            <p className="text-gray-600 mb-6">
              Cảm ơn bạn đã đặt phòng tại {hotel.name}. Chúng tôi đã gửi email xác nhận đến {bookingData.guestEmail}.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold text-black mb-4">Thông tin đặt phòng</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Khách sạn:</span>
                  <span className="font-medium text-black">{hotel.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tên khách:</span>
                  <span className="font-medium text-black">{bookingData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium text-black">{bookingData.guestEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Nhận phòng:</span>
                  <span className="font-medium text-black">
                    {new Date(bookingData.checkIn).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Trả phòng:</span>
                  <span className="font-medium text-black">
                    {new Date(bookingData.checkOut).toLocaleDateString('vi-VN')}
                  </span>
                </div>
                <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
                  <span className="text-gray-600">Tổng tiền:</span>
                  <span className="font-bold text-black text-lg">{formatPrice(total)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 bg-white text-black border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => window.location.href = '/hotels'}
                className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Đặt thêm phòng
              </button>
            </div>
          </div>
        </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => window.history.back()}
          className="text-black hover:underline mb-6"
        >
          ← Quay lại
        </button>

        <h1 className="text-3xl font-bold text-black mb-8">Hoàn tất đặt phòng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-black mb-4">Thông tin khách hàng</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Họ và tên
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={bookingData.guestName}
                        onChange={(e) => setBookingData({ ...bookingData, guestName: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={bookingData.guestEmail}
                        onChange={(e) => setBookingData({ ...bookingData, guestEmail: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="email@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Số điện thoại
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="tel"
                        required
                        value={bookingData.guestPhone}
                        onChange={(e) => setBookingData({ ...bookingData, guestPhone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="0912345678"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-black mb-4">Yêu cầu đặc biệt</h2>
                <textarea
                  value={bookingData.specialRequests}
                  onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                  placeholder="Ghi chú về yêu cầu đặc biệt của bạn (tùy chọn)"
                />
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold text-black mb-4">Thông tin thanh toán</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Số thẻ
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Ngày hết hạn
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                        placeholder="123"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                Xác nhận đặt phòng
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold text-black mb-4">Chi tiết đặt phòng</h2>

              <div className="mb-6">
                <img
                  src={hotel.main_image}
                  alt={hotel.name}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
                <h3 className="font-bold text-black text-lg mb-1">{hotel.name}</h3>
                <p className="text-gray-600 text-sm">{hotel.address}</p>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Nhận phòng</div>
                    <div className="font-medium text-black">
                      {bookingData.checkIn ? new Date(bookingData.checkIn).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Trả phòng</div>
                    <div className="font-medium text-black">
                      {bookingData.checkOut ? new Date(bookingData.checkOut).toLocaleDateString('vi-VN') : '-'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-sm text-gray-600">Số khách</div>
                    <div className="font-medium text-black">{bookingData.guests} người</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between text-gray-600">
                  <span>{formatPrice(hotel.price_per_night)} × {nights} đêm</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thuế & phí</span>
                  <span>{formatPrice(tax)}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-black pt-3 border-t border-gray-200">
                  <span>Tổng cộng</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
