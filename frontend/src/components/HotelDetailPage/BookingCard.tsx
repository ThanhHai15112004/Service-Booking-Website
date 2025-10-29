import { Calendar, Users, Home, Baby } from 'lucide-react';

interface BookingCardProps {
  pricePerNight: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms?: number;
  children?: number;
  onCheckInChange: (value: string) => void;
  onCheckOutChange: (value: string) => void;
  onGuestsChange: (value: number) => void;
  onRoomsChange?: (value: number) => void;
  onChildrenChange?: (value: number) => void;
  onBooking: () => void;
}

export default function BookingCard({
  pricePerNight,
  checkIn,
  checkOut,
  guests,
  rooms = 1,
  children = 0,
  onCheckInChange,
  onCheckOutChange,
  onGuestsChange,
  onRoomsChange,
  onChildrenChange,
  onBooking
}: BookingCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-20">
      <div className="text-center mb-6 pb-6 border-b border-gray-200">
        <div className="text-sm text-gray-600 mb-1">Giá mỗi đêm từ</div>
        <div className="text-3xl font-bold text-black">
          {formatPrice(pricePerNight)}
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
              onChange={(e) => onCheckInChange(e.target.value)}
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
              onChange={(e) => onCheckOutChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Số phòng
          </label>
          <div className="relative">
            <Home className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={rooms}
              onChange={(e) => onRoomsChange?.(parseInt(e.target.value) || 1)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Số người lớn
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="1"
              value={guests}
              onChange={(e) => onGuestsChange(parseInt(e.target.value) || 1)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Số trẻ em
          </label>
          <div className="relative">
            <Baby className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="number"
              min="0"
              value={children}
              onChange={(e) => onChildrenChange?.(parseInt(e.target.value) || 0)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
            />
          </div>
        </div>

        <button
          onClick={onBooking}
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Đặt phòng ngay
        </button>

        <p className="text-xs text-gray-600 text-center">
          Bạn sẽ không bị tính phí ngay lập tức
        </p>
      </div>
    </div>
  );
}

