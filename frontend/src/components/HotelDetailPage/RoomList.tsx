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
          // Check capacity & availability
          const exceedsCapacity = guests > room.capacity;
          const hasEnoughRooms = room.minAvailable >= roomsRequested;
          const canBook = !exceedsCapacity && hasEnoughRooms;

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
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            {/* HEADER - Tên phòng với bg xám */}
            <div className="bg-gray-100 px-4 py-2.5 border-b border-gray-200">
              <h3 className="text-base font-bold text-gray-900">{room.roomName}</h3>
              {room.roomDescription && (
                <p className="text-[10px] text-gray-600 mt-0.5 line-clamp-1">
                  {room.roomDescription}
                </p>
              )}
            </div>

            {/* CONTENT - Phần còn lại */}
            <div className="flex p-4 items-stretch border-t border-gray-200">
              
              {/* COL 1: Ảnh + Tiện nghi (25%) */}
              <div className="flex-shrink-0 pr-3 border-r border-gray-200" style={{ width: '25%' }}>
                {/* Room Images - Ảnh chính + 2 ảnh nhỏ + Xem tất cả - Width 200px */}
                <div className="space-y-1.5">
                  {/* Ảnh chính */}
                  <div className="relative group">
                    <img
                      src={mainImage.imageUrl}
                      alt={mainImage.imageAlt || room.roomName}
                      className="w-full h-28 object-cover rounded"
                    />
                  </div>

                  {/* 2 ảnh nhỏ + Xem tất cả */}
                  <div className="grid grid-cols-3 gap-1.5">
                    {thumbnailImages.map((image, index) => (
                      <button
                        key={image.imageId}
                        onClick={() => {
                          // Find the index of this image in the original array
                          const originalIndex = roomImages.findIndex(img => img.imageId === image.imageId);
                          if (originalIndex !== -1) {
                            setSelectedImageIndex(originalIndex);
                          }
                        }}
                        onMouseEnter={() => {
                          // Di chuột vào thì đổi ảnh chính
                          const originalIndex = roomImages.findIndex(img => img.imageId === image.imageId);
                          if (originalIndex !== -1) {
                            setSelectedImageIndex(originalIndex);
                          }
                        }}
                        className={`relative w-full h-10 overflow-hidden rounded transition-all ${
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
                    
                    {/* Ảnh cuối là "Xem tất cả" */}
                    <button 
                      onClick={onOpenGallery}
                      className="relative w-full h-10 bg-gray-200 hover:bg-gray-300 rounded flex flex-col items-center justify-center transition-colors overflow-hidden"
                    >
                      {roomImages.length > 3 ? (
                        // Nếu có nhiều hơn 3 ảnh, hiển thị ảnh thứ 4 với overlay
                        <>
                          <img
                            src={roomImages[3].imageUrl}
                            alt="More"
                            className="absolute inset-0 w-full h-full object-cover opacity-50"
                          />
                          <div className="relative z-10 flex flex-col items-center">
                            <ImageIcon className="w-3 h-3 text-gray-700" />
                            <span className="text-[8px] text-gray-700 font-bold mt-0.5">+{roomImages.length - 3}</span>
                          </div>
                        </>
                      ) : (
                        // Nếu <= 3 ảnh, chỉ hiển thị icon
                        <div className="flex flex-col items-center">
                          <ImageIcon className="w-3 h-3 text-gray-700" />
                          <span className="text-[8px] text-gray-700 font-bold mt-0.5">Xem</span>
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Room specs - Dưới ảnh */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                    <Maximize className="w-3 h-3" />
                    <span>{room.area || 'N/A'} m²</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-700">
                    <BedDouble className="w-3 h-3" />
                    <span>{getBedTypeName(room.bedType)}</span>
                  </div>
                </div>

                {/* Room Facilities - Dưới ảnh */}
                {room.facilities && room.facilities.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {room.facilities.slice(0, 4).map((facility) => (
                      <div 
                        key={facility.facilityId}
                        className="flex items-center gap-1.5 text-[10px] text-gray-700"
                      >
                        <CheckCircle className="w-3 h-3 text-green-600" />
                        <span>{facility.name}</span>
                      </div>
                    ))}
                    {room.facilities.length > 4 && (
                      <button className="text-[10px] font-semibold mt-1" style={{ color: '#2067da' }}>
                        +{room.facilities.length - 4} tiện nghi khác
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* COL 2: Chính sách + Khuyến mãi (30%) */}
              <div className="flex-1 space-y-2 px-3 border-r border-gray-200" style={{ width: '30%' }}>
                {/* Chính sách */}
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold text-gray-900">Chính sách hủy</p>
                  <div className="flex items-start gap-1.5">
                    {room.freeCancellation ? (
                      <>
                        <CheckCircle className="w-3 h-3 text-green-600 mt-0.5" />
                        <div className="text-[10px] text-gray-700">
                          <span className="font-semibold text-green-700">Chính sách hủy</span>
                          <p className="text-gray-600 mt-0.5">Đặt và trả tiền ngay</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 text-red-600 mt-0.5" />
                        <div className="text-[10px] text-gray-700">
                          <span className="font-semibold text-red-700">Đặt không hoàn tiền</span>
                          <p className="text-gray-600 mt-0.5">Không hoàn tiền khi hủy</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Thanh toán */}
                <div className="space-y-1.5">
                  {room.payLater && (
                    <div className="flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 mt-0.5" style={{ color: '#2067da' }} />
                      <div className="text-[10px] text-gray-700">
                        <span className="font-semibold" style={{ color: '#2067da' }}>Thanh toán tại nơi ở</span>
                        <p className="text-gray-600 mt-0.5">Không cần thanh toán ngay</p>
                      </div>
                    </div>
                  )}
                  {room.noCreditCard && (
                    <div className="flex items-start gap-1.5">
                      <CheckCircle className="w-3 h-3 text-purple-600 mt-0.5" />
                      <div className="text-[10px] text-gray-700">
                        <span className="font-semibold text-purple-700">Đặt không cần thẻ tín dụng</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chương trình khuyến mãi */}
                {room.totalBasePrice > room.totalPrice && (
                  <div className="p-2 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="bg-purple-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">🎃 HALLOWEEN</span>
                    </div>
                    <p className="text-[10px] text-purple-900">
                      <span className="font-semibold">Khuyến mãi trong thời gian có hạn.</span> Giá phòng đã có giảm giá 20%!
                    </p>
                    <p className="text-[10px] text-purple-700 mt-0.5 font-semibold">
                      Giảm {Math.round(((room.totalBasePrice - room.totalPrice) / room.totalBasePrice) * 100)}% VNĐ!
                    </p>
                  </div>
                )}
              </div>

              {/* COL 3: Số người (10%) */}
              <div className="flex-shrink-0 text-center px-2 border-r border-gray-200 flex flex-col" style={{ width: '10%' }}>
                <Users className={`w-5 h-5 mx-auto mb-1 ${exceedsCapacity ? 'text-red-600' : 'text-gray-700'}`} />
                <p className="text-xs font-bold text-gray-900">{guests} người</p>
                {exceedsCapacity ? (
                  <p className="text-[10px] text-red-600 font-semibold flex items-center justify-center gap-0.5 mt-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Vượt
                  </p>
                ) : (
                  <p className="text-[10px] text-green-600 mt-1">Max {room.capacity}</p>
                )}
              </div>

              {/* COL 4: Giá (18%) */}
              <div className="flex-shrink-0 text-center px-3 border-r border-gray-200 flex flex-col" style={{ width: '18%' }}>
                {room.totalBasePrice > room.totalPrice && (
                  <div className="flex items-center justify-center gap-1 mb-1">
                    <span className="text-[10px] text-gray-500 line-through">
                      {formatPrice(room.totalBasePrice)} ₫
                    </span>
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                      -{Math.round(((room.totalBasePrice - room.totalPrice) / room.totalBasePrice) * 100)}%
                    </span>
                  </div>
                )}
                <p className="text-base font-bold text-red-600">
                  {formatPrice(room.totalPrice)} ₫
                </p>
                <p className="text-[9px] text-gray-600 mt-0.5">
                  Chưa gồm thuế
                </p>
              </div>

              {/* COL 5: Số phòng (10%) */}
              <div className="flex-shrink-0 text-center px-2 border-r border-gray-200 flex flex-col" style={{ width: '10%' }}>
                <BedDouble className={`w-5 h-5 mx-auto mb-1 ${!hasEnoughRooms ? 'text-red-600' : 'text-gray-700'}`} />
                <p className="text-xs font-bold text-gray-900">{roomsRequested} phòng</p>
                {hasEnoughRooms ? (
                  <p className="text-[10px] text-green-600 mt-1">Còn {room.minAvailable}</p>
                ) : (
                  <p className="text-[10px] text-red-600 font-semibold flex items-center justify-center gap-0.5 mt-1">
                    <AlertTriangle className="w-2.5 h-2.5" />
                    Hết
                  </p>
                )}
              </div>

              {/* COL 6: Đặt phòng (7%) */}
              <div className="flex-shrink-0 flex flex-col items-center px-2" style={{ width: '7%' }}>
                <button
                  onClick={() => canBook && onSelectRoom?.(room)}
                  disabled={!canBook}
                  className={`w-full py-3 rounded-lg font-bold text-xs transition-colors ${
                    canBook
                      ? 'text-white hover:opacity-90'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                  style={canBook ? { backgroundColor: '#2067da' } : undefined}
                >
                  {canBook ? 'Đặt ngay' : (exceedsCapacity ? 'Vượt' : 'Hết')}
                </button>
                {canBook && hasEnoughRooms && (
                  <p className="text-[9px] text-center text-gray-500 mt-1">
                    2 phút
                  </p>
                )}
              </div>
            </div>
    </div>
  );
}

