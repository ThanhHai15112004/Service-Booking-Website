import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { MapPin, Star, Check, Wifi, Utensils, Car, Waves, Dumbbell, Dog, Users } from 'lucide-react';

interface HotelSearchResult {
  hotelId: string;
  name: string;
  starRating: number;
  avgRating: number;
  reviewCount: number;
  mainImage: string;
  categoryName?: string;
  location: {
    city: string;
    district?: string;
    areaName?: string;
    distanceCenter?: number;
  };
  bestOffer: {
    roomName: string;
    capacity: number;
    availableRooms: number;
    avgPricePerNight: number;
    totalPrice: number;
    originalPricePerNight?: number;
    totalOriginalPrice?: number;
    discountPercent?: number;
    refundable: boolean;
    payLater: boolean;
    freeCancellation?: boolean;
    noCreditCard?: boolean;
    petsAllowed?: boolean;
    childrenAllowed?: boolean;
  };
  images?: Array<{
    imageUrl: string;
    isPrimary: boolean;
    caption?: string;
  }>;
  facilities?: Array<{
    facilityId: string;
    name: string;
    icon?: string;
  }>;
}

interface HotelResultCardProps {
  hotel: HotelSearchResult;
}

export default function HotelResultCard({ hotel }: HotelResultCardProps) {
  const [searchParams] = useSearchParams();
  const [currentImage, setCurrentImage] = useState(
    hotel.images?.find(img => img.isPrimary)?.imageUrl || hotel.mainImage
  );
  const [isHoveringImage, setIsHoveringImage] = useState(false);

  // Build URL with search params - pass ALL search context to hotel detail page
  const buildHotelUrl = () => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const rooms = searchParams.get('rooms');
    const guests = searchParams.get('guests');
    const children = searchParams.get('children');
    const stayType = searchParams.get('stayType'); // ✅ Thêm stayType

    const queryParams = new URLSearchParams();
    if (destination) queryParams.set('destination', destination);
    if (checkIn) queryParams.set('checkIn', checkIn);
    if (checkOut) queryParams.set('checkOut', checkOut);
    if (rooms) queryParams.set('rooms', rooms);
    if (guests) queryParams.set('guests', guests);
    if (children) queryParams.set('children', children);
    if (stayType) queryParams.set('stayType', stayType); // ✅ Pass stayType

    const query = queryParams.toString();
    return `/hotel/${hotel.hotelId}${query ? `?${query}` : ''}`;
  };

  // Lấy tất cả ảnh
  const displayImages = hotel.images || [{ imageUrl: hotel.mainImage, isPrimary: true }];
  const thumbnails = displayImages.slice(0, 4);
  const totalImages = displayImages.length;

  // Lấy top 5 facilities từ data
  const topFacilities = (hotel.facilities || []).slice(0, 5);

  // Map facility icon từ database
  const getFacilityIcon = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('wifi') || lowerName.includes('wi-fi')) return <Wifi className="w-4 h-4" />;
    if (lowerName.includes('nhà hàng') || lowerName.includes('restaurant') || lowerName.includes('sáng')) return <Utensils className="w-4 h-4" />;
    if (lowerName.includes('đỗ xe') || lowerName.includes('parking')) return <Car className="w-4 h-4" />;
    if (lowerName.includes('bơi') || lowerName.includes('pool')) return <Waves className="w-4 h-4" />;
    if (lowerName.includes('gym') || lowerName.includes('fitness')) return <Dumbbell className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  // Tính rating text
  const getRatingText = (rating: number) => {
    if (rating >= 9) return 'Tuyệt vời';
    if (rating >= 8) return 'Rất tốt';
    if (rating >= 7) return 'Tốt';
    if (rating >= 6) return 'Khá';
    return 'Trung bình';
  };

  return (
    <Link 
      to={buildHotelUrl()}
      className="block bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all"
    >
      <div className="flex gap-0 h-[220px]">
        {/* LEFT: Image Gallery */}
        <div 
          className="w-[280px] flex-shrink-0 flex flex-col gap-1"
          onMouseEnter={() => setIsHoveringImage(true)}
          onMouseLeave={() => setIsHoveringImage(false)}
        >
          {/* Main Image */}
          <div className="flex-1 bg-gray-200 overflow-hidden relative">
            <img
              src={currentImage}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
            
            {/* Image count overlay - only show on hover */}
            {isHoveringImage && totalImages > 1 && (
              <div className="absolute top-2 right-2 bg-black/70 text-white text-[11px] px-2 py-0.5 rounded">
                <span className="font-medium">{totalImages} ảnh</span>
              </div>
            )}
          </div>

              {/* Thumbnail Strip - Below main image */}
              <div className="flex gap-1 h-[40px]">
                {thumbnails.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex-1 relative group cursor-pointer overflow-hidden bg-gray-200"
                    onMouseEnter={() => setCurrentImage(img.imageUrl)}
                    onClick={(e) => {
                      e.stopPropagation();
                      // Thumbnail clicks just change preview image
                      // Don't need to navigate for thumbnails
                    }}
                  >
                    <img
                      src={img.imageUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:brightness-75 transition-all"
                    />
                    {idx === 3 && totalImages > 4 && (
                      <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center">
                        <span className="text-white text-[9px] font-medium">Xem tất cả</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
        </div>

        {/* MIDDLE: Hotel Info */}
        <div className="flex-1 px-3 py-3 flex flex-col border-r border-gray-200">
          {/* Hotel Name - 18px bold */}
          <h3 className="text-[18px] font-bold text-gray-900 line-clamp-1 mb-2">
            {hotel.name}
          </h3>

          {/* Stars */}
          <div className="flex items-center gap-0.5 mb-2">
            {[...Array(Math.floor(hotel.starRating))].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 text-orange-500 fill-current" />
            ))}
          </div>

          {/* Location */}
          <div className="flex items-start gap-1 mb-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-[13px] text-gray-700 line-clamp-1">
              <span>{hotel.location.district ? `${hotel.location.district}, ` : ''}{hotel.location.city}</span>
            </div>
          </div>

          {/* Distance to center - bên dưới vị trí */}
          {hotel.location.distanceCenter !== undefined && (
            <div className="text-[12px] text-gray-500 mb-2 ml-5">
              {hotel.location.distanceCenter.toFixed(1) === '0.0' ? 
                `${(hotel.location.distanceCenter * 1000).toFixed(0)} m` : 
                `${hotel.location.distanceCenter.toFixed(1)} km`} từ {hotel.location.areaName || 'trung tâm'}
            </div>
          )}

          {/* Separator line mờ */}
          <div className="border-t border-gray-200 my-2 opacity-50"></div>

          {/* Policies - Nằm ngang với icon */}
          <div className="flex items-center gap-3 flex-wrap mb-2">
            {hotel.bestOffer.freeCancellation && (
              <div className="flex items-center gap-1 text-green-700">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[12px] font-medium">Miễn phí hủy</span>
              </div>
            )}
            {hotel.bestOffer.noCreditCard && (
              <div className="flex items-center gap-1 text-blue-700">
                <Check className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[12px] font-medium">Không cần thẻ tín dụng</span>
              </div>
            )}
            {hotel.bestOffer.petsAllowed && (
              <div className="flex items-center gap-1 text-purple-700">
                <Dog className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[12px] font-medium">Cho phép thú cưng</span>
              </div>
            )}
            {hotel.bestOffer.childrenAllowed && (
              <div className="flex items-center gap-1 text-indigo-700">
                <Users className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="text-[12px] font-medium">Cho phép trẻ em</span>
              </div>
            )}
          </div>

          {/* Separator line mờ */}
          {topFacilities.length > 0 && (
            <div className="border-t border-gray-200 my-2 opacity-50"></div>
          )}

          {/* Điểm nổi bật - Facilities với icon (di chuột hiện tên) */}
          {topFacilities.length > 0 && (
            <div className="mt-auto flex items-center gap-2">
              <span className="text-[12px] text-gray-600 font-medium">Điểm nổi bật:</span>
              <div className="flex items-center gap-3">
                {topFacilities.map((facility, idx) => (
                  <div key={idx} className="group relative">
                    <div className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
                      {getFacilityIcon(facility.name)}
                    </div>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[11px] rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      {facility.name}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: Rating & Price */}
        <div className="w-[170px] flex-shrink-0 px-3 py-3 flex flex-col">
          {/* Rating Section - Nhỏ hơn */}
          <div className="flex items-start gap-1.5 mb-4">
            <div className="flex flex-col items-end flex-1">
              <div className="text-[11px] font-semibold text-gray-900 mb-0.5">
                {getRatingText(hotel.avgRating)}
              </div>
              <div className="text-[9px] text-gray-600">
                {hotel.reviewCount} đánh giá
              </div>
            </div>
            <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-lg flex-shrink-0">
              <span className="text-[12px] font-bold">{hotel.avgRating.toFixed(1)}</span>
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1"></div>

          {/* Price Section - Nổi bật hơn */}
          <div className="text-right">
            {/* Label */}
            <div className="text-[10px] text-gray-500 mb-1">Giá mỗi đêm từ</div>
            
            {/* Discount Badge - Only show if there's a discount */}
            {hotel.bestOffer.discountPercent && hotel.bestOffer.discountPercent > 0 && (
              <div className="flex items-center justify-end gap-1 mb-2">
                <Check className="w-3 h-3 text-green-600" />
                <span className="text-[11px] text-green-600 font-medium">
                  Giá đã giảm {Math.round(hotel.bestOffer.discountPercent)}%
                </span>
              </div>
            )}

            {/* Old Price (nếu có giảm giá) */}
            {hotel.bestOffer.originalPricePerNight && hotel.bestOffer.discountPercent && hotel.bestOffer.discountPercent > 0 && (
              <div className="text-[13px] text-gray-500 line-through mb-2">
                {new Intl.NumberFormat('vi-VN').format(hotel.bestOffer.originalPricePerNight)}đ <span className="text-red-600 font-semibold">-{Math.round(hotel.bestOffer.discountPercent)}%</span>
              </div>
            )}

            {/* Current Price - TO & NỔI BẬT */}
            <div className="text-[20px] font-bold text-red-600 leading-tight mb-2">
              {new Intl.NumberFormat('vi-VN').format(hotel.bestOffer.avgPricePerNight)}đ
            </div>

            {/* Total Price */}
            <div className="text-[11px] text-gray-600">
              Tổng: {new Intl.NumberFormat('vi-VN').format(hotel.bestOffer.totalPrice)}đ
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

