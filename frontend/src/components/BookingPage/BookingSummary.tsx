import { CheckCircle, ThumbsUp, Bell } from 'lucide-react';

interface Hotel {
  name?: string;
  main_image?: string;
  mainImage?: string;
  address?: string;
  price_per_night?: number;
  avgRating?: number;
  reviewCount?: number;
  starRating?: number;
  city?: string;
  country?: string;
  hotelId?: string;
  id?: string;
}

interface Room {
  roomType?: string;
  roomId?: string;
  roomTypeId?: string;
  roomName?: string;
  roomDescription?: string;
  bedType?: string;
  capacity?: number;
  totalPrice?: number;
  avgPricePerNight?: number;
  images?: Array<{ imageUrl?: string; imageId?: string; isPrimary?: boolean }>;
  facilities?: Array<{ facilityId?: string; name?: string; icon?: string }>;
  payLater?: boolean;
  freeCancellation?: boolean;
  noCreditCard?: boolean;
  area?: number;
  roomNumber?: string | null; // ✅ Room number from database
  refundable?: boolean;
  extraBedFee?: number;
  childrenAllowed?: boolean;
  petsAllowed?: boolean;
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
  paymentMethod?: 'pay_at_hotel' | 'online_payment';
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
  total,
  paymentMethod = 'pay_at_hotel'
}: BookingSummaryProps) {
  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const months = ['tháng 1', 'tháng 2', 'tháng 3', 'tháng 4', 'tháng 5', 'tháng 6', 
                    'tháng 7', 'tháng 8', 'tháng 9', 'tháng 10', 'tháng 11', 'tháng 12'];
    return `${days[date.getDay()]}, ngày ${date.getDate()}, ${months[date.getMonth()]}`;
  };

  const roomImage = room?.images?.[0]?.imageUrl || room?.images?.find(img => img.isPrimary)?.imageUrl || hotel.main_image || hotel.mainImage;
  const roomFeatures = room?.facilities || [];
  const discountPercent = 0; // TODO: Calculate from original price

  return (
    <div className="space-y-4">
      {/* Check-in/Check-out Dates */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600 mb-1">Nhận phòng</p>
            <p className="text-sm font-medium text-black">{formatDate(checkIn)}</p>
          </div>
          <div className="text-blue-600">
            →
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600 mb-1">Trả phòng</p>
            <p className="text-sm font-medium text-black">
              {formatDate(checkOut)} {nights} đêm
            </p>
          </div>
        </div>
      </div>

      {/* Hotel & Room Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {roomImage && (
          <img
            src={roomImage}
            alt={room?.roomName || hotel.name}
            className="w-full h-32 object-cover rounded-lg mb-3"
          />
        )}
        <h3 className="font-bold text-black text-base mb-1">{hotel.name}</h3>
        
        {/* ✅ Hotel Star Rating */}
        {hotel.starRating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-1">
              {[...Array(Math.floor(hotel.starRating))].map((_, i) => (
                <span key={i} className="text-yellow-400 text-xs">★</span>
              ))}
            </div>
            <span className="text-xs text-gray-600">{hotel.starRating} sao</span>
          </div>
        )}
        
        {/* ✅ Hotel Rating & Reviews */}
        {hotel.avgRating && (
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-black">{hotel.avgRating}</span>
            <span className="text-xs text-gray-600">Tuyệt vời</span>
            {hotel.reviewCount && (
              <span className="text-xs text-gray-600">({hotel.reviewCount} đánh giá)</span>
            )}
          </div>
        )}
        
        {/* ✅ Hotel Address */}
        {hotel.address && (
          <p className="text-xs text-gray-600 mb-3">{hotel.address}</p>
        )}
        
        {/* ✅ Hotel City/Country */}
        {(hotel.city || hotel.country) && (
          <p className="text-xs text-gray-500 mb-3">
            {hotel.city}{hotel.city && hotel.country ? ', ' : ''}{hotel.country}
          </p>
        )}
        
        {/* Room Details */}
        {room && (
          <div className="border-t border-gray-200 pt-3 mt-3">
            <p className="text-sm font-medium text-black mb-2">
              {rooms} × {room.roomName || room.roomType || 'Phòng đã chọn'}
            </p>
            
            {/* ✅ Room Number - Hiển thị nếu có */}
            {room.roomNumber && (
              <p className="text-xs text-blue-600 font-semibold mb-1">
                Phòng số: {room.roomNumber}
              </p>
            )}
            
            {/* ✅ Room Description */}
            {room.roomDescription && (
              <p className="text-xs text-gray-600 mb-2">{room.roomDescription}</p>
            )}
            
            {/* ✅ Room Area */}
            {room.area && (
              <p className="text-xs text-gray-600 mb-1">Diện tích: {room.area} m²</p>
            )}
            
            {/* ✅ Bed Type */}
            {room.bedType && (
              <p className="text-xs text-gray-600 mb-1">Loại giường: {room.bedType}</p>
            )}
            
            {/* ✅ Number of guests - Hiển thị số người đang đi */}
            <p className="text-xs text-gray-600 mb-2">
              Số người: {guests} người lớn{children > 0 ? `, ${children} trẻ em` : ''}
              {room.capacity && ` (Tối đa ${room.capacity} người/phòng)`}
            </p>
            
            {/* ✅ Room Features - Hiển thị thêm thông tin */}
            {(room.childrenAllowed !== undefined || room.petsAllowed !== undefined) && (
              <div className="text-xs text-gray-600 mb-2 space-y-1">
                {room.childrenAllowed !== undefined && (
                  <p className={room.childrenAllowed ? 'text-green-600' : 'text-red-600'}>
                    {room.childrenAllowed ? '✓' : '✗'} {room.childrenAllowed ? 'Cho phép' : 'Không cho phép'} trẻ em
                  </p>
                )}
                {room.petsAllowed !== undefined && (
                  <p className={room.petsAllowed ? 'text-green-600' : 'text-red-600'}>
                    {room.petsAllowed ? '✓' : '✗'} {room.petsAllowed ? 'Cho phép' : 'Không cho phép'} vật nuôi
                  </p>
                )}
              </div>
            )}
            
            {/* ✅ Extra Bed Fee - Chỉ hiển thị nếu có giá > 0 */}
            {typeof room.extraBedFee === 'number' && room.extraBedFee > 0 && (
              <p className="text-xs text-gray-600 mb-2">
                Phí giường phụ: {formatPrice(room.extraBedFee)}
              </p>
            )}
            
            {/* Room Features */}
            <div className="space-y-2 mt-3">
              {room.noCreditCard && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Đặt không cần thẻ tín dụng</span>
                </div>
              )}
              {paymentMethod === 'pay_at_hotel' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Thanh toán tại nơi ở</span>
                </div>
              )}
              {room.freeCancellation && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-xs text-gray-700">Miễn phí hủy</span>
                </div>
              )}
              {roomFeatures.length > 0 ? (
                <>
                  {roomFeatures.slice(0, 5).map((facility, index) => (
                    <div key={facility.facilityId || index} className="flex items-center gap-2">
                      {facility.icon ? (
                        <img src={facility.icon} alt={facility.name} className="w-4 h-4 object-contain flex-shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      )}
                      <span className="text-xs text-gray-700">{facility.name}</span>
                    </div>
                  ))}
                  {roomFeatures.length > 5 && (
                    <p className="text-xs text-gray-500">+ {roomFeatures.length - 5} tiện nghi khác</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-gray-500">Đang tải thông tin tiện nghi...</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Risk-Free Booking Alert */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-green-800 mb-1">
              Đơn đặt phòng không có rủi ro!
            </p>
            <p className="text-xs text-green-700 mb-2">
              Hủy trước {formatDate(checkOut)} và quý khách sẽ không phải thanh toán bất cứ khoản nào!
            </p>
            <button className="text-xs text-blue-600 hover:underline">
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>

      {/* Hotel Rating Alert */}
      {hotel.avgRating && hotel.avgRating >= 8 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <ThumbsUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-green-800">
              Lựa chọn khách sạn tốt nhất - Đánh giá trung bình của khách {hotel.avgRating}
            </p>
          </div>
        </div>
      )}

      {/* Limited Rooms Warning */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-800">
            Chúng tôi chỉ có số phòng giới hạn ở mức giá này - hãy đặt ngay!
          </p>
        </div>
      </div>

      {/* Cancellation Policy */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="text-sm font-semibold text-black mb-2">
          Nếu hủy phòng thì sẽ trả phí bao nhiêu?
        </h4>
        <p className="text-xs text-gray-600 mb-3">
          Đặt chỗ không có rủi ro! Quý khách có thể hủy miễn phí đơn đặt phòng này trước {formatDate(checkOut)}. 
          Quý khách có thể dễ dàng hủy hoặc thay đổi đơn đặt phòng trực tuyến miễn phí.{' '}
          <button className="text-blue-600 hover:underline">Xem thêm chi tiết</button>
        </p>
      </div>

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        {discountPercent > 0 && (
          <div className="bg-red-600 text-white text-xs font-bold text-center py-1.5 rounded mb-3">
            GIẢM {discountPercent}% HÔM NAY
          </div>
        )}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Giá phòng ({rooms} phòng × {nights} đêm)</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Thuế và phí (10%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí đặt trước</span>
            <span className="text-green-600 font-medium">MIỄN PHÍ</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-black pt-3 border-t border-gray-200">
            <span>Giá cuối cùng</span>
            <span className="text-red-600">{formatPrice(total)}</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Giá đã bao gồm: Phí dịch vụ 5%, Thuế 8%
          </p>
          {paymentMethod === 'pay_at_hotel' && (
            <p className="text-xs text-gray-500 mt-1">
              Bạn sẽ thanh toán tại {hotel.name} bằng ngoại tệ (₫).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
