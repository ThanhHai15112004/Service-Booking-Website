import { CheckCircle } from 'lucide-react';

interface Hotel {
  name: string;
}

interface BookingSuccessProps {
  hotel: Hotel;
  guestName: string;
  guestEmail: string;
  checkIn: string;
  checkOut: string;
  total: number;
}

export default function BookingSuccess({
  hotel,
  guestName,
  guestEmail,
  checkIn,
  checkOut,
  total
}: BookingSuccessProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <CheckCircle className="w-12 h-12 text-green-600" />
      </div>
      <h1 className="text-3xl font-bold text-black mb-4">
        Đặt phòng thành công!
      </h1>
      <p className="text-gray-600 mb-6">
        Cảm ơn bạn đã đặt phòng tại {hotel.name}. Chúng tôi đã gửi email xác nhận đến {guestEmail}.
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
            <span className="font-medium text-black">{guestName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-black">{guestEmail}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nhận phòng:</span>
            <span className="font-medium text-black">
              {new Date(checkIn).toLocaleDateString('vi-VN')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Trả phòng:</span>
            <span className="font-medium text-black">
              {new Date(checkOut).toLocaleDateString('vi-VN')}
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
  );
}

