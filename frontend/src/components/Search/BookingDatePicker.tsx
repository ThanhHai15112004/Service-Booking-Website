// src/components/search/BookingDatePicker.tsx
import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isAfter,
  isBefore,
  format,
  parseISO,
} from 'date-fns';

interface Props {
  checkIn: string;
  checkOut: string;
  onChange: (ci: string, co: string, stayType?: 'overnight' | 'dayuse') => void; // ✅ Add stayType
  onClose: () => void;
}

export default function BookingDatePicker({ checkIn, checkOut, onChange, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<'overnight' | 'dayuse' | 'flexible'>('overnight');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectingStart, setSelectingStart] = useState(true);
  const [flexibleDuration, setFlexibleDuration] = useState<'3days' | '1week' | '1month'>('1week');
  const [flexibleMonths, setFlexibleMonths] = useState<number[]>([0]);
  const [flexibleMonthScroll, setFlexibleMonthScroll] = useState(0);

  const startDate = checkIn ? parseISO(checkIn) : null;
  const endDate = checkOut ? parseISO(checkOut) : null;

  // Update parent when tab changes
  const handleTabChange = (newTab: 'overnight' | 'dayuse' | 'flexible') => {
    setActiveTab(newTab);
    // Only update stayType for overnight and dayuse tabs
    // Flexible tab uses overnight mode without changing stayType
    if (newTab === 'overnight') {
      onChange(checkIn, checkOut, 'overnight');
    } else if (newTab === 'dayuse') {
      // When switching to dayuse, auto-select the check-in date as the dayuse date
      if (checkIn) {
        onChange(checkIn, checkIn, 'dayuse');
      } else {
        onChange(checkIn, checkOut, 'dayuse');
      }
    }
    // For 'flexible', don't call onChange to keep current stayType
  };

  const handleDateClick = (date: Date) => {
    // Khi là day use, chỉ chọn 1 ngày
    if (activeTab === 'dayuse') {
      onChange(format(date, 'yyyy-MM-dd'), format(date, 'yyyy-MM-dd'), 'dayuse'); // ✅ Pass stayType
      setTimeout(() => onClose(), 300);
      return;
    }

    // Click 2 lần vào cùng 1 ngày để xóa (overnight mode)
    if (startDate && isSameDay(date, startDate) && !endDate) {
      onChange('', '', 'overnight');
      setSelectingStart(true);
      return;
    }

    if (selectingStart || !startDate) {
      onChange(format(date, 'yyyy-MM-dd'), '', 'overnight');
      setSelectingStart(false);
    } else {
      if (isBefore(date, startDate)) {
        onChange(format(date, 'yyyy-MM-dd'), '', 'overnight');
      } else {
        onChange(checkIn, format(date, 'yyyy-MM-dd'), 'overnight');
        setSelectingStart(true);
        setTimeout(() => onClose(), 300);
      }
    }
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
            <button
              type="button"
              onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft className="w-4 md:w-5 h-4 md:h-5 text-gray-700" />
            </button>
          )}
          <div className="flex-1 text-center font-semibold text-sm md:text-base text-gray-900">
            Tháng {month.getMonth() + 1} {month.getFullYear()}
          </div>
          {monthOffset === 1 && (
            <button
              type="button"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              className="p-1.5 hover:bg-gray-100 rounded-full"
            >
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
    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 w-full md:w-[700px] max-h-[500px] flex flex-col overflow-hidden">
      {/* Tabs header */}
      <div className="flex border-b border-gray-200 flex-shrink-0">
        <button
          type="button"
          className={`flex-1 px-5 py-3 text-base font-bold transition-colors relative flex items-center justify-center gap-2 ${
            activeTab === 'overnight' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('overnight')}
        >
          <Calendar className="w-5 h-5" />
          Chỗ Ở Qua Đêm
          {activeTab === 'overnight' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          type="button"
          className={`flex-1 px-5 py-3 text-base font-bold transition-colors relative flex items-center justify-center gap-2 ${
            activeTab === 'dayuse' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('dayuse')}
        >
          <Calendar className="w-5 h-5" />
          Chỗ Ở Trong Ngày
          {activeTab === 'dayuse' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
        <button
          type="button"
          className={`flex-1 px-5 py-3 text-base font-bold transition-colors relative flex items-center justify-center gap-2 ${
            activeTab === 'flexible' ? 'text-blue-600' : 'text-gray-600 hover:text-gray-900'
          }`}
          onClick={() => handleTabChange('flexible')}
        >
          <ChevronRight className="w-5 h-5" />
          Linh hoạt
          {activeTab === 'flexible' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
          )}
        </button>
      </div>

      {/* Calendar Content for Overnight */}
      {activeTab === 'overnight' && (
        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="flex gap-3 md:gap-6 flex-col md:flex-row">
            {renderMonth(0)}
            <div className="hidden md:block w-px bg-gray-200"></div>
            <div className="md:hidden w-full h-px bg-gray-200"></div>
            {renderMonth(1)}
          </div>
        </div>
      )}

      {/* Calendar Content for Dayuse */}
      {activeTab === 'dayuse' && (
        <div className="p-3 md:p-4 flex-1 overflow-y-auto">
          <div className="bg-red-50 text-red-700 px-3 py-2 rounded text-xs mb-3 flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Quý khách đang tìm kiếm <b>Chỗ Ở Trong Ngày</b>
          </div>
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
              {[
                { k: '3days', label: '3 đêm' },
                { k: '1week', label: '1 tuần' },
                { k: '1month', label: '1 tháng' },
              ].map((opt) => (
                <button
                  key={opt.k}
                  onClick={() => setFlexibleDuration(opt.k as any)}
                  className={`px-3 py-1.5 text-xs font-medium border-2 rounded-full transition-colors ${
                    flexibleDuration === opt.k
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-gray-300 text-gray-700 hover:border-blue-600'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {flexibleDuration === '3days' && (
              <p className="text-xs text-gray-500 mt-2">Gợi ý: 3 đêm thường là một kỳ nghỉ cuối tuần.</p>
            )}
          </div>

          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-900 mb-1">Quý khách muốn đi vào lúc nào?</p>
            <p className="text-xs text-gray-500 mb-3">Có thể chọn nhiều tháng</p>

            <div className="relative">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }, (_, i) => {
                  const monthIndex = flexibleMonthScroll + i;
                  const date = addMonths(new Date(), monthIndex);
                  const isSelected = flexibleMonths.includes(monthIndex);
                  return (
                    <button
                      key={monthIndex}
                      onClick={() => {
                        // Auto-select and calculate dates when clicking month
                        const checkInDate = new Date();
                        checkInDate.setMonth(checkInDate.getMonth() + monthIndex);
                        checkInDate.setDate(1);
                        checkInDate.setHours(0, 0, 0, 0);
                        const checkInStr = format(checkInDate, 'yyyy-MM-dd');
                        
                        // Calculate check-out date based on duration
                        const checkOutDate = new Date(checkInDate);
                        if (flexibleDuration === '3days') {
                          checkOutDate.setDate(checkOutDate.getDate() + 3);
                        } else if (flexibleDuration === '1week') {
                          checkOutDate.setDate(checkOutDate.getDate() + 7);
                        } else if (flexibleDuration === '1month') {
                          checkOutDate.setMonth(checkOutDate.getMonth() + 1);
                        }
                        checkOutDate.setHours(0, 0, 0, 0);
                        const checkOutStr = format(checkOutDate, 'yyyy-MM-dd');
                        
                        // Update parent and close immediately
                        onChange(checkInStr, checkOutStr, 'overnight');
                        setActiveTab('overnight');
                        onClose();
                      }}
                      className={`px-3 py-2 border-2 rounded-lg text-xs font-medium transition ${
                        isSelected
                          ? 'border-blue-600 text-blue-600 bg-blue-50'
                          : 'border-gray-300 text-gray-700 hover:border-blue-600'
                      }`}
                    >
                      <Calendar className="w-4 h-4 mx-auto mb-0.5" />
                      <div>
                        Tháng {date.getMonth() + 1}
                        <br />
                        {date.getFullYear()}
                      </div>
                    </button>
                  );
                })}
              </div>
              {flexibleMonthScroll > 0 && (
                <button
                  type="button"
                  onClick={() => setFlexibleMonthScroll((p) => Math.max(0, p - 5))}
                  className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-600 shadow-md"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setFlexibleMonthScroll((p) => p + 5)}
                className="absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-2 border-gray-300 rounded-full flex items-center justify-center hover:border-blue-600 shadow-md"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setFlexibleMonths([])}
              className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Xóa
            </button>
            <button
              type="button"
              onClick={() => {
                // Handle flexible tab date selection
                if (flexibleMonths.length > 0) {
                  // Calculate check-in date based on selected month
                  const selectedMonthIndex = flexibleMonths[0];
                  const checkInDate = new Date();
                  checkInDate.setMonth(checkInDate.getMonth() + selectedMonthIndex);
                  checkInDate.setDate(1); // Start from 1st of month
                  checkInDate.setHours(0, 0, 0, 0);
                  const checkInStr = format(checkInDate, 'yyyy-MM-dd');
                  
                  // Calculate check-out date based on duration
                  const checkOutDate = new Date(checkInDate);
                  if (flexibleDuration === '3days') {
                    checkOutDate.setDate(checkOutDate.getDate() + 3);
                  } else if (flexibleDuration === '1week') {
                    checkOutDate.setDate(checkOutDate.getDate() + 7);
                  } else if (flexibleDuration === '1month') {
                    checkOutDate.setMonth(checkOutDate.getMonth() + 1);
                  }
                  checkOutDate.setHours(0, 0, 0, 0);
                  const checkOutStr = format(checkOutDate, 'yyyy-MM-dd');
                  
                  // Update parent with overnight mode and calculated dates
                  onChange(checkInStr, checkOutStr, 'overnight');
                }
                
                // Reset to overnight tab when closing from flexible
                setActiveTab('overnight');
                onClose();
              }}
              className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
