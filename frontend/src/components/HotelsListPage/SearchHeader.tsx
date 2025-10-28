import { SlidersHorizontal, AlertCircle, Loader2, Star, TrendingUp, DollarSign, MapPin, Zap, Award } from 'lucide-react';

interface SearchHeaderProps {
  resultsCount: number;
  isLoading: boolean;
  error: string | null;
  showFilters?: boolean;
  onToggleFilters: () => void;
  sortBy: string;
  onSortChange: (value: string) => void;
  activeFiltersCount?: number;
}

export default function SearchHeader({
  resultsCount,
  isLoading,
  error,
  showFilters,
  onToggleFilters,
  sortBy,
  onSortChange,
  activeFiltersCount = 0
}: SearchHeaderProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        {/* Left: Results count */}
        <div className="flex-1 min-w-[200px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <div>
                <h2 className="text-lg font-bold text-gray-700">Đang tìm kiếm...</h2>
                <p className="text-sm text-gray-500">Vui lòng đợi</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <div>
                <h2 className="text-sm font-bold text-red-600">Lỗi tìm kiếm</h2>
                <p className="text-xs text-red-600">{error}</p>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {resultsCount} khách sạn
              </h2>
              <p className="text-sm text-gray-600">
                Tìm thấy kết quả phù hợp
              </p>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          {/* Filter button with badge */}
          <button
            onClick={onToggleFilters}
            className={`relative flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
              showFilters 
                ? 'bg-blue-500 text-white border-blue-500 hover:bg-blue-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            } lg:hidden`}
            title={`${activeFiltersCount} bộ lọc đang áp dụng`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-sm font-medium">Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Sort buttons row - Agoda style */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium mr-2">Sắp xếp theo:</span>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSortChange('recommended')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'recommended'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Star className="w-4 h-4" />
              Phù hợp nhất
            </button>

            <button
              onClick={() => onSortChange('rating_desc')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'rating_desc'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Award className="w-4 h-4" />
              Được đánh giá nhiều nhất
            </button>

            <button
              onClick={() => onSortChange('price_asc')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price_asc'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              Giá thấp nhất trước
            </button>

            <button
              onClick={() => onSortChange('distance_asc')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'distance_asc'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Khoảng cách
            </button>

            <button
              onClick={() => onSortChange('star_desc')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'star_desc'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              Hạng sao cao nhất
            </button>

            <button
              onClick={() => onSortChange('price_desc')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                sortBy === 'price_desc'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Zap className="w-4 h-4" />
              Ưu đãi nóng hổi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

