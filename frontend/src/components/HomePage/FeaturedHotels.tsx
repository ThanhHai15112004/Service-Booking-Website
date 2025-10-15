import HotelCard, { type Hotel } from './HotelCard';

interface FeaturedHotelsProps {
  hotels: Hotel[];
  onHotelSelect: (id: string) => void;
}

export default function FeaturedHotels({ hotels, onHotelSelect }: FeaturedHotelsProps) {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Khách sạn nổi bật</h2>
        <p className="text-gray-600">Những lựa chọn được yêu thích nhất</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {hotels.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} onSelect={onHotelSelect} />
        ))}
      </div>
    </div>
  );
}