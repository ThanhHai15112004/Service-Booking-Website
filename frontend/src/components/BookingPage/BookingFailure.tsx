import { XCircle, Calendar, Users, Home, MapPin, Phone, Clock } from 'lucide-react';

interface Hotel {
  name: string;
  address?: string;
  phone_number?: string;
}

interface BookingFailureProps {
  hotel: Hotel;
  errorMessage: string;
  bookingId?: string;
  checkIn?: string;
  checkOut?: string;
  roomName?: string;
  guests?: number;
  rooms?: number;
  stayType?: 'overnight' | 'dayuse';
  onGoHome?: () => void;
}

export default function BookingFailure({
  hotel,
  errorMessage,
  bookingId,
  checkIn,
  checkOut,
  roomName,
  guests,
  rooms,
  stayType,
  onGoHome
}: BookingFailureProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-xl overflow-hidden">
      {/* Header với background gradient */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              Đặt phòng thất bại
            </h1>
            <p className="text-red-100 text-sm">
              Rất tiếc, không thể hoàn tất đặt phòng của bạn
            </p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Error Message */}
        <div className="bg-red-50 border-l-4 border-red-500 rounded-r-lg p-5 mb-6">
          <h3 className="font-bold text-red-800 mb-2 flex items-center gap-2">
            <XCircle className="w-5 h-5" />
            Thông báo lỗi
          </h3>
          <p className="text-red-700 text-sm mb-3">{errorMessage}</p>
          {bookingId && (
            <div className="mt-3 pt-3 border-t border-red-200">
              <p className="text-xs text-gray-600">
                Mã đặt phòng: <span className="font-mono font-semibold text-red-800">{bookingId}</span>
              </p>
            </div>
          )}
        </div>

        {/* Booking Details */}
        {(checkIn || checkOut || roomName || guests || rooms) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Thông tin đặt phòng
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Hotel Info */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Khách sạn</p>
                    <p className="font-semibold text-gray-900">{hotel.name}</p>
                    {hotel.address && (
                      <p className="text-sm text-gray-600 mt-1 flex items-start gap-1">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        {hotel.address}
                      </p>
                    )}
                    {hotel.phone_number && (
                      <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                        <Phone className="w-4 h-4 text-gray-400" />
                        {hotel.phone_number}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Booking Dates & Details */}
              <div className="space-y-3">
                {roomName && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Loại phòng</p>
                    <p className="font-semibold text-gray-900">{roomName}</p>
                  </div>
                )}
                {checkIn && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Ngày nhận phòng</p>
                      <p className="font-medium text-gray-900">{formatDate(checkIn)}</p>
                    </div>
                  </div>
                )}
                {checkOut && (
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <div>
                      <p className="text-xs text-gray-500 mb-1">
                        Ngày trả phòng
                        {stayType === 'dayuse' && ' (Day-use)'}
                      </p>
                      <p className="font-medium text-gray-900">{formatDate(checkOut)}</p>
                    </div>
                  </div>
                )}
                {(guests || rooms) && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <div className="flex gap-4">
                      {guests && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số khách</p>
                          <p className="font-medium text-gray-900">{guests} người</p>
                        </div>
                      )}
                      {rooms && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Số phòng</p>
                          <p className="font-medium text-gray-900">{rooms} phòng</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Possible Reasons */}
        <div className="bg-blue-50 border-l-4 border-blue-500 rounded-r-lg p-5 mb-6">
          <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs">?</span>
            Có thể do nguyên nhân sau:
          </h4>
          <ul className="text-sm text-blue-700 space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Phòng đã được đặt bởi khách hàng khác trong thời gian bạn đang xử lý</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Không đủ phòng trống cho ngày bạn đã chọn</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Phiên đặt phòng đã hết hạn (quá thời gian giữ chỗ)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Lỗi kết nối mạng hoặc hệ thống tạm thời</span>
            </li>
          </ul>
        </div>

        {/* Support Info */}
        <div className="bg-gray-50 rounded-lg p-5 mb-6">
          <p className="text-sm text-gray-700 mb-2">
            <strong>Bạn cần hỗ trợ?</strong>
          </p>
          <p className="text-sm text-gray-600">
            Vui lòng liên hệ với chúng tôi qua số hotline: <strong className="text-blue-600">{hotel.phone_number || '1900-xxxx'}</strong> hoặc email: <strong className="text-blue-600">support@example.com</strong>
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {onGoHome ? (
            <button
              onClick={onGoHome}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Về trang chủ
            </button>
          ) : (
            <button
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Về trang chủ
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
