import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { SearchParams, Hotel } from '../../types';
import { useNavigate } from 'react-router-dom';
import {
  HeroSearchSection,
  FeaturesHighlights,
  PopularDestinations,
  FeaturedHotels
} from '../../components/HomePage';
import { getFeaturedHotels } from '../../services/hotelService';
import { getPopularDestinations } from '../../services/locationService';
import { Loading } from '../../components/common';

interface PopularDestination {
  city: string;
  hotels_count: number;
  image: string;
}

export default function HomePage() {
  const [, setSearchParams] = useState<SearchParams | null>(null);
  const [featuredHotels, setFeaturedHotels] = useState<Hotel[]>([]);
  const [popularDestinations, setPopularDestinations] = useState<PopularDestination[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const searchSectionRef = useRef<HTMLDivElement>(null);

  // Fetch data khi component mount
  useEffect(() => {
    const fetchHomePageData = async () => {
      setLoading(true);
      
      try {
        // Fetch featured hotels (4-5 sao, rating cao)
        console.log('🔄 Fetching featured hotels...');
        const hotelsResult = await getFeaturedHotels({
          limit: 6,
          minStars: 4,
          minRating: 8.0
        });

        console.log('📦 Hotels result:', hotelsResult);

        if (hotelsResult.success && hotelsResult.data?.hotels) {
          console.log('✅ Found hotels:', hotelsResult.data.hotels.length);
          setFeaturedHotels(hotelsResult.data.hotels);
        } else {
          console.log('⚠️ No hotels found or error:', hotelsResult.message);
        }

        // Fetch popular destinations
        console.log('🔄 Fetching popular destinations...');
        const destinationsResult = await getPopularDestinations(6);
        
        console.log('📦 Destinations result:', destinationsResult);
        
        if (destinationsResult.success && destinationsResult.items) {
          console.log('✅ Found destinations:', destinationsResult.items.length);
          setPopularDestinations(destinationsResult.items);
        }
      } catch (error) {
        console.error('❌ Error loading homepage data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomePageData();
  }, []);

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

  const scrollToSearch = () => {
    searchSectionRef.current?.scrollIntoView({ 
      behavior: 'smooth', 
      block: 'center' 
    });
    
    // Focus vào input destination sau khi scroll
    setTimeout(() => {
      const destinationInput = searchSectionRef.current?.querySelector('input[placeholder*="Bạn muốn đến đâu"]');
      if (destinationInput) {
        (destinationInput as HTMLInputElement).focus();
      }
    }, 500);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Loading />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div ref={searchSectionRef}>
        <HeroSearchSection onSearch={handleSearch} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-40 pb-8 md:pb-12">
        <FeaturesHighlights />
        
        {popularDestinations.length > 0 && (
          <PopularDestinations destinations={popularDestinations} />
        )}
        
        {featuredHotels.length > 0 && (
          <FeaturedHotels 
            hotels={featuredHotels} 
            onViewAll={scrollToSearch}
          />
        )}
      </div>
    </MainLayout>
  );
}
