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
  stayType: 'overnight' | 'dayuse'; // ✅ Thêm stayType
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
  const { searchParams: contextSearchParams } = useSearch(); // ✅ Removed updateSearchParams

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

  // ✅ FIX: Đọc trực tiếp từ URL params (không dùng useState để nó tự động update khi URL thay đổi)
  const checkIn = searchParams.get('checkIn') || contextSearchParams.checkIn || '';
  const checkOut = searchParams.get('checkOut') || contextSearchParams.checkOut || '';
  const stayType = (searchParams.get('stayType') as 'overnight' | 'dayuse') || 'overnight'; // ✅ Thêm stayType
  const guests = parseInt(searchParams.get('guests') || contextSearchParams.adults?.toString() || '2');
  const rooms = parseInt(searchParams.get('rooms') || contextSearchParams.rooms?.toString() || '1');
  const children = parseInt(searchParams.get('children') || contextSearchParams.children?.toString() || '0');

  // ✅ FIX: KHÔNG SYNC params vào SearchContext nữa
  // Params chỉ đọc từ URL, không lưu vào context
  // useEffect(() => {
  //   const destination = searchParams.get('destination');
  //   const checkInParam = searchParams.get('checkIn');
  //   const checkOutParam = searchParams.get('checkOut');
  //   const roomsParam = searchParams.get('rooms');
  //   const guestsParam = searchParams.get('guests');
  //   const childrenParam = searchParams.get('children');

  //   // If URL has search params, sync to context
  //   if (checkInParam && checkOutParam) {
  //     updateSearchParams({
  //       destination: destination || contextSearchParams.destination,
  //       destinationName: destination || contextSearchParams.destinationName,
  //       checkIn: checkInParam,
  //       checkOut: checkOutParam,
  //       adults: parseInt(guestsParam || '2'),
  //       rooms: parseInt(roomsParam || '1'),
  //       children: parseInt(childrenParam || '0'),
  //     });
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []); // Only run once on mount

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

        console.log('🏨 Fetching hotel details:', { id, checkIn, checkOut, stayType, guests, rooms, children });

        const response = await getHotelDetail(id, {
          checkIn,
          checkOut,
          stayType, // ✅ Thêm stayType
          adults: guests,
          rooms,
          children
        });

        console.log('📦 Hotel API response:', response);

        // ✅ FIX: Kiểm tra response structure kỹ hơn
        if (!response || !response.success) {
          const errorMsg = response?.message || 'Không tìm thấy khách sạn';
          console.error('❌ API response error:', errorMsg, response);
          setError(errorMsg);
          return;
        }

        if (!response.data) {
          console.error('❌ API response missing data:', response);
          setError('Dữ liệu không hợp lệ từ server');
          return;
        }

        const hotelData = response.data.hotel;
        
        // ✅ FIX: Validate hotel data
        if (!hotelData) {
          console.error('❌ API response missing hotel data:', response);
          setError('Không tìm thấy thông tin khách sạn');
          return;
        }

        console.log('✅ Hotel data received:', hotelData);
        setHotel(hotelData);
        
        // ✅ FIX: Đổi tên biến để tránh conflict với `rooms` param
        const availableRoomsData = response.data.availableRooms || [];
        console.log('✅ Available rooms count:', availableRoomsData.length);
        setAvailableRooms(availableRoomsData);
        
        // Fetch hotel counts for breadcrumb
        if (hotelData?.city) {
          try {
            const countsResponse = await getHotelCounts('Vietnam', hotelData.city);
            if (countsResponse.success) {
              setHotelCounts(countsResponse.data);
            }
          } catch (countsErr) {
            console.warn('⚠️ Failed to fetch hotel counts:', countsErr);
            // Không fail nếu counts fail, chỉ log warning
          }
        }
      } catch (err: any) {
        console.error('❌ Error fetching hotel:', err);
        console.error('❌ Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status,
          stack: err.stack
        });
        
        // ✅ FIX: Xử lý error message chi tiết hơn
        let errorMessage = 'Có lỗi xảy ra khi tải thông tin khách sạn';
        
        if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        } else if (err.message) {
          errorMessage = err.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [id, checkIn, checkOut, stayType, guests, rooms, children]); // ✅ Thêm stayType vào dependencies

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
    stayType, // ✅ Export stayType
    guests,
    rooms,
    children,
    roomFilters,
    setRoomFilters,
    isLoading,
    error
  };
}

