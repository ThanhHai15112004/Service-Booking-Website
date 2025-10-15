import { ChevronRight } from 'lucide-react';

interface PromotionalOffer {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  discount?: string;
  image: string;
  backgroundColor: string;
  textColor: string;
}

export default function PromotionalOffers() {
  const offers: PromotionalOffer[] = [
    {
      id: '1',
      title: 'Nhận mọi ưu đãi của quý khách tại đây!',
      subtitle: '',
      description: '',
      discount: '-75%',
      image: '',
      backgroundColor: 'bg-gradient-to-r from-purple-600 to-pink-600',
      textColor: 'text-white'
    },
    {
      id: '2',
      title: 'Agoda',
      subtitle: 'Exclusive Offers with Accor',
      description: 'T&Cs apply',
      image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=400&h=200&fit=crop',
      backgroundColor: 'bg-blue-900',
      textColor: 'text-white'
    },
    {
      id: '3',
      title: 'CITYHOUSE',
      subtitle: 'Urban Vibe, Harmony Of Space',
      description: 'Khám phá ưu đãi các cơ sở lưu trú CityHouse',
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop',
      backgroundColor: 'bg-gray-900',
      textColor: 'text-white'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Chương trình khuyến mại chỗ ở</h2>
        <button className="flex items-center text-blue-600 hover:text-blue-800 font-medium">
          Xem tất cả
          <ChevronRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {offers.map((offer, index) => (
          <div key={offer.id} className="relative cursor-pointer group">
            {/* Special styling for the first promotional card */}
            {index === 0 ? (
              <div className={`${offer.backgroundColor} rounded-2xl p-8 h-64 flex flex-col justify-center items-center text-center relative overflow-hidden`}>
                {/* Decorative elements */}
                <div className="absolute top-4 left-4">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold transform -rotate-12">
                    {offer.discount}
                  </div>
                </div>
                <div className="absolute top-6 right-6">
                  <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold transform rotate-12">
                    %
                  </div>
                </div>
                <div className="absolute bottom-4 left-6">
                  <div className="bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold">
                    %
                  </div>
                </div>
                <div className="absolute bottom-6 right-4">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                    %
                  </div>
                </div>
                
                <h3 className={`text-xl font-bold ${offer.textColor} leading-tight`}>
                  {offer.title}
                </h3>
              </div>
            ) : (
              <div className={`${offer.backgroundColor} rounded-2xl overflow-hidden h-64 relative group-hover:scale-105 transition-transform duration-300`}>
                {offer.image && (
                  <img 
                    src={offer.image} 
                    alt={offer.title}
                    className="w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className={`text-xl font-bold ${offer.textColor} mb-2`}>
                    {offer.title}
                  </h3>
                  {offer.subtitle && (
                    <p className={`${offer.textColor} opacity-90 mb-1`}>
                      {offer.subtitle}
                    </p>
                  )}
                  {offer.description && (
                    <p className={`${offer.textColor} text-sm opacity-75`}>
                      {offer.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}