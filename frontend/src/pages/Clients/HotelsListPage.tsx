import { useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import SearchBar from '../../components/Search';
import HotelCard from '../../components/HotelCard';
import { mockHotels } from '../../data/mockData';
import { SearchParams } from '../../types';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';

export default function HotelsListPage() {
  const [hotels, setHotels] = useState(mockHotels);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: [0, 5000000],
    starRating: [] as number[],
    sortBy: 'recommended'
  });

  const handleSearch = (params: SearchParams) => {
    let filtered = [...mockHotels];

    if (params.destination) {
      filtered = filtered.filter(hotel =>
        hotel.city.toLowerCase().includes(params.destination.toLowerCase()) ||
        hotel.name.toLowerCase().includes(params.destination.toLowerCase())
      );
    }

    setHotels(filtered);
  };

  const handleFilterChange = () => {
    let filtered = [...mockHotels];

    filtered = filtered.filter(
      hotel => hotel.price_per_night >= filters.priceRange[0] &&
               hotel.price_per_night <= filters.priceRange[1]
    );

    if (filters.starRating.length > 0) {
      filtered = filtered.filter(hotel =>
        filters.starRating.includes(hotel.star_rating)
      );
    }

    switch (filters.sortBy) {
      case 'price_low':
        filtered.sort((a, b) => a.price_per_night - b.price_per_night);
        break;
      case 'price_high':
        filtered.sort((a, b) => b.price_per_night - a.price_per_night);
        break;
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
    }

    setHotels(filtered);
  };

  const toggleStarRating = (star: number) => {
    const newRatings = filters.starRating.includes(star)
      ? filters.starRating.filter(s => s !== star)
      : [...filters.starRating, star];
    setFilters({ ...filters, starRating: newRatings });
  };

  return (
    <MainLayout>
      <div className="bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-black">
              Tìm thấy {hotels.length} khách sạn
            </h1>
            <p className="text-gray-600">
              Khách sạn tốt nhất với mức giá phù hợp
            </p>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5 text-black" />
            <span className="text-black font-medium">Bộ lọc</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg p-6 shadow-md sticky top-20">
              <h3 className="text-lg font-bold text-black mb-4">Bộ lọc</h3>

              <div className="mb-6">
                <h4 className="font-medium text-black mb-3">Khoảng giá (VNĐ)</h4>
                <div className="space-y-2">
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
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>0đ</span>
                    <span>{new Intl.NumberFormat('vi-VN').format(filters.priceRange[1])}đ</span>
                  </div>
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
                <div className="relative">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black appearance-none text-black"
                  >
                    <option value="recommended">Đề xuất</option>
                    <option value="price_low">Giá thấp đến cao</option>
                    <option value="price_high">Giá cao đến thấp</option>
                    <option value="rating">Đánh giá cao nhất</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <button
                onClick={handleFilterChange}
                className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {hotels.map((hotel) => (
                <HotelCard
                  key={hotel.id}
                  hotel={hotel}
                />
              ))}
            </div>

            {hotels.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">
                  Không tìm thấy khách sạn phù hợp. Vui lòng thử lại với các tiêu chí khác.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
    </MainLayout>
  );
}
