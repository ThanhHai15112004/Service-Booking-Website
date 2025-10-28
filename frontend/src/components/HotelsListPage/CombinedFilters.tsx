import React, { useState, useRef, useEffect } from 'react';
import { X, Star, DollarSign, Wifi, Coffee, MapPin, MoreHorizontal, DollarSign as Money, Home, Bed, CreditCard, Navigation } from 'lucide-react';

interface CombinedFiltersProps {
  // Active filters
  filters: {
    priceRange: number[];
    starRating: number[];
    categoryId: string[];
    facilities: string[];
    bedTypes: string[];
    policies: string[];
  };
  onClearFilter: (filterKey: string, value?: any) => void;
  onClearAll: () => void;
  categoryNames: Map<string, string>;
  facilityNames: Map<string, string>;
  bedTypeNames: Map<string, string>;
  policyNames: Map<string, string>;
  // Suggestions
  onApplySuggestion: (type: string, value: any) => void;
  fullFilterData: {
    facilities: Array<{ facilityId: string; name: string; category: string; icon?: string }>;
    categories: Array<{ categoryId: string; name: string; icon?: string }>;
  };
}

export default function CombinedFilters({
  filters,
  onClearFilter,
  onClearAll,
  categoryNames,
  facilityNames,
  bedTypeNames,
  policyNames,
  onApplySuggestion,
  fullFilterData
}: CombinedFiltersProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const containerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const formatPrice = (value: number): string => {
    return new Intl.NumberFormat('vi-VN').format(value);
  };

  const hasActiveFilters = 
    filters.starRating.length > 0 ||
    filters.categoryId.length > 0 ||
    filters.facilities.length > 0 ||
    filters.bedTypes.length > 0 ||
    filters.policies.length > 0 ||
    filters.priceRange[1] < 10000000;

  // Active filter chips
  const activeChips: Array<{ type: string; label: string; icon: React.ReactElement; color: string; onRemove: () => void }> = [];

  // Price Range
  if (filters.priceRange[1] < 10000000) {
    activeChips.push({
      type: 'active',
      label: `Giá: ${formatPrice(filters.priceRange[0])} - ${formatPrice(filters.priceRange[1])}đ`,
      icon: <Money className="w-4 h-4" />,
      color: 'bg-blue-100 border-blue-300 text-blue-800',
      onRemove: () => onClearFilter('priceRange')
    });
  }

  // Star Rating
  filters.starRating.forEach((star) => {
    activeChips.push({
      type: 'active',
      label: `${star} sao`,
      icon: <Star className="w-4 h-4 fill-current" />,
      color: 'bg-yellow-100 border-yellow-300 text-yellow-800',
      onRemove: () => onClearFilter('starRating', star)
    });
  });

  // Categories
  filters.categoryId.forEach((catId) => {
    activeChips.push({
      type: 'active',
      label: categoryNames.get(catId) || catId,
      icon: <Home className="w-4 h-4" />,
      color: 'bg-purple-100 border-purple-300 text-purple-800',
      onRemove: () => onClearFilter('categoryId', catId)
    });
  });

  // Facilities
  filters.facilities.forEach((facilityId) => {
    activeChips.push({
      type: 'active',
      label: facilityNames.get(facilityId) || facilityId,
      icon: <Wifi className="w-4 h-4" />,
      color: 'bg-green-100 border-green-300 text-green-800',
      onRemove: () => onClearFilter('facilities', facilityId)
    });
  });

  // Bed Types
  filters.bedTypes.forEach((bedType) => {
    activeChips.push({
      type: 'active',
      label: bedTypeNames.get(bedType) || bedType,
      icon: <Bed className="w-4 h-4" />,
      color: 'bg-indigo-100 border-indigo-300 text-indigo-800',
      onRemove: () => onClearFilter('bedTypes', bedType)
    });
  });

  // Policies
  filters.policies.forEach((policy) => {
    activeChips.push({
      type: 'active',
      label: policyNames.get(policy) || policy,
      icon: <CreditCard className="w-4 h-4" />,
      color: 'bg-pink-100 border-pink-300 text-pink-800',
      onRemove: () => onClearFilter('policies', policy)
    });
  });

  // Suggestion chips (only show those not already active)
  const suggestionChips: Array<{ type: string; label: string; icon: React.ReactElement; color: string; onClick: () => void }> = [];

  // Find facility IDs dynamically
  const wifiFacility = fullFilterData.facilities.find(f => 
    f.name.toLowerCase().includes('wifi') || f.name.toLowerCase().includes('wi-fi')
  );
  const breakfastFacility = fullFilterData.facilities.find(f => 
    f.name.toLowerCase().includes('sáng') || f.name.toLowerCase().includes('breakfast')
  );
  const poolFacility = fullFilterData.facilities.find(f => 
    f.name.toLowerCase().includes('bể bơi') || f.name.toLowerCase().includes('pool')
  );
  const parkingFacility = fullFilterData.facilities.find(f => 
    f.name.toLowerCase().includes('đỗ xe') || f.name.toLowerCase().includes('parking')
  );

  // Only add suggestions that are not active
  // Only show star suggestions if no star filter is applied
  if (filters.starRating.length === 0) {
    suggestionChips.push({
      type: 'suggestion',
      label: '5 sao',
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
      onClick: () => onApplySuggestion('starRating', 5)
    });

    suggestionChips.push({
      type: 'suggestion',
      label: '4 sao trở lên',
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100',
      onClick: () => onApplySuggestion('starRating', 4)
    });
  }

  // Only show price suggestions if price filter is not applied (still at default)
  if (filters.priceRange[1] >= 10000000) {
    suggestionChips.push({
      type: 'suggestion',
      label: 'Dưới 2 triệu',
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      onClick: () => onApplySuggestion('priceRange', [0, 2000000])
    });

    suggestionChips.push({
      type: 'suggestion',
      label: 'Dưới 1 triệu',
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      onClick: () => onApplySuggestion('priceRange', [0, 1000000])
    });
  }

  // Wifi facility suggestion
  if (wifiFacility && !filters.facilities.includes(wifiFacility.facilityId)) {
    suggestionChips.push({
      type: 'suggestion',
      label: wifiFacility.name,
      icon: <Wifi className="w-4 h-4 text-green-500" />,
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      onClick: () => onApplySuggestion('facility', wifiFacility.facilityId)
    });
  }

  // Breakfast facility suggestion
  if (breakfastFacility && !filters.facilities.includes(breakfastFacility.facilityId)) {
    suggestionChips.push({
      type: 'suggestion',
      label: breakfastFacility.name,
      icon: <Coffee className="w-4 h-4 text-purple-500" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
      onClick: () => onApplySuggestion('facility', breakfastFacility.facilityId)
    });
  }

  // Pool facility suggestion
  if (poolFacility && !filters.facilities.includes(poolFacility.facilityId)) {
    suggestionChips.push({
      type: 'suggestion',
      label: poolFacility.name,
      icon: <Navigation className="w-4 h-4 text-cyan-500" />,
      color: 'bg-cyan-50 border-cyan-200 text-cyan-700 hover:bg-cyan-100',
      onClick: () => onApplySuggestion('facility', poolFacility.facilityId)
    });
  }

  // Parking facility suggestion
  if (parkingFacility && !filters.facilities.includes(parkingFacility.facilityId)) {
    suggestionChips.push({
      type: 'suggestion',
      label: parkingFacility.name,
      icon: <MapPin className="w-4 h-4 text-orange-500" />,
      color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
      onClick: () => onApplySuggestion('facility', parkingFacility.facilityId)
    });
  }

  // Policy suggestions
  if (!filters.policies.includes('free_cancellation')) {
    suggestionChips.push({
      type: 'suggestion',
      label: 'Miễn phí hủy',
      icon: <CreditCard className="w-4 h-4 text-green-500" />,
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      onClick: () => onApplySuggestion('policy', 'free_cancellation')
    });
  }

  if (!filters.policies.includes('pay_later')) {
    suggestionChips.push({
      type: 'suggestion',
      label: 'Thanh toán sau',
      icon: <CreditCard className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      onClick: () => onApplySuggestion('policy', 'pay_later')
    });
  }

  // Combine active and suggestion chips
  const allChips = [...activeChips, ...suggestionChips];
  const visibleChips = allChips.slice(0, visibleCount);
  const hiddenChips = allChips.slice(visibleCount);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  // Calculate visible count based on container width (approximately 2 rows)
  useEffect(() => {
    const calculateVisibleCount = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        // Rough estimate: ~150px per chip, 2 rows
        const chipsPerRow = Math.floor(containerWidth / 150);
        const twoRows = chipsPerRow * 2;
        setVisibleCount(Math.max(6, twoRows - 1)); // -1 for the "..." button
      }
    };

    calculateVisibleCount();
    window.addEventListener('resize', calculateVisibleCount);
    return () => window.removeEventListener('resize', calculateVisibleCount);
  }, [allChips.length]);

  const title = hasActiveFilters ? 'Bộ lọc đang áp dụng:' : 'Gợi ý bộ lọc phổ biến:';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium hover:underline"
          >
            Xóa tất cả
          </button>
        )}
      </div>
      
      <div ref={containerRef} className="flex flex-wrap gap-2 relative">
        {visibleChips.map((chip, index) => {
          if ('onRemove' in chip) {
            // Active chip
            return (
              <div
                key={`${chip.type}-${index}`}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${chip.color}`}
              >
                {chip.icon}
                <span>{chip.label}</span>
                <button
                  onClick={chip.onRemove}
                  className="hover:bg-black/10 rounded-full p-0.5 ml-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          } else {
            // Suggestion chip
            return (
              <button
                key={`${chip.type}-${index}`}
                onClick={chip.onClick}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${chip.color}`}
              >
                {chip.icon}
                <span>{chip.label}</span>
              </button>
            );
          }
        })}

        {hiddenChips.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-full text-sm border border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
              <span>+{hiddenChips.length}</span>
            </button>

            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-50 min-w-[200px] max-w-[300px]">
                <div className="flex flex-col gap-1">
                  {hiddenChips.map((chip, index) => {
                    if ('onRemove' in chip) {
                      return (
                        <div
                          key={`hidden-${chip.type}-${index}`}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${chip.color}`}
                        >
                          {chip.icon}
                          <span className="flex-1">{chip.label}</span>
                          <button
                            onClick={() => {
                              chip.onRemove();
                              setShowDropdown(false);
                            }}
                            className="hover:bg-black/10 rounded-full p-0.5"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    } else {
                      return (
                        <button
                          key={`hidden-${chip.type}-${index}`}
                          onClick={() => {
                            chip.onClick();
                            setShowDropdown(false);
                          }}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${chip.color}`}
                        >
                          {chip.icon}
                          <span>{chip.label}</span>
                        </button>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

