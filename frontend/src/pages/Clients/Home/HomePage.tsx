import Header from '../../../components/Include/Header';
import Footer from '../../../components/Include/Footer';
import Hero from '../../../components/HomePage/Hero';
import Features from '../../../components/HomePage/Features';
import FeaturedHotels from '../../../components/HomePage/FeaturedHotels';
import Newsletter from '../../../components/HomePage/Newsletter';
import type { HotelSearchParams } from '../../../components/HomePage/Search/HotelSearch/types/hotel.types';
import type { Hotel } from '../../../components/HomePage/HotelCard';

export default function HomePage() {
  // Danh sách khách sạn mẫu
  const featuredHotels: Hotel[] = [
    {
      id: '1',
      name: 'Khách sạn Luxury Palace',
      location: 'Hà Nội',
      price: 1200000,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '2',
      name: 'Sea View Resort',
      location: 'Đà Nẵng',
      price: 950000,
      rating: 4.5,
      image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '3',
      name: 'Mountain Retreat',
      location: 'Đà Lạt',
      price: 850000,
      rating: 4.6,
      image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
    {
      id: '4',
      name: 'City Comfort Hotel',
      location: 'TP. Hồ Chí Minh',
      price: 780000,
      rating: 4.3,
      image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1080&q=80'
    },
  ];

  const handleHotelSelect = (id: string) => {
    console.log('Selected hotel:', id);
  };
  
  const handleSearch = (criteria: HotelSearchParams) => {
    console.log('Search criteria:', criteria);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <Hero onSearch={handleSearch} />
      <Features />
      <FeaturedHotels hotels={featuredHotels} onHotelSelect={handleHotelSelect} />
      <Newsletter />
      <Footer />
    </div>
  );
}
