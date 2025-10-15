import { useState } from 'react';
import type { HotelSearchParams, StayType } from '../types/hotel.types';

export const useHotelSearch = () => {
  const [searchParams, setSearchParams] = useState<HotelSearchParams>({
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

  const toggleStayType = (type: StayType) => {
    setSearchParams({ 
      ...searchParams, 
      stayType: type,
      checkIn: null,
      checkOut: null
    });
  };

  const updateDestination = (destination: string) => {
    setSearchParams({ ...searchParams, destination });
  };

  return {
    searchParams,
    setSearchParams,
    showDatePicker,
    setShowDatePicker,
    showGuestPicker,
    setShowGuestPicker,
    showStayTypeTip,
    setShowStayTypeTip,
    toggleStayType,
    updateDestination
  };
};