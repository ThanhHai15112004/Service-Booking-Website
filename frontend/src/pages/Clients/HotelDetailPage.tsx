import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import {
  useHotelDetail,
  HotelDetailLoadingState,
  HotelDetailErrorState,
  HotelHeaderSection,
  HotelMainContent,
  HotelSearchUpdateBar
} from '../../components/HotelDetailPage';

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Custom hook handles all business logic
  const {
    hotel,
    hotelCounts,
    images,
    highlights,
    availableRooms,
    checkIn,
    checkOut,
    stayType, // ✅ Get stayType from hook
    guests,
    rooms,
    children,
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


  return (
    <MainLayout>
      <div className="bg-white">
        {/* Search Update Bar - Sticky at top */}
        <HotelSearchUpdateBar
          hotelId={id || ''}
          initialDestination={hotel?.city || ''}
          initialCheckIn={checkIn}
          initialCheckOut={checkOut}
          initialGuests={guests}
          initialRooms={rooms}
          initialChildren={children}
        />

        {/* Header Section: Breadcrumb + Hotel Info + Image Gallery */}
        <HotelHeaderSection
          breadcrumbItems={breadcrumbItems}
          hotel={hotel}
          images={images}
          availableRooms={availableRooms}
        />

        {/* Main Content: Overview + Facilities + Policies + Rooms */}
        <HotelMainContent
          hotel={hotel}
          highlights={highlights}
          availableRooms={availableRooms}
          checkIn={checkIn}
          checkOut={checkOut}
          stayType={stayType} // ✅ Pass stayType
          guests={guests}
          rooms={rooms}
          children={children}
          hotelImages={images}
          roomFilters={roomFilters}
          onRoomFiltersChange={setRoomFilters}
          onSelectRoom={(room, paymentMethod) => {
            // ✅ Navigate to booking page với room và payment method
            // Sử dụng hotelId trong URL path, roomTypeId trong query params
            const hotelId = id; // hotelId từ URL params
            if (!hotelId) {
              console.error('Hotel ID not found');
              return;
            }

            const roomTypeId = room.roomTypeId;
            if (!roomTypeId) {
              console.error('Room Type ID not found');
              return;
            }

            // Build query params
            const bookingParams = new URLSearchParams();
            bookingParams.set('checkIn', checkIn || '');
            bookingParams.set('checkOut', checkOut || '');
            bookingParams.set('stayType', stayType || 'overnight'); // ✅ Pass stayType to booking page
            bookingParams.set('guests', guests.toString());
            bookingParams.set('rooms', rooms.toString());
            bookingParams.set('children', children.toString());
            bookingParams.set('roomTypeId', roomTypeId); // ✅ Thêm roomTypeId vào query params
            
            // Map payment method: 'payNow' -> 'online_payment', 'payLater' -> 'pay_at_hotel'
            const paymentMethodParam = paymentMethod === 'payNow' ? 'online_payment' : 'pay_at_hotel';
            bookingParams.set('paymentMethod', paymentMethodParam);
            
            // Navigate to booking page với hotelId
            navigate(`/booking/${hotelId}?${bookingParams.toString()}`);
          }}
        />
      </div>
    </MainLayout>
  );
}
