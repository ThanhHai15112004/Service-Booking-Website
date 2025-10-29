import { X, Bed, CreditCard, Calendar, Coffee, Eye, Ban } from 'lucide-react';
import { RoomFiltersState, FilterCounts } from '../../types';

interface FilterOption {
  key: keyof RoomFiltersState;
  label: string;
  icon: React.ReactNode;
}

interface RoomFiltersProps {
  filters: RoomFiltersState;
  filterCounts?: Partial<FilterCounts>;
  onFilterChange: (filters: RoomFiltersState) => void;
  totalRooms?: number;
}

const filterOptions: FilterOption[] = [
  {
    key: 'noSmoking',
    label: 'Không hút thuốc',
    icon: <Ban className="w-4 h-4" />
  },
  {
    key: 'payLater',
    label: 'Thanh toán sau',
    icon: <CreditCard className="w-4 h-4" />
  },
  {
    key: 'freeCancellation',
    label: 'Hủy miễn phí',
    icon: <Calendar className="w-4 h-4" />
  },
  {
    key: 'breakfast',
    label: 'Bao gồm bữa sáng',
    icon: <Coffee className="w-4 h-4" />
  },
  {
    key: 'kingBed',
    label: 'Giường King',
    icon: <Bed className="w-4 h-4" />
  },
  {
    key: 'cityView',
    label: 'Nhìn ra thành phố',
    icon: <Eye className="w-4 h-4" />
  },
  {
    key: 'noCreditCard',
    label: 'Không cần thẻ tín dụng',
    icon: <CreditCard className="w-4 h-4" />
  }
];

export default function RoomFilters({ 
  filters, 
  filterCounts = {},
  onFilterChange,
  totalRooms = 0
}: RoomFiltersProps) {
  const toggleFilter = (key: keyof RoomFiltersState) => {
    onFilterChange({
      ...filters,
      [key]: !filters[key]
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: RoomFiltersState = {
      noSmoking: false,
      payLater: false,
      freeCancellation: false,
      breakfast: false,
      kingBed: false,
      cityView: false,
      noCreditCard: false
    };
    onFilterChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters).some(v => v);
  const activeFilterCount = Object.values(filters).filter(v => v).length;

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
      <div className="flex flex-wrap gap-2">
        {filterOptions.map(option => {
          const count = filterCounts[option.key];
          const isActive = filters[option.key];
          const isDisabled = count === 0;

          return (
            <button
              key={option.key}
              onClick={() => !isDisabled && toggleFilter(option.key)}
              disabled={isDisabled}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
                border transition-all duration-200 text-xs
                ${isActive
                  ? 'text-white border-blue-600 shadow-sm'
                  : isDisabled
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500 hover:bg-blue-50'
                }
              `}
              style={isActive ? { backgroundColor: '#2067da', borderColor: '#2067da' } : undefined}
            >
              <span className={isActive ? 'text-white' : isDisabled ? 'text-gray-400' : 'text-gray-600'}>
                {option.icon}
              </span>
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
    </div>
  );
}

