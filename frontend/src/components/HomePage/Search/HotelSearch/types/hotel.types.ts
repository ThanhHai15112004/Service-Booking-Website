export interface HotelSearchParams {
  destination: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
  rooms: number;
  stayType: 'overnight' | 'dayUse';
}

export interface HotelSearchProps {
  onSearch: (params: HotelSearchParams) => void;
}

export interface CalendarData {
  currentMonth: {
    month: number;
    year: number;
    firstDay: number;
    daysInMonth: number;
  };
  nextMonth: {
    month: number;
    year: number;
    firstDay: number;
    daysInMonth: number;
  };
}

export type FlexibleStayDuration = '3days' | '1week' | '1month';
export type CalendarTab = 'calendar' | 'flexible';
export type StayType = 'overnight' | 'dayUse';
export type GuestType = 'adults' | 'children' | 'rooms';

export interface DatePickerProps {
  searchParams: HotelSearchParams;
  showDatePicker: boolean;
  onDateClick: () => void;
  setCheckInDate: (date: Date) => void;
  setCheckOutDate: (date: Date) => void;
  calendarRef: React.RefObject<HTMLDivElement>;
}

export interface GuestPickerProps {
  searchParams: HotelSearchParams;
  showGuestPicker: boolean;
  onGuestClick: () => void;
  incrementGuests: (type: GuestType) => void;
  decrementGuests: (type: GuestType) => void;
  guestPickerRef: React.RefObject<HTMLDivElement>;
}

export interface ServiceTabsProps {
  activeService: string;
  onServiceChange: (service: string) => void;
}

export interface StayTypeTabsProps {
  stayType: StayType;
  onStayTypeChange: (type: StayType) => void;
  showStayTypeTip: boolean;
  onShowTip: (show: boolean) => void;
}

export interface DestinationInputProps {
  destination: string;
  onDestinationChange: (destination: string) => void;
}