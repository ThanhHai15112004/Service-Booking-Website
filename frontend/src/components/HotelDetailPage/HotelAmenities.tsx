import { Wifi, Waves, Utensils, Car } from 'lucide-react';

interface HotelAmenitiesProps {
  amenities: string[];
}

const amenityIcons: Record<string, any> = {
  'WiFi miễn phí': Wifi,
  'Bể bơi': Waves,
  'Nhà hàng': Utensils,
  'Đỗ xe miễn phí': Car
};

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-black mb-4">Tiện nghi</h2>
      <div className="grid grid-cols-2 gap-4">
        {amenities?.map((amenity, index) => {
          const Icon = amenityIcons[amenity] || Wifi;
          return (
            <div key={index} className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
              <Icon className="w-5 h-5 text-black" />
              <span className="text-gray-700">{amenity}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

