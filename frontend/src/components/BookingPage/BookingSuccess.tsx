import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock } from 'lucide-react';

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
  bookingCode?: string;
  bookingId?: string;
  status?: string; // ✅ Add status prop
}

export default function BookingSuccess({
  hotel,
  guestName,
  guestEmail,
  checkIn,
  checkOut,
  total,
  bookingCode,
  bookingId,
  status = 'PENDING_CONFIRMATION' // ✅ Default to PENDING_CONFIRMATION
}: BookingSuccessProps) {
  const navigate = useNavigate();

  // ✅ Redirect về trang chủ nếu reload trang (không có bookingCode và bookingId)
  useEffect(() => {
    // Kiểm tra nếu không có bookingCode và bookingId (có thể do reload trang)
    if (!bookingCode && !bookingId) {
      navigate('/', { replace: true });
      return;
    }

    // ✅ Lưu flag vào sessionStorage để đánh dấu đã vào trang success hợp lệ
    sessionStorage.setItem('bookingSuccessVisited', 'true');
    
    // ✅ Cleanup: Xóa flag khi component unmount hoặc khi có bookingCode/bookingId
    return () => {
      // Không xóa flag ngay, để có thể check khi reload
    };
  }, [bookingCode, bookingId, navigate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // ✅ Get status message based on booking status
  const getStatusMessage = () => {
    switch (status) {
      case 'PENDING_CONFIRMATION':
        return {
          title: 'Đặt phòng thành công!',
          description: `Cảm ơn bạn đã đặt phòng tại ${hotel.name}. Đơn đặt chỗ của bạn đã được thanh toán và đang chờ admin xác nhận. Chúng tôi sẽ gửi email xác nhận đến ${guestEmail} sau khi được duyệt.`,
          icon: Clock,
          iconColor: 'text-yellow-600',
          bgColor: 'bg-yellow-100'
        };
      case 'CONFIRMED':
        return {
          title: 'Đặt phòng thành công!',
          description: `Cảm ơn bạn đã đặt phòng tại ${hotel.name}. Đơn đặt chỗ của bạn đã được xác nhận. Chúng tôi đã gửi email xác nhận đến ${guestEmail}.`,
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        };
      default:
        return {
          title: 'Đặt phòng thành công!',
          description: `Cảm ơn bạn đã đặt phòng tại ${hotel.name}. Chúng tôi đã gửi email xác nhận đến ${guestEmail}.`,
          icon: CheckCircle,
          iconColor: 'text-green-600',
          bgColor: 'bg-green-100'
        };
    }
  };

  const statusMessage = getStatusMessage();
  const StatusIcon = statusMessage.icon;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8 text-center">
      <div className={`w-20 h-20 ${statusMessage.bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
        <StatusIcon className={`w-12 h-12 ${statusMessage.iconColor}`} />
      </div>
      <h1 className="text-3xl font-bold text-black mb-4">
        {statusMessage.title}
      </h1>
      <p className="text-gray-600 mb-6">
        {statusMessage.description}
      </p>

      <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
        <h3 className="font-bold text-black mb-4">Thông tin đặt phòng</h3>
        <div className="space-y-3 text-sm">
          {bookingCode && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đặt phòng:</span>
              <span className="font-bold text-blue-600 text-base">{bookingCode}</span>
            </div>
          )}
          {bookingId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-medium text-black">{bookingId}</span>
            </div>
          )}
          {/* Status Badge */}
          {status && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === 'PENDING_CONFIRMATION' 
                  ? 'bg-yellow-100 text-yellow-800'
                  : status === 'CONFIRMED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {status === 'PENDING_CONFIRMATION' 
                  ? 'Chờ xác nhận'
                  : status === 'CONFIRMED'
                  ? 'Đã xác nhận'
                  : status}
              </span>
            </div>
          )}
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

      {/* Status-specific message */}
      {status === 'PENDING_CONFIRMATION' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-yellow-800">
            <strong>Lưu ý:</strong> Đơn đặt chỗ của bạn đã được thanh toán thành công và đang chờ admin xác nhận. 
            Bạn sẽ nhận được email thông báo khi đơn đặt chỗ được xác nhận. 
            Vui lòng kiểm tra email thường xuyên.
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/', { replace: true })}
          className="flex-1 bg-white text-black border border-gray-300 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors font-medium"
        >
          Về trang chủ
        </button>
        <button
          onClick={() => navigate('/bookings', { replace: true })}
          className="flex-1 bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium"
        >
          Xem đơn đặt chỗ
        </button>
      </div>
    </div>
  );
}

