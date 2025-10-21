import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, X, ChevronDown, Loader, Calendar } from 'lucide-react';
import { searchLocations, formatLocationDisplay, Location } from '../../services/locationService';
import { searchHotels } from '../../services/hotelService';
import BookingDatePicker from './BookingDatePicker';

interface CompactSearchBarProps {
  onSearch: (params: any) => void;
  initialSearchParams?: any;
}

export default function CompactSearchBar({ onSearch, initialSearchParams }: CompactSearchBarProps) {
  const [destination, setDestination] = useState(initialSearchParams?.destination || '');
  const [checkIn, setCheckIn] = useState(initialSearchParams?.checkIn || '');
  const [checkOut, setCheckOut] = useState(initialSearchParams?.checkOut || '');
  const [guests, setGuests] = useState(initialSearchParams?.guests || 2);
  const [rooms, setRooms] = useState(initialSearchParams?.rooms || 1);
  const [children, setChildren] = useState(initialSearchParams?.children || 0);
  const [stayType, setStayType] = useState<'overnight' | 'dayuse'>('overnight'); // ✅ Add stayType

  const [locations, setLocations] = useState<Location[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [roomGuestOpen, setRoomGuestOpen] = useState(false);
  // datePickerOpen: 'checkIn' | 'checkOut' | false
  const [datePickerOpen, setDatePickerOpen] = useState<'checkIn' | 'checkOut' | null>(null);

  const pickerRef = useRef<HTMLDivElement>(null);

  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);


  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);

    if (destination.trim().length < 1) {
      setLocations([]);
      setIsUserTyping(false);
      return;
    }

    if (!isUserTyping) return;

    setIsSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        let result = await searchLocations(destination, 10);
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
    const displayName = formatLocationDisplay(location);
    setDestination(displayName);
    setShowDropdown(false);
    setLocations([]);
    setIsUserTyping(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!destination || destination.trim().length === 0) {
      alert("Vui lòng chọn điểm đến.");
      return;
    }

    if (!checkIn || checkIn.trim().length === 0) {
      alert("Vui lòng chọn ngày.");
      return;
    }

    // Only require checkout for overnight mode
    if (stayType === 'overnight' && (!checkOut || checkOut.trim().length === 0)) {
      alert("Vui lòng chọn ngày trả phòng.");
      return;
    }

    if (!rooms || rooms < 1 || !guests || guests < 1) {
      alert("Vui lòng chọn phòng và khách.");
      return;
    }

    try {
      setIsLoadingSearch(true);
      
      const params = {
        destination,
        checkIn,
        checkOut,
        guests,
        rooms,
        children,
        stayType: stayType as 'overnight' | 'dayuse', // ✅ Use stayType from state
      };

      const res = await searchHotels(params);

      if (res.success) {
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
    <div className="bg-gray-100 bg-opacity-80 border-b border-gray-200 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 relative">
        {/* Overlay that blocks the whole form when searching */}
        {isLoadingSearch && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-blue-600 font-semibold">Đang tìm kiếm...</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-row items-center gap-2 md:gap-3">
          {/* Destination */}
          <div className="relative flex-[2.2] min-w-[220px] max-w-[460px]" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="w-full h-[60px] pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Điểm đến"
              value={destination}
              onChange={e => {
                setDestination(e.target.value);
                setIsUserTyping(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
            {/* Clear button */}
            {destination && (
              <button
                type="button"
                onClick={() => {
                  setDestination('');
                  setLocations([]);
                  setShowDropdown(false);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {/* Dropdown */}
            {showDropdown && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                {isUserTyping && destination.trim().length > 0 ? (
                  locations.length > 0 ? (
                    <div className="py-1">
                      {locations.slice(0, 5).map((location) => (
                        <button
                          key={location.locationId}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-blue-50 text-sm flex items-center gap-2"
                          onClick={() => handleSelectLocation(location)}
                        >
                          <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="truncate">
                            {[location.city, location.district].filter(Boolean).join(', ')}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : !isSearching ? (
                    <div className="p-3 text-center text-xs text-gray-500">Không tìm thấy kết quả</div>
                  ) : null
                ) : null}
              </div>
            )}
          </div>

          {/* Cụm chọn ngày nhận/trả phòng tối ưu */}
          <div
            ref={pickerRef}
            className="relative flex-[1.1] max-w-[400px] min-w-[240px] h-[50px] flex items-center bg-white rounded-lg border border-gray-300"
            style={{ fontSize: '14px' }}
          >
            {stayType === 'overnight' ? (
              <>
                {/* Button nhận phòng - Overnight Mode */}
                <button
                  type="button"
                  className={`flex-1 h-full flex items-center gap-2 px-3 border-r border-gray-200 focus:outline-none hover:bg-gray-50 ${
                    datePickerOpen === 'checkIn' ? 'bg-gray-50' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatePickerOpen((prev) => (prev === 'checkIn' ? null : 'checkIn'));
                  }}
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-black">
                      {checkIn
                        ? new Date(checkIn).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Nhận phòng'}
                    </span>
                    <span className="text-xs text-gray-600">
                      {checkIn
                        ? ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][new Date(checkIn).getDay()]
                        : ''}
                    </span>
                  </div>
                </button>

                {/* Button trả phòng - Overnight Mode */}
                <button
                  type="button"
                  className={`flex-1 h-full flex items-center gap-2 px-3 focus:outline-none hover:bg-gray-50 ${
                    datePickerOpen === 'checkOut' ? 'bg-gray-50' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatePickerOpen((prev) => (prev === 'checkOut' ? null : 'checkOut'));
                  }}
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-black">
                      {checkOut
                        ? new Date(checkOut).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Trả phòng'}
                    </span>
                    <span className="text-xs text-gray-600">
                      {checkOut
                        ? ['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][new Date(checkOut).getDay()]
                        : ''}
                    </span>
                  </div>
                </button>
              </>
            ) : (
              <>
                {/* Button Ngày duy nhất - Dayuse Mode */}
                <button
                  type="button"
                  className={`flex-1 h-full flex items-center gap-2 px-3 focus:outline-none hover:bg-gray-50 ${
                    datePickerOpen ? 'bg-gray-50' : ''
                  }`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setDatePickerOpen((prev) => (prev ? null : 'checkIn'));
                  }}
                >
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold text-black text-15px">
                      {checkIn
                        ? new Date(checkIn).toLocaleDateString('vi-VN', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                          })
                        : 'Chọn ngày'}
                    </span>
                    <span className="text-14px text-gray-600 ">
                      {checkIn
                        ? `${['Chủ Nhật','Thứ Hai','Thứ Ba','Thứ Tư','Thứ Năm','Thứ Sáu','Thứ Bảy'][new Date(checkIn).getDay()]} | Trả phòng trong ngày`
                        : 'Trả phòng trong ngày'}
                    </span>
                  </div>
                </button>
              </>
            )}

            {/* Popup lịch */}
            {datePickerOpen && (
              <div className="absolute left-0 top-full mt-2 z-[9999]">
                <BookingDatePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co, type) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                    if (type) {
                      setStayType(type); // ✅ Update stayType based on picker tab
                    }
                  }}
                  onClose={() => setDatePickerOpen(null)}
                />
              </div>
            )}
          </div>



          {/* Guests & Rooms */}
          <div className="relative flex-[1] min-w-[120px]">
            <button
              type="button"
              onClick={() => setRoomGuestOpen(!roomGuestOpen)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 whitespace-nowrap bg-white"
            >
              👥 {guests} · {rooms} phòng
              <ChevronDown className="w-3 h-3" />
            </button>
            {roomGuestOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-40 min-w-48">
                <div className="space-y-2">
                  <div>
                    <label className="text-xs font-medium">Người lớn</label>
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Phòng</label>
                    <input
                      type="number"
                      min="1"
                      value={rooms}
                      onChange={e => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium">Trẻ em</label>
                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={e => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded mt-1"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={isLoadingSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap text-sm"
          >
            {isLoadingSearch ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                TÌM...
              </>
            ) : (
              'TÌM'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
