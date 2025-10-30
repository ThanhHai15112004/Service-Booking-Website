import { useState } from 'react';
import { Users, Maximize, BedDouble, AlertTriangle, Image as ImageIcon, CheckCircle, XCircle } from 'lucide-react';
import { Room } from '../../types';
import { NoRoomsAvailable } from '../common';
import HotelImageGallery from './HotelImageGallery';

interface RoomListProps {
  rooms: Room[];
  nights: number;
  guests: number;          // Số khách từ form search
  roomsRequested: number;  // Số phòng từ form search
  hotelImages?: string[];  // Ảnh khách sạn (optional)
  hotelName?: string;      // Tên khách sạn (optional)
  onSelectRoom?: (room: Room) => void;
}

export default function RoomList({ 
  rooms, 
  guests, 
  roomsRequested, 
  onSelectRoom,
  hotelImages = [],
  hotelName = ''
}: RoomListProps) {
  const [selectedRoomForGallery, setSelectedRoomForGallery] = useState<Room | null>(null);
  const [showGallery, setShowGallery] = useState(false);

  if (!rooms || rooms.length === 0) {
    return <NoRoomsAvailable />;
  }

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

  return (
    <>
      <div className="space-y-3">
        {rooms.map((room) => {
          // ✅ FIX: Dùng meetsCapacity từ BE thay vì tính ở FE
          const exceedsCapacity = !room.meetsCapacity;
          const hasEnoughRooms = room.maxBookableSets ? room.maxBookableSets > 0 : room.minAvailable >= roomsRequested;
          const canBook = room.meetsCapacity && hasEnoughRooms;

          return (
            <RoomCard
              key={room.roomId}
              room={room}
              guests={guests}
              roomsRequested={roomsRequested}
              exceedsCapacity={exceedsCapacity}
              hasEnoughRooms={hasEnoughRooms}
              canBook={canBook}
              getBedTypeName={getBedTypeName}
              formatPrice={formatPrice}
              onSelectRoom={onSelectRoom}
              onOpenGallery={() => {
                setSelectedRoomForGallery(room);
                setShowGallery(true);
              }}
            />
          );
        })}
      </div>

      {/* Room Image Gallery Modal - using HotelImageGallery with tabs */}
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
  guests: number;
  roomsRequested: number;
  exceedsCapacity: boolean;
  hasEnoughRooms: boolean;
  canBook: boolean;
  getBedTypeName: (bedType?: string) => string;
  formatPrice: (price: number) => string;
  onSelectRoom?: (room: Room) => void;
  onOpenGallery: () => void;
}

function RoomCard({
  room,
  guests,
  roomsRequested,
  exceedsCapacity,
  hasEnoughRooms,
  canBook,
  getBedTypeName,
  formatPrice,
  onSelectRoom,
  onOpenGallery
}: RoomCardProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get room images or fallback
  const roomImages = room.images && room.images.length > 0
    ? room.images
    : [{
        imageId: 'default',
        imageUrl: room.roomImage || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg',
        imageAlt: room.roomName,
        isPrimary: true,
        sortOrder: 0
      }];

  // Get main image (selected or primary)
  const mainImage = roomImages[selectedImageIndex] || roomImages.find(img => img.isPrimary) || roomImages[0];

  // Get thumbnail images (max 2, excluding the main image if possible)
  const thumbnailImages = roomImages.length > 1
    ? roomImages.filter((_, idx) => idx !== selectedImageIndex).slice(0, 2)
    : roomImages.slice(0, 2);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-lg transition-all overflow-hidden">
      {/* HEADER - Tên phòng */}
      <div className="bg-gray-50 px-5 py-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">{room.roomName}</h3>
        {room.roomDescription && (
          <p className="text-xs text-gray-600 mt-1 line-clamp-1">
            {room.roomDescription}
          </p>
        )}
      </div>

      {/* CONTENT */}
      <div className="flex p-5 gap-5 items-start">
        
        {/* LEFT: Ảnh + Thông tin phòng (35%) */}
        <div className="flex-shrink-0" style={{ width: '35%' }}>
          {/* Room Images */}
          <div className="space-y-2">
            {/* Ảnh chính */}
            <div className="relative group rounded-lg overflow-hidden">
              <img
                src={mainImage.imageUrl}
                alt={mainImage.imageAlt || room.roomName}
                className="w-full h-40 object-cover"
              />
            </div>

            {/* Thumbnails */}
            <div className="grid grid-cols-4 gap-2">
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
                  />
                </button>
              ))}
              
              {/* View All Button */}
              <button 
                onClick={onOpenGallery}
                className="relative w-full h-12 bg-gray-100 hover:bg-gray-200 rounded flex flex-col items-center justify-center transition-colors overflow-hidden"
              >
                {roomImages.length > 3 ? (
                  <>
                    <img
                      src={roomImages[3].imageUrl}
                      alt="More"
                      className="absolute inset-0 w-full h-full object-cover opacity-40"
                    />
                    <div className="relative z-10 flex flex-col items-center">
                      <ImageIcon className="w-4 h-4 text-gray-800" />
                      <span className="text-[9px] text-gray-800 font-bold">+{roomImages.length - 3}</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center">
                    <ImageIcon className="w-4 h-4 text-gray-700" />
                    <span className="text-[9px] text-gray-700 font-semibold">Xem</span>
                  </div>
                )}
              </button>
            </div>
          </div>

          {/* Room Info */}
          <div className="mt-4 space-y-2.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Maximize className="w-4 h-4 text-gray-500" />
              <span>{room.area || 'N/A'} m²</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <BedDouble className="w-4 h-4 text-gray-500" />
              <span>{getBedTypeName(room.bedType)}</span>
            </div>
          </div>

          {/* Facilities */}
          {room.facilities && room.facilities.length > 0 && (
            <div className="mt-4 space-y-2">
              {room.facilities.slice(0, 3).map((facility) => (
                <div 
                  key={facility.facilityId}
                  className="flex items-center gap-2 text-xs text-gray-700"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span>{facility.name}</span>
                </div>
              ))}
              {room.facilities.length > 3 && (
                <button className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                  +{room.facilities.length - 3} tiện nghi khác
                </button>
              )}
            </div>
          )}
        </div>

        {/* MIDDLE: Policies & Promos (35%) */}
        <div className="flex-1 space-y-3">
          {/* Cancellation Policy */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              {room.freeCancellation ? (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-green-700">Miễn phí hủy</span>
                    <p className="text-gray-600 text-xs mt-0.5">Hủy miễn phí trước 24h</p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <span className="font-semibold text-red-700">Không hoàn tiền</span>
                    <p className="text-gray-600 text-xs mt-0.5">Không hoàn tiền khi hủy</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment Options */}
          <div className="space-y-2">
            {room.payLater && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-blue-700">Thanh toán tại nơi ở</span>
                  <p className="text-gray-600 text-xs mt-0.5">Không cần thanh toán ngay</p>
                </div>
              </div>
            )}
            {room.noCreditCard && (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <span className="font-semibold text-purple-700">Không cần thẻ tín dụng</span>
                </div>
              </div>
            )}
          </div>

          {/* Promotion */}
          {room.totalBasePrice > room.totalPrice && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-purple-600 text-white text-xs font-bold px-2 py-0.5 rounded">🎃 HALLOWEEN</span>
              </div>
              <p className="text-xs text-purple-900">
                <span className="font-semibold">Khuyến mãi có hạn!</span> Giảm giá {Math.round(((room.totalBasePrice - room.totalPrice) / room.totalBasePrice) * 100)}%
              </p>
            </div>
          )}

          {/* Capacity & Availability Info */}
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm mb-2">
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${exceedsCapacity ? 'text-red-600' : 'text-gray-700'}`} />
                <span className="font-medium text-gray-900">{guests} người</span>
              </div>
              {exceedsCapacity ? (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1" title={room.capacityWarning || ''}>
                  <AlertTriangle className="w-3 h-3" />
                  Vượt quá sức chứa
                </span>
              ) : (
                <span className="text-xs text-green-600 font-medium">
                  Max {room.totalCapacity || room.capacity} người
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <BedDouble className={`w-4 h-4 ${!hasEnoughRooms ? 'text-red-600' : 'text-gray-700'}`} />
                <span className="font-medium text-gray-900">{roomsRequested} phòng</span>
              </div>
              {hasEnoughRooms ? (
                <span className="text-xs text-green-600 font-medium">
                  {room.maxBookableSets !== undefined 
                    ? `Còn ${room.maxBookableSets} bộ`
                    : `Còn ${room.minAvailable}`
                  }
                </span>
              ) : (
                <span className="text-xs text-red-600 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Hết phòng
                </span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Price & Book (30%) */}
        <div className="flex-shrink-0 flex flex-col" style={{ width: '30%' }}>
          <div className="text-right">
            {room.totalBasePrice > room.totalPrice && (
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-sm text-gray-500 line-through">
                  {formatPrice(room.totalBasePrice)} ₫
                </span>
                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded">
                  -{Math.round(((room.totalBasePrice - room.totalPrice) / room.totalBasePrice) * 100)}%
                </span>
              </div>
            )}
            <p className="text-2xl font-bold text-red-600 mb-1">
              {formatPrice(room.totalPrice)} ₫
            </p>
            <p className="text-xs text-gray-600 mb-4">
              Chưa bao gồm thuế & phí
            </p>
          </div>

          <button
            onClick={() => canBook && onSelectRoom?.(room)}
            disabled={!canBook}
            className={`w-full py-3.5 rounded-lg font-bold text-sm transition-all ${
              canBook
                ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {canBook ? 'Đặt ngay' : (exceedsCapacity ? 'Vượt quá sức chứa' : 'Hết phòng')}
          </button>
          
          {canBook && hasEnoughRooms && (
            <p className="text-xs text-center text-gray-500 mt-2">
              ⚡ Xác nhận trong 2 phút
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

