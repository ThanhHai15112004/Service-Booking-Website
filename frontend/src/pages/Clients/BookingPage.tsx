import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useSearch } from '../../contexts/SearchContext';
import {
  GuestInfoForm,
  SpecialRequestsForm,
  PaymentForm,
  BookingSummary,
  BookingSuccess
} from '../../components/BookingPage';

export default function BookingPage() {
  const { id } = useParams(); // hotelId or roomId
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchParams: contextSearchParams, updateSearchParams } = useSearch();

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

  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
    rooms: rooms,
    children: children,
    specialRequests: '',
    paymentMethod: 'pay_at_hotel' as 'pay_at_hotel' | 'online_payment'
  });

  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);

  // Sync URL params to SearchContext on page load
  useEffect(() => {
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const guestsParam = searchParams.get('guests');
    const roomsParam = searchParams.get('rooms');
    const childrenParam = searchParams.get('children');

    if (checkInParam && checkOutParam) {
      updateSearchParams({
        destination: contextSearchParams.destination,
        destinationName: contextSearchParams.destinationName,
        checkIn: checkInParam,
        checkOut: checkOutParam,
        adults: parseInt(guestsParam || '2'),
        rooms: parseInt(roomsParam || '1'),
        children: parseInt(childrenParam || '0'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

        // TODO: Replace with actual API calls
        // 1. Get hotel/room details
        // const response = await fetch(`/api/hotels/${id}?checkIn=${checkIn}&checkOut=${checkOut}`);
        // 2. Re-check availability
        // const availabilityRes = await fetch(`/api/availability/room/${id}?startDate=${checkIn}&endDate=${checkOut}&roomsCount=${rooms}`);

        // For now, use mock data
        const mockHotels = [
          {
            id: 'H001',
            name: 'Hanoi Old Quarter Hotel',
            address: '12 Hàng Bạc, Hoàn Kiếm, Hà Nội',
            city: 'Hà Nội',
            star_rating: 3,
            rating: 8.5,
            reviews_count: 245,
            description: 'Khách sạn 3 sao giữa lòng phố cổ Hà Nội.',
            main_image: 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nquZO-cO1woQvrkFfrWaRZ0CMK8t6pL-IBcPwZ9dmojDrqngeCEC8GC50oxeizk4gsLeDMtxYFZ2rytPcrA5VF45WDIX__jp73xW3VgzhLIdYJ0S1KoLr1yJrgLxUD3roOk2COT=w252-h189-k-no',
            price_per_night: 800000,
            amenities: ['Wifi miễn phí', 'Bãi đỗ xe', 'Nhà hàng']
          }
        ];

        const hotelData = mockHotels.find(h => h.id === id);
        if (hotelData) {
          setHotel(hotelData);
          setRoom({ roomType: 'Deluxe', roomId: 'R001' }); // Mock room data
        } else {
          setError('Không tìm thấy khách sạn');
        }
      } catch (err: any) {
        console.error('Error fetching booking data:', err);
        setError('Có lỗi xảy ra khi tải thông tin đặt phòng');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, checkIn, checkOut, rooms]);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const subtotal = hotel ? hotel.price_per_night * nights * bookingData.rooms : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    try {
      // TODO: Call API POST /api/bookings
      /*
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          hotelId: id,
          roomId: room?.roomId,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          rooms: bookingData.rooms,
          adults: bookingData.guests,
          children: bookingData.children,
          guestInfo: {
            name: bookingData.guestName,
            email: bookingData.guestEmail,
            phone: bookingData.guestPhone
          },
          specialRequests: bookingData.specialRequests,
          paymentMethod: bookingData.paymentMethod
        })
      });

      const result = await response.json();
      if (result.success) {
        setBookingConfirmation(result.data);
        setBookingComplete(true);
      } else {
        alert(result.message || 'Đặt phòng thất bại');
      }
      */

      // Mock success for now
      setBookingConfirmation({
        bookingId: 'BK' + Date.now(),
        bookingCode: 'ABC123',
        total: total
      });
      setBookingComplete(true);
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (err: any) {
      console.error('Error creating booking:', err);
      alert('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
    }
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

  if (bookingComplete) {
    return (
      <MainLayout>
        <div className="bg-gray-50 py-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingSuccess
              hotel={hotel}
              guestName={bookingData.guestName}
              guestEmail={bookingData.guestEmail}
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              total={total}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => window.history.back()}
          className="text-black hover:underline mb-6"
        >
          ← Quay lại
        </button>

        <h1 className="text-3xl font-bold text-black mb-8">Hoàn tất đặt phòng</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              <GuestInfoForm
                guestName={bookingData.guestName}
                guestEmail={bookingData.guestEmail}
                guestPhone={bookingData.guestPhone}
                onNameChange={(value) => setBookingData({ ...bookingData, guestName: value })}
                onEmailChange={(value) => setBookingData({ ...bookingData, guestEmail: value })}
                onPhoneChange={(value) => setBookingData({ ...bookingData, guestPhone: value })}
              />

              <SpecialRequestsForm
                value={bookingData.specialRequests}
                onChange={(value) => setBookingData({ ...bookingData, specialRequests: value })}
              />

              <PaymentForm />

              <button
                type="submit"
                className="w-full bg-black text-white py-4 rounded-lg hover:bg-gray-800 transition-colors font-medium text-lg"
              >
                Xác nhận đặt phòng
              </button>
            </form>
          </div>

          <div className="lg:col-span-1">
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
            />
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
