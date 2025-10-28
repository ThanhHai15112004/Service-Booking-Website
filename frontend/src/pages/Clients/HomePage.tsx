import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { mockHotels, popularDestinations } from '../../data/mockData';
import { SearchParams } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  HeroSearchSection,
  FeaturesHighlights,
  PopularDestinations,
  FeaturedHotels
} from '../../components/HomePage';

export default function HomePage() {
  const [, setSearchParams] = useState<SearchParams | null>(null);
  const navigate = useNavigate();

  const handleSearch = (params: any) => {
    setSearchParams(params);
    
    // Tạo query params và chuyển đến /hotels/search
    const queryParams = new URLSearchParams({
      destination: params.destination || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: params.guests?.toString() || '2',
      rooms: params.rooms?.toString() || '1',
      children: params.children?.toString() || '0',
      stayType: params.stayType || 'overnight'
    });
    
    navigate(`/hotels/search?${queryParams.toString()}`);
  };

  const featuredHotels = mockHotels.filter(h => h.star_rating >= 4).slice(0, 6);

  return (
    <MainLayout>
      <HeroSearchSection onSearch={handleSearch} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-40 pb-8 md:pb-12">
        <FeaturesHighlights />
        <PopularDestinations destinations={popularDestinations} />
        <FeaturedHotels 
          hotels={featuredHotels} 
          onViewAll={() => window.location.href = '/hotels'}
        />
      </div>
    </MainLayout>
  );
}
