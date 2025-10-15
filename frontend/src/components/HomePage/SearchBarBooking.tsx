import { useState, useRef, useEffect } from 'react';
import { MapPin, Calendar, Users, Search, Plus, Minus, Info, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchBarProps {
  onSearch: (params: SearchParams) => void;
}

interface SearchParams {
  destination: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
  stayType: 'overnight' | 'dayUse';
}

const formatDate = (date: Date, isDayUse: boolean = false): string => {
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  
  if (isDayUse) {
    return `${date.getDate()} tháng ${date.getMonth() + 1} ${date.getFullYear()}\n${dayName} | Trả phòng trong ngày`;
  }
  
  return `${date.getDate()} tháng ${date.getMonth() + 1} ${date.getFullYear()}\n${dayName}`;
};

export default function SearchBarBooking({ onSearch }: SearchBarProps) {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    destination: '',
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
    rooms: 1,
    stayType: 'overnight'
  });

  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [showGuestPicker, setShowGuestPicker] = useState<boolean>(false);
  const [showStayTypeTip, setShowStayTypeTip] = useState<boolean>(false);
  const [calendarTab, setCalendarTab] = useState<'calendar' | 'flexible'>('calendar');
  const [flexibleStayDuration, setFlexibleStayDuration] = useState<'3days' | '1week' | '1month'>('1week');
  const [selectedFlexibleMonth, setSelectedFlexibleMonth] = useState<Date | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const guestPickerRef = useRef<HTMLDivElement>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchParams);
  };
  
  const handleClickOutside = (event: MouseEvent) => {
    if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
      setShowDatePicker(false);
    }
    
    if (guestPickerRef.current && !guestPickerRef.current.contains(event.target as Node)) {
      setShowGuestPicker(false);
    }
  };
  
  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Các hàm xử lý sự kiện
  const handleDateClick = () => {
    setShowGuestPicker(false);
    setShowDatePicker(prev => !prev);
  };

  const handleGuestClick = () => {
    setShowDatePicker(false);
    setShowGuestPicker(prev => !prev);
  };

  const setCheckInDate = (date: Date) => {
    // Nếu là "Chỗ Ở Trong Ngày", chỉ set ngày check-in và đóng calendar
    if (searchParams.stayType === 'dayUse') {
      setSearchParams({ ...searchParams, checkIn: date, checkOut: date });
      setTimeout(() => {
        setShowDatePicker(false);
        setShowGuestPicker(true);
      }, 300);
      return;
    }
    
    // Logic cho "Chỗ Ở Qua Đêm"
    if (searchParams.checkOut && date > searchParams.checkOut) {
      const newCheckOut = new Date(date);
      newCheckOut.setDate(date.getDate() + 1);
      setSearchParams({ 
        ...searchParams, 
        checkIn: date,
        checkOut: newCheckOut 
      });
    } else {
      setSearchParams({ ...searchParams, checkIn: date });
    }
  };

  const setCheckOutDate = (date: Date) => {
    // Nếu ngày check-out trước ngày check-in, không cho phép
    if (searchParams.checkIn && date < searchParams.checkIn) {
      return;
    }
    setSearchParams({ ...searchParams, checkOut: date });
    
    // Đóng calendar và mở dropdown chọn phòng sau khi chọn xong ngày
    setTimeout(() => {
      setShowDatePicker(false);
      setShowGuestPicker(true);
    }, 300);
  };

  const incrementGuests = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults' && searchParams.adults < 30) {
      setSearchParams({ ...searchParams, adults: searchParams.adults + 1 });
    } else if (type === 'children' && searchParams.children < 10) {
      setSearchParams({ ...searchParams, children: searchParams.children + 1 });
    } else if (type === 'rooms' && searchParams.rooms < 30) {
      setSearchParams({ ...searchParams, rooms: searchParams.rooms + 1 });
    }
  };

  const decrementGuests = (type: 'adults' | 'children' | 'rooms') => {
    if (type === 'adults' && searchParams.adults > 1) {
      setSearchParams({ ...searchParams, adults: searchParams.adults - 1 });
    } else if (type === 'children' && searchParams.children > 0) {
      setSearchParams({ ...searchParams, children: searchParams.children - 1 });
    } else if (type === 'rooms' && searchParams.rooms > 1) {
      setSearchParams({ ...searchParams, rooms: searchParams.rooms - 1 });
    }
  };

  const toggleStayType = (type: 'overnight' | 'dayUse') => {
    // Reset ngày khi chuyển đổi loại hình
    setSearchParams({ 
      ...searchParams, 
      stayType: type,
      checkIn: null,
      checkOut: null
    });
  };

  // Tạo một mảng các ngày trong tháng để hiển thị lịch
  const generateCalendar = () => {
    const currentMonth = currentCalendarMonth.getMonth();
    const currentYear = currentCalendarMonth.getFullYear();
    
    // Trả về một object chứa thông tin về tháng hiện tại và tháng tiếp theo
    return {
      currentMonth: {
        month: currentMonth,
        year: currentYear,
        firstDay: new Date(currentYear, currentMonth, 1).getDay(),
        daysInMonth: new Date(currentYear, currentMonth + 1, 0).getDate()
      },
      nextMonth: {
        month: currentMonth + 1 > 11 ? 0 : currentMonth + 1,
        year: currentMonth + 1 > 11 ? currentYear + 1 : currentYear,
        firstDay: new Date(currentYear, currentMonth + 1, 1).getDay(),
        daysInMonth: new Date(currentYear, currentMonth + 2, 0).getDate()
      }
    };
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentCalendarMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    
    // Không cho quay về tháng trước tháng hiện tại
    const today = new Date();
    const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    if (newDate >= currentMonthStart) {
      setCurrentCalendarMonth(newDate);
    }
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentCalendarMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentCalendarMonth(newDate);
  };

  const calendar = generateCalendar();
  
  const getGuestSummary = () => {
    const totalGuests = searchParams.adults + searchParams.children;
    return `${totalGuests} người lớn, ${searchParams.rooms} phòng`;
  };
  
  return (
    <>
      {/* Overlay - Hiện khi có dropdown mở */}
      {(showDatePicker || showGuestPicker) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-40 transition-opacity duration-300"
          onClick={() => {
            setShowDatePicker(false);
            setShowGuestPicker(false);
          }}
        />
      )}
      
      <div className="bg-white rounded-3xl shadow-2xl p-8 -mt-8 relative z-50 max-w-7xl mx-auto">
      {/* Tabs dịch vụ - giống Booking.com */}
      <div className="flex gap-6 mb-8 border-b-2 border-gray-100">
        <button className="flex items-center gap-2 px-4 py-3 font-semibold text-base border-b-3 border-blue-600 text-blue-600 -mb-0.5">
          <MapPin className="w-5 h-5" />
          Khách sạn
        </button>
        <button className="flex items-center gap-2 px-4 py-3 font-medium text-base text-gray-600 hover:text-gray-800">
          Nhà và Căn hộ
        </button>
      </div>
      
      {/* Tabs cho loại đặt phòng - Pill style */}
      <div className="flex gap-3 mb-6">
        <button 
          className={`px-6 py-2.5 rounded-full font-medium text-sm transition-all ${searchParams.stayType === 'overnight' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}
          onClick={() => toggleStayType('overnight')}
        >
          Chỗ Ở Qua Đêm
        </button>
        <button 
          className={`px-6 py-2.5 rounded-full font-medium text-sm relative transition-all ${searchParams.stayType === 'dayUse' 
            ? 'bg-blue-600 text-white shadow-md' 
            : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'}`}
          onClick={() => toggleStayType('dayUse')}
          onMouseEnter={() => setShowStayTypeTip(true)}
          onMouseLeave={() => setShowStayTypeTip(false)}
        >
          Chỗ Ở Trong Ngày
          {showStayTypeTip && (
            <div className="absolute left-0 top-full mt-2 bg-white p-3 rounded-md shadow-lg text-xs text-gray-700 w-64 z-20 border border-gray-100">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <p>Là phòng cho thuê không qua đêm, 4-12 tiếng mà không phải trả thêm phí.</p>
              </div>
            </div>
          )}
        </button>
      </div>
      
      {/* Info box cho Chỗ Ở Trong Ngày */}
      {searchParams.stayType === 'dayUse' && (
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center">
              <Info className="w-5 h-5 text-white" />
            </div>
          </div>
          <div>
            <p className="text-pink-900 font-medium text-sm">
              <span className="text-pink-600 font-semibold">Chỗ Ở Trong Ngày</span> là phòng cho thuê không đặt, 4-12 tiếng mà không phải qua đêm. Quý khách sẽ nhận phòng và trả phòng vào cùng một ngày.
            </p>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Form fields container */}
        <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
          {/* Địa điểm - chiếm hết 1 dòng */}
          <div className="w-full">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="UNU C&B homestay"
                className="text-black w-full pl-12 pr-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-base transition-all hover:border-gray-300"
                value={searchParams.destination}
                onChange={(e) => setSearchParams({ ...searchParams, destination: e.target.value })}
              />
            </div>
          </div>

          {/* Ngày và Khách - dòng thứ 2 */}
          <div className={`grid grid-cols-1 gap-4 ${searchParams.stayType === 'overnight' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
            {/* Nhận phòng / Ngày sử dụng */}
            <div ref={calendarRef}>
              <div 
                className="relative cursor-pointer" 
                onClick={handleDateClick}
              >
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all min-h-[88px]">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">
                        {searchParams.stayType === 'overnight' ? 'Nhận phòng' : 'Ngày'}
                      </div>
                      <div className="text-sm font-semibold text-gray-900 whitespace-pre-line">
                        {searchParams.stayType === 'overnight' ? (
                          // Hiển thị cho Chỗ Ở Qua Đêm
                          searchParams.checkIn 
                            ? formatDate(searchParams.checkIn, false) 
                            : '17 tháng 10 2025\nThứ Sáu'
                        ) : (
                          // Hiển thị cho Chỗ Ở Trong Ngày
                          searchParams.checkIn 
                            ? formatDate(searchParams.checkIn, true) 
                            : '21 tháng 11 2025\nThứ Sáu | Trả phòng trong ngày'
                        )}
                      </div>
                    </div>
                    <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </div>
              
              {/* Calendar popup - Thiết kế mới giống hình */}
              {showDatePicker && (
                <div className="absolute left-0 mt-2 p-6 bg-white rounded-xl shadow-2xl z-50 w-[750px] border border-gray-200">
                  {/* Header với tabs Lịch và Linh hoạt - Chỉ hiển thị cho "Chỗ Ở Qua Đêm" */}
                  {searchParams.stayType === 'overnight' && (
                    <div className="flex border-b-2 border-gray-200 mb-6">
                      <button 
                        type="button"
                        onClick={() => setCalendarTab('calendar')}
                        className={`px-6 py-3 font-medium ${
                          calendarTab === 'calendar' 
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Lịch
                      </button>
                      <button 
                        type="button"
                        onClick={() => setCalendarTab('flexible')}
                        className={`px-6 py-3 font-medium ${
                          calendarTab === 'flexible' 
                            ? 'text-blue-600 border-b-2 border-blue-600 -mb-0.5' 
                            : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        Linh hoạt
                      </button>
                    </div>
                  )}
                  
                  {/* Nội dung tab Lịch */}
                  {(calendarTab === 'calendar' || searchParams.stayType === 'dayUse') && (
                <div>
                  {/* Navigation với mũi tên */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      disabled={currentCalendarMonth.getMonth() === new Date().getMonth() && 
                               currentCalendarMonth.getFullYear() === new Date().getFullYear()}
                      className={`p-2 rounded-full transition-colors ${
                        currentCalendarMonth.getMonth() === new Date().getMonth() && 
                        currentCalendarMonth.getFullYear() === new Date().getFullYear()
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                      aria-label="Tháng trước"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    
                    <div className="flex gap-8 flex-1 justify-center">
                      <h4 className="font-bold text-gray-800 text-lg">
                        Tháng {calendar.currentMonth.month + 1} {calendar.currentMonth.year}
                      </h4>
                      <h4 className="font-bold text-gray-800 text-lg">
                        Tháng {calendar.nextMonth.month + 1} {calendar.nextMonth.year}
                      </h4>
                    </div>
                    
                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                      aria-label="Tháng sau"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-600" />
                    </button>
                  </div>
                  
                  <div className="flex gap-8">
                  {/* Tháng hiện tại */}
                  <div className="flex-1">
                    <div className="grid grid-cols-7 gap-2">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                        <div key={day} className="text-xs font-semibold text-gray-600 text-center py-2">{day}</div>
                      ))}
                      
                      {/* Ngày trống đầu tháng (điều chỉnh để bắt đầu từ T2) */}
                      {Array.from({ length: (calendar.currentMonth.firstDay + 6) % 7 }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-2"></div>
                      ))}
                      
                      {/* Các ngày trong tháng */}
                      {Array.from({ length: calendar.currentMonth.daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const currentDate = new Date(calendar.currentMonth.year, calendar.currentMonth.month, day);
                        const isToday = new Date().toDateString() === currentDate.toDateString();
                        
                        // Logic riêng cho từng loại hình
                        const isSelected = searchParams.stayType === 'dayUse'
                          ? searchParams.checkIn?.toDateString() === currentDate.toDateString()
                          : (searchParams.checkIn?.toDateString() === currentDate.toDateString() || 
                             searchParams.checkOut?.toDateString() === currentDate.toDateString());
                        
                        const isInRange = searchParams.stayType === 'overnight' && 
                                        searchParams.checkIn && searchParams.checkOut && 
                                        currentDate > searchParams.checkIn && currentDate < searchParams.checkOut;
                        const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
                                        
                        return (
                          <button 
                            key={`day-${day}`}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              if (searchParams.stayType === 'dayUse') {
                                // "Chỗ Ở Trong Ngày": Luôn chọn lại ngày mới, không có logic check-in/check-out
                                setCheckInDate(currentDate);
                              } else {
                                // "Chỗ Ở Qua Đêm": Logic chọn 2 ngày
                                if (!searchParams.checkIn) {
                                  // Chưa có check-in → Chọn check-in
                                  setCheckInDate(currentDate);
                                } else if (searchParams.checkOut) {
                                  // Đã có cả check-in và check-out → Reset và chọn lại check-in
                                  setCheckInDate(currentDate);
                                } else if (currentDate < searchParams.checkIn) {
                                  // Click vào ngày trước check-in → Chọn lại check-in
                                  setCheckInDate(currentDate);
                                } else if (currentDate.getTime() === searchParams.checkIn.getTime()) {
                                  // Click vào chính ngày check-in → Bỏ qua
                                  return;
                                } else {
                                  // Click vào ngày sau check-in → Chọn check-out
                                  setCheckOutDate(currentDate);
                                }
                              }
                            }}
                            className={`
                              relative w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                              ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:border-2 hover:border-gray-800'}
                              ${isToday && !isSelected ? 'font-bold' : ''}
                              ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : ''}
                              ${isInRange && searchParams.stayType === 'overnight' ? 'bg-blue-50 text-blue-600' : ''}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {/* Tháng tiếp theo */}
                  <div className="flex-1">
                    <div className="grid grid-cols-7 gap-2">
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                        <div key={day} className="text-xs font-semibold text-gray-600 text-center py-2">{day}</div>
                      ))}
                      
                      {/* Ngày trống đầu tháng (điều chỉnh để bắt đầu từ T2) */}
                      {Array.from({ length: (calendar.nextMonth.firstDay + 6) % 7 }).map((_, i) => (
                        <div key={`empty-next-${i}`} className="p-2"></div>
                      ))}
                      
                      {/* Các ngày trong tháng tiếp theo */}
                      {Array.from({ length: calendar.nextMonth.daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const currentDate = new Date(calendar.nextMonth.year, calendar.nextMonth.month, day);
                        
                        // Logic riêng cho từng loại hình
                        const isSelected = searchParams.stayType === 'dayUse'
                          ? searchParams.checkIn?.toDateString() === currentDate.toDateString()
                          : (searchParams.checkIn?.toDateString() === currentDate.toDateString() || 
                             searchParams.checkOut?.toDateString() === currentDate.toDateString());
                        
                        const isInRange = searchParams.stayType === 'overnight' && 
                                        searchParams.checkIn && searchParams.checkOut && 
                                        currentDate > searchParams.checkIn && currentDate < searchParams.checkOut;
                        const isPast = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
                                        
                        return (
                          <button 
                            key={`next-day-${day}`}
                            type="button"
                            disabled={isPast}
                            onClick={() => {
                              if (searchParams.stayType === 'dayUse') {
                                // "Chỗ Ở Trong Ngày": Luôn chọn lại ngày mới, không có logic check-in/check-out
                                setCheckInDate(currentDate);
                              } else {
                                // "Chỗ Ở Qua Đêm": Logic chọn 2 ngày
                                if (!searchParams.checkIn) {
                                  // Chưa có check-in → Chọn check-in
                                  setCheckInDate(currentDate);
                                } else if (searchParams.checkOut) {
                                  // Đã có cả check-in và check-out → Reset và chọn lại check-in
                                  setCheckInDate(currentDate);
                                } else if (currentDate < searchParams.checkIn) {
                                  // Click vào ngày trước check-in → Chọn lại check-in
                                  setCheckInDate(currentDate);
                                } else if (currentDate.getTime() === searchParams.checkIn.getTime()) {
                                  // Click vào chính ngày check-in → Bỏ qua
                                  return;
                                } else {
                                  // Click vào ngày sau check-in → Chọn check-out
                                  setCheckOutDate(currentDate);
                                }
                              }
                            }}
                            className={`
                              relative w-full aspect-square flex items-center justify-center rounded-full text-sm font-medium transition-all
                              ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:border-2 hover:border-gray-800'}
                              ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : ''}
                              ${isInRange && searchParams.stayType === 'overnight' ? 'bg-blue-50 text-blue-600' : ''}
                            `}
                          >
                            {day}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
                </div>
                )}
                
                {/* Nội dung tab Linh hoạt */}
                {calendarTab === 'flexible' && (
                  <div className="space-y-6">
                    {/* Câu hỏi về thời gian lưu trú */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-4">Quý khách muốn lưu trú trong bao lâu?</h3>
                      <div className="flex gap-3">
                        <button
                          type="button"
                          onClick={() => setFlexibleStayDuration('3days')}
                          className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
                            flexibleStayDuration === '3days'
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          3 đêm
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlexibleStayDuration('1week')}
                          className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
                            flexibleStayDuration === '1week'
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          1 tuần
                        </button>
                        <button
                          type="button"
                          onClick={() => setFlexibleStayDuration('1month')}
                          className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
                            flexibleStayDuration === '1month'
                              ? 'border-blue-600 bg-blue-50 text-blue-600'
                              : 'border-gray-300 text-gray-700 hover:border-gray-400'
                          }`}
                        >
                          1 tháng
                        </button>
                      </div>
                    </div>

                    {/* Câu hỏi về thời điểm đi */}
                    <div>
                      <h3 className="text-gray-700 font-semibold mb-3">Quý khách muốn đi vào lúc nào?</h3>
                      <p className="text-sm text-gray-500 mb-4">Có thể chọn nhiều tháng</p>
                      
                      {/* Danh sách tháng */}
                      <div className="grid grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, index) => {
                          const monthDate = new Date();
                          monthDate.setMonth(monthDate.getMonth() + index);
                          const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
                          const isSelected = selectedFlexibleMonth?.getMonth() === monthDate.getMonth() && 
                                           selectedFlexibleMonth?.getFullYear() === monthDate.getFullYear();
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => setSelectedFlexibleMonth(monthDate)}
                              className={`p-4 rounded-lg border-2 transition-all text-center ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <Calendar className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                              <div className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                                {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="flex justify-end gap-3 pt-4 border-t">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFlexibleMonth(null);
                          setFlexibleStayDuration('1week');
                        }}
                        className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        Xóa
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedFlexibleMonth) {
                            // Tính toán ngày check-in và check-out dựa trên tháng được chọn và thời gian lưu trú
                            const checkIn = new Date(selectedFlexibleMonth);
                            checkIn.setDate(1);
                            const checkOut = new Date(checkIn);
                            
                            if (flexibleStayDuration === '3days') {
                              checkOut.setDate(checkOut.getDate() + 3);
                            } else if (flexibleStayDuration === '1week') {
                              checkOut.setDate(checkOut.getDate() + 7);
                            } else {
                              checkOut.setMonth(checkOut.getMonth() + 1);
                            }
                            
                            setSearchParams({ ...searchParams, checkIn, checkOut });
                            
                            // Đóng calendar và mở dropdown chọn phòng
                            setTimeout(() => {
                              setShowDatePicker(false);
                              setShowGuestPicker(true);
                            }, 300);
                          }
                        }}
                        className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
                      >
                        Chọn
                      </button>
                    </div>
                  </div>
                )}
                </div>
              )}
            </div>

            {/* Trả phòng - chỉ hiển thị khi overnight */}
            {searchParams.stayType === 'overnight' && (
              <div>
                <div 
                  className="relative cursor-pointer" 
                  onClick={handleDateClick}
                >
                  <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all min-h-[88px]">
                    <div className="flex items-center justify-between h-full">
                      <div className="flex-1">
                        <div className="text-xs text-gray-500 mb-1">Trả phòng</div>
                        <div className="text-sm font-semibold text-gray-900 whitespace-pre-line">
                          {searchParams.checkOut ? formatDate(searchParams.checkOut) : '25 tháng 10 2025\nThứ Bảy'}
                        </div>
                      </div>
                      <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Khách & Phòng */}
            <div ref={guestPickerRef}>
              <div 
                className="relative cursor-pointer" 
                onClick={handleGuestClick}
              >
                <div className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-gray-300 transition-all min-h-[88px]">
                  <div className="flex items-center justify-between h-full">
                    <div className="flex-1">
                      <div className="text-xs text-gray-500 mb-1">Khách & Phòng</div>
                      <div className="text-sm font-semibold text-gray-900">
                        {getGuestSummary()}
                      </div>
                    </div>
                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              </div>
              
              {/* Guest picker popup */}
              {showGuestPicker && (
                <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-xl z-50 w-80 border border-gray-100">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black">Người lớn</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => decrementGuests('adults')}
                          className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            searchParams.adults <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                          disabled={searchParams.adults <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-black">{searchParams.adults}</span>
                        <button 
                          type="button"
                          onClick={() => incrementGuests('adults')}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black">Trẻ em</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => decrementGuests('children')}
                          className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            searchParams.children <= 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                          disabled={searchParams.children <= 0}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-black">{searchParams.children}</span>
                        <button 
                          type="button"
                          onClick={() => incrementGuests('children')}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-black">Phòng</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button 
                          type="button"
                          onClick={() => decrementGuests('rooms')}
                          className={`w-8 h-8 flex items-center justify-center rounded-full ${
                            searchParams.rooms <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                          }`}
                          disabled={searchParams.rooms <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-medium text-black">{searchParams.rooms}</span>
                        <button 
                          type="button"
                          onClick={() => incrementGuests('rooms')}
                          className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-700"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Nút TÌM */}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-10 py-4 rounded-xl hover:bg-blue-700 transition-all shadow-lg font-semibold text-lg flex items-center justify-center gap-2"
          >
            TÌM
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
