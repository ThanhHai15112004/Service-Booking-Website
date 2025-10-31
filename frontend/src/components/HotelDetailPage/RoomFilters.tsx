import { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { RoomFiltersState, FilterCounts } from '../../types';
import { Facility, Policy } from '../../services/filterService';

interface FilterOption {
  key: string;
  label: string;
  icon?: string;
  type: 'facility' | 'policy';
}

interface RoomFiltersProps {
  filters: RoomFiltersState;
  filterCounts?: Partial<FilterCounts>;
  onFilterChange: (filters: RoomFiltersState) => void;
  totalRooms?: number;
  // ✅ NEW: Nhận filters từ backend
  roomFacilities?: Facility[];
  policies?: Policy[];
}

export default function RoomFilters({ 
  filters, 
  filterCounts = {},
  onFilterChange,
  totalRooms = 0,
  roomFacilities = [],
  policies = []
}: RoomFiltersProps) {
  const [showAllFilters, setShowAllFilters] = useState(false);

  // ✅ Build filterOptions từ backend data
  const allFilterOptions: FilterOption[] = [
    // Facilities từ backend
    ...roomFacilities.map(facility => ({
      key: facility.facilityId,
      label: facility.name,
      icon: facility.icon,
      type: 'facility' as const
    })),
    // Policies từ backend
    ...policies.map(policy => ({
      key: policy.key,
      label: policy.label,
      icon: policy.icon,
      type: 'policy' as const
    }))
  ];

  // ✅ Sắp xếp: Filters có room (count > 0) ở đầu
  const sortedFilterOptions = [...allFilterOptions].sort((a, b) => {
    const countA = filterCounts[a.key] || 0;
    const countB = filterCounts[b.key] || 0;
    
    // Nếu cả 2 đều có count > 0 hoặc cả 2 đều = 0 → giữ nguyên thứ tự
    if ((countA > 0 && countB > 0) || (countA === 0 && countB === 0)) {
      return 0;
    }
    
    // countA > 0 và countB = 0 → a lên trước
    if (countA > 0) return -1;
    // countA = 0 và countB > 0 → b lên trước
    return 1;
  });

  // ✅ Giới hạn hiển thị 14 filters ban đầu
  const displayLimit = 14;
  const hasMore = sortedFilterOptions.length > displayLimit;
  const filterOptions = showAllFilters 
    ? sortedFilterOptions 
    : sortedFilterOptions.slice(0, displayLimit);

  const toggleFilter = (key: string) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: RoomFiltersState = {};
    // Clear tất cả filters hiện tại
    Object.keys(filters).forEach(key => {
      clearedFilters[key] = false;
    });
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v === true);
  const activeFilterCount = Object.values(filters).filter(v => v === true).length;

  return (
    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">
          Lọc phòng
          {totalRooms > 0 && (
            <span className="ml-2 text-xs font-normal text-gray-600">
              ({totalRooms} phòng)
            </span>
          )}
        </h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="flex items-center gap-1 text-xs hover:underline"
            style={{ color: '#2067da' }}
          >
            <X className="w-3 h-3" />
            Xóa bộ lọc ({activeFilterCount})
          </button>
        )}
      </div>

      {/* Filter Chips */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => {
            const count = filterCounts[option.key];
            const isActive = filters[option.key] === true;
            // ✅ FIX: KHÔNG disable bất kỳ filter nào - cho phép click tất cả

            return (
              <button
                key={option.key}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toggleFilter(option.key);
                }}
                className={`
                  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                  border transition-all duration-200 text-xs cursor-pointer
                  ${isActive
                    ? 'text-white border-blue-600 shadow-sm'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                  }
                `}
                style={isActive ? { backgroundColor: '#2067da', borderColor: '#2067da' } : undefined}
              >
                {option.icon ? (
                  <img 
                    src={option.icon} 
                    alt={option.label}
                    className="w-4 h-4 object-contain opacity-100"
                  />
                ) : null}
                <span className="font-medium">
                  {option.label}
                </span>
                {count !== undefined && count > 0 && (
                  <span className={`
                    text-xs px-1.5 py-0.5 rounded-full
                    ${isActive 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700'
                    }
                  `}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ✅ Nút "Xem thêm"/"Thu gọn" */}
        {hasMore && (
          <button
            onClick={() => setShowAllFilters(!showAllFilters)}
            className="flex items-center justify-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium py-2 hover:bg-blue-50 rounded transition-colors w-full"
          >
            {showAllFilters ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Xem thêm
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

