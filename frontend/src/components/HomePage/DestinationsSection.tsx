interface Destination {
  city: string;
  hotels_count: number;
  image: string;
}

interface DestinationsSectionProps {
  destinations: Destination[];
}

export default function DestinationsSection({ destinations }: DestinationsSectionProps) {
  return (
    <div className="mb-12 md:mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-black mb-2">
        Điểm đến phổ biến
      </h2>
      <p className="text-sm md:text-base text-gray-600 mb-4 md:mb-6">
        Khám phá những địa điểm du lịch được yêu thích nhất
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-4">
        {destinations.map((destination, index) => (
          <div
            key={index}
            className="relative rounded-lg overflow-hidden cursor-pointer group h-28 md:h-40"
          >
            <img
              src={destination.image}
              alt={destination.city}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-2 md:p-4">
              <h3 className="text-white font-bold text-xs md:text-lg">
                {destination.city}
              </h3>
              <p className="text-white text-xs md:text-sm">
                {destination.hotels_count} khách sạn
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


