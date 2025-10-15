import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Destination {
  id: string;
  name: string;
  accommodations: string;
  image: string;
}

export default function PopularDestinations() {
  const destinations: Destination[] = [
    {
      id: '1',
      name: 'Nha Trang',
      accommodations: '4,098 chỗ ở',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop'
    },
    {
      id: '2',
      name: 'Phan Thiết',
      accommodations: '1,605 chỗ ở',
      image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop'
    },
    {
      id: '3',
      name: 'Huế',
      accommodations: '1,093 chỗ ở',
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=400&h=300&fit=crop'
    },
    {
      id: '4',
      name: 'Cần Thơ',
      accommodations: '655 chỗ ở',
      image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop'
    },
    {
      id: '5',
      name: 'Quy Nhon (Bình Định)',
      accommodations: '1,727 chỗ ở',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Các điểm đến thu hút nhất Việt Nam</h2>
      </div>

      <div className="relative">
        {/* Navigation Buttons */}
        <button className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white shadow-lg rounded-full p-2 hover:bg-gray-50 transition-colors">
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Destinations Grid */}
        <div className="overflow-hidden">
          <div className="flex gap-4 transition-transform duration-300">
            {destinations.map((destination) => (
              <div 
                key={destination.id} 
                className="flex-shrink-0 w-80 cursor-pointer hover:scale-105 transition-transform duration-300"
              >
                <div className="relative rounded-2xl overflow-hidden h-64 mb-4">
                  <img 
                    src={destination.image} 
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-xl font-bold mb-1">{destination.name}</h3>
                    <p className="text-sm opacity-90">{destination.accommodations}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}