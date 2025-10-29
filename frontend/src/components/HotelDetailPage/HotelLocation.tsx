import { MapPin, Navigation } from 'lucide-react';

interface HotelLocationProps {
  address: string;
  city: string;
  latitude?: number;
  longitude?: number;
  distanceCenter?: number;
}

export default function HotelLocation({ 
  address, 
  city,
  latitude,
  longitude,
  distanceCenter
}: HotelLocationProps) {
  // Convert to number if needed
  const numLat = latitude ? (typeof latitude === 'string' ? parseFloat(latitude) : latitude) : undefined;
  const numLng = longitude ? (typeof longitude === 'string' ? parseFloat(longitude) : longitude) : undefined;
  const numDist = distanceCenter ? (typeof distanceCenter === 'string' ? parseFloat(distanceCenter) : distanceCenter) : undefined;
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">Vị trí</h3>
      
      {/* Address */}
      <div className="mb-4">
        <div className="flex items-start gap-2 text-gray-700 mb-2">
          <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-medium">{address}</p>
            <p className="text-sm text-gray-600">{city}</p>
          </div>
        </div>
        
        {numDist && (
          <div className="flex items-center gap-2 text-sm text-gray-600 ml-7">
            <Navigation className="w-4 h-4" />
            <span>Cách trung tâm {numDist} km</span>
          </div>
        )}
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">Bản đồ sẽ hiển thị ở đây</p>
          {numLat && numLng && (
            <p className="text-xs text-gray-400 mt-1">
              {numLat.toFixed(6)}, {numLng.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      {/* View on map button */}
      <button className="w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
        Xem trên bản đồ
      </button>
    </div>
  );
}

