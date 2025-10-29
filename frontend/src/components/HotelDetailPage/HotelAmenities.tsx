import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Facility {
  facilityId?: string;
  name: string;
  icon?: string;
}

interface HotelAmenitiesProps {
  amenities: (string | Facility)[];
}

export default function HotelAmenities({ amenities }: HotelAmenitiesProps) {
  const [showAll, setShowAll] = useState(false);
  const MAX_ITEMS = 20; // 5 hàng x 4 items

  if (!amenities || amenities.length === 0) {
    return null;
  }

  const displayedAmenities = showAll ? amenities : amenities.slice(0, MAX_ITEMS);
  const hasMore = amenities.length > MAX_ITEMS;

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-black mb-4">Cơ sở vật chất</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {displayedAmenities.map((amenity, index) => {
          // Handle both string and object format
          const amenityName = typeof amenity === 'string' ? amenity : amenity.name;
          
          return (
            <div key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#2067da' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-gray-800 leading-tight">{amenityName}</span>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-gray-50 rounded-lg"
            style={{ color: '#2067da' }}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Xem thêm ({amenities.length - MAX_ITEMS} nữa)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

