import { useState, useEffect, useRef } from 'react';
import SearchTypeTabs from './SearchTypeTabs';
import SearchTab from './SearchTab';
import DateRangePicker, { FlexibleDate } from './DateRangePicker';
import RoomGuestPicker from './RoomGuestPicker';
import { Search, MapPin, Clock, Star, X } from 'lucide-react';
import { searchLocations, formatLocationDetail, Location } from '../../services/locationService';
import { searchHotels } from '../../services/hotelService';

interface MainSearchBarProps {
  onSearch: (params: any) => void;
}

export default function MainSearchBar({ onSearch }: MainSearchBarProps) {
  const [searchType, setSearchType] = useState('hotel');
  const [tab, setTab] = useState<'overnight' | 'dayuse'>('overnight');
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<string | FlexibleDate>('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);
  const [rooms, setRooms] = useState(1);
  const [children, setChildren] = useState(0);
  const [roomGuestOpen, setRoomGuestOpen] = useState(false);
  
  const [locations, setLocations] = useState<Location[]>([]);
  const [hotLocations, setHotLocations] = useState<Location[]>([]);
  const [recentSearches, setRecentSearches] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHotLocations = async () => {
      try {
        const result = await searchLocations('', 20); 
        if (result.success && result.items.length > 0) {
          setHotLocations(result.items);
        }
      } catch (error) {
        console.error('Lỗi load hot locations:', error);
      }
    };

    const loadRecents = () => {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        try {
          const recents = JSON.parse(stored);
          setRecentSearches(recents.slice(0, 5));
        } catch (error) {
          console.error('Lỗi load recents:', error);
        }
      }
    };

    loadHotLocations();
    loadRecents();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (destination.trim().length < 1) {
      setLocations([]);
      setIsUserTyping(false);
      return;
    }

    if (!isUserTyping) {
      return;
    }

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        let result = await searchLocations(destination, 10);
        
        if ((!result.success || result.items.length === 0) && destination.includes(',')) {
          const cityName = destination.split(',')[0].trim();
          if (cityName && cityName !== destination) {
            result = await searchLocations(cityName, 10);
          }
        }
        
        if (result.success && result.items.length > 0) {
          setLocations(result.items);
        } else {
          setLocations([]);
        }
      } catch (error) {
        console.error('Lỗi tìm kiếm địa điểm:', error);
        setLocations([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); 

    return () => {
      if (searchTimeout.current) clearTimeout(searchTimeout.current);
    };
  }, [destination, isUserTyping]);

  const handleSelectLocation = (location: Location) => {
    // Chỉ gửi city + district (không country) để backend search match được
    const displayName = [location.city, location.district].filter(Boolean).join(', ');
    setDestination(displayName);
    setSelectedLocation(location);
    setShowDropdown(false);
    setLocations([]);
    setIsUserTyping(false); 

    try {
      const stored = localStorage.getItem('recentSearches');
      let recents: Location[] = stored ? JSON.parse(stored) : [];
      
      recents = recents.filter(r => r.locationId !== location.locationId);
      recents.unshift(location);
      recents = recents.slice(0, 10);
      
      localStorage.setItem('recentSearches', JSON.stringify(recents));
      setRecentSearches(recents.slice(0, 5));
    } catch (error) {
      console.error('Lỗi save recent:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination || destination.trim().length === 0) {
      alert("Vui lòng chọn điểm đến.");
      return;
    }

    // Xử lý checkIn - nếu là flexible date thì lấy rỗng
    const ci = typeof checkIn === "object" && "flexible" in checkIn ? "" : (checkIn as string);

    if (!ci || ci.trim().length === 0) {
      alert("Vui lòng chọn ngày nhận phòng.");
      return;
    }

    // Xử lý checkOut
    let co = typeof checkOut === "object" ? "" : (checkOut as string);

    // Chỉ yêu cầu checkOut khi ở mode overnight
    if (tab === 'overnight') {
      if (!co || co.trim().length === 0) {
        alert("Vui lòng chọn ngày trả phòng.");
        return;
      }
    } else {
      // Mode dayuse: checkOut = checkIn
      co = ci;
    }

    if (!rooms || rooms < 1) {
      alert("Số phòng phải >= 1.");
      return;
    }

    if (!guests || guests < 1) {
      alert("Số người lớn phải >= 1.");
      return;
    }

    if (children < 0) {
      alert("Số trẻ em không hợp lệ.");
      return;
    }

    try {
      setIsLoadingSearch(true);
      
      const params = {
        destination,
        checkIn: ci,
        checkOut: co,
        guests,
        rooms,
        children,
        stayType: tab,
      };

      const res = await searchHotels(params);

      if (res.success) {
        console.log("✅ Kết quả tìm kiếm:", res);
        onSearch(params);
      } else {
        alert(res.message || "Không tìm thấy khách sạn phù hợp.");
      }
    } catch (error: any) {
      console.error("❌ Lỗi tìm kiếm:", error);
      alert("Có lỗi xảy ra khi tìm kiếm. Vui lòng thử lại.");
    } finally {
      setIsLoadingSearch(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 md:p-6 max-w-6xl mx-auto">
      <SearchTypeTabs value={searchType} onChange={setSearchType} />
      <SearchTab value={tab} onChange={setTab} />
      
      {tab === 'dayuse' && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg mb-4 bg-red-50 border border-red-200">
          <span className="text-red-600 text-xl">🏨</span>
          <div>
            <span className="text-red-600 font-semibold">Chỗ Ở Trong Ngày</span>
            <span className="text-gray-700 text-sm ml-1">
              là phòng cho thuê không đắt, 4-12 tiếng mà không phải qua đêm. Quý khách sẽ nhận phòng và trả phòng vào cùng một ngày.
            </span>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3 md:gap-4">
        <div className="relative" ref={dropdownRef}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            className="w-full pl-12 pr-12 py-2.5 md:py-3.5 text-sm md:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Nhập điểm đến (ví dụ: Vũng Tàu, Đà Nẵng...)"
            value={destination}
            onChange={e => {
              setDestination(e.target.value);
              setIsUserTyping(true);
            }}
            onFocus={() => {
              setShowDropdown(true);
              if (selectedLocation) {
                setIsUserTyping(false);
              }
            }}
            autoComplete="off"
          />
          
          {destination && (
            <button
              type="button"
              onClick={() => {
                setDestination('');
                setSelectedLocation(null);
                setLocations([]);
                setShowDropdown(false);
                setIsUserTyping(false);
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {isUserTyping && destination.trim().length > 0 ? (
                locations.length > 0 ? (
                  <div className="py-2">
                    {locations.map((location) => (
                      <button
                        key={location.locationId}
                        type="button"
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors focus:outline-none focus:bg-blue-100 flex items-center gap-3 group"
                        onClick={() => handleSelectLocation(location)}
                      >
                        <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {[location.city, location.district].filter(Boolean).join(', ')}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {formatLocationDetail(location)}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : !isSearching ? (
                  <div className="p-8 text-center">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">Không tìm thấy kết quả</p>
                    <p className="text-gray-400 text-sm mt-1">Hãy thử từ khóa khác</p>
                  </div>
                ) : null
              ) : (
                <div className="py-4 px-4">
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-600" />
                        <span>Tìm kiếm gần đây</span>
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {recentSearches.map((location) => (
                          <button
                            key={`recent-${location.locationId}`}
                            type="button"
                            className="text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group"
                            onClick={() => handleSelectLocation(location)}
                          >
                            <div className="font-medium text-gray-800 text-sm group-hover:text-blue-600 truncate">
                              {location.city}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {location.district || 'Toàn thành phố'}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {recentSearches.length > 0 && (
                    <div className="border-t border-gray-100 mb-6"></div>
                  )}

                  {hotLocations.length > 0 ? (
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                          <Star className="w-4 h-4 text-gray-600" strokeWidth={2} />
                          <span>Điểm đến phổ biến</span>
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {hotLocations.slice(0, 6).map((location) => (
                            <button
                              key={location.locationId}
                              type="button"
                              className="text-left px-3 py-2.5 hover:bg-gray-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 group"
                              onClick={() => handleSelectLocation(location)}
                            >
                              <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700">
                                {location.city}
                              </div>
                              <div className="text-xs text-gray-600 truncate">
                                {location.district || 'Toàn thành phố'}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-3 md:gap-4">
          <div className="flex-1">
            <DateRangePicker
              checkIn={checkIn}
              checkOut={checkOut}
              tab={tab}
              onChange={(ci, co) => {
                setCheckIn(ci);
                setCheckOut(co);
                if (typeof ci === 'object' && ci.flexible) {
                  // Flexible date - không tự động mở room picker
                } else if (ci && co) {
                  // Overnight: chọn xong cả checkIn và checkOut mới mở room picker
                  // Dayuse: checkIn === checkOut nên cũng tự động mở
                  if (tab === 'overnight' || (tab === 'dayuse' && ci === co)) {
                    setTimeout(() => setRoomGuestOpen(true), 350);
                  }
                }
              }}
            />
          </div>
          <div className="flex-1">
            <RoomGuestPicker
              guests={guests}
              rooms={rooms}
              childrenCount={children}
              onChange={(g, r, c) => {
                setGuests(g);
                setRooms(r);
                setChildren(c);
              }}
              open={roomGuestOpen}
              setOpen={setRoomGuestOpen}
            />
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isLoadingSearch}
            className={`${isLoadingSearch ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'} text-white text-xs md:text-sm font-semibold py-2.5 md:py-4 px-8 md:px-60 rounded-lg transition-colors shadow-md w-full md:w-auto flex items-center justify-center gap-2`}
          >
            {isLoadingSearch ? (
              <>
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>ĐANG TÌM...</span>
              </>
            ) : (
              'TÌM'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
