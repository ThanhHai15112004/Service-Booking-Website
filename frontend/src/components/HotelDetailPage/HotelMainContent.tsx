import {
  HotelHighlights,
  HotelInfo,
  HotelAmenities,
  HotelPolicies,
  HotelReviews,
  HotelLocation,
  RoomFilters,
  RoomFiltersState
} from './index';

interface HotelMainContentProps {
  hotel: any;
  highlights: any[];
  roomFilters: RoomFiltersState;
  onRoomFiltersChange: (filters: RoomFiltersState) => void;
}

export default function HotelMainContent({ 
  hotel, 
  highlights,
  roomFilters,
  onRoomFiltersChange
}: HotelMainContentProps) {
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* 2 Column Layout - 60:40 ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        
        {/* Left Column - Main Content (60%) */}
        <div className="lg:col-span-3">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-20">
            <HotelHighlights highlights={highlights} />
            <HotelInfo description={hotel?.description || 'Đang tải thông tin khách sạn...'} />
          </section>

          {/* Facilities Section */}
          <section id="facilities" className="scroll-mt-20">
            <HotelAmenities amenities={
              Array.isArray(hotel?.facilities) ? hotel.facilities : 
              Array.isArray(hotel?.amenities) ? hotel.amenities : 
              []
            } />
          </section>

          {/* Policies Section */}
          <section id="policies" className="scroll-mt-20">
            <HotelPolicies policies={hotel?.policies} />
          </section>
        </div>

        {/* Right Column - Reviews & Map (40%) */}
        <div className="lg:col-span-2">
          {/* Reviews */}
          <div className="sticky top-20">
            <HotelReviews
              rating={hotel?.avgRating || hotel?.rating || 0}
              reviewsCount={hotel?.reviewCount || hotel?.reviews_count || 0}
            />
            
            {/* Location/Map */}
            <HotelLocation
              address={hotel?.address || ''}
              city={hotel?.city || ''}
              latitude={hotel?.latitude}
              longitude={hotel?.longitude}
              distanceCenter={hotel?.distanceCenter}
            />
          </div>
        </div>
      </div>

      {/* Rooms Section - Full Width Below */}
      <section id="rooms" className="scroll-mt-20 mt-8">
        <h2 className="text-2xl font-bold text-black mb-4">Chọn phòng</h2>
        
        {/* Room Filters */}
        <RoomFilters
          filters={roomFilters}
          onFilterChange={onRoomFiltersChange}
          totalRooms={0}
          filterCounts={{}}
        />

        {/* TODO: Add Room List Component */}
        <div className="my-8 p-8 bg-blue-50 rounded-lg text-center">
          <p className="text-gray-600">Danh sách phòng trống sẽ hiển thị ở đây</p>
        </div>
      </section>
    </div>
  );
}

