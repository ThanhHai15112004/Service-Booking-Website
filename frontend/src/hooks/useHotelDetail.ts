import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useSearch } from '../contexts/SearchContext';
import { getHotelDetail, getHotelCounts } from '../services/hotelService';
import {
  HotelDetail,
  Room,
  HotelHighlight,
  HotelCounts,
  RoomFiltersState
} from '../types';

export interface UseHotelDetailReturn {
  // Data
  hotel: HotelDetail | null;
  hotelCounts: HotelCounts;
  images: string[];
  highlights: HotelHighlight[];
  availableRooms: Room[];
  
  // Search params
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
  
  // Room filters
  roomFilters: RoomFiltersState;
  setRoomFilters: React.Dispatch<React.SetStateAction<RoomFiltersState>>;
  
  // States
  isLoading: boolean;
  error: string | null;
}

/**
 * Custom hook for Hotel Detail Page
 * Handles all data fetching, state management, and business logic
 */
export function useHotelDetail(): UseHotelDetailReturn {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const { searchParams: contextSearchParams, updateSearchParams } = useSearch();

  // States
  const [hotel, setHotel] = useState<HotelDetail | null>(null);
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hotelCounts, setHotelCounts] = useState<HotelCounts>({ countryCount: 0, cityCount: 0 });
  const [roomFilters, setRoomFilters] = useState<RoomFiltersState>({
    noSmoking: false,
    payLater: false,
    freeCancellation: false,
    breakfast: false,
    kingBed: false,
    cityView: false,
    noCreditCard: false
  });

  // Initialize from URL params or SearchContext with safe defaults
  const checkInParam = searchParams.get('checkIn') || contextSearchParams.checkIn || '';
  const checkOutParam = searchParams.get('checkOut') || contextSearchParams.checkOut || '';
  const guestsParam = searchParams.get('guests') || contextSearchParams.adults?.toString() || '2';
  const roomsParam = searchParams.get('rooms') || contextSearchParams.rooms?.toString() || '1';
  const childrenParam = searchParams.get('children') || contextSearchParams.children?.toString() || '0';

  const [checkIn] = useState(checkInParam);
  const [checkOut] = useState(checkOutParam);
  const [guests] = useState(parseInt(guestsParam) || 2);
  const [rooms] = useState(parseInt(roomsParam) || 1);
  const [children] = useState(parseInt(childrenParam) || 0);

  // Sync URL params to SearchContext on page load
  useEffect(() => {
    const destination = searchParams.get('destination');
    const checkInParam = searchParams.get('checkIn');
    const checkOutParam = searchParams.get('checkOut');
    const roomsParam = searchParams.get('rooms');
    const guestsParam = searchParams.get('guests');
    const childrenParam = searchParams.get('children');

    // If URL has search params, sync to context
    if (checkInParam && checkOutParam) {
      updateSearchParams({
        destination: destination || contextSearchParams.destination,
        destinationName: destination || contextSearchParams.destinationName,
        checkIn: checkInParam,
        checkOut: checkOutParam,
        adults: parseInt(guestsParam || '2'),
        rooms: parseInt(roomsParam || '1'),
        children: parseInt(childrenParam || '0'),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch hotel details from API
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!id) return;

      // Validate required params
      if (!checkIn || !checkOut) {
        setError('Thiếu thông tin ngày nhận/trả phòng');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('🏨 Fetching hotel details:', { id, checkIn, checkOut, guests, rooms, children });

        const response = await getHotelDetail(id, {
          checkIn,
          checkOut,
          adults: guests,
          rooms,
          children
        });

        console.log('📦 Hotel API response:', response);

        if (response.success && response.data) {
          const hotelData = response.data.hotel;
          setHotel(hotelData);
          
          // Set available rooms
          const rooms = response.data.availableRooms || [];
          setAvailableRooms(rooms);
          
          // Fetch hotel counts for breadcrumb
          if (hotelData?.city) {
            const countsResponse = await getHotelCounts('Vietnam', hotelData.city);
            if (countsResponse.success) {
              setHotelCounts(countsResponse.data);
            }
          }
        } else {
          setError(response.message || 'Không tìm thấy khách sạn');
        }
      } catch (err: any) {
        console.error('❌ Error fetching hotel:', err);
        setError('Có lỗi xảy ra khi tải thông tin khách sạn');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, checkIn, checkOut, guests, rooms, children]);

  // Build images array from hotel data
  const images = Array.isArray(hotel?.images) && hotel.images.length > 0
    ? hotel.images.map((img: any) => img.imageUrl)
    : hotel?.mainImage
      ? [hotel.mainImage]
      : ['https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg'];

  // Get highlights from API or use empty array
  const highlights: HotelHighlight[] = hotel?.highlights || [];

  return {
    hotel,
    hotelCounts,
    images,
    highlights,
    availableRooms,
    checkIn,
    checkOut,
    guests,
    rooms,
    children,
    roomFilters,
    setRoomFilters,
    isLoading,
    error
  };
}

