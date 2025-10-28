import { useState, useEffect } from 'react';
import { getCategories, getFacilities, getBedTypes, getPolicies, Category, Facility, BedType, Policy } from '../../services/filterService';
import { Search, MapPin, DollarSign, Award } from 'lucide-react';

interface Filters {
  priceRange: number[];
  starRating: number[];
  sortBy: string;
  categoryId: string[];
  facilities: string[];
  bedTypes: string[];
  policies: string[];
  maxDistance?: number;
  minRating?: number;
}

interface FilterSidebarProps {
  filters: Filters;
  showFilters: boolean;
  onFiltersChange: (filters: Filters) => void;
  onToggleStarRating: (star: number) => void;
}

export default function FilterSidebar({
  filters,
  showFilters,
  onFiltersChange,
  onToggleStarRating
}: FilterSidebarProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [bedTypes, setBedTypes] = useState<BedType[]>([]);
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);

  useEffect(() => {
    const fetchFilters = async () => {
      const [cats, facs, beds, pols] = await Promise.all([
        getCategories(),
        getFacilities(),
        getBedTypes(),
        getPolicies()
      ]);
      setCategories(cats);
      setFacilities(facs);
      setBedTypes(beds);
      setPolicies(pols);
    };
    fetchFilters();
  }, []);

  useEffect(() => {
    setMinPrice(filters.priceRange[0]);
    setMaxPrice(filters.priceRange[1]);
  }, [filters.priceRange]);

  const toggleArrayFilter = (key: 'facilities' | 'bedTypes' | 'policies', value: string) => {
    const currentArray = filters[key] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    onFiltersChange({ ...filters, [key]: newArray });
  };

  const handlePriceChange = () => {
    onFiltersChange({ ...filters, priceRange: [minPrice, maxPrice] });
  };

  const formatPrice = (value: number): string => {
    if (value === 0) return '0';
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const hotelFacilities = facilities.filter(f => f.category === 'HOTEL');
  const roomFacilities = facilities.filter(f => f.category === 'ROOM');

  return (
    <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Search Box */}
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm văn bản"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
        {/* Price Range */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-4 text-sm">Giá mỗi đêm</h4>
          
          <div className="mb-4">
            <input
              type="range"
              min="0"
              max="10000000"
              step="100000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              onMouseUp={handlePriceChange}
              onTouchEnd={handlePriceChange}
              className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 text-sm">
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">TỐI THIỂU</label>
              <div className="relative">
                <input
                  type="text"
                  value={formatPrice(minPrice)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, '').replace(/đ/g, '');
                    setMinPrice(parseInt(value) || 0);
                  }}
                  onBlur={handlePriceChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="text-gray-400 mt-5">-</div>
            <div className="flex-1">
              <label className="block text-xs text-gray-600 mb-1">TỐI ĐA</label>
              <div className="relative">
                <input
                  type="text"
                  value={formatPrice(maxPrice)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\./g, '').replace(/đ/g, '');
                    setMaxPrice(parseInt(value) || 0);
                  }}
                  onBlur={handlePriceChange}
                  className="w-full px-2 py-1 border border-gray-300 rounded text-center text-sm focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Star Rating */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm">Xếp hạng sao</h4>
          <div className="space-y-2">
            {[5, 4, 3, 2, 1].map((star) => (
              <label key={star} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="checkbox"
                  checked={filters.starRating.includes(star)}
                  onChange={() => onToggleStarRating(star)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex items-center gap-1 text-sm">
                  {[...Array(star)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-base">★</span>
                  ))}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Guest Rating */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <Award className="w-4 h-4 text-blue-500" />
            Đánh giá của khách
          </h4>
          <div className="space-y-2">
            {[
              { value: 9, label: 'Tuyệt vời: 9+' },
              { value: 8, label: 'Rất tốt: 8+' },
              { value: 7, label: 'Tốt: 7+' },
              { value: 6, label: 'Khá: 6+' }
            ].map((rating) => (
              <label key={rating.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="guestRating"
                  checked={filters.minRating === rating.value}
                  onChange={() => onFiltersChange({ ...filters, minRating: rating.value })}
                  className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{rating.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="guestRating"
                checked={!filters.minRating}
                onChange={() => onFiltersChange({ ...filters, minRating: undefined })}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
          </div>
        </div>

        {/* Distance from Center */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            Khoảng cách từ trung tâm
          </h4>
          <div className="space-y-2">
            {[
              { value: 1, label: 'Dưới 1 km' },
              { value: 3, label: 'Dưới 3 km' },
              { value: 5, label: 'Dưới 5 km' },
              { value: 10, label: 'Dưới 10 km' }
            ].map((distance) => (
              <label key={distance.value} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                <input
                  type="radio"
                  name="distance"
                  checked={filters.maxDistance === distance.value}
                  onChange={() => onFiltersChange({ ...filters, maxDistance: distance.value })}
                  className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{distance.label}</span>
              </label>
            ))}
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
              <input
                type="radio"
                name="distance"
                checked={!filters.maxDistance}
                onChange={() => onFiltersChange({ ...filters, maxDistance: undefined })}
                className="w-4 h-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Tất cả</span>
            </label>
          </div>
        </div>

        {/* Quick Price Filters */}
        <div className="p-4 border-b border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            Khoảng giá phổ biến
          </h4>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => {
                setMinPrice(0);
                setMaxPrice(500000);
                onFiltersChange({ ...filters, priceRange: [0, 500000] });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.priceRange[1] === 500000
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Dưới 500k
            </button>
            <button
              onClick={() => {
                setMinPrice(500000);
                setMaxPrice(1000000);
                onFiltersChange({ ...filters, priceRange: [500000, 1000000] });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.priceRange[0] === 500000 && filters.priceRange[1] === 1000000
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              500k - 1tr
            </button>
            <button
              onClick={() => {
                setMinPrice(1000000);
                setMaxPrice(2000000);
                onFiltersChange({ ...filters, priceRange: [1000000, 2000000] });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.priceRange[0] === 1000000 && filters.priceRange[1] === 2000000
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              1tr - 2tr
            </button>
            <button
              onClick={() => {
                setMinPrice(2000000);
                setMaxPrice(5000000);
                onFiltersChange({ ...filters, priceRange: [2000000, 5000000] });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.priceRange[0] === 2000000 && filters.priceRange[1] === 5000000
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              2tr - 5tr
            </button>
            <button
              onClick={() => {
                setMinPrice(5000000);
                setMaxPrice(10000000);
                onFiltersChange({ ...filters, priceRange: [5000000, 10000000] });
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filters.priceRange[0] === 5000000
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Trên 5tr
            </button>
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Loại hình nơi ở</h4>
            <div className="space-y-2">
              {categories.map((cat) => (
                <label key={cat.categoryId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.categoryId.includes(cat.categoryId)}
                    onChange={() => {
                      const newCategoryId = filters.categoryId.includes(cat.categoryId)
                        ? filters.categoryId.filter(id => id !== cat.categoryId)
                        : [...filters.categoryId, cat.categoryId];
                      onFiltersChange({ ...filters, categoryId: newCategoryId });
                    }}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {cat.icon && <img src={cat.icon} alt="" className="w-5 h-5 object-contain" />}
                  <span className="text-sm text-gray-700">{cat.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Hotel Facilities */}
        {hotelFacilities.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Tiện nghi khách sạn</h4>
            <div className="space-y-2">
              {hotelFacilities.map((fac) => (
                <label key={fac.facilityId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.facilities?.includes(fac.facilityId) || false}
                    onChange={() => toggleArrayFilter('facilities', fac.facilityId)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {fac.icon && <img src={fac.icon} alt="" className="w-5 h-5 object-contain" />}
                  <span className="text-sm text-gray-700">{fac.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Room Facilities */}
        {roomFacilities.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Tiện nghi phòng</h4>
            <div className="space-y-2">
              {roomFacilities.map((fac) => (
                <label key={fac.facilityId} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.facilities?.includes(fac.facilityId) || false}
                    onChange={() => toggleArrayFilter('facilities', fac.facilityId)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  {fac.icon && <img src={fac.icon} alt="" className="w-5 h-5 object-contain" />}
                  <span className="text-sm text-gray-700">{fac.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Bed Types */}
        {bedTypes.length > 0 && (
          <div className="p-4 border-b border-gray-200">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Loại giường</h4>
            <div className="space-y-2">
              {bedTypes.map((bed) => (
                <label key={bed.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.bedTypes?.includes(bed.key) || false}
                    onChange={() => toggleArrayFilter('bedTypes', bed.key)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{bed.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Policies */}
        {policies.length > 0 && (
          <div className="p-4">
            <h4 className="font-semibold text-gray-900 mb-3 text-sm">Lựa chọn thanh toán</h4>
            <div className="space-y-2">
              {policies.map((policy) => (
                <label key={policy.key} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                  <input
                    type="checkbox"
                    checked={filters.policies?.includes(policy.key) || false}
                    onChange={() => toggleArrayFilter('policies', policy.key)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{policy.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
