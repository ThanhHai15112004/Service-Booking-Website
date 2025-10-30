import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MapPin, X, ChevronDown, Loader, Calendar, Users } from 'lucide-react';
import { searchLocations, Location } from '../../services/locationService';
import BookingDatePicker from '../Search/BookingDatePicker';

interface HotelSearchUpdateBarProps {
  hotelId: string;
  initialDestination?: string;
  initialCheckIn: string;
  initialCheckOut: string;
  initialGuests: number;
  initialRooms: number;
  initialChildren?: number;
}

export default function HotelSearchUpdateBar({
  hotelId,
  initialDestination = '',
  initialCheckIn,
  initialCheckOut,
  initialGuests,
  initialRooms,
  initialChildren = 0
}: HotelSearchUpdateBarProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [destination, setDestination] = useState(initialDestination);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests);
  const [rooms, setRooms] = useState(initialRooms);
  const [children, setChildren] = useState(initialChildren);
  const [stayType] = useState<'overnight' | 'dayuse'>('overnight');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const [locations, setLocations] = useState<Location[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isUserTyping, setIsUserTyping] = useState(false);
  const [isLoadingUpdate, setIsLoadingUpdate] = useState(false);
  const [roomGuestOpen, setRoomGuestOpen] = useState(false);
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
    const displayName = [location.city, location.district].filter(Boolean).join(', ');
    setDestination(displayName);
    setSelectedLocation(location);
    setShowDropdown(false);
    setLocations([]);
    setIsUserTyping(false);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!checkIn || checkIn.trim().length === 0) {
      alert("Vui lòng chọn ngày.");
      return;
    }

    if (stayType === 'overnight' && (!checkOut || checkOut.trim().length === 0)) {
      alert("Vui lòng chọn ngày trả phòng.");
      return;
    }

    if (!rooms || rooms < 1 || !guests || guests < 1) {
      alert("Vui lòng chọn phòng và khách.");
      return;
    }

    try {
      setIsLoadingUpdate(true);
      
      // ✅ CHỈ UPDATE URL PARAMS - useHotelDetail sẽ tự động re-fetch
      const newParams = new URLSearchParams(searchParams);
      newParams.set('checkIn', checkIn);
      newParams.set('checkOut', stayType === 'dayuse' ? checkIn : checkOut);
      newParams.set('guests', guests.toString());
      newParams.set('rooms', rooms.toString());
      newParams.set('children', children.toString());
      if (destination) {
        newParams.set('destination', destination);
      }
      
      // Update URL params - component sẽ re-render và useHotelDetail sẽ fetch lại data
      setSearchParams(newParams);
      
      // Loading sẽ tự tắt khi data fetch xong
      setTimeout(() => setIsLoadingUpdate(false), 500);
    } catch (error: any) {
      console.error("❌ Lỗi cập nhật:", error);
      alert("Có lỗi xảy ra. Vui lòng thử lại.");
      setIsLoadingUpdate(false);
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 shadow-sm sticky top-14 z-40">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-3 relative">
        {/* Overlay when updating */}
        {isLoadingUpdate && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 rounded-lg">
            <div className="flex items-center gap-3">
              <Loader className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-blue-600 font-semibold">Đang cập nhật...</span>
            </div>
          </div>
        )}

        <form onSubmit={handleUpdate} className="flex flex-row items-center gap-2 md:gap-3">
          {/* Destination (hidden on hotel detail, but keep for potential use) */}
          <div className="relative flex-[2] min-w-[200px] max-w-[380px] hidden md:block" ref={dropdownRef}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              className="w-full h-[46px] pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="Điểm đến"
              value={destination}
              onChange={e => {
                setDestination(e.target.value);
                setIsUserTyping(true);
              }}
              onFocus={() => setShowDropdown(true)}
              autoComplete="off"
            />
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

          {/* Date Picker */}
          <div
            ref={pickerRef}
            className="relative flex-[2] max-w-[420px] min-w-[260px] h-[46px] flex items-center bg-white rounded-lg border border-gray-300"
            style={{ fontSize: '13px' }}
          >
            {/* Check-in Button */}
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
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-black text-xs">
                  {checkIn
                    ? new Date(checkIn).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Nhận phòng'}
                </span>
                <span className="text-[10px] text-gray-600">
                  {checkIn
                    ? ['CN','T2','T3','T4','T5','T6','T7'][new Date(checkIn).getDay()]
                    : ''}
                </span>
              </div>
            </button>

            {/* Check-out Button */}
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
              <Calendar className="w-4 h-4 text-gray-400" />
              <div className="flex flex-col items-start">
                <span className="font-semibold text-black text-xs">
                  {checkOut
                    ? new Date(checkOut).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'Trả phòng'}
                </span>
                <span className="text-[10px] text-gray-600">
                  {checkOut
                    ? ['CN','T2','T3','T4','T5','T6','T7'][new Date(checkOut).getDay()]
                    : ''}
                </span>
              </div>
            </button>

            {/* Date Picker Popup */}
            {datePickerOpen && (
              <div className="absolute left-0 top-full mt-2 z-[9999]">
                <BookingDatePicker
                  checkIn={checkIn}
                  checkOut={checkOut}
                  onChange={(ci, co, type) => {
                    setCheckIn(ci);
                    setCheckOut(co);
                  }}
                  onClose={() => setDatePickerOpen(null)}
                />
              </div>
            )}
          </div>

          {/* Guests & Rooms */}
          <div className="relative flex-[1] min-w-[120px] max-w-[200px]">
            <button
              type="button"
              onClick={() => setRoomGuestOpen(!roomGuestOpen)}
              className="w-full h-[46px] px-3 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Users className="w-4 h-4 text-gray-600 flex-shrink-0" />
              <div className="flex flex-col items-start flex-1">
                <span className="font-semibold text-black text-xs">
                  {guests} {children > 0 ? `người, ${children} trẻ` : 'người'}
                </span>
                <span className="text-[10px] text-gray-600">
                  {rooms} phòng
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            </button>
            {roomGuestOpen && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-40 min-w-60">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-700">Người lớn</label>
                    <input
                      type="number"
                      min="1"
                      value={guests}
                      onChange={e => setGuests(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Phòng</label>
                    <input
                      type="number"
                      min="1"
                      value={rooms}
                      onChange={e => setRooms(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700">Trẻ em</label>
                    <input
                      type="number"
                      min="0"
                      value={children}
                      onChange={e => setChildren(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Button */}
          <button
            type="submit"
            disabled={isLoadingUpdate}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2 whitespace-nowrap text-sm font-semibold shadow-md"
          >
            {isLoadingUpdate ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                ĐANG CẬP NHẬT...
              </>
            ) : (
              'CẬP NHẬT'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

