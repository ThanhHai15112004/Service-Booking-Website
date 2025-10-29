import HotelHighlights from './HotelHighlights';
import HotelInfo from './HotelInfo';
import HotelAmenities from './HotelAmenities';
import HotelReviews from './HotelReviews';
import HotelLocation from './HotelLocation';
import RoomFilters from './RoomFilters';
import RoomList from './RoomList';
import HotelHeader from './HotelHeader';
import { HotelDetail, HotelHighlight, Room, RoomFiltersState } from '../../types';

interface HotelMainContentProps {
  hotel: HotelDetail | null;
  highlights: HotelHighlight[];
  availableRooms: Room[];
  checkIn: string;
  checkOut: string;
  guests: number;        // Thêm số khách
  rooms: number;         // Thêm số phòng
  hotelImages?: string[]; // Ảnh khách sạn
  roomFilters: RoomFiltersState;
  onRoomFiltersChange: (filters: RoomFiltersState) => void;
  onSelectRoom?: (room: Room) => void;
}

export default function HotelMainContent({ 
  hotel, 
  highlights,
  availableRooms,
  checkIn,
  checkOut,
  guests,
  rooms,
  hotelImages = [],
  roomFilters,
  onRoomFiltersChange,
  onSelectRoom
}: HotelMainContentProps) {
  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);
  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
      

      {/* 2 Column Layout - 70:30 ratio */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
        
         {/* Left Column - Main Content (70%) */}
         <div className="lg:col-span-7">
           {/* Hotel Header */}
           <HotelHeader
             name={hotel?.name || 'Đang tải...'}
             address={hotel?.address || ''}
             city={hotel?.city || ''}
             starRating={hotel?.starRating || 0}
           />
          
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-20">
            <HotelHighlights highlights={highlights} />
            <HotelInfo description={hotel?.description || 'Đang tải thông tin khách sạn...'} />
          </section>

          {/* Facilities Section */}
          <section id="facilities" className="scroll-mt-20">
            <HotelAmenities amenities={hotel?.facilities || []} />
          </section>
        </div>

        {/* Right Column - Reviews & Map (30%) */}
        <div className="lg:col-span-3">
          <div className="sticky top-20">
            {/* Reviews */}
            <HotelReviews
              rating={hotel?.avgRating || 0}
              reviewsCount={hotel?.reviewCount || 0}
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
      <section id="rooms" className="scroll-mt-20 mt-6">
        <h2 className="text-2xl font-bold text-black mb-3">Chọn phòng</h2>
        
        {/* Room Filters */}
        <RoomFilters
          filters={roomFilters}
          onFilterChange={onRoomFiltersChange}
          totalRooms={availableRooms.length}
          filterCounts={{}}
        />

        {/* Room List */}
        <RoomList
          rooms={availableRooms}
          nights={nights}
          guests={guests}
          roomsRequested={rooms}
          hotelImages={hotelImages}
          hotelName={hotel?.name || ''}
          onSelectRoom={onSelectRoom}
        />
      </section>
    </div>
  );
}

