import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { searchHotels } from '../../services/hotelService';
import { SlidersHorizontal, Loader } from 'lucide-react';
import CompactSearchBar from '../../components/Search/CompactSearchBar';

interface HotelSearchResult {
  hotel_id: string;
  name: string;
  star_rating: number;
  avg_rating: number;
  review_count: number;
  main_image: string;
  city: string;
  district: string;
  available_rooms: number;
  total_price: number;
  avg_price_per_night: number;
  room_name: string;
  capacity: number;
}

export default function HotelsListPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hotels, setHotels] = useState<HotelSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredHotels, setFilteredHotels] = useState<HotelSearchResult[]>([]);
  
  // Lưu search params
  const [searchData, setSearchData] = useState({
    destination: searchParams.get('destination') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    guests: parseInt(searchParams.get('guests') || '2'),
    rooms: parseInt(searchParams.get('rooms') || '1'),
    children: parseInt(searchParams.get('children') || '0'),
    stayType: (searchParams.get('stayType') as 'overnight' | 'dayuse') || 'overnight',
  });

  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    starRating: [] as number[],
    sortBy: 'recommended'
  });

  // Fetch hotels từ API khi có query params
  useEffect(() => {
    const destination = searchParams.get('destination');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const guests = searchParams.get('guests');
    const rooms = searchParams.get('rooms');
    const children = searchParams.get('children');
    const stayType = (searchParams.get('stayType') || 'overnight') as 'overnight' | 'dayuse';

    if (destination && checkIn) {
      const fetchHotels = async () => {
        try {
          setIsLoading(true);
          setError(null);

          const params = {
            destination: destination || '',
            checkIn: checkIn || '',
            checkOut: checkOut || '',
            guests: parseInt(guests || '2'),
            rooms: parseInt(rooms || '1'),
            children: parseInt(children || '0'),
            stayType: stayType,
          };

          const res = await searchHotels(params);

          if (res.success && res.items && res.items.length > 0) {
            setHotels(res.items);
            setFilteredHotels(res.items);
          } else {
            setError(res.message || 'Không tìm thấy khách sạn nào');
            setHotels([]);
            setFilteredHotels([]);
          }
        } catch (err: any) {
          console.error('Lỗi fetch hotels:', err);
          setError('Có lỗi xảy ra khi tìm kiếm');
          setHotels([]);
          setFilteredHotels([]);
        } finally {
          setIsLoading(false);
        }
      };

      fetchHotels();
    }
  }, [searchParams]);

  // Apply filters khi hotels hoặc filters thay đổi
  useEffect(() => {
    applyFilters();
  }, [hotels, filters]);

  const applyFilters = () => {
    let filtered = [...hotels];

    // Filter by price
    filtered = filtered.filter(
      hotel => hotel.avg_price_per_night >= filters.priceRange[0] &&
               hotel.avg_price_per_night <= filters.priceRange[1]
    );

    // Filter by star rating
    if (filters.starRating.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.starRating.includes(Math.floor(hotel.star_rating))
      );
    }

    // Sort
    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.avg_price_per_night - b.avg_price_per_night);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.avg_price_per_night - a.avg_price_per_night);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
        break;
      case 'recommended':
      default:
        break;
    }

    setFilteredHotels(filtered);
  };

  const handleSearch = (params: any) => {
    setSearchData(params); // Lưu lại search params
    
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

  const toggleStarRating = (star: number) => {
    const newRatings = filters.starRating.includes(star)
      ? filters.starRating.filter(s => s !== star)
      : [...filters.starRating, star];
    setFilters({ ...filters, starRating: newRatings });
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
          <div className="flex items-center justify-between mb-6">
            <div>
              {isLoading ? (
                <h1 className="text-2xl font-bold text-gray-600">Đang tìm kiếm...</h1>
              ) : error ? (
                <>
                  <h1 className="text-2xl font-bold text-red-600">Lỗi tìm kiếm</h1>
                  <p className="text-red-600">{error}</p>
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-bold text-black">
                    Tìm thấy {filteredHotels.length} khách sạn
                  </h1>
                  <p className="text-gray-600">
                    Khách sạn tốt nhất với mức giá phù hợp
                  </p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <SlidersHorizontal className="w-5 h-5 text-black" />
              <span className="text-black font-medium">Bộ lọc</span>
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-center">
                <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
                <p className="text-gray-600">Đang tải khách sạn...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Filters Sidebar */}
              <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
                <div className="bg-white rounded-lg p-6 shadow-md sticky top-20">
                  <h3 className="text-lg font-bold text-black mb-4">Bộ lọc</h3>

                  <div className="mb-6">
                    <h4 className="font-medium text-black mb-3">Khoảng giá (VNĐ)</h4>
                    <input
                      type="range"
                      min="0"
                      max="5000000"
                      step="100000"
                      value={filters.priceRange[1]}
                      onChange={(e) => {
                        setFilters({
                          ...filters,
                          priceRange: [0, parseInt(e.target.value)]
                        });
                      }}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                      <span>0đ</span>
                      <span>{new Intl.NumberFormat('vi-VN').format(filters.priceRange[1])}đ</span>
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-black mb-3">Hạng sao</h4>
                    <div className="space-y-2">
                      {[5, 4, 3].map((star) => (
                        <label key={star} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={filters.starRating.includes(star)}
                            onChange={() => toggleStarRating(star)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <span className="text-gray-700">{star} sao</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="mb-6">
                    <h4 className="font-medium text-black mb-3">Sắp xếp theo</h4>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
                    >
                      <option value="recommended">Đề xuất</option>
                      <option value="price_low">Giá thấp đến cao</option>
                      <option value="price_high">Giá cao đến thấp</option>
                      <option value="rating">Đánh giá cao nhất</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Hotels Grid */}
              <div className="lg:col-span-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHotels.map((hotel) => (
                    <div key={hotel.hotel_id} className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-gray-200">
                        <img
                          src={hotel.main_image || 'https://via.placeholder.com/300x200'}
                          alt={hotel.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 flex items-center gap-1">
                          <span className="font-bold text-sm">⭐ {hotel.star_rating}</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-black mb-2 line-clamp-2">{hotel.name}</h3>
                        <p className="text-sm text-gray-600 mb-3">
                          📍 {hotel.district && `${hotel.district}, `}{hotel.city}
                        </p>
                        <p className="text-sm text-gray-700 mb-3">
                          👥 {hotel.room_name} - Chứa {hotel.capacity} người
                        </p>
                        <div className="flex justify-between items-end pt-3 border-t border-gray-200">
                          <div>
                            <span className="text-xs text-gray-600">Giá từ</span>
                            <div className="text-2xl font-bold text-blue-600">
                              {new Intl.NumberFormat('vi-VN').format(hotel.avg_price_per_night)}đ
                            </div>
                            <span className="text-xs text-gray-600">/đêm</span>
                          </div>
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                            Chi tiết
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredHotels.length === 0 && !isLoading && (
                  <div className="text-center py-12">
                    <p className="text-gray-600 text-lg">
                      Không tìm thấy khách sạn phù hợp. Vui lòng thử lại với các tiêu chí khác.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
