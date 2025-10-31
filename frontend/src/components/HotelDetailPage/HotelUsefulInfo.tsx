import React from 'react';
import { Calendar, MapPin, Car, Building2, Key, Clock } from 'lucide-react';

interface HotelUsefulInfoProps {
  hotel?: {
    checkinTime?: string;
    checkoutTime?: string;
    totalRooms?: number;
    distanceCenter?: number;
    address?: string;
    city?: string;
  };
}

export default function HotelUsefulInfo({ hotel }: HotelUsefulInfoProps) {
  if (!hotel) {
    return null;
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-black mb-4">Vài thông tin hữu ích</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Check-in/Check-out */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            Nhận phòng/ Trả phòng
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            {hotel.checkinTime && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Nhận phòng từ: <strong>{hotel.checkinTime}</strong></span>
              </div>
            )}
            {hotel.checkoutTime && (
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Trả phòng đến: <strong>{hotel.checkoutTime}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Transportation */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            Di chuyển
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            {hotel.distanceCenter !== undefined && (
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <span>Khoảng cách từ trung tâm thành phố: <strong>{hotel.distanceCenter} km</strong></span>
              </div>
            )}
            
            {/* About Hotel - Nested */}
            <div className="mt-3 pl-4 border-l-2 border-gray-200">
              <h4 className="text-xs font-semibold text-gray-800 mb-2">Về khách sạn</h4>
              {hotel.totalRooms && (
                <div className="flex items-start gap-2 mb-1">
                  <Key className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-gray-600">Số lượng phòng: <strong>{hotel.totalRooms}</strong></span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Parking */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Car className="w-4 h-4 text-blue-600" />
            Đỗ xe
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start gap-2">
              <Car className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
              <span>Phí giữ xe hàng ngày: <strong>200,000 VND</strong></span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              (*Thông tin có thể thay đổi, vui lòng liên hệ khách sạn để biết chi tiết)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

