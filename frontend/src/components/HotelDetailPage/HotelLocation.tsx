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
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h3 className="text-lg font-bold text-black mb-3">Vị trí</h3>
      
      {/* Address */}
      <div className="mb-3">
        <div className="flex items-start gap-2 text-gray-700 mb-1.5">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#2067da' }} />
          <div>
            <p className="text-xs font-medium text-gray-900">{address}</p>
            <p className="text-[10px] text-gray-600 mt-0.5">{city}</p>
          </div>
        </div>
        
        {numDist && (
          <div className="flex items-center gap-1.5 text-[10px] text-gray-600 ml-5.5">
            <Navigation className="w-3 h-3" style={{ color: '#2067da' }} />
            <span>Cách trung tâm {numDist} km</span>
          </div>
        )}
      </div>

      {/* Map placeholder */}
      <div className="bg-gray-100 rounded h-36 flex items-center justify-center mb-2.5 overflow-hidden">
        <div className="text-center">
          <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-1" />
          <p className="text-gray-500 text-[10px]">Bản đồ</p>
        </div>
      </div>

      {/* View on map button */}
      <button className="w-full px-3 py-1.5 border rounded hover:bg-blue-50 transition-colors text-xs font-medium"
              style={{ borderColor: '#2067da', color: '#2067da' }}>
        Xem trên bản đồ
      </button>
    </div>
  );
}

