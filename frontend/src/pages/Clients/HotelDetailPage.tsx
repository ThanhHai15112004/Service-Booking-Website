import { useState } from 'react';
import { useParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { mockHotels } from '../../data/mockData';
import {
  HotelHeader,
  HotelImageGallery,
  HotelInfo,
  HotelAmenities,
  HotelPolicies,
  BookingCard
} from '../../components/HotelDetailPage';

export default function HotelDetailPage() {
  const { id } = useParams();
  const hotel = mockHotels.find(h => h.id === id);
  const [selectedImage, setSelectedImage] = useState(0);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  if (!hotel) {
    return (
      <MainLayout>
        <div className="bg-white flex items-center justify-center py-20">
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
      </MainLayout>
    );
  }

  const images = [
    hotel.main_image,
    'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg',
    'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg',
    'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg',
    'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'
  ];

  const handleBooking = () => {
    if (!checkIn || !checkOut) {
      alert('Vui lòng chọn ngày nhận và trả phòng');
      return;
    }
    window.location.href = `/booking/${hotel.id}?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  return (
    <MainLayout>
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <HotelHeader
            name={hotel.name}
            address={hotel.address}
            city={hotel.city}
            starRating={hotel.star_rating}
            rating={hotel.rating}
            reviewsCount={hotel.reviews_count}
          />

          <HotelImageGallery
            images={images}
            hotelName={hotel.name}
            selectedImage={selectedImage}
            onSelectImage={setSelectedImage}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <HotelInfo description={hotel.description} />
              <HotelAmenities amenities={hotel.amenities || []} />
              <HotelPolicies />
            </div>

            <div className="lg:col-span-1">
              <BookingCard
                pricePerNight={hotel.price_per_night}
                checkIn={checkIn}
                checkOut={checkOut}
                guests={guests}
                onCheckInChange={setCheckIn}
                onCheckOutChange={setCheckOut}
                onGuestsChange={setGuests}
                onBooking={handleBooking}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
