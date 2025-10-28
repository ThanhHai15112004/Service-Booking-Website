import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { mockHotels } from '../../data/mockData';
import {
  GuestInfoForm,
  SpecialRequestsForm,
  PaymentForm,
  BookingSummary,
  BookingSuccess
} from '../../components/BookingPage';

export default function BookingPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const hotel = mockHotels.find(h => h.id === id);

  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests') || '2'),
    specialRequests: ''
  });

  const [bookingComplete, setBookingComplete] = useState(false);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = calculateNights();
  const subtotal = hotel ? hotel.price_per_night * nights : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!bookingData.guestName || !bookingData.guestEmail || !bookingData.guestPhone) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    setBookingComplete(true);
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  };

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">Không tìm thấy khách sạn</h2>
          <button
            onClick={() => window.location.href = '/'}
            className="text-black hover:underline"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
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
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              guests={bookingData.guests}
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
