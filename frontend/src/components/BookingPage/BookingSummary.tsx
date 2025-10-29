import { Calendar, Users, Home, Baby } from 'lucide-react';

interface Hotel {
  name: string;
  main_image: string;
  address: string;
  price_per_night: number;
}

interface Room {
  roomType?: string;
  roomId?: string;
}

interface BookingSummaryProps {
  hotel: Hotel;
  room?: Room | null;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  children?: number;
  nights: number;
  subtotal: number;
  tax: number;
  total: number;
}

export default function BookingSummary({
  hotel,
  room,
  checkIn,
  checkOut,
  guests,
  rooms = 1,
  children = 0,
  nights,
  subtotal,
  tax,
  total
}: BookingSummaryProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
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
        {room?.roomType && (
          <p className="text-gray-700 text-sm font-medium mt-2">Loại phòng: {room.roomType}</p>
        )}
      </div>

      <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">Nhận phòng</div>
            <div className="font-medium text-black">
              {checkIn ? new Date(checkIn).toLocaleDateString('vi-VN') : '-'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">Trả phòng</div>
            <div className="font-medium text-black">
              {checkOut ? new Date(checkOut).toLocaleDateString('vi-VN') : '-'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Home className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">Số phòng</div>
            <div className="font-medium text-black">{rooms} phòng</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-gray-400" />
          <div className="flex-1">
            <div className="text-sm text-gray-600">Người lớn</div>
            <div className="font-medium text-black">{guests} người</div>
          </div>
        </div>

        {children > 0 && (
          <div className="flex items-center gap-3">
            <Baby className="w-5 h-5 text-gray-400" />
            <div className="flex-1">
              <div className="text-sm text-gray-600">Trẻ em</div>
              <div className="font-medium text-black">{children} trẻ</div>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-gray-600">
          <span>{formatPrice(hotel.price_per_night)} × {nights} đêm × {rooms} phòng</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Thuế & phí (10%)</span>
          <span>{formatPrice(tax)}</span>
        </div>
        <div className="flex justify-between text-xl font-bold text-black pt-3 border-t border-gray-200">
          <span>Tổng cộng</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  );
}

