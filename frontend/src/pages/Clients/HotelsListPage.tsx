import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { searchHotels } from '../../services/hotelService';
import { getCategories, getFacilities, getBedTypes, getPolicies } from '../../services/filterService';
import CompactSearchBar from '../../components/Search/CompactSearchBar';
import { useSearch } from '../../contexts/SearchContext';
import {
  SearchHeader,
  FilterSidebar,
  HotelResultCard,
  LoadingState,
  EmptyState,
  CombinedFilters
} from '../../components/HotelsListPage';

interface HotelSearchResult {
  hotelId: string;
  name: string;
  starRating: number;
  avgRating: number;
  reviewCount: number;
  mainImage: string;
  categoryName?: string;
  location: {
    city: string;
    district?: string;
    areaName?: string;
    distanceCenter?: number;
  };
  bestOffer: {
    stayType: string;
    nights: number;
    rooms: number;
    adults: number;
    children: number;
    roomTypeId: string;
    roomName: string;
    capacity: number;
    availableRooms: number;
    totalPrice: number;
    avgPricePerNight: number;
    originalPricePerNight?: number;
    totalOriginalPrice?: number;
    discountPercent?: number;
    refundable: boolean;
    payLater: boolean;
    freeCancellation?: boolean;
    noCreditCard?: boolean;
    petsAllowed?: boolean;
    childrenAllowed?: boolean;
  };
  images?: Array<{
    imageId: string;
    imageUrl: string;
    isPrimary: boolean;
    caption?: string;
  }>;
  facilities?: Array<{
    facilityId: string;
    name: string;
    icon?: string;
  }>;
}

export default function HotelsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { searchParams: contextSearchParams } = useSearch(); // ✅ Removed updateSearchParams
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(true);
  const [filteredHotels, setFilteredHotels] = useState<HotelSearchResult[]>([]);
  
  // Lưu search params - prioritize URL params over context
  const [searchData, setSearchData] = useState({
    destination: searchParams.get('destination') || contextSearchParams.destinationName || '',
    checkIn: searchParams.get('checkIn') || contextSearchParams.checkIn || '',
    checkOut: searchParams.get('checkOut') || contextSearchParams.checkOut || '',
    guests: parseInt(searchParams.get('guests') || contextSearchParams.adults.toString() || '2'),
    rooms: parseInt(searchParams.get('rooms') || contextSearchParams.rooms.toString() || '1'),
    children: parseInt(searchParams.get('children') || contextSearchParams.children.toString() || '0'),
    stayType: (searchParams.get('stayType') as 'overnight' | 'dayuse') || 'overnight',
  });

  // Initialize filters from URL params
  const initializeFiltersFromUrl = () => {
    const categoryId = searchParams.get('category_id');
    const starMin = searchParams.get('star_min');
    const facilities = searchParams.get('facilities');
    const bedTypes = searchParams.get('bed_types');
    const policies = searchParams.get('policies');
    const maxDistance = searchParams.get('max_distance');
    const sort = searchParams.get('sort');

    // Helper to parse comma-separated values and trim each item
    const parseCommaSeparated = (value: string | null): string[] => {
      if (!value) return [];
      return value.split(',').map(item => item.trim()).filter(Boolean);
    };

    return {
      priceRange: [0, 10000000],
      starRating: starMin ? [parseInt(starMin)] : [] as number[],
      sortBy: sort || 'recommended',
      categoryId: categoryId ? [categoryId] : [] as string[],
      facilities: parseCommaSeparated(facilities),
      bedTypes: parseCommaSeparated(bedTypes),
      policies: parseCommaSeparated(policies),
      maxDistance: maxDistance ? parseFloat(maxDistance) : undefined as number | undefined,
      minRating: undefined as number | undefined
    };
  };

  const [filters, setFilters] = useState(initializeFiltersFromUrl());

  // Filter metadata for displaying names
  const [filterMetadata, setFilterMetadata] = useState({
    categories: new Map<string, string>(),
    facilities: new Map<string, string>(),
    bedTypes: new Map<string, string>(),
    policies: new Map<string, string>()
  });

  // Store full facility and category objects for suggestions
  const [fullFilterData, setFullFilterData] = useState<{
    facilities: Array<{ facilityId: string; name: string; category: string; icon?: string }>;
    categories: Array<{ categoryId: string; name: string; icon?: string }>;
    bedTypes: Array<{ bedTypeId: string; name: string; icon?: string }>;
    policies: Array<{ policyId: string; name: string; icon?: string }>;
  }>({
    facilities: [],
    categories: [],
    bedTypes: [],
    policies: []
  });

  // ✅ FIX: KHÔNG SYNC params vào SearchContext nữa
  // Params chỉ đọc từ URL, không lưu vào context
  // useEffect(() => {
  //   const destination = searchParams.get('destination');
  //   const checkIn = searchParams.get('checkIn');
  //   const checkOut = searchParams.get('checkOut');
  //   const guests = searchParams.get('guests');
  //   const rooms = searchParams.get('rooms');
  //   const children = searchParams.get('children');

  //   if (destination && checkIn) {
  //     updateSearchParams({
  //       destination,
  //       destinationName: destination,
  //       checkIn,
  //       checkOut: checkOut || checkIn,
  //       adults: parseInt(guests || '2'),
  //       rooms: parseInt(rooms || '1'),
  //       children: parseInt(children || '0'),
  //     });
  //   }
  // }, []);

  // Fetch filter metadata
  useEffect(() => {
    const fetchMetadata = async () => {
      const [cats, facs, beds, pols] = await Promise.all([
        getCategories(),
        getFacilities(),
        getBedTypes(),
        getPolicies()
      ]);

      setFilterMetadata({
        categories: new Map(cats.map(c => [c.categoryId, c.name])),
        facilities: new Map(facs.map(f => [f.facilityId, f.name])),
        bedTypes: new Map(beds.map(b => [b.key, b.label])),
        policies: new Map(pols.map(p => [p.key, p.label]))
      });

      setFullFilterData({
        facilities: facs,
        categories: cats,
        bedTypes: beds.map(b => ({ bedTypeId: b.key, name: b.label, icon: b.icon })),
        policies: pols.map(p => ({ policyId: p.key, name: p.label, icon: p.icon }))
      });
    };
    fetchMetadata();
  }, []);

  // ✅ FIX: Tách riêng logic fetch hotels
  // Chỉ fetch khi search params cơ bản thay đổi (từ search form) hoặc filters thay đổi
  // Không fetch lại khi URL sync (vì URL sync chỉ update filter params trong URL, không thay đổi search params cơ bản)
  
  // Extract search params cơ bản (chỉ những params không phải filter)
  // ✅ Dùng useMemo với searchParams.toString() để chỉ track search params cơ bản
  // Filter params (category_id, star_min, facilities, etc.) sẽ không trigger lại fetch
  const baseSearchKey = useMemo(() => {
    // Chỉ lấy các params cơ bản, bỏ qua filter params
    const basicParams = ['destination', 'checkIn', 'checkOut', 'guests', 'rooms', 'children', 'stayType'];
    const params = new URLSearchParams();
    basicParams.forEach(key => {
      const value = searchParams.get(key);
      if (value) params.set(key, value);
    });
    return params.toString();
  }, [searchParams]);

  // Fetch hotels - debounced để tránh gọi nhiều lần
  useEffect(() => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    
    if (!destination || !checkIn) return;

    // ✅ Debounce để tránh gọi API quá nhiều khi filter thay đổi nhanh
    const timeoutId = setTimeout(() => {
      const fetchHotels = async () => {
        try {
          setIsLoading(true);
          setError(null);

          // Build search params with filters
          const params = {
            destination: destination || '',
            checkIn: checkIn || '',
            checkOut: searchParams.get('checkOut') || '',
            guests: parseInt(searchParams.get('guests') || '2'),
            rooms: parseInt(searchParams.get('rooms') || '1'),
            children: parseInt(searchParams.get('children') || '0'),
            stayType: (searchParams.get('stayType') || 'overnight') as 'overnight' | 'dayuse',
            // ✅ Filters from sidebar - gửi lên API search
            categoryId: filters.categoryId.length > 0 ? filters.categoryId[0] : undefined, // Backend only supports single category for now
            starMin: filters.starRating.length > 0 ? Math.min(...filters.starRating) : undefined,
            facilities: filters.facilities.length > 0 ? filters.facilities : undefined,
            bedTypes: filters.bedTypes.length > 0 ? filters.bedTypes : undefined,
            policies: filters.policies.length > 0 ? filters.policies : undefined,
            maxDistance: filters.maxDistance,
            sort: filters.sortBy !== 'recommended' ? filters.sortBy : undefined
          };

          console.log('🔍 Fetching hotels with filters:', params);

          const res = await searchHotels(params);

          // Handle new response format: { success, data: { hotels, pagination, searchParams } }
          if (res.success && res.data && res.data.hotels) {
            setHotels(res.data.hotels);
            setFilteredHotels(res.data.hotels);
            if (res.data.hotels.length === 0) {
              setError(res.message || 'Không tìm thấy khách sạn nào phù hợp với bộ lọc');
            }
          } else {
            setError(res.message || 'Không tìm thấy khách sạn nào');
            setHotels([]);
            setFilteredHotels([]);
          }
        } catch (err: any) {
          console.error('❌ Error fetching hotels:', err);
          setError('Có lỗi xảy ra khi tìm kiếm');
          setHotels([]);
          setFilteredHotels([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHotels();
    }, 400); // Debounce 400ms - đủ để user tick nhiều filter mà không gọi API nhiều lần

    return () => clearTimeout(timeoutId);
    // ✅ CHỈ phụ thuộc vào baseSearchKey (search params cơ bản) và filters
    // KHÔNG phụ thuộc vào searchParams toàn bộ để tránh trigger lại khi URL sync
  }, [baseSearchKey, filters]);

  // Apply client-side filters (price and rating - other filters are handled by backend)
  const applyFilters = useCallback(() => {
    let filtered = [...hotels];

    // Filter by price (client-side only)
    filtered = filtered.filter(
      hotel => hotel.bestOffer.avgPricePerNight >= filters.priceRange[0] &&
               hotel.bestOffer.avgPricePerNight <= filters.priceRange[1]
    );

    // Filter by guest rating (client-side only)
    if (filters.minRating) {
      filtered = filtered.filter(hotel => hotel.avgRating >= filters.minRating!);
    }

    setFilteredHotels(filtered);
  }, [hotels, filters.priceRange, filters.minRating]);

  // Apply filters khi hotels hoặc price range thay đổi
  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Helper function to sync filters to URL
  // ✅ FIX: Chỉ update URL, KHÔNG trigger lại fetch (vì fetch đã phụ thuộc vào filters)
  const syncFiltersToUrl = useCallback(() => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const rooms = searchParams.get('rooms');
    const children = searchParams.get('children');
    const stayType = searchParams.get('stayType');

    // Only update if we have basic search params
    if (!destination || !checkIn) return;

    const queryParams: any = {
      destination,
      checkIn,
      checkOut: checkOut || '',
      guests: guests || '2',
      rooms: rooms || '1',
      children: children || '0',
      stayType: stayType || 'overnight'
    };

    // Add filters to URL
    if (filters.categoryId.length > 0) queryParams.category_id = filters.categoryId[0];
    if (filters.starRating.length > 0) queryParams.star_min = Math.min(...filters.starRating).toString();
    if (filters.facilities.length > 0) queryParams.facilities = filters.facilities.join(',');
    if (filters.bedTypes.length > 0) queryParams.bed_types = filters.bedTypes.join(',');
    if (filters.policies.length > 0) queryParams.policies = filters.policies.join(',');
    if (filters.maxDistance) queryParams.max_distance = filters.maxDistance.toString();
    if (filters.sortBy && filters.sortBy !== 'recommended') queryParams.sort = filters.sortBy;

    // Build new URL - dùng replace: true để không trigger history change
    const newSearchParams = new URLSearchParams(queryParams).toString();
    const newUrl = `/hotels/search?${newSearchParams}`;
    
    // Chỉ update URL nếu khác với URL hiện tại để tránh trigger lại
    if (window.location.pathname + window.location.search !== newUrl) {
      navigate(newUrl, { replace: true });
    }
  }, [filters, searchParams, navigate]);

  const handleSearch = (params: any) => {
    setSearchData(params);
    
    // ✅ FIX: KHÔNG UPDATE SearchContext nữa
    // Chỉ navigate với query params
    
    const queryParams: any = {
      destination: params.destination || '',
      checkIn: params.checkIn || '',
      checkOut: params.checkOut || '',
      guests: params.guests?.toString() || '2',
      rooms: params.rooms?.toString() || '1',
      children: params.children?.toString() || '0',
      stayType: params.stayType || 'overnight'
    };

      // Add filters to query
      if (filters.categoryId.length > 0) queryParams.category_id = filters.categoryId[0]; // Backend only supports single category
      if (filters.starRating.length > 0) queryParams.star_min = Math.min(...filters.starRating).toString();
      if (filters.facilities.length > 0) queryParams.facilities = filters.facilities.join(',');
      if (filters.bedTypes.length > 0) queryParams.bed_types = filters.bedTypes.join(',');
      if (filters.policies.length > 0) queryParams.policies = filters.policies.join(',');
      if (filters.maxDistance) queryParams.max_distance = filters.maxDistance.toString();
      if (filters.sortBy !== 'recommended') queryParams.sort = filters.sortBy;
    
    navigate(`/hotels/search?${new URLSearchParams(queryParams).toString()}`);
  };

  // ✅ Auto sync filters to URL when filters change (debounced)
  // Đảm bảo URL được update khi filter thay đổi để có thể share/bookmark
  // ✅ FIX: Debounce lâu hơn để không conflict với fetch hotels
  useEffect(() => {
    const timer = setTimeout(() => {
      syncFiltersToUrl();
    }, 500); // Debounce 500ms - sau khi fetch hotels đã xong

    return () => clearTimeout(timer);
  }, [syncFiltersToUrl]);

  const toggleStarRating = (star: number) => {
    const newRatings = filters.starRating.includes(star)
      ? filters.starRating.filter(s => s !== star)
      : [...filters.starRating, star];
    setFilters({ ...filters, starRating: newRatings });
  };

  const handleClearFilter = (filterKey: string, value?: any) => {
    switch (filterKey) {
      case 'priceRange':
        setFilters({ ...filters, priceRange: [0, 10000000] });
        break;
      case 'starRating':
        setFilters({ ...filters, starRating: filters.starRating.filter(s => s !== value) });
        break;
      case 'categoryId':
        setFilters({ ...filters, categoryId: filters.categoryId.filter(c => c !== value) });
        break;
      case 'facilities':
        setFilters({ ...filters, facilities: filters.facilities.filter(f => f !== value) });
        break;
      case 'bedTypes':
        setFilters({ ...filters, bedTypes: filters.bedTypes.filter(b => b !== value) });
        break;
      case 'policies':
        setFilters({ ...filters, policies: filters.policies.filter(p => p !== value) });
        break;
    }
  };

  const handleClearAllFilters = () => {
    setFilters({
      ...filters,
      priceRange: [0, 10000000],
      starRating: [],
      categoryId: [],
      facilities: [],
      bedTypes: [],
      policies: [],
      maxDistance: undefined,
      minRating: undefined
    });
  };

  const handleApplySuggestion = (type: string, value: any) => {
    switch (type) {
      case 'starRating':
        setFilters({ ...filters, starRating: [value] });
        break;
      case 'priceRange':
        setFilters({ ...filters, priceRange: value });
        break;
      case 'facility':
        // Add facility to filters if not already included
        if (!filters.facilities.includes(value)) {
          setFilters({ ...filters, facilities: [...filters.facilities, value] });
        }
        break;
      case 'policy':
        // Add policy to filters if not already included
        if (!filters.policies.includes(value)) {
          setFilters({ ...filters, policies: [...filters.policies, value] });
        }
        break;
      case 'distance':
        // Add distance filtering - will be implemented
        alert(`Gợi ý "Gần trung tâm" sẽ được triển khai trong phiên bản tiếp theo`);
        break;
    }
  };

  // Calculate active filters count
  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.starRating.length > 0) count += filters.starRating.length;
    if (filters.categoryId.length > 0) count += filters.categoryId.length;
    if (filters.facilities.length > 0) count += filters.facilities.length;
    if (filters.bedTypes.length > 0) count += filters.bedTypes.length;
    if (filters.policies.length > 0) count += filters.policies.length;
    if (filters.priceRange[1] < 10000000) count += 1;
    if (filters.maxDistance) count += 1;
    if (filters.minRating) count += 1;
    return count;
  };

  return (
    <MainLayout>
      {/* Compact Search Bar */}
      <CompactSearchBar 
        onSearch={handleSearch} 
        initialSearchParams={searchData}
      />

      <div className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <SearchHeader
            resultsCount={filteredHotels.length}
            isLoading={isLoading}
            error={error}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            sortBy={filters.sortBy}
            onSortChange={(value) => setFilters({ ...filters, sortBy: value })}
            activeFiltersCount={getActiveFiltersCount()}
          />

          {/* Combined Filters: Suggestions + Active Filters */}
          <CombinedFilters
            filters={filters}
            onClearFilter={handleClearFilter}
            onClearAll={handleClearAllFilters}
            categoryNames={filterMetadata.categories}
            facilityNames={filterMetadata.facilities}
            bedTypeNames={filterMetadata.bedTypes}
            policyNames={filterMetadata.policies}
            onApplySuggestion={handleApplySuggestion}
            fullFilterData={fullFilterData}
          />

          {isLoading ? (
            <LoadingState />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <FilterSidebar
                filters={filters}
                showFilters={showFilters}
                onFiltersChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
                onToggleStarRating={toggleStarRating}
              />

              <div className="lg:col-span-3">
                <div className="space-y-4">
                  {filteredHotels.map((hotel) => (
                    <HotelResultCard key={hotel.hotelId} hotel={hotel} />
                  ))}
                </div>

                {filteredHotels.length === 0 && !isLoading && <EmptyState />}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
