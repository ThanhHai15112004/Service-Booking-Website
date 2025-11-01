import { MapPin, ExternalLink } from 'lucide-react';

interface HotelLocationMapProps {
  latitude: number;
  longitude: number;
  address: string;
  hotelName: string;
}

export default function HotelLocationMap({
  latitude,
  longitude,
  address,
  hotelName
}: HotelLocationMapProps) {
  // ✅ Convert to number if needed
  const numLat = typeof latitude === 'string' ? parseFloat(latitude) : latitude;
  const numLng = typeof longitude === 'string' ? parseFloat(longitude) : longitude;

  // ✅ Validate coordinates
  if (!numLat || !numLng || isNaN(numLat) || isNaN(numLng)) {
    return (
      <section className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-5">
          <h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Vị trí khách sạn trên bản đồ
          </h2>
          <p className="text-sm text-gray-600 mt-1">{address}</p>
          <p className="text-sm text-red-600 mt-4">Không có thông tin tọa độ để hiển thị bản đồ.</p>
        </div>
      </section>
    );
  }

  // ✅ Google Maps Static API - Replace YOUR_API_KEY with actual key
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${numLat},${numLng}&zoom=15&size=800x400&markers=color:red%7Clabel:H%7C${numLat},${numLng}&key=${apiKey}`;
  
  // ✅ Google Maps URL để mở trên Google Maps
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${numLat},${numLng}`;

  return (
    <section className="mb-8 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="p-5 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-bold text-black mb-1 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-blue-600" />
          Vị trí khách sạn trên bản đồ
        </h2>
        <p className="text-sm text-gray-600 mt-1">{address}</p>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-96 bg-gray-200">
        {apiKey === 'YOUR_API_KEY' ? (
          // ✅ Fallback khi chưa có API key
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
            <MapPin className="w-16 h-16 text-blue-400 mb-4" />
            <p className="text-gray-600 font-medium mb-2">Bản đồ sẽ hiển thị ở đây</p>
            <p className="text-sm text-gray-500">Cần cấu hình Google Maps API key</p>
            {/* Link to Google Maps as fallback */}
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Xem trên Google Maps
            </a>
          </div>
        ) : (
          // ✅ Hiển thị static map khi có API key
          <img
            src={staticMapUrl}
            alt={`Vị trí của ${hotelName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback nếu không load được ảnh
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('div');
              fallback.className = 'w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100';
              fallback.innerHTML = `
                <svg class="w-16 h-16 text-blue-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <p class="text-gray-600 font-medium mb-2">Không thể tải bản đồ</p>
                <a href="${googleMapsUrl}" target="_blank" rel="noopener noreferrer" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  Xem trên Google Maps
                </a>
              `;
              target.parentElement?.appendChild(fallback);
            }}
          />
        )}
        
        {/* Overlay Info */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/50 to-transparent p-4 text-white">
          <p className="font-bold text-lg mb-1">{hotelName}</p>
          <p className="text-sm text-gray-200 mb-3">{address}</p>
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-200 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Xem trên Google Maps
          </a>
        </div>
      </div>

      {/* Info Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-start gap-3 text-sm text-gray-700">
          <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-black mb-1">Địa chỉ</p>
            <p className="text-gray-600">{address}</p>
            <p className="text-xs text-gray-500 mt-1">Tọa độ: {numLat.toFixed(6)}, {numLng.toFixed(6)}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

