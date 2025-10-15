import type { HotelSearchParams, GuestType } from '../types/hotel.types';

export const useGuestSelection = (
  searchParams: HotelSearchParams,
  setSearchParams: (params: HotelSearchParams) => void
) => {
  const incrementGuests = (type: GuestType) => {
    if (type === 'adults' && searchParams.adults < 30) {
      setSearchParams({ ...searchParams, adults: searchParams.adults + 1 });
    } else if (type === 'children' && searchParams.children < 10) {
      setSearchParams({ ...searchParams, children: searchParams.children + 1 });
    } else if (type === 'rooms' && searchParams.rooms < 30) {
      const newRooms = searchParams.rooms + 1;
      // Chỉ tính người lớn, không tính trẻ em
      const currentAdults = searchParams.adults;
      
      // Nếu số người lớn ít hơn số phòng mới, tự động tăng người lớn
      if (currentAdults < newRooms) {
        const additionalAdults = newRooms - currentAdults;
        const newAdults = searchParams.adults + additionalAdults;
        
        // Kiểm tra không vượt quá giới hạn 30 người lớn
        if (newAdults <= 30) {
          setSearchParams({ 
            ...searchParams, 
            rooms: newRooms,
            adults: newAdults
          });
        } else {
          // Nếu vượt quá 30 người lớn, chỉ tăng đến mức tối đa có thể
          const maxAdditionalAdults = 30 - searchParams.adults;
          const finalAdults = searchParams.adults + maxAdditionalAdults;
          setSearchParams({ 
            ...searchParams, 
            rooms: newRooms,
            adults: finalAdults
          });
        }
      } else {
        // Nếu đã đủ người lớn, chỉ tăng số phòng
        setSearchParams({ ...searchParams, rooms: newRooms });
      }
    }
  };

  const decrementGuests = (type: GuestType) => {
    if (type === 'adults' && searchParams.adults > 1) {
      const newAdults = searchParams.adults - 1;
      
      // Chỉ cho phép giảm nếu số người lớn mới vẫn >= số phòng
      if (newAdults >= searchParams.rooms) {
        setSearchParams({ ...searchParams, adults: newAdults });
      }
    } else if (type === 'children' && searchParams.children > 0) {
      // Trẻ em không ảnh hưởng đến validation, luôn cho phép giảm
      const newChildren = searchParams.children - 1;
      setSearchParams({ ...searchParams, children: newChildren });
    } else if (type === 'rooms' && searchParams.rooms > 1) {
      const newRooms = searchParams.rooms - 1;
      // Luôn cho phép giảm phòng vì số người lớn sẽ luôn >= số phòng mới (ít hơn)
      setSearchParams({ ...searchParams, rooms: newRooms });
    }
  };

  return {
    incrementGuests,
    decrementGuests
  };
};