import { useState } from 'react';
import type { HotelSearchParams, CalendarTab, FlexibleStayDuration } from '../types/hotel.types';

export const useDateSelection = (
  searchParams: HotelSearchParams,
  setSearchParams: (params: HotelSearchParams) => void,
  setShowDatePicker: (show: boolean) => void,
  setShowGuestPicker: (show: boolean) => void
) => {
  const [calendarTab, setCalendarTab] = useState<CalendarTab>('calendar');
  const [flexibleStayDuration, setFlexibleStayDuration] = useState<FlexibleStayDuration>('1week');
  const [selectedFlexibleMonth, setSelectedFlexibleMonth] = useState<Date | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState<Date>(new Date());

  const setCheckInDate = (date: Date) => {
    if (searchParams.stayType === 'dayUse') {
      setSearchParams({ ...searchParams, checkIn: date, checkOut: date });
      setTimeout(() => {
        setShowDatePicker(false);
        setShowGuestPicker(true);
      }, 300);
      return;
    }
    
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
    if (searchParams.checkIn && date < searchParams.checkIn) {
      return;
    }
    setSearchParams({ ...searchParams, checkOut: date });
    
    setTimeout(() => {
      setShowDatePicker(false);
      setShowGuestPicker(true);
    }, 300);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentCalendarMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    
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

  return {
    calendarTab,
    setCalendarTab,
    flexibleStayDuration,
    setFlexibleStayDuration,
    selectedFlexibleMonth,
    setSelectedFlexibleMonth,
    currentCalendarMonth,
    setCurrentCalendarMonth,
    setCheckInDate,
    setCheckOutDate,
    goToPreviousMonth,
    goToNextMonth
  };
};