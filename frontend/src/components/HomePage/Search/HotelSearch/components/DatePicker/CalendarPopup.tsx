import { ChevronLeft, ChevronRight } from 'lucide-react';
import FlexibleTab from './FlexibleTab';
import { generateCalendar } from '../../utils';
import type { HotelSearchParams, CalendarTab, FlexibleStayDuration } from '../../types/hotel.types';

interface CalendarPopupProps {
  searchParams: HotelSearchParams;
  showDatePicker: boolean;
  calendarTab: CalendarTab;
  setCalendarTab: (tab: CalendarTab) => void;
  currentCalendarMonth: Date;
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;
  setCheckInDate: (date: Date) => void;
  setCheckOutDate: (date: Date) => void;
  flexibleStayDuration: FlexibleStayDuration;
  setFlexibleStayDuration: (duration: FlexibleStayDuration) => void;
  selectedFlexibleMonth: Date | null;
  setSelectedFlexibleMonth: (month: Date | null) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowGuestPicker: (show: boolean) => void;
}

export default function CalendarPopup({
  searchParams,
  showDatePicker,
  calendarTab,
  setCalendarTab,
  currentCalendarMonth,
  goToPreviousMonth,
  goToNextMonth,
  setCheckInDate,
  setCheckOutDate,
  flexibleStayDuration,
  setFlexibleStayDuration,
  selectedFlexibleMonth,
  setSelectedFlexibleMonth,
  setShowDatePicker,
  setShowGuestPicker
}: CalendarPopupProps) {
  if (!showDatePicker) return null;

  const calendar = generateCalendar(currentCalendarMonth);

  const renderCalendarGrid = (monthData: any, isNextMonth: boolean = false) => {
    return (
      <div className="flex-1">
        <div className="grid grid-cols-7 gap-2">
          {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
            <div key={day} className="text-xs font-semibold text-gray-600 text-center py-2">{day}</div>
          ))}
          
          {/* Ngày trống đầu tháng */}
          {Array.from({ length: (monthData.firstDay + 6) % 7 }).map((_, i) => (
            <div key={`empty-${isNextMonth ? 'next-' : ''}${i}`} className="p-2"></div>
          ))}
          
          {/* Các ngày trong tháng */}
          {Array.from({ length: monthData.daysInMonth }).map((_, i) => {
            const day = i + 1;
            const currentDate = new Date(monthData.year, monthData.month, day);
            const isToday = new Date().toDateString() === currentDate.toDateString();
            
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
                key={`${isNextMonth ? 'next-' : ''}day-${day}`}
                type="button"
                disabled={isPast}
                onClick={() => {
                  if (searchParams.stayType === 'dayUse') {
                    setCheckInDate(currentDate);
                  } else {
                    if (!searchParams.checkIn) {
                      setCheckInDate(currentDate);
                    } else if (searchParams.checkOut) {
                      setCheckInDate(currentDate);
                    } else if (currentDate < searchParams.checkIn) {
                      setCheckInDate(currentDate);
                    } else if (currentDate.getTime() === searchParams.checkIn.getTime()) {
                      return;
                    } else {
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
    );
  };

  return (
    <div className="absolute left-0 mt-2 p-6 bg-white rounded-xl shadow-2xl z-20 w-[750px] border border-gray-200">
      {/* Header với tabs */}
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
          {/* Navigation */}
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
            >
              <ChevronRight className="w-6 h-6 text-gray-600" />
            </button>
          </div>
          
          <div className="flex gap-8">
            {renderCalendarGrid(calendar.currentMonth)}
            {renderCalendarGrid(calendar.nextMonth, true)}
          </div>
        </div>
      )}
      
      {/* Tab Linh hoạt */}
      {calendarTab === 'flexible' && (
        <FlexibleTab
          flexibleStayDuration={flexibleStayDuration}
          setFlexibleStayDuration={setFlexibleStayDuration}
          selectedFlexibleMonth={selectedFlexibleMonth}
          setSelectedFlexibleMonth={setSelectedFlexibleMonth}
          setShowDatePicker={setShowDatePicker}
          setShowGuestPicker={setShowGuestPicker}
          onFlexibleDateSelect={(checkIn: Date, checkOut: Date) => {
            setCheckInDate(checkIn);
            setCheckOutDate(checkOut);
          }}
        />
      )}
    </div>
  );
}