import { useState, useEffect } from 'react';
import HotelHighlights from './HotelHighlights';
import HotelInfo from './HotelInfo';
import HotelAmenities from './HotelAmenities';
import HotelReviews from './HotelReviews';
import HotelLocation from './HotelLocation';
import RoomFilters from './RoomFilters';
import RoomList from './RoomList';
import HotelHeader from './HotelHeader';
import HotelDetailedInfo from './HotelDetailedInfo';
import HotelFacilitiesDetailed from './HotelFacilitiesDetailed';
import HotelPoliciesDetailed from './HotelPoliciesDetailed';
import HotelUsefulInfo from './HotelUsefulInfo';
import HotelReviewsDetailed from './HotelReviewsDetailed';
import { HotelDetail, HotelHighlight, Room, RoomFiltersState, FilterCounts } from '../../types';
import { getFacilities, getPolicies, Facility, Policy } from '../../services/filterService';

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
  onSelectRoom?: (room: Room, paymentMethod: 'payNow' | 'payLater') => void;
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
  // ✅ State để lưu filters từ backend
  const [roomFacilities, setRoomFacilities] = useState<Facility[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);

  // ✅ Fetch facilities và policies từ backend
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const [facilitiesData, policiesData] = await Promise.all([
          getFacilities(),
          getPolicies()
        ]);

        // Chỉ lấy facilities có category = 'ROOM'
        const roomFacilitiesOnly = facilitiesData.filter(f => f.category === 'ROOM');
        setRoomFacilities(roomFacilitiesOnly);
        setPolicies(policiesData);
      } catch (error) {
        console.error('Error fetching filters:', error);
      }
    };

    fetchFilters();
  }, []);

  // Calculate nights
  const calculateNights = (checkIn: string, checkOut: string): number => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const nights = calculateNights(checkIn, checkOut);

  // ✅ Logic filter rooms dựa trên selected facilityIds và policyKeys
  const filteredRooms = availableRooms.filter(room => {
    // ✅ Kiểm tra xem có filter nào được chọn không
    const activeFilters = Object.entries(roomFilters).filter(([_, value]) => value === true);
    
    // Nếu không có filter nào được chọn → hiển thị tất cả rooms
    if (activeFilters.length === 0) {
      return true;
    }

    // ✅ CÓ filter được chọn → Lọc rooms theo filter
    // Lấy các selected facilityIds từ filters
    const selectedFacilityIds: string[] = [];
    roomFacilities.forEach(facility => {
      if (roomFilters[facility.facilityId] === true) {
        selectedFacilityIds.push(facility.facilityId);
      }
    });

    // Kiểm tra facilities (tiện nghi phòng) - room phải có TẤT CẢ selected facilities
    if (selectedFacilityIds.length > 0) {
      const roomFacilityIds = room.facilities.map(f => f.facilityId);
      const hasAllFacilities = selectedFacilityIds.every(fid => roomFacilityIds.includes(fid));
      if (!hasAllFacilities) {
        return false; // Room không có đủ facilities → loại bỏ
      }
    }

    // Kiểm tra policies (chính sách) - room phải có TẤT CẢ selected policies
    const selectedPolicyKeys: string[] = [];
    policies.forEach(policy => {
      if (roomFilters[policy.key] === true) {
        selectedPolicyKeys.push(policy.key);
      }
    });

    if (selectedPolicyKeys.length > 0) {
      // Map policy key sang room property
      for (const policyKey of selectedPolicyKeys) {
        if (policyKey === 'pay_later' && !room.payLater) {
          return false; // Room không có policy này → loại bỏ
        }
        if (policyKey === 'free_cancellation' && !room.freeCancellation) {
          return false;
        }
        if (policyKey === 'no_credit_card' && !room.noCreditCard) {
          return false;
        }
        // TODO: Thêm các policies khác khi có field trong Room
      }
    }

    // ✅ Backward compatibility - kiểm tra các filter cũ
    if (roomFilters.payLater === true && !room.payLater) {
      return false;
    }
    if (roomFilters.freeCancellation === true && !room.freeCancellation) {
      return false;
    }
    if (roomFilters.noCreditCard === true && !room.noCreditCard) {
      return false;
    }
    if (roomFilters.kingBed === true && room.bedType !== 'King') {
      return false;
    }

    // Room pass tất cả filters → giữ lại
    return true;
  });

  // ✅ Tính filterCounts để hiển thị số lượng rooms cho mỗi filter
  const calculateFilterCounts = (): Partial<FilterCounts> => {
    const counts: Partial<FilterCounts> = {};

    // Đếm rooms có facilities
    roomFacilities.forEach(facility => {
      const count = availableRooms.filter(r => 
        r.facilities.some(f => f.facilityId === facility.facilityId)
      ).length;
      counts[facility.facilityId] = count;
    });

    // Đếm rooms có policies
    policies.forEach(policy => {
      let count = 0;
      if (policy.key === 'pay_later') {
        count = availableRooms.filter(r => r.payLater).length;
      } else if (policy.key === 'free_cancellation') {
        count = availableRooms.filter(r => r.freeCancellation).length;
      } else if (policy.key === 'no_credit_card') {
        count = availableRooms.filter(r => r.noCreditCard).length;
      }
      // TODO: Thêm các policies khác khi có field trong Room
      counts[policy.key] = count;
    });

    // ✅ Backward compatibility
    counts.payLater = availableRooms.filter(r => r.payLater).length;
    counts.freeCancellation = availableRooms.filter(r => r.freeCancellation).length;
    counts.noCreditCard = availableRooms.filter(r => r.noCreditCard).length;
    counts.kingBed = availableRooms.filter(r => r.bedType === 'King').length;

    return counts;
  };

  const filterCounts = calculateFilterCounts();

  return (
    <div className="w-full">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        

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
          <section id="overview">
            <HotelHighlights highlights={highlights} />
            <HotelInfo description={hotel?.description || 'Đang tải thông tin khách sạn...'} />
          </section>

          {/* Facilities Section */}
          <section id="facilities">
            <HotelAmenities amenities={hotel?.facilities || []} />
          </section>
          
          {/* Policies Section */}
          <section id="policies">
            {/* TODO: Add policies component if needed */}
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
      </div>

      {/* ✅ Đường kẻ ngang đi hết màn hình - Style giống sticky nav */}
      <div className="w-full border-b border-gray-200 bg-white"></div>

      {/* Rooms Section - Full Width Below */}
      <div className="max-w-[1200px] mx-auto px-4 mt-10 sm:px-6 lg:px-8">
        <section id="rooms">
          <h2 className="text-2xl font-bold text-black mb-3">Chọn phòng</h2>
          
          {/* Room Filters */}
          <RoomFilters
            filters={roomFilters}
            onFilterChange={onRoomFiltersChange}
            totalRooms={filteredRooms.length}
            filterCounts={filterCounts}
            roomFacilities={roomFacilities}
            policies={policies}
          />

          {/* Room List */}
          <RoomList
            rooms={filteredRooms}
            nights={nights}
            roomsRequested={rooms}
            guests={guests}
            hotelImages={hotelImages}
            hotelName={hotel?.name || ''}
            hotelHighlights={highlights}
            hasActiveFilters={Object.values(roomFilters).some(v => v === true)}
            onSelectRoom={(room, paymentMethod) => {
              // ✅ Pass both room and paymentMethod to parent
              onSelectRoom?.(room, paymentMethod);
            }}
          />
        </section>
      </div>

      {/* ✅ New Sections Below Rooms - Detailed Information */}
      <div className="max-w-[1200px] mx-auto px-4 mt-10 sm:px-6 lg:px-8">
        {/* Giới thiệu chi tiết về khách sạn */}
        <section className="mb-8">
          <HotelDetailedInfo 
            description={hotel?.description} 
            name={hotel?.name || ''} 
          />
        </section>

        {/* Cơ sở vật chất của khách sạn (Detailed) */}
        <section className="mb-8">
          <HotelFacilitiesDetailed facilities={hotel?.facilities || []} />
        </section>

        {/* Chính sách của khách sạn */}
        <section className="mb-8">
          <HotelPoliciesDetailed policies={hotel?.policies} />
        </section>

        {/* Đầy đủ thông tin */}
        <section className="mb-8">
          <HotelUsefulInfo hotel={hotel || undefined} />
        </section>

        {/* Đánh giá chi tiết */}
        <section className="mb-8">
          <HotelReviewsDetailed
            hotelName={hotel?.name || 'Khách sạn'}
            overallRating={hotel?.avgRating}
            reviewsCount={hotel?.reviewCount}
            categoryRatings={[
              { label: 'Vị trí', score: 8.8 },
              { label: 'Cơ sở vật chất', score: hotel?.avgRating ? hotel.avgRating + 0.2 : 8.7 },
              { label: 'Dịch vụ', score: hotel?.avgRating || 8.5 },
              { label: 'Độ sạch sẽ', score: hotel?.avgRating ? hotel.avgRating + 0.2 : 8.7 },
              { label: 'Đáng giá tiền', score: hotel?.avgRating ? hotel.avgRating + 0.2 : 8.7 }
            ]}
          />
        </section>
      </div>
    </div>
  );
}

