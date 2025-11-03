import { MapPin, Star, Heart, Wifi, Car, Coffee } from 'lucide-react';
import { Hotel } from '../../types';
import { useState } from 'react';

interface HotelCardProps {
  hotel: Hotel;
}

export default function HotelCard({ hotel }: HotelCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);

  const handleCardClick = () => {
    window.location.href = `/hotel/${hotel.id}`;
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setIsWishlisted(!isWishlisted);
  };

  // Get top 6 amenities to display
  const displayAmenities = hotel.amenities?.slice(0, 6) || [];
  
  // Check if description contains amenities list (avoid duplication)
  const shouldShowDescription = hotel.description && !displayAmenities.some(amenity => {
    const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
    return hotel.description?.toLowerCase().includes(amenityName.toLowerCase());
  });
  
  // Function to render icon from emoji or use default
  const renderAmenityIcon = (amenity: any) => {
    const icon = typeof amenity === 'string' ? null : amenity.icon;
    const name = typeof amenity === 'string' ? amenity : amenity.name;
    
    // If backend provides emoji icon, use it
    if (icon && icon.length <= 3) {
      return <span className="text-sm">{icon}</span>;
    }
    
    // Fallback to lucide icons based on name
    if (name.toLowerCase().includes('wifi')) return <Wifi className="w-3.5 h-3.5" />;
    if (name.toLowerCase().includes('đỗ xe') || name.toLowerCase().includes('parking')) return <Car className="w-3.5 h-3.5" />;
    if (name.toLowerCase().includes('ăn') || name.toLowerCase().includes('restaurant') || name.toLowerCase().includes('buffet')) return <Coffee className="w-3.5 h-3.5" />;
    
    return null;
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Image with overlays */}
      <div className="relative h-52 overflow-hidden">
        <img
          src={hotel.main_image}
          alt={hotel.name}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        
        {/* Top left: Rating score */}
        {hotel.rating && (
          <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg">
            <div className="text-base font-bold text-gray-900">{hotel.rating}</div>
            {hotel.reviews_count && (
              <div className="text-[11px] text-gray-600">
                {hotel.reviews_count} đánh giá
              </div>
            )}
          </div>
        )}
        
        {/* Top right: Star rating & Wishlist (2 rows) */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          {/* Star rating */}
          {hotel.star_rating && (
            <div className="bg-white/95 backdrop-blur-sm px-2.5 py-2 rounded-md shadow-lg flex items-center gap-1.5">
              <Star className="w-5 h-5 text-yellow-400 stroke-yellow-500 stroke-1 fill-yellow-400" />
              <span className="text-sm font-bold text-gray-900">{hotel.star_rating}</span>
            </div>
          )}
          
          {/* Wishlist button */}
          <button
            onClick={handleWishlistClick}
            className="bg-white/95 backdrop-blur-sm p-2.5 rounded-md shadow-lg transition-all duration-200 group hover:bg-white"
            aria-label="Add to wishlist"
          >
            <Heart 
              className={`w-5 h-5 stroke-1 transition-all duration-200 ${
                isWishlisted 
                  ? 'fill-red-500 text-red-500 stroke-red-500' 
                  : 'fill-transparent text-gray-600 stroke-gray-600 group-hover:fill-red-500 group-hover:text-red-500 group-hover:stroke-red-500'
              }`}
            />
          </button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Hotel name */}
        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-1">
          {hotel.name}
        </h3>
        
        {/* Address */}
        <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-1">
            {hotel.address}
          </span>
        </div>
        
        {/* Description - only show if not duplicate with amenities */}
        {shouldShowDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3 leading-relaxed">
            {hotel.description}
          </p>
        )}
        
        {/* Amenities - Tự động wrap theo content */}
        {displayAmenities.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
            {displayAmenities.map((amenity, index) => {
              const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
              return (
                <div
                  key={index}
                  className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1.5 rounded text-xs text-gray-700"
                >
                  {renderAmenityIcon(amenity)}
                  <span className="whitespace-nowrap">{amenityName}</span>
                </div>
              );
            })}
            {hotel.amenities && hotel.amenities.length > 6 && (
              <div className="flex items-center bg-gray-50 px-2.5 py-1.5 rounded text-xs text-gray-600 font-medium">
                +{hotel.amenities.length - 6} tiện nghi khác
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
