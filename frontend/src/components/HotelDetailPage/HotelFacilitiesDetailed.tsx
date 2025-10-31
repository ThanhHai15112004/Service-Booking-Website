import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

interface Facility {
  facilityId?: string;
  name: string;
  icon?: string;
  category?: string;
}

interface HotelFacilitiesDetailedProps {
  facilities: (string | Facility)[];
}

export default function HotelFacilitiesDetailed({ facilities }: HotelFacilitiesDetailedProps) {
  const [showAll, setShowAll] = useState(false);
  const MAX_ITEMS = 24; // Show 24 items initially (4 columns x 6 rows)
  
  if (!facilities || facilities.length === 0) {
    return null;
  }

  const displayedFacilities = showAll ? facilities : facilities.slice(0, MAX_ITEMS);
  const hasMore = facilities.length > MAX_ITEMS;

  // ✅ Render icon for facility
  const renderFacilityIcon = (facility: string | Facility) => {
    if (typeof facility === 'string') {
      return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
    }
    
    if (facility.icon && facility.icon.startsWith('http')) {
      return <img src={facility.icon} alt="" className="w-4 h-4 object-contain flex-shrink-0" />;
    }
    
    return <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />;
  };

  const getFacilityName = (facility: string | Facility): string => {
    return typeof facility === 'string' ? facility : facility.name;
  };

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-black">Tiện nghi và cơ sở vật chất</h2>
      </div>
      
      {/* ✅ Grid layout như Agoda - 4 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-3">
        {displayedFacilities.map((facility, index) => (
          <div key={index} className="flex items-start gap-2">
            {renderFacilityIcon(facility)}
            <span className="text-xs text-gray-700 leading-tight">
              {getFacilityName(facility)}
            </span>
          </div>
        ))}
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
                Xem thêm ({facilities.length - MAX_ITEMS} nữa)
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

