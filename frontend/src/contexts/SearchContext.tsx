import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Interface cho search parameters
export interface SearchParams {
  destination: string;        // Location ID hoặc tên địa điểm
  destinationName?: string;   // Tên hiển thị của địa điểm
  checkIn: string;            // YYYY-MM-DD
  checkOut: string;           // YYYY-MM-DD
  rooms: number;              // Số phòng
  adults: number;             // Số người lớn
  children: number;           // Số trẻ em
  childAges: number[];        // Tuổi của từng trẻ em
  los: number;                // Length of stay (số đêm)
}

interface SearchContextType {
  searchParams: SearchParams;
  updateSearchParams: (params: Partial<SearchParams>) => void;
  clearSearchParams: () => void;
  hasSearchParams: boolean;
}

// Default search params
const getDefaultSearchParams = (): SearchParams => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  return {
    destination: '',
    destinationName: '',
    checkIn: formatDate(tomorrow),
    checkOut: formatDate(dayAfterTomorrow),
    rooms: 1,
    adults: 2,
    children: 0,
    childAges: [],
    los: 1
  };
};

// Helper function để format date thành YYYY-MM-DD
const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper function để tính số đêm
const calculateLOS = (checkIn: string, checkOut: string): number => {
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  } catch (error) {
    return 1;
  }
};

// Helper function để validate dates
const validateDates = (checkIn: string, checkOut: string): boolean => {
  try {
    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check-in phải từ hôm nay trở đi
    if (checkInDate < today) {
      return false;
    }

    // Check-out phải sau check-in
    if (checkOutDate <= checkInDate) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
};

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [searchParams, setSearchParams] = useState<SearchParams>(() => {
    // ✅ FIX: KHÔNG LOAD từ localStorage nữa
    // Luôn khởi tạo với default params
    return getDefaultSearchParams();
  });

  // ✅ FIX: KHÔNG TỰ ĐỘNG LƯU vào localStorage nữa
  // Params chỉ tồn tại trong memory, không persist qua reload
  // useEffect(() => {
  //   localStorage.setItem('searchParams', JSON.stringify(searchParams));
  // }, [searchParams]);

  // Update search params (partial update)
  const updateSearchParams = (params: Partial<SearchParams>) => {
    setSearchParams(prev => {
      const updated = { ...prev, ...params };

      // Tự động tính lại LOS nếu checkIn hoặc checkOut thay đổi
      if (params.checkIn || params.checkOut) {
        updated.los = calculateLOS(updated.checkIn, updated.checkOut);
      }

      // Tự động điều chỉnh childAges array nếu children thay đổi
      if (params.children !== undefined) {
        if (params.children > updated.childAges.length) {
          // Thêm age mặc định (5 tuổi) cho trẻ em mới
          const newAges = [...updated.childAges];
          while (newAges.length < params.children) {
            newAges.push(5);
          }
          updated.childAges = newAges;
        } else if (params.children < updated.childAges.length) {
          // Xóa bớt ages
          updated.childAges = updated.childAges.slice(0, params.children);
        }
      }

      return updated;
    });
  };

  // Clear search params về default
  const clearSearchParams = () => {
    setSearchParams(getDefaultSearchParams());
    localStorage.removeItem('searchParams');
  };

  // Check xem có search params hay chưa
  const hasSearchParams = searchParams.destination !== '';

  const value: SearchContextType = {
    searchParams,
    updateSearchParams,
    clearSearchParams,
    hasSearchParams
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

// Custom hook để sử dụng SearchContext
export const useSearch = (): SearchContextType => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

// Export helper functions để sử dụng ở nơi khác
export { formatDate, calculateLOS, validateDates };

