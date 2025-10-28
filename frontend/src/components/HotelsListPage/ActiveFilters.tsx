import { X, DollarSign, Star, Home, Wifi, Bed, CreditCard } from 'lucide-react';

interface ActiveFiltersProps {
  filters: {
    priceRange: number[];
    starRating: number[];
    categoryId?: string;
    facilities: string[];
    bedTypes: string[];
    policies: string[];
  };
  onClearFilter: (filterKey: string, value?: any) => void;
  onClearAll: () => void;
  categoryName?: string;
  facilityNames: Map<string, string>;
  bedTypeNames: Map<string, string>;
  policyNames: Map<string, string>;
}

export default function ActiveFilters({
  filters,
  onClearFilter,
  onClearAll,
  categoryName,
  facilityNames,
  bedTypeNames,
  policyNames
}: ActiveFiltersProps) {
  const hasActiveFilters = 
    filters.starRating.length > 0 ||
    filters.categoryId ||
    filters.facilities.length > 0 ||
    filters.bedTypes.length > 0 ||
    filters.policies.length > 0 ||
    filters.priceRange[1] < 10000000;

  if (!hasActiveFilters) return null;

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">Bộ lọc đang áp dụng:</h3>
        <button
          onClick={onClearAll}
          className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
        >
          Xóa tất cả
        </button>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {/* Price Range */}
        {filters.priceRange[1] < 10000000 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm border border-blue-200">
            <DollarSign className="w-4 h-4" />
            <span>Giá: {formatPrice(filters.priceRange[0])} - {formatPrice(filters.priceRange[1])}đ</span>
            <button
              onClick={() => onClearFilter('priceRange')}
              className="hover:bg-blue-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Star Rating */}
        {filters.starRating.map((star) => (
          <div key={star} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-full text-sm border border-yellow-200">
            <Star className="w-4 h-4 fill-current" />
            <span>{star} sao</span>
            <button
              onClick={() => onClearFilter('starRating', star)}
              className="hover:bg-yellow-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Category */}
        {filters.categoryId && categoryName && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-full text-sm border border-purple-200">
            <Home className="w-4 h-4" />
            <span>{categoryName}</span>
            <button
              onClick={() => onClearFilter('categoryId')}
              className="hover:bg-purple-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Facilities */}
        {filters.facilities.map((facilityId) => (
          <div key={facilityId} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-sm border border-green-200">
            <Wifi className="w-4 h-4" />
            <span>{facilityNames.get(facilityId) || facilityId}</span>
            <button
              onClick={() => onClearFilter('facilities', facilityId)}
              className="hover:bg-green-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Bed Types */}
        {filters.bedTypes.map((bedType) => (
          <div key={bedType} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm border border-indigo-200">
            <Bed className="w-4 h-4" />
            <span>{bedTypeNames.get(bedType) || bedType}</span>
            <button
              onClick={() => onClearFilter('bedTypes', bedType)}
              className="hover:bg-indigo-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {/* Policies */}
        {filters.policies.map((policy) => (
          <div key={policy} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 rounded-full text-sm border border-pink-200">
            <CreditCard className="w-4 h-4" />
            <span>{policyNames.get(policy) || policy}</span>
            <button
              onClick={() => onClearFilter('policies', policy)}
              className="hover:bg-pink-100 rounded-full p-0.5 ml-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

