import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useSearch } from '../../contexts/SearchContext';
import {
  BookingSummary,
  BookingSuccess,
  BookingHeader,
  BookingStep1,
  BookingStep2
} from '../../components/BookingPage';
import { getHotelDetail } from '../../services/hotelService';
import { createBooking, CreateBookingRequest } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';

export default function BookingPage() {
  const { id } = useParams(); // hotelId or roomId
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchParams: contextSearchParams } = useSearch(); // ✅ Removed updateSearchParams
  const { isLoggedIn } = useAuth(); // ✅ Check authentication

  const [hotel, setHotel] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get search params from URL or SearchContext
  const checkIn = searchParams.get('checkIn') || contextSearchParams.checkIn;
  const checkOut = searchParams.get('checkOut') || contextSearchParams.checkOut;
  const guests = parseInt(searchParams.get('guests') || contextSearchParams.adults.toString() || '2');
  const rooms = parseInt(searchParams.get('rooms') || contextSearchParams.rooms.toString() || '1');
  const children = parseInt(searchParams.get('children') || contextSearchParams.children.toString() || '0');
  
  // ✅ Get payment method from URL params
  const paymentMethodParam = searchParams.get('paymentMethod') || 'pay_at_hotel';
  const initialPaymentMethod = (paymentMethodParam === 'online_payment' ? 'online_payment' : 'pay_at_hotel') as 'pay_at_hotel' | 'online_payment';

  const [currentStep, setCurrentStep] = useState(1); // 1: Guest Info, 2: Payment/Confirmation, 3: Success
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestFirstName: '',
    guestLastName: '',
    country: 'Việt Nam',
    checkInTime: 'unknown',
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
    rooms: rooms,
    children: children,
    specialRequests: '',
    paymentMethod: initialPaymentMethod,
    smokingPreference: 'non-smoking' as 'non-smoking' | 'smoking' | null,
    bedPreference: null as 'large-bed' | 'twin-beds' | null,
    showMoreRequests: false,
    // Payment info
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });

  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  // ✅ FIX: KHÔNG SYNC params vào SearchContext nữa
  // Params chỉ đọc từ URL, không lưu vào context
  // useEffect(() => {
  //   const checkInParam = searchParams.get('checkIn');
  //   const checkOutParam = searchParams.get('checkOut');
  //   const guestsParam = searchParams.get('guests');
  //   const roomsParam = searchParams.get('rooms');
  //   const childrenParam = searchParams.get('children');

  //   if (checkInParam && checkOutParam) {
  //     updateSearchParams({
  //       destination: contextSearchParams.destination,
  //       destinationName: contextSearchParams.destinationName,
  //       checkIn: checkInParam,
  //       checkOut: checkOutParam,
  //       adults: parseInt(guestsParam || '2'),
  //       rooms: parseInt(roomsParam || '1'),
  //       children: parseInt(childrenParam || '0'),
  //     });
  //   }
  // }, []);

  // ✅ Get roomTypeId from query params or from id if id is roomTypeId
  const roomTypeIdParam = searchParams.get('roomTypeId');
  // ✅ Check if id is roomTypeId (starts with "RT") or hotelId (starts with "H")
  const isRoomTypeId = id?.startsWith('RT');
  const actualRoomTypeId = roomTypeIdParam || (isRoomTypeId ? id : null);
  const actualHotelId = isRoomTypeId ? null : id;

  // Fetch hotel/room details and re-check availability
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Validate required params
        if (!checkIn || !checkOut) {
          setError('Thiếu thông tin ngày nhận/trả phòng');
          return;
        }

        // ✅ If id is roomTypeId, need to get hotelId first
        let hotelIdToFetch = actualHotelId;
        
        if (isRoomTypeId && actualRoomTypeId) {
          // ✅ Get hotelId from roomTypeId using API
          try {
            const api = (await import('../../api/axiosClient')).default;
            const hotelIdRes = await api.get(`/api/rooms/hotel/${actualRoomTypeId}`);
            
            if (hotelIdRes.data.success && hotelIdRes.data.data?.hotelId) {
              hotelIdToFetch = hotelIdRes.data.data.hotelId;
            } else {
              setError(hotelIdRes.data.message || 'Không tìm thấy khách sạn cho loại phòng này');
              return;
            }
          } catch (err: any) {
            console.error('Error fetching hotelId from roomTypeId:', err);
            setError('Có lỗi xảy ra khi lấy thông tin khách sạn từ loại phòng');
            return;
          }
        }
        
        if (hotelIdToFetch) {
          // ✅ Fetch hotel detail from API using hotelId
          const response = await getHotelDetail(hotelIdToFetch, {
            checkIn,
            checkOut,
            adults: guests,
            rooms,
            children
          });

          if (!response || !response.success || !response.data?.hotel) {
            setError(response?.message || 'Không tìm thấy khách sạn');
            return;
          }

          const hotelData = response.data.hotel;
          setHotel(hotelData);
        } else {
          setError('Thiếu thông tin khách sạn');
          return;
        }

        // ✅ Set room info from roomTypeId if available
        if (actualRoomTypeId) {
          // Get room type info from available rooms
          // Need to fetch hotel detail again to get availableRooms
          const hotelDetailResponse = await getHotelDetail(hotelIdToFetch || actualHotelId || '', {
            checkIn,
            checkOut,
            adults: guests,
            rooms,
            children
          });
          
          const availableRooms = hotelDetailResponse.data?.availableRooms || [];
          const selectedRoomType = availableRooms.find((r: any) => r.roomTypeId === actualRoomTypeId);
          
          if (selectedRoomType) {
            setRoom({
              roomId: selectedRoomType.roomId || null,
              roomTypeId: selectedRoomType.roomTypeId,
              roomName: selectedRoomType.roomName,
              roomDescription: selectedRoomType.roomDescription,
              bedType: selectedRoomType.bedType,
              capacity: selectedRoomType.capacity,
              totalPrice: selectedRoomType.totalPrice,
              avgPricePerNight: selectedRoomType.avgPricePerNight
            });
          } else {
            // Fallback: set basic room info from roomTypeId
            setRoom({
              roomTypeId: actualRoomTypeId,
              roomName: 'Phòng đã chọn',
              roomId: null
            });
          }
        } else {
          // Fallback: set basic room info
          setRoom({
            roomType: 'Deluxe',
            roomId: null
          });
        }
      } catch (err: any) {
        console.error('Error fetching booking data:', err);
        setError('Có lỗi xảy ra khi tải thông tin đặt phòng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut, rooms, guests, children, actualRoomTypeId, actualHotelId, isRoomTypeId]);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  // ✅ FIX: Dùng room price thay vì hotel price
  const basePrice = room?.totalPrice || room?.avgPricePerNight || (hotel?.price_per_night || 0);
  const subtotal = basePrice * nights * bookingData.rooms;
  const tax = subtotal * 0.1; // 10% thuế và phí
  const total = subtotal + tax;

  const handleStep1Next = () => {
    // Validate step 1
    if (!bookingData.guestFirstName && !bookingData.guestLastName && !bookingData.guestName) {
      alert('Vui lòng điền họ và tên');
      return;
    }
    if (!bookingData.guestEmail) {
      alert('Vui lòng điền email');
      return;
    }
    setCurrentStep(2);
  };

  const handleStep2Confirm = async () => {
    // ✅ Check authentication
    if (!isLoggedIn) {
      const shouldLogin = confirm('Bạn cần đăng nhập để đặt phòng. Bạn có muốn đăng nhập ngay không?');
      if (shouldLogin) {
        navigate('/login', { state: { returnTo: window.location.pathname + window.location.search } });
      }
      return;
    }

    // Validate step 2 if online payment
    if (bookingData.paymentMethod === 'online_payment') {
      if (!bookingData.cardName || !bookingData.cardNumber || !bookingData.cardExpiry || !bookingData.cardCVC) {
        alert('Vui lòng điền đầy đủ thông tin thanh toán');
        return;
      }
    }

    // Validate guest info
    if (!bookingData.guestFirstName && !bookingData.guestLastName && !bookingData.guestName) {
      alert('Vui lòng điền họ và tên');
      return;
    }
    if (!bookingData.guestEmail) {
      alert('Vui lòng điền email');
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Map payment method from frontend to backend
      let paymentMethod: 'VNPAY' | 'MOMO' | 'CASH';
      if (bookingData.paymentMethod === 'online_payment') {
        paymentMethod = 'VNPAY'; // Default to VNPAY for online payment
      } else {
        paymentMethod = 'CASH'; // Pay at hotel -> CASH
      }

      // ✅ Get hotelId - check if id is roomTypeId
      let hotelIdToUse = id;
      if (id?.startsWith('RT')) {
        // If id is roomTypeId, get hotelId from roomTypeId
        try {
          const api = (await import('../../api/axiosClient')).default;
          const hotelIdRes = await api.get(`/api/rooms/hotel/${id}`);
          if (hotelIdRes.data.success && hotelIdRes.data.data?.hotelId) {
            hotelIdToUse = hotelIdRes.data.data.hotelId;
          } else {
            alert('Không tìm thấy khách sạn cho loại phòng này');
            setIsLoading(false);
            return;
          }
        } catch (err: any) {
          console.error('Error fetching hotelId from roomTypeId:', err);
          alert('Không thể lấy thông tin khách sạn');
          setIsLoading(false);
          return;
        }
      }

      // ✅ Build booking request
      // If we have roomTypeId but no roomId, only send roomTypeId
      // Backend will auto-select the first available room
      const bookingRequest: CreateBookingRequest = {
        hotelId: hotelIdToUse || '',
        // ✅ Only include roomId if it exists and is valid (starts with R)
        ...(room?.roomId && room.roomId.startsWith('R') ? { roomId: room.roomId } : {}),
        // ✅ Include roomTypeId if we have it
        ...(actualRoomTypeId && actualRoomTypeId.startsWith('RT') ? { roomTypeId: actualRoomTypeId } : {}),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        rooms: bookingData.rooms,
        adults: bookingData.guests,
        children: bookingData.children || undefined,
        guestInfo: {
          firstName: bookingData.guestFirstName || bookingData.guestName.split(' ').slice(1).join(' ') || '',
          lastName: bookingData.guestLastName || bookingData.guestName.split(' ')[0] || '',
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone || '',
          country: bookingData.country || 'Việt Nam'
        },
        specialRequests: bookingData.specialRequests || undefined,
        paymentMethod: paymentMethod,
        checkInTime: bookingData.checkInTime !== 'unknown' ? bookingData.checkInTime : undefined,
        smokingPreference: bookingData.smokingPreference || undefined,
        bedPreference: bookingData.bedPreference || undefined
      };

      // ✅ Validate request before sending
      if (!bookingRequest.hotelId) {
        alert('Thiếu thông tin khách sạn');
        setIsLoading(false);
        return;
      }
      if (!bookingRequest.roomId && !bookingRequest.roomTypeId) {
        alert('Thiếu thông tin phòng hoặc loại phòng');
        setIsLoading(false);
        return;
      }

      // ✅ Call API
      const result = await createBooking(bookingRequest);

      if (result.success && result.data) {
        setBookingConfirmation(result.data);
        setCurrentStep(3);
        setBookingComplete(true);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        alert(result.message || 'Đặt phòng thất bại');
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      alert(err.message || 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="bg-white flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đặt phòng...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (error || !hotel) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-black mb-2">{error || 'Không tìm thấy khách sạn'}</h2>
            <button
              onClick={() => navigate('/')}
              className="text-blue-600 hover:underline"
            >
              Quay về trang chủ
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Step 3: Success
  if (currentStep === 3 && bookingComplete) {
    return (
      <MainLayout>
        <BookingHeader currentStep={2} countdownSeconds={0} />
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingSuccess
              hotel={hotel}
              guestName={`${bookingData.guestLastName} ${bookingData.guestFirstName}`.trim() || bookingData.guestName}
              guestEmail={bookingData.guestEmail}
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              total={bookingConfirmation?.priceBreakdown?.totalPrice || total}
              bookingCode={bookingConfirmation?.bookingCode}
              bookingId={bookingConfirmation?.bookingId}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* ✅ Agoda-style Header with Progress Bar and Countdown */}
      <BookingHeader currentStep={currentStep} countdownSeconds={1200} />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => currentStep === 1 ? window.history.back() : setCurrentStep(currentStep - 1)}
            className="text-black hover:underline mb-6"
          >
            ← Quay lại
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Steps */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <BookingStep1
                  guestName={bookingData.guestName}
                  guestEmail={bookingData.guestEmail}
                  guestPhone={bookingData.guestPhone}
                  guestFirstName={bookingData.guestFirstName}
                  guestLastName={bookingData.guestLastName}
                  country={bookingData.country}
                  checkInTime={bookingData.checkInTime}
                  smokingPreference={bookingData.smokingPreference}
                  bedPreference={bookingData.bedPreference}
                  specialRequests={bookingData.specialRequests}
                  showMoreRequests={bookingData.showMoreRequests}
                  onNameChange={(value) => setBookingData({ ...bookingData, guestName: value })}
                  onEmailChange={(value) => setBookingData({ ...bookingData, guestEmail: value })}
                  onPhoneChange={(value) => setBookingData({ ...bookingData, guestPhone: value })}
                  onFirstNameChange={(value) => setBookingData({ ...bookingData, guestFirstName: value })}
                  onLastNameChange={(value) => setBookingData({ ...bookingData, guestLastName: value })}
                  onCountryChange={(value) => setBookingData({ ...bookingData, country: value })}
                  onCheckInTimeChange={(value) => setBookingData({ ...bookingData, checkInTime: value })}
                  onSmokingChange={(value) => setBookingData({ ...bookingData, smokingPreference: value })}
                  onBedPreferenceChange={(value) => setBookingData({ ...bookingData, bedPreference: value })}
                  onSpecialRequestsChange={(value) => setBookingData({ ...bookingData, specialRequests: value })}
                  onShowMoreRequestsChange={(value) => setBookingData({ ...bookingData, showMoreRequests: value })}
                  paymentMethod={bookingData.paymentMethod}
                  checkOut={bookingData.checkOut}
                  onNext={handleStep1Next}
                />
              )}

              {currentStep === 2 && (
                <BookingStep2
                  paymentMethod={bookingData.paymentMethod}
                  cardName={bookingData.cardName}
                  cardNumber={bookingData.cardNumber}
                  cardExpiry={bookingData.cardExpiry}
                  cardCVC={bookingData.cardCVC}
                  guestEmail={bookingData.guestEmail} // ✅ Pass email to BookingStep2
                  onCardNameChange={(value) => setBookingData({ ...bookingData, cardName: value })}
                  onCardNumberChange={(value) => setBookingData({ ...bookingData, cardNumber: value })}
                  onCardExpiryChange={(value) => setBookingData({ ...bookingData, cardExpiry: value })}
                  onCardCVCChange={(value) => setBookingData({ ...bookingData, cardCVC: value })}
                  onConfirm={handleStep2Confirm}
                  onBack={handleStep2Back}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  nights={nights}
                  rooms={bookingData.rooms}
                />
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-[200px]">
                <BookingSummary
                  hotel={hotel}
                  room={room}
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  guests={bookingData.guests}
                  rooms={bookingData.rooms}
                  children={bookingData.children}
                  nights={nights}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  paymentMethod={bookingData.paymentMethod}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
