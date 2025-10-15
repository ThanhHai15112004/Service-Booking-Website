export interface Hotel {
  id: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  image: string;
}

interface HotelCardProps {
  hotel: Hotel;
  onSelect: (id: string) => void;
}

export default function HotelCard({ hotel, onSelect }: HotelCardProps) {
  return (
    <div 
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition cursor-pointer"
      onClick={() => onSelect(hotel.id)}
    >
      <img src={hotel.image} alt={hotel.name} className="w-full h-48 object-cover" />
      <div className="p-4">
        <h3 className="font-bold text-lg mb-1">{hotel.name}</h3>
        <p className="text-gray-600 text-sm mb-2">{hotel.location}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-lg">{hotel.price.toLocaleString('vi-VN')} đ</span>
          <span className="bg-black text-white px-2 py-1 rounded-md text-sm">{hotel.rating}/5</span>
        </div>
      </div>
    </div>
  );
}