import { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, parseISO, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, isBefore, getDay } from 'date-fns';

export interface FlexibleDate {
  flexible: true;
  duration: '3days' | '1week' | '1month';
  months: { month: number; year: number }[];
}

interface DateRangePickerProps {
  checkIn: string | FlexibleDate;
  checkOut: string;
  onChange: (checkIn: string | FlexibleDate, checkOut: string) => void;
  tab?: 'overnight' | 'dayuse';
}

const getDayName = (dateStr: string) => {
  const dayIndex = getDay(parseISO(dateStr));
  return ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'][dayIndex];
};

export default function DateRangePicker({ checkIn, checkOut, onChange, tab = 'overnight' }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'flexible'>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [flexibleDuration, setFlexibleDuration] = useState<'3days' | '1week' | '1month'>('1week');
  const [flexibleMonths, setFlexibleMonths] = useState<number[]>([10]); // Array of selected month indices
  const [flexibleMonthScroll, setFlexibleMonthScroll] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', handle);
    }
    return () => document.removeEventListener('mousedown', handle);
  }, [open]);

  const startDate = checkIn ? parseISO(checkIn as string) : null;
  const endDate = checkOut ? parseISO(checkOut) : null;

  const handleDateClick = (date: Date) => {
    // Khi là day use, chỉ chọn 1 ngày
    if (tab === 'dayuse') {
      onChange(format(date, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd'));
      setTimeout(() => setOpen(false), 300);
      return;
    }

    // Click 2 lần vào cùng 1 ngày để xóa (overnight mode)
    if (startDate && isSameDay(date, startDate) && !endDate) {
      onChange('', '');
      setSelectingStart(true);
      return;
    }
    
    if (selectingStart || !startDate) {
      onChange(format(date, 'yyyy-MM-dd'), '');
      setSelectingStart(false);
    } else {
      if (isBefore(date, startDate)) {
        onChange(format(date, 'yyyy-MM-dd'), '');
      } else {
        onChange(checkIn, format(date, 'yyyy-MM-dd'));
        setSelectingStart(true);
        // Tự đóng khi chọn xong range
        setTimeout(() => setOpen(false), 300);
      }
    }
  };

  const toggleFlexibleMonth = (monthIndex: number) => {
    // Chỉ cho phép chọn 1 tháng
    setFlexibleMonths([monthIndex]);
  };

  // Hàm tính check-in và check-out dựa vào duration và tháng được chọn
  const calculateFlexibleDates = (duration: '3days' | '1week' | '1month', monthIndex: number) => {
    const selectedMonth = addMonths(new Date(), monthIndex);
    const checkInDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1); // Ngày 1 của tháng
    let checkOutDate;

    if (duration === '3days') {
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 3); // +3 ngày
    } else if (duration === '1week') {
      checkOutDate = new Date(checkInDate);
      checkOutDate.setDate(checkOutDate.getDate() + 7); // +7 ngày
    } else { // 1month
      checkOutDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0); // Ngày cuối của tháng
    }

    return {
      checkIn: format(checkInDate, 'yyyy-MM-dd'),
      checkOut: format(checkOutDate, 'yyyy-MM-dd')
    };
  };

  const renderMonth = (monthOffset: number) => {
    const month = addMonths(currentMonth, monthOffset);
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    const startDay = monthStart.getDay();
    const emptyDays = Array(startDay).fill(null);

    return (
      <div className="flex-1 px-2 md:px-4">
        <div className="flex items-center justify-between mb-2 md:mb-3">
          {monthOffset === 0 && (
            <button type="button" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-4 md:w-5 h-4 md:h-5 text-gray-700" />
            </button>
          )}
          <div className="flex-1 text-center font-semibold text-sm md:text-base text-gray-900">
            Tháng {month.getMonth() + 1} {month.getFullYear()}
          </div>
          {monthOffset === 1 && (
            <button type="button" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-1.5 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-4 md:w-5 h-4 md:h-5 text-gray-700" />
            </button>
          )}
          {monthOffset === 0 && <div className="w-6 md:w-8"></div>}
          {monthOffset === 1 && <div className="w-0"></div>}
        </div>

        <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-0.5 md:gap-1">
          {emptyDays.map((_, idx) => (
            <div key={`empty-${idx}`} className="aspect-square"></div>
          ))}
          {days.map((day) => {
            const isStart = startDate && isSameDay(day, startDate);
            const isEnd = endDate && isSameDay(day, endDate);
            const isInRange = startDate && endDate && isAfter(day, startDate) && isBefore(day, endDate);
            const isToday = isSameDay(day, new Date());
            const isPast = isBefore(day, new Date()) && !isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                type="button"
                disabled={isPast}
                onClick={() => !isPast && handleDateClick(day)}
                className={`
                  aspect-square flex items-center justify-center text-xs md:text-sm rounded-full transition-colors
                  ${isPast ? 'text-gray-300 cursor-not-allowed' : 'text-gray-900 hover:bg-gray-100'}
                  ${isStart || isEnd ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                  ${isInRange ? 'bg-blue-100 text-blue-900' : ''}
                  ${isToday && !isStart && !isEnd ? 'ring-2 ring-gray-900 font-semibold' : ''}
                `}
              >
                {day.getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setOpen(false)}></div>}
      
      <div className="relative w-full" ref={ref}>
        <div
          className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white cursor-pointer min-w-[220px]"
          onClick={() => setOpen((v) => !v)}
        >
          <Calendar className="w-5 h-5 text-gray-400 mr-2" />
          <div className="flex flex-col flex-1">
            <span className="text-xs text-gray-500">{tab === 'dayuse' ? 'Ngày' : 'Nhận phòng'}</span>
            <span className="text-sm text-black font-medium">{checkIn ? format(parseISO(checkIn as string), 'dd/MM/yyyy') : 'Chọn ngày'}</span>
          </div>
          {tab === 'overnight' && (
            <>
              <div className="flex flex-col flex-1">
                <span className="text-xs text-gray-500">Trả phòng</span>
                <span className="text-sm text-black font-medium">{checkOut ? format(parseISO(checkOut), 'dd/MM/yyyy') : 'Chọn ngày'}</span>
              </div>
            </>
          )}
        </div>
        {open && (
          <div className="absolute left-0 right-0 top-full mt-2 md:left-0 md:right-auto bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200 w-full md:w-[700px] max-h-[500px] flex flex-col">
            {/* Header with selected dates */}
            {(checkIn || checkOut) && (
              <div className={`flex gap-4 px-5 py-3 border-b border-gray-200 bg-gray-50 flex-shrink-0 ${tab === 'dayuse' ? 'flex-col' : ''}`}>
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs text-gray-500 mb-0.5">{tab === 'dayuse' ? 'Ngày' : 'Nhận phòng'}</div>
                    <div className="text-sm font-semibold text-gray-900 truncate">
                      {checkIn ? format(parseISO(checkIn as string), 'dd \'tháng\' MM yyyy') : 'Chọn ngày'}
                    </div>
                    {checkIn && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {getDayName(checkIn as string)}
                      </div>
                    )}
                  </div>
                </div>
                {tab === 'overnight' && (
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 mb-0.5">Trả phòng</div>
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {checkOut ? format(parseISO(checkOut), 'dd \'tháng\' MM yyyy') : 'Chọn ngày'}
                      </div>
                      {checkOut && (
                        <div className="text-xs text-gray-500 mt-0.5">
                          {getDayName(checkOut)}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tabs */}
            <div className="flex border-b border-gray-200 flex-shrink-0">
              <button
                type="button"
                className={`flex-1 px-5 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'calendar'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('calendar')}
              >
                Lịch
                {activeTab === 'calendar' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
              </button>
              <button
                type="button"
                className={`flex-1 px-5 py-2 text-sm font-medium transition-colors relative ${
                  activeTab === 'flexible'
                    ? 'text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setActiveTab('flexible')}
              >
                Linh hoạt
                {activeTab === 'flexible' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>}
              </button>
            </div>

            {/* Calendar Content */}
            {activeTab === 'calendar' && (
              <div className="p-3 md:p-4 flex-1 overflow-y-auto">
                <div className="flex gap-3 md:gap-6 flex-col md:flex-row">
                  {renderMonth(0)}
                  <div className="hidden md:block w-px bg-gray-200"></div>
                  <div className="md:hidden w-full h-px bg-gray-200"></div>
                  {renderMonth(1)}
                </div>
              </div>
            )}

            {/* Flexible Content */}
            {activeTab === 'flexible' && (
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Quý khách muốn lưu trú trong bao lâu?</p>
                  <div className="flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setFlexibleDuration('3days')}
                      className={`px-4 py-1.5 text-xs font-medium border-2 rounded-full transition-colors ${
                        flexibleDuration === '3days'
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      3 đêm
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFlexibleDuration('1week')}
                      className={`px-4 py-1.5 text-xs font-medium border-2 rounded-full transition-colors ${
                        flexibleDuration === '1week'
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      1 tuần
                    </button>
                    <button 
                      type="button" 
                      onClick={() => setFlexibleDuration('1month')}
                      className={`px-4 py-1.5 text-xs font-medium border-2 rounded-full transition-colors ${
                        flexibleDuration === '1month'
                          ? 'text-white bg-blue-600 border-blue-600'
                          : 'text-gray-700 border-gray-300 hover:border-blue-600 hover:text-blue-600'
                      }`}
                    >
                      1 tháng
                    </button>
                  </div>
                  {flexibleDuration === '3days' && (
                    <div className="mt-2 flex items-center gap-2 text-xs text-blue-600">
                      <input type="checkbox" className="rounded" defaultChecked />
                      <span>Phải bao gồm cuối tuần</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-sm font-semibold text-gray-900 mb-1">Quý khách muốn đi vào lúc nào?</p>
                  <p className="text-xs text-gray-500 mb-3">Có thể chọn nhiều tháng</p>
                  
                  <div className="relative">
                    <div className="grid grid-cols-5 gap-2">
                      {Array.from({ length: 5 }, (_, i) => {
                        const monthIndex = flexibleMonthScroll + i;
                        const monthDate = addMonths(new Date(), monthIndex);
                        const isSelected = flexibleMonths.includes(monthIndex);
                        
                        return (
                          <button
                            key={monthIndex}
                            type="button"
                            onClick={() => toggleFlexibleMonth(monthIndex)}
                            className={`px-3 py-2 text-xs font-medium border-2 rounded-lg transition-colors ${
                              isSelected
                                ? 'text-blue-600 border-blue-600 bg-blue-50'
                                : 'text-gray-700 border-gray-300 hover:border-blue-600'
                            }`}
                          >
                            <Calendar className="w-4 h-4 mx-auto mb-0.5" />
                            <div className="text-center leading-tight">
                              T{monthDate.getMonth() + 1}<br/>
                              {monthDate.getFullYear()}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Scroll arrow */}
                    <button
                      type="button"
                      onClick={() => setFlexibleMonthScroll(prev => prev + 5)}
                      className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-colors shadow-md"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      onChange('', '');
                      setSelectingStart(true);
                      setFlexibleMonths([]);
                    }}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                  >
                    Xóa
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      // Nếu chọn tháng thì tính check-in, check-out tự động
                      if (flexibleMonths.length > 0) {
                        const { checkIn: ci, checkOut: co } = calculateFlexibleDates(flexibleDuration, flexibleMonths[0]);
                        onChange(ci, co);
                      }
                      setOpen(false);
                    }}
                    className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    Chọn
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
