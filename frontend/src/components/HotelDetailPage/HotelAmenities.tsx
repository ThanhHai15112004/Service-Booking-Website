import { Wifi, Waves, Utensils, Car } from 'lucide-react';

interface Facility {
  facilityId?: string;
  name: string;
  icon?: string;
}

interface HotelAmenitiesProps {
  amenities: (string | Facility)[];
}

const amenityIcons: Record<string, any> = {
  'WiFi miễn phí': Wifi,
  'Wifi miễn phí': Wifi,
  'Bể bơi': Waves,
  'Nhà hàng': Utensils,
  'Đỗ xe miễn phí': Car,
  'Bãi đỗ xe': Car
};

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  if (!amenities || amenities.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-black mb-3">Cơ sở vật chất</h2>
      <div className="grid grid-cols-2 gap-4">
        {amenities.map((amenity, index) => {
          // Handle both string and object format
          const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
          const amenityIcon = typeof amenity === 'object' && amenity.icon ? amenity.icon : null;
          
          const Icon = amenityIcons[amenityName] || Wifi;
          
          return (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              {amenityIcon ? (
                <img src={amenityIcon} alt={amenityName} className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5 text-black" />
              )}
              <span className="text-gray-700">{amenityName}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

