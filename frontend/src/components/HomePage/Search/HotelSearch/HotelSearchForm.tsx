import { useRef, useEffect } from 'react';
import ServiceTabs from './components/ServiceTabs';
import StayTypeTabs from './components/StayTypeTabs';
import DestinationInput from './components/DestinationInput';
import DatePickerField from './components/DatePicker/DatePickerField';
import CalendarPopup from './components/DatePicker/CalendarPopup';
import GuestPickerField from './components/GuestPicker/GuestPickerField';
import GuestPickerPopup from './components/GuestPicker/GuestPickerPopup';
import { useHotelSearch } from './hooks/useHotelSearch';
import { useDateSelection } from './hooks/useDateSelection';
import { useGuestSelection } from './hooks/useGuestSelection';
import type { HotelSearchProps } from './types/hotel.types';

export default function HotelSearchForm({ onSearch }: HotelSearchProps) {
  const {
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
  } = useHotelSearch();

  const dateSelection = useDateSelection(
    searchParams,
    setSearchParams,
    setShowDatePicker,
    setShowGuestPicker
  );

  const { incrementGuests, decrementGuests } = useGuestSelection(
    searchParams,
    setSearchParams
  );

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

  const handleDateClick = () => {
    setShowGuestPicker(false);
    setShowDatePicker(prev => !prev);
  };

  const handleGuestClick = () => {
    setShowDatePicker(false);
    setShowGuestPicker(prev => !prev);
  };

  return (
    <>
      {/* Overlay */}
      {(showDatePicker || showGuestPicker) && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-15 transition-opacity duration-300"
          onClick={() => {
            setShowDatePicker(false);
            setShowGuestPicker(false);
          }}
        />
      )}
      
      <div className="bg-white rounded-2xl shadow-xl p-6 relative z-10 max-w-5xl mx-auto">
        {/* Service Tabs */}
        <ServiceTabs 
          activeService="hotel"
          onServiceChange={() => {}} // Will be implemented when adding other services
        />
        
        {/* Stay Type Tabs */}
        <StayTypeTabs
          stayType={searchParams.stayType}
          onStayTypeChange={toggleStayType}
          showStayTypeTip={showStayTypeTip}
          onShowTip={setShowStayTypeTip}
        />
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields container */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            {/* Destination Input */}
            <DestinationInput
              destination={searchParams.destination}
              onDestinationChange={updateDestination}
            />

            {/* Date and Guest Fields */}
            <div className={`grid grid-cols-1 gap-3 ${searchParams.stayType === 'overnight' ? 'md:grid-cols-3' : 'md:grid-cols-2'}`}>
              {/* Check-in Date */}
              <div ref={calendarRef}>
                <DatePickerField
                  searchParams={searchParams}
                  onDateClick={handleDateClick}
                  type="checkin"
                />
                
                <CalendarPopup
                  searchParams={searchParams}
                  showDatePicker={showDatePicker}
                  calendarTab={dateSelection.calendarTab}
                  setCalendarTab={dateSelection.setCalendarTab}
                  currentCalendarMonth={dateSelection.currentCalendarMonth}
                  goToPreviousMonth={dateSelection.goToPreviousMonth}
                  goToNextMonth={dateSelection.goToNextMonth}
                  setCheckInDate={dateSelection.setCheckInDate}
                  setCheckOutDate={dateSelection.setCheckOutDate}
                  flexibleStayDuration={dateSelection.flexibleStayDuration}
                  setFlexibleStayDuration={dateSelection.setFlexibleStayDuration}
                  selectedFlexibleMonth={dateSelection.selectedFlexibleMonth}
                  setSelectedFlexibleMonth={dateSelection.setSelectedFlexibleMonth}
                  setShowDatePicker={setShowDatePicker}
                  setShowGuestPicker={setShowGuestPicker}
                />
              </div>

              {/* Check-out Date - only for overnight */}
              {searchParams.stayType === 'overnight' && (
                <div>
                  <DatePickerField
                    searchParams={searchParams}
                    onDateClick={handleDateClick}
                    type="checkout"
                  />
                </div>
              )}

              {/* Guest & Room Picker */}
              <div ref={guestPickerRef}>
                <GuestPickerField
                  searchParams={searchParams}
                  onGuestClick={handleGuestClick}
                />
                
                <GuestPickerPopup
                  searchParams={searchParams}
                  showGuestPicker={showGuestPicker}
                  incrementGuests={incrementGuests}
                  decrementGuests={decrementGuests}
                />
              </div>
            </div>

            {/* Search Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-all shadow-md font-semibold text-base flex items-center justify-center gap-2"
            >
              TÌM
            </button>
          </div>
        </form>
      </div>
    </>
  );
}