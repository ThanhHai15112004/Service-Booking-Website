import { useState } from 'react';
import { Users, Maximize, BedDouble, Image as ImageIcon, CheckCircle, Wifi, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Room } from '../../types';
import { NoRoomsAvailable } from '../common';
import HotelImageGallery from './HotelImageGallery';

interface RoomListProps {
  rooms: Room[];
  nights: number;
  roomsRequested: number;
  guests?: number; // ✅ NEW: Số khách để kiểm tra capacity
  hotelImages?: string[];
  hotelName?: string;
  hotelHighlights?: Array<{ text: string; icon?: string; tooltip?: string }>; // Highlights từ hotel
  onSelectRoom?: (room: Room, paymentMethod: 'payNow' | 'payLater') => void;
  hasActiveFilters?: boolean; // ✅ NEW: Có filter đang active không
}

type PaymentOption = 'payNow' | 'payLater';

export default function RoomList({ 
  rooms, 
  roomsRequested,
  guests = 2, // ✅ NEW: Default 2 guests
  onSelectRoom,
  hotelImages = [],
  hotelName = '',
  hotelHighlights = [],
  hasActiveFilters = false // ✅ NEW: Default không có filter active
}: RoomListProps) {
  const [selectedRoomForGallery, setSelectedRoomForGallery] = useState<Room | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  if (!rooms || rooms.length === 0) {
    return <NoRoomsAvailable hasActiveFilters={hasActiveFilters} />;
  }

  // ✅ Check xem hotel có cho phép "Thanh toán tại nơi ở" không
  // Nếu có ít nhất 1 room có payLater = true, thì hotel cho phép
  const hotelAllowsPayLater = rooms.some(room => room.payLater === true);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price);
  };

  const getBedTypeName = (bedType?: string) => {
    const bedTypeMap: Record<string, string> = {
      'Single': 'Giường đơn',
      'Double': 'Giường đôi',
      'Queen': 'Giường Queen',
      'King': 'Giường King',
      'Twin': 'Giường đôi nhỏ',
      'Bunk': 'Giường tầng'
    };
    return bedType ? bedTypeMap[bedType] || bedType : 'Chưa rõ';
  };

  // Tính giá cho từng payment option
  // Note: room.totalPrice đã bao gồm tất cả promotions từ backend
  const calculatePrice = (room: Room, paymentMethod: PaymentOption) => {
    // room.totalPrice đã là giá cuối cùng sau khi áp dụng tất cả promotions
    const finalPrice = room.totalPrice;
    // Thanh toán ngay thường rẻ hơn ~2% so với thanh toán tại quầy
    if (paymentMethod === 'payNow') {
      return Math.round(finalPrice * 0.98); // Giảm 2% khi thanh toán ngay
    }
    return finalPrice;
  };

  return (
    <>
      <div className="space-y-4">
        {rooms.map((room) => {
          const exceedsCapacity = !room.meetsCapacity;
          const hasEnoughRooms = room.maxBookableSets ? room.maxBookableSets > 0 : room.minAvailable >= roomsRequested;
          const canBook = room.meetsCapacity && hasEnoughRooms;

          // Tính giá cho 2 options
          const payNowPrice = calculatePrice(room, 'payNow');
          const payLaterPrice = calculatePrice(room, 'payLater');

          return (
            <RoomCard
              key={room.roomId || room.roomTypeId}
              room={room}
              roomsRequested={roomsRequested}
              exceedsCapacity={exceedsCapacity}
              hasEnoughRooms={hasEnoughRooms}
              canBook={canBook}
              getBedTypeName={getBedTypeName}
              formatPrice={formatPrice}
              payNowPrice={payNowPrice}
              payLaterPrice={payLaterPrice}
              hotelHighlights={hotelHighlights}
              hotelAllowsPayLater={hotelAllowsPayLater}
              guests={guests}
              onSelectRoom={onSelectRoom}
              onOpenGallery={() => {
                setSelectedRoomForGallery(room);
                setShowGallery(true);
              }}
            />
          );
        })}
      </div>

      {showGallery && selectedRoomForGallery && (
        <HotelImageGallery
          images={hotelImages}
          hotelName={hotelName}
          roomImages={selectedRoomForGallery.images || []}
          roomName={selectedRoomForGallery.roomName}
          initialTab="room"
          autoOpen={true}
          onClose={() => {
            setShowGallery(false);
            setSelectedRoomForGallery(null);
          }}
        />
      )}
    </>
  );
}

interface RoomCardProps {
  room: Room;
  roomsRequested: number;
  exceedsCapacity: boolean;
  hasEnoughRooms: boolean;
  canBook: boolean;
  getBedTypeName: (bedType?: string) => string;
  formatPrice: (price: number) => string;
  payNowPrice: number;
  payLaterPrice: number;
  hotelHighlights: Array<{ text: string; icon?: string; tooltip?: string }>;
  hotelAllowsPayLater: boolean; // ✅ NEW: Hotel có cho phép thanh toán tại nơi ở không
  guests: number; // ✅ NEW: Số khách để hiển thị trong tooltip
  onSelectRoom?: (room: Room, paymentMethod: PaymentOption) => void;
  onOpenGallery: () => void;
}

function RoomCard({
  room,
  roomsRequested,
  exceedsCapacity,
  hasEnoughRooms,
  canBook,
  getBedTypeName,
  formatPrice,
  payNowPrice,
  payLaterPrice,
  hotelHighlights,
  hotelAllowsPayLater, // ✅ NEW: Hotel có cho phép thanh toán tại nơi ở không
  guests, // ✅ NEW: Số khách
  onSelectRoom,
  onOpenGallery
}: RoomCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showAllFacilities, setShowAllFacilities] = useState(false);

  // Helper function to format image URL
  const formatImageUrl = (url: string | null | undefined): string => {
    if (!url) return 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Relative path - add base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}${url.startsWith('/') ? url : `/${url}`}`;
  };

  const roomImages = room.images && room.images.length > 0
    ? room.images.map(img => ({
        ...img,
        imageUrl: formatImageUrl(img.imageUrl)
      }))
    : [{
        imageId: 'default',
        imageUrl: formatImageUrl(room.roomImage),
        imageAlt: room.roomName,
        isPrimary: true,
        sortOrder: 0
      }];

  const mainImage = roomImages[selectedImageIndex] || roomImages.find(img => img.isPrimary) || roomImages[0];

  // ✅ FIX: Chỉ hiển thị 2 thumbnails + 1 nút "Xem tất cả"
  // Lấy 2 ảnh đầu tiên (không phải ảnh chính đang hiển thị)
  const otherImages = roomImages.filter((_, idx) => idx !== selectedImageIndex);
  const thumbnailImages = otherImages.slice(0, 2);

  const discountPercent = room.totalBasePrice > room.totalPrice 
    ? Math.round(((room.totalBasePrice - room.totalPrice) / room.totalBasePrice) * 100)
    : 0;

  // ✅ FIX: Không cần highlights ở đây nữa, sẽ có trong mỗi PaymentOptionRow

  // ✅ FIX: Facilities hiển thị - giới hạn 6 items
  const facilitiesToShow = showAllFacilities 
    ? room.facilities || []
    : (room.facilities || []).slice(0, 6);
  const hasMoreFacilities = room.facilities && room.facilities.length > 6;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* HEADER - Tên phòng */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">{room.roomName}</h3>
        {room.roomDescription && (
          <p className="text-sm text-gray-600 mt-1">
            {room.roomDescription}
          </p>
        )}
      </div>

            {/* CONTENT - 6 cột layout với đường kẻ dọc */}
            <div className="p-6">
              <div className="flex gap-6 items-stretch">
          {/* CỘT 1: Ảnh + Tiện nghi phòng */}
          <div className="flex-shrink-0 w-64 border-r border-gray-300 pr-6 h-full flex flex-col">
            {/* Room Images */}
            <div className="space-y-2 mb-4">
              {/* Ảnh chính */}
              <div className="relative group rounded-lg overflow-hidden cursor-pointer" onClick={onOpenGallery}>
                <img
                  src={mainImage.imageUrl}
                  alt={mainImage.imageAlt || room.roomName}
                  className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                  }}
                />
              </div>

              {/* Thumbnails - ✅ FIX: Chỉ hiển thị 2 thumbnails + 1 nút "Xem tất cả" */}
              <div className="grid grid-cols-3 gap-1.5">
                {/* Hiển thị 2 thumbnails đầu tiên (không phải ảnh chính) */}
                {thumbnailImages.map((image, index) => (
                  <button
                    key={image.imageId}
                    onClick={() => {
                      const originalIndex = roomImages.findIndex(img => img.imageId === image.imageId);
                      if (originalIndex !== -1) setSelectedImageIndex(originalIndex);
                    }}
                    onMouseEnter={() => {
                      const originalIndex = roomImages.findIndex(img => img.imageId === image.imageId);
                      if (originalIndex !== -1) setSelectedImageIndex(originalIndex);
                    }}
                    className={`relative w-full h-12 overflow-hidden rounded transition-all ${
                      roomImages[selectedImageIndex]?.imageId === image.imageId
                        ? 'ring-2 ring-blue-500'
                        : 'hover:opacity-80'
                    }`}
                  >
                    <img
                      src={image.imageUrl}
                      alt={image.imageAlt || `${room.roomName} - ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg';
                      }}
                    />
                  </button>
                ))}
                
                {/* ✅ FIX: Nếu chưa đủ 2 thumbnails, hiển thị placeholder cho slot trống */}
                {thumbnailImages.length < 2 && Array.from({ length: 2 - thumbnailImages.length }).map((_, idx) => (
                  <div
                    key={`placeholder-${idx}`}
                    className="w-full h-12 bg-gray-100 rounded flex items-center justify-center"
                  >
                    <ImageIcon className="w-3 h-3 text-gray-400" />
                  </div>
                ))}
                
                {/* ✅ FIX: Luôn hiển thị nút "Xem tất cả" ở slot thứ 3 */}
                <button 
                  onClick={onOpenGallery}
                  className="relative w-full h-12 bg-gray-100 hover:bg-gray-200 rounded flex flex-col items-center justify-center transition-colors overflow-hidden"
                >
                  {roomImages.length > 3 && thumbnailImages.length >= 2 ? (
                    <>
                      {/* Hiển thị ảnh thứ 3 làm background nếu có */}
                      <img
                        src={otherImages[2]?.imageUrl || roomImages[3]?.imageUrl}
                        alt="More"
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                      <div className="relative z-10 flex flex-col items-center">
                        <ImageIcon className="w-3 h-3 text-gray-700" />
                        <span className="text-[8px] text-gray-700 font-semibold">
                          +{roomImages.length - 3}
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center">
                      <ImageIcon className="w-3 h-3 text-gray-700 mb-0.5" />
                      <span className="text-[8px] text-gray-700 font-semibold">Xem tất cả</span>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Room Info - Diện tích */}
            <div className="space-y-2 mb-4">
              <div className="flex items-start gap-2 text-xs text-gray-700">
                <Maximize className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-semibold">Diện tích phòng:</span>{' '}
                  <span>{room.area ? `${room.area} m²` : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* ✅ FIX: Style phòng (Bed Type) - Hiển thị rõ ràng hơn */}
            {room.bedType && (
              <div className="mb-4">
                <div className="flex items-start gap-2 text-xs text-gray-700">
                  <BedDouble className="w-3.5 h-3.5 text-gray-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold">Style phòng:</span>{' '}
                    <span>{getBedTypeName(room.bedType)}</span>
                  </div>
                </div>
              </div>
            )}

            {/* ✅ FIX: Facilities - Lấy từ API, giới hạn 6 items, có "xem thêm", dùng icon của facility */}
            {room.facilities && room.facilities.length > 0 && (
              <div className="space-y-1.5">
                <div className="text-xs font-semibold text-gray-700 mb-2">Tiện nghi phòng:</div>
                {facilitiesToShow.map((facility) => (
                  <div 
                    key={facility.facilityId}
                    className="flex items-center gap-1.5 text-xs text-gray-700"
                  >
                    {facility.icon ? (
                      <img 
                        src={facility.icon} 
                        alt={facility.name}
                        className="w-[14px] h-[14px] object-contain flex-shrink-0"
                      />
                    ) : (
                      <CheckCircle className="w-[14px] h-[14px] text-green-600 flex-shrink-0" />
                    )}
                    <span className="line-clamp-1">{facility.name}</span>
                  </div>
                ))}
                {hasMoreFacilities && (
                  <button 
                    onClick={() => setShowAllFacilities(!showAllFacilities)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 mt-2"
                  >
                    {showAllFacilities ? (
                      <>
                        <ChevronUp className="w-3 h-3" />
                        Thu gọn
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" />
                        +{room.facilities.length - 6} tiện nghi khác
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>

          {/* CỘT 2-6: Payment Options - 2 khung riêng biệt, mỗi khung có highlights riêng */}
          {/* ✅ FIX: Nếu hotel không cho phép pay later, thì chỉ hiển thị 1 khung (pay now) và phủ xuống hết */}
          <div className={`flex-1 min-w-0 flex flex-col ${hotelAllowsPayLater && room.payLater ? 'space-y-4' : ''}`}>
            {/* Option 1: Pay Now - Khung riêng với border */}
            {/* ✅ FIX: Nếu chỉ có pay now, khung phủ xuống hết (flex-1 để fill remaining space) */}
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors ${!hotelAllowsPayLater || !room.payLater ? 'flex-1' : ''}`}>
              <PaymentOptionRow 
                paymentMethod="payNow"
                price={payNowPrice}
                room={room}
                roomsRequested={roomsRequested}
                discountPercent={discountPercent}
                canBook={canBook}
                exceedsCapacity={exceedsCapacity}
                hasEnoughRooms={hasEnoughRooms}
                formatPrice={formatPrice}
                onSelectRoom={onSelectRoom}
                isPayNow={true}
                hotelHighlights={hotelHighlights}
                guests={guests}
              />
            </div>

            {/* Option 2: Pay Later - Chỉ hiển thị nếu hotel cho phép VÀ room này có payLater */}
            {hotelAllowsPayLater && room.payLater && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                <PaymentOptionRow 
                  paymentMethod="payLater"
                  price={payLaterPrice}
                  room={room}
                  roomsRequested={roomsRequested}
                  discountPercent={discountPercent}
                  canBook={canBook}
                  exceedsCapacity={exceedsCapacity}
                  hasEnoughRooms={hasEnoughRooms}
                  formatPrice={formatPrice}
                  onSelectRoom={onSelectRoom}
                  isPayNow={false}
                  hotelHighlights={hotelHighlights}
                  guests={guests}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Component hiển thị 1 payment option row với highlights riêng + 5 cột (2, 3, 4, 5, 6)
function PaymentOptionRow({ 
  paymentMethod,
  price,
  room,
  roomsRequested,
  discountPercent,
  canBook,
  exceedsCapacity,
  hasEnoughRooms,
  formatPrice,
  onSelectRoom,
  isPayNow,
  hotelHighlights = [],
  guests = 2 // ✅ NEW: Số khách
}: {
  paymentMethod: PaymentOption;
  price: number;
  room: Room;
  roomsRequested: number;
  discountPercent: number;
  canBook: boolean;
  exceedsCapacity: boolean;
  hasEnoughRooms: boolean;
  formatPrice: (price: number) => string;
  onSelectRoom?: (room: Room, paymentMethod: PaymentOption) => void;
  isPayNow: boolean;
  hotelHighlights?: Array<{ text: string; icon?: string; tooltip?: string }>;
  guests?: number; // ✅ NEW: Số khách
}) {
  // ✅ Build highlights riêng cho mỗi payment option
  const optionHighlights: Array<{ text: string; icon?: string; color: string }> = [];
  
  // 1. Payment-specific highlights
  if (isPayNow) {
    optionHighlights.push({
      text: 'Đặt và trả tiền ngay',
      color: 'green'
    });
  } else {
    optionHighlights.push({
      text: 'Thanh toán tại nơi ở',
      color: 'blue'
    });
    if (room.noCreditCard) {
      optionHighlights.push({
        text: 'Đặt không cần thẻ tín dụng',
        color: 'purple'
      });
    }
  }
  
  // 2. Common highlights
  if (room.freeCancellation) {
    optionHighlights.push({
      text: 'Miễn phí hủy',
      color: 'green'
    });
  }
  
  optionHighlights.push({
    text: 'Nhận phòng nhanh',
    color: 'blue'
  });
  
  optionHighlights.push({
    text: 'WiFi miễn phí',
    icon: 'wifi',
    color: 'green'
  });
  
  // 3. Thêm highlights từ API (liên quan đến thanh toán)
  hotelHighlights.forEach(h => {
    const lowerText = h.text.toLowerCase();
    if (lowerText.includes('thanh toán') || lowerText.includes('hủy') || lowerText.includes('đặt') || lowerText.includes('check-in') || lowerText.includes('wifi')) {
      if (optionHighlights.length < 5) { // Giới hạn tối đa
        optionHighlights.push({
          text: h.text,
          icon: h.icon,
          color: 'green'
        });
      }
    }
  });

          return (
            <div className="flex items-stretch gap-0 min-h-[140px] h-full">
              {/* CỘT 2: Highlights/Policies riêng cho payment option này */}
              <div className="flex-shrink-0 w-72 border-r border-gray-300 pr-4 flex flex-col justify-start py-4 h-full">
        {/* Payment Policies/Highlights */}
        <div className="space-y-2 mb-3">
          {optionHighlights.slice(0, 4).map((highlight, index) => (
            <div key={index} className="flex items-start gap-2">
              {highlight.icon === 'wifi' ? (
                <Wifi className={`w-4 h-4 ${highlight.color === 'green' ? 'text-green-600' : 'text-blue-600'} mt-0.5 flex-shrink-0`} />
              ) : highlight.icon ? (
                <img src={highlight.icon} alt="" className="w-4 h-4 mt-0.5 flex-shrink-0 object-contain" />
              ) : (
                <CheckCircle className={`w-4 h-4 ${highlight.color === 'green' ? 'text-green-600' : highlight.color === 'blue' ? 'text-blue-600' : 'text-purple-600'} mt-0.5 flex-shrink-0`} />
              )}
              <div className="text-sm">
                <span className={`font-semibold ${
                  highlight.color === 'green' ? 'text-green-700' : 
                  highlight.color === 'blue' ? 'text-blue-700' : 
                  'text-purple-700'
                }`}>
                  {highlight.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ✅ Chương trình khuyến mãi - Giao diện gọn, đẹp và đều */}
        {room.promotions && room.promotions.length > 0 ? (
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-700 mb-2">
              Chương trình khuyến mãi
            </p>
            <div className="space-y-1.5">
              {room.promotions.map((promo, index) => {
                // Map promotion name to icon và màu - nhất quán
                const getPromotionStyle = (name: string) => {
                  const lowerName = name.toLowerCase();
                  if (lowerName.includes('halloween')) return { icon: '🎃', bgColor: 'bg-orange-600' };
                  if (lowerName.includes('black friday') || lowerName.includes('blackfriday')) return { icon: '🛍️', bgColor: 'bg-gray-900' };
                  if (lowerName.includes('tet') || lowerName.includes('tết')) return { icon: '🎊', bgColor: 'bg-red-600' };
                  if (lowerName.includes('summer') || lowerName.includes('hè')) return { icon: '☀️', bgColor: 'bg-yellow-500' };
                  if (lowerName.includes('winter') || lowerName.includes('đông')) return { icon: '❄️', bgColor: 'bg-blue-500' };
                  if (lowerName.includes('cuối tuần') || lowerName.includes('weekend') || lowerName.includes('siêu giảm giá')) return { icon: '⭐', bgColor: 'bg-purple-600' };
                  return { icon: '⭐', bgColor: 'bg-purple-600' };
                };
                
                // Format promotion text - gọn, rõ ràng và nhất quán
                const getPromotionText = (promo: any) => {
                  if (promo.description) {
                    return promo.description;
                  }
                  
                  // Use total_discount_amount if available (for total price promotions), otherwise use discount_amount
                  const discountAmount = promo.total_discount_amount || promo.discount_amount || 0;
                  
                  if (promo.discount_type === 'PERCENTAGE') {
                    if (discountAmount > 0) {
                      return `Giảm ${promo.discount_value}%! (Tiết kiệm ${formatPrice(Math.round(discountAmount))} VND)`;
                    }
                    return `Giảm ${promo.discount_value}%!`;
                  } else {
                    return `Giảm ${formatPrice(promo.discount_value)} VND!`;
                  }
                };
                
                const style = getPromotionStyle(promo.name);
                
                return (
                  <div key={promo.promotion_id || index} className="flex items-center gap-2 flex-wrap">
                    <span className={`${style.bgColor} text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 flex-shrink-0 whitespace-nowrap`}>
                      <span>{style.icon}</span>
                      <span>{promo.name.toUpperCase()}</span>
                    </span>
                    <p className="text-[11px] text-gray-700 leading-tight flex-1 min-w-0">
                      {getPromotionText(promo)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          // ✅ Hiển thị placeholder để giữ layout đều
          <div className="pt-3 border-t border-gray-200">
            <p className="text-xs font-semibold text-gray-400 mb-2">
              Chương trình khuyến mãi
            </p>
            <p className="text-[11px] text-gray-400 italic">
              Không có khuyến mãi áp dụng
            </p>
          </div>
        )}
      </div>

      {/* CỘT 3: Số người tối đa - ✅ FIX: Hiển thị capacity của 1 phòng, không phải totalCapacity */}
      {/* ✅ FIX: Xóa title attribute để tránh hiện 2 tooltip */}
      <div 
        className="flex-shrink-0 border-r border-gray-300 pr-2 pl-2 flex flex-col items-center justify-start py-4 h-full relative group"
      >
        <div className="relative mb-1">
          <Info className="w-3 h-3 text-gray-400" />
        </div>
        <div className={`flex items-center gap-1 ${exceedsCapacity ? 'text-red-600' : ''}`}>
          <span className={`text-sm font-medium ${exceedsCapacity ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
            {room.capacity}x
          </span>
          <Users className={`w-4 h-4 ${exceedsCapacity ? 'text-red-600' : 'text-gray-600'}`} />
        </div>
        {/* ✅ Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden md:block">
          Sức chứa: {room.capacity} người/phòng
          <div className="mt-1 text-gray-300">
            Bạn chọn: {guests} khách
          </div>
          {exceedsCapacity && (
            <div className="text-red-300 mt-1 font-bold">
              ⚠️ Vượt quá sức chứa! (Tối đa: {room.capacity * roomsRequested} người)
            </div>
          )}
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </div>

      {/* CỘT 4: Số phòng - ✅ FIX: Không padding, căn trên */}
      {/* ✅ FIX: Xóa title attribute để tránh hiện 2 tooltip */}
      <div 
        className="flex-shrink-0 pr-2 pl-2 border-r border-gray-300 flex items-start justify-start pt-4 h-full relative group"
      >
        <div className={`flex items-center gap-1 px-2 py-1.5 rounded transition-colors ${!hasEnoughRooms ? 'bg-red-100 border border-red-300' : 'bg-gray-100'}`}>
          <BedDouble className={`w-4 h-7 ${!hasEnoughRooms ? 'text-red-600' : 'text-gray-600'}`} />
          <span className={`text-xs font-medium ${!hasEnoughRooms ? 'text-red-600 font-bold' : 'text-gray-700'}`}>
            {roomsRequested}
          </span>
        </div>
        {/* ✅ Tooltip */}
        <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 hidden md:block">
          Số phòng yêu cầu: {roomsRequested}
          {!hasEnoughRooms && (
            <div className="text-red-300 mt-1">
              ⚠️ Chỉ còn {room.minAvailable || 0} phòng!
            </div>
          )}
          <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      </div>

      {/* CỘT 5: Giá - ✅ FIX: Căn trên, font 12px, chia 2 dòng */}
      <div className="flex-shrink-0 w-52 border-r border-gray-300 pr-4 text-right flex flex-col justify-start py-4 h-full">
        {room.totalBasePrice > price && (
          <div className="flex items-center justify-end gap-2 mb-1">
            <span className="text-sm text-gray-500 line-through">
              {formatPrice(room.totalBasePrice)} ₫
            </span>
            <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded">
              -{discountPercent}%
            </span>
          </div>
        )}
        <p className="text-2xl font-bold text-red-600 mb-1">
          {formatPrice(price)} ₫
        </p>
        <p className="text-xs text-gray-600 leading-tight whitespace-normal break-words max-w-full">
          Giá mỗi đêm<br />chưa gồm thuế và phí
        </p>
      </div>

      {/* CỘT 6: Nút đặt phòng - ✅ FIX: Căn trên, giảm width */}
      <div className="flex-shrink-0 w-36 flex flex-col items-end justify-start py-4 pl-4 h-full">
        <button
          onClick={() => canBook && onSelectRoom?.(room, paymentMethod)}
          disabled={!canBook}
          className={`w-full px-3 py-2.5 rounded-lg font-bold text-xs transition-all ${
            canBook
              ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {canBook ? 'Đặt ngay' : (exceedsCapacity ? 'Vượt quá' : 'Hết phòng')}
        </button>
        {canBook && isPayNow && (
          <p className="text-xs text-center text-gray-500 mt-1 w-full">
            ⚡ Xác nhận trong 2 phút
          </p>
        )}
        {canBook && !isPayNow && (
          <p className="text-xs text-center text-gray-500 mt-1 w-full">
            ⚡ Đặt trong 2 phút
          </p>
        )}
        {canBook && hasEnoughRooms && (
          <p className="text-xs text-center text-orange-600 font-semibold mt-1 w-full">
            Phòng cuối cùng của chúng tôi!
          </p>
        )}
      </div>
    </div>
  );
}
