import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  useHotelDetail,
  HotelDetailLoadingState,
  HotelDetailErrorState,
  HotelHeaderSection,
  HotelMainContent
} from '../../components/HotelDetailPage';

export default function HotelDetailPage() {
  const { id } = useParams();
  
  // Custom hook handles all business logic
  const {
    hotel,
    hotelCounts,
    images,
    highlights,
    availableRooms,
    checkIn,
    checkOut,
    guests,
    rooms,
    roomFilters,
    setRoomFilters,
    isLoading,
    error
  } = useHotelDetail();

  // Loading state
  if (isLoading) {
    return <HotelDetailLoadingState hotelId={id} />;
  }

  // Error state
  if (error || !hotel) {
    return (
      <HotelDetailErrorState
        error={error || 'Không tìm thấy khách sạn'}
        hotelId={id}
        checkIn={checkIn}
        checkOut={checkOut}
      />
    );
  }

  // Build breadcrumb items with real counts
  const breadcrumbItems = [
    { label: 'Trang chủ', href: '/' },
    { 
      label: 'Khách sạn Việt Nam', 
      href: '/hotels', 
      count: hotelCounts.countryCount 
    },
    { 
      label: `Khách sạn ${hotel?.city || 'Hồ Chí Minh'}`, 
      href: `/hotels?city=${hotel?.city}`, 
      count: hotelCounts.cityCount
    },
    { label: hotel?.name || 'Đặt phòng', href: '#' }
  ];

  // Tab sections for sticky navigation
  const tabSections = [
    { id: 'overview', label: 'Tổng quan' },
    { id: 'facilities', label: 'Cơ sở vật chất' },
    { id: 'policies', label: 'Chính sách' },
    { id: 'rooms', label: 'Phòng nghỉ' },
  ];

  return (
    <MainLayout>
      <div className="bg-white">
        {/* Header Section: Breadcrumb + Hotel Info + Image Gallery + Sticky Nav */}
        <HotelHeaderSection
          breadcrumbItems={breadcrumbItems}
          hotel={hotel}
          images={images}
          tabSections={tabSections}
          availableRooms={availableRooms}
        />

        {/* Main Content: Overview + Facilities + Policies + Rooms */}
        <HotelMainContent
          hotel={hotel}
          highlights={highlights}
          availableRooms={availableRooms}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          rooms={rooms}
          hotelImages={images}
          roomFilters={roomFilters}
          onRoomFiltersChange={setRoomFilters}
          onSelectRoom={(room) => {
            // TODO: Navigate to booking page
            console.log('Selected room:', room);
          }}
        />
      </div>
    </MainLayout>
  );
}
