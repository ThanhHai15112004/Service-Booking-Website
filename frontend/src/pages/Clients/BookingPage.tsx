import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useSearch } from '../../contexts/SearchContext';
import { BOOKING_EXPIRATION_MINUTES } from '../../config/booking.constants';
import {
  BookingSummary,
  BookingSuccess,
  BookingFailure,
  BookingHeader,
  BookingStep1,
  BookingStep2
} from '../../components/BookingPage';
import { getHotelDetail } from '../../services/hotelService';
import { createBooking, createTemporaryBooking, cancelBooking, checkBookingExists, confirmBooking, CreateBookingRequest, getBookingById } from '../../services/bookingService';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile } from '../../services/profileService';
import { validateDiscountCode } from '../../services/discountService';

export default function BookingPage() {
  const { id } = useParams(); // hotelId or roomId
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { searchParams: contextSearchParams } = useSearch(); // ✅ Removed updateSearchParams
  const { isLoggedIn, user } = useAuth(); // ✅ Check authentication and get user info

  const [hotel, setHotel] = useState<any>(null);
  const [room, setRoom] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get search params from URL or SearchContext
  const checkIn = searchParams.get('checkIn') || contextSearchParams.checkIn;
  const checkOut = searchParams.get('checkOut') || contextSearchParams.checkOut;
  const stayType = (searchParams.get('stayType') as 'overnight' | 'dayuse') || 'overnight'; // ✅ Get stayType
  const guests = parseInt(searchParams.get('guests') || contextSearchParams.adults.toString() || '2');
  const rooms = parseInt(searchParams.get('rooms') || contextSearchParams.rooms.toString() || '1');
  const children = parseInt(searchParams.get('children') || contextSearchParams.children.toString() || '0');
  
  // ✅ Get payment method from URL params
  const paymentMethodParam = searchParams.get('paymentMethod') || 'pay_at_hotel';
  const initialPaymentMethod = (paymentMethodParam === 'online_payment' ? 'online_payment' : 'pay_at_hotel') as 'pay_at_hotel' | 'online_payment';

  const [currentStep, setCurrentStep] = useState(1); // 1: Guest Info, 2: Payment/Confirmation, 3: Success
  const [bookingData, setBookingData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    guestFirstName: '',
    guestLastName: '',
    country: 'Việt Nam',
    checkInTime: 'unknown',
    checkIn: checkIn,
    checkOut: checkOut,
    guests: guests,
    rooms: rooms,
    children: children,
    specialRequests: '',
    paymentMethod: initialPaymentMethod,
    smokingPreference: 'non-smoking' as 'non-smoking' | 'smoking' | null,
    bedPreference: null as 'large-bed' | 'twin-beds' | null,
    showMoreRequests: false,
    // Payment info
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: '',
    // Discount code
    discountCode: '',
    discountCodeApplied: false,
    discountCodeError: ''
  });

  const [bookingComplete, setBookingComplete] = useState(false);
  const [bookingConfirmation, setBookingConfirmation] = useState<any>(null);
  const [bookingFailed, setBookingFailed] = useState(false);
  const [bookingFailureMessage, setBookingFailureMessage] = useState<string>('');
  const [failedBookingId, setFailedBookingId] = useState<string | null>(null);
  
  // ✅ Temporary booking state (CREATED status)
  // ✅ Restore from localStorage on mount to persist on reload
  const [temporaryBookingId, setTemporaryBookingId] = useState<string | null>(() => {
    const saved = localStorage.getItem('temporaryBookingId');
    return saved || null;
  });
  const [bookingExpiresAt, setBookingExpiresAt] = useState<Date | null>(() => {
    const saved = localStorage.getItem('temporaryBookingExpiresAt');
    if (saved) {
      const expiresAt = new Date(saved);
      // ✅ Check if expired, if so return null
      return expiresAt > new Date() ? expiresAt : null;
    }
    return null;
  });
  const [timeRemaining, setTimeRemaining] = useState<number>(() => {
    // ✅ Calculate initial time remaining from saved expiresAt
    const saved = localStorage.getItem('temporaryBookingExpiresAt');
    if (saved) {
      const expiresAt = new Date(saved);
      const now = new Date();
      const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      return remaining;
    }
    return BOOKING_EXPIRATION_MINUTES * 60; // Default (match với backend constant)
  });
  
  // ✅ Flag to prevent duplicate API calls (useRef to avoid infinite loop)
  const isCreatingTemporaryBookingRef = useRef(false);

  // ✅ Rehydrated booking totals from backend (prevents price = 0 on reload)
  const [rehydratedTotals, setRehydratedTotals] = useState<{
    subtotal: number;
    tax: number;
    total: number;
    nights: number;
    packageDiscount?: number;
    codeDiscount?: number;
    subtotalAfterPackage?: number;
  } | null>(null);

  // ✅ Auto-fill guest information from account if user is logged in
  // Fetch full profile from API to get phone_number from database
  useEffect(() => {
    const fetchAndFillProfile = async () => {
      if (isLoggedIn && user) {
        try {
          // Fetch full profile from API to get phone_number
          const profileResponse = await getProfile();
          const profileData = profileResponse.success ? profileResponse.data : null;
          
          // Use profile data if available, otherwise use user from AuthContext
          const accountData = profileData || user;
          
          // Parse full_name to firstName and lastName
          // Vietnamese name format: usually "Họ Tên Đệm Tên" (Last Middle First)
          // We'll split: last word = first name, rest = last name
          let firstName = '';
          let lastName = '';
          let guestName = '';
          
          const fullName = accountData.full_name || user.full_name;
          if (fullName) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length === 1) {
              firstName = nameParts[0];
              lastName = '';
              guestName = nameParts[0];
            } else if (nameParts.length === 2) {
              firstName = nameParts[1]; // First name
              lastName = nameParts[0]; // Last name
              guestName = fullName;
            } else {
              // For names with more parts: last part = first name, rest = last name
              firstName = nameParts[nameParts.length - 1];
              lastName = nameParts.slice(0, nameParts.length - 1).join(' ');
              guestName = fullName;
            }
          }
          
          // Auto-fill form with account data (only if fields are empty)
          setBookingData((prev: any) => ({
            ...prev,
            // Fill name if empty
            guestName: (prev.guestName && prev.guestName.trim() !== '') ? prev.guestName : (guestName || ''),
            guestFirstName: (prev.guestFirstName && prev.guestFirstName.trim() !== '') ? prev.guestFirstName : (firstName || ''),
            guestLastName: (prev.guestLastName && prev.guestLastName.trim() !== '') ? prev.guestLastName : (lastName || ''),
            // Fill email if empty
            guestEmail: (prev.guestEmail && prev.guestEmail.trim() !== '') ? prev.guestEmail : (accountData.email || user.email || ''),
            // ✅ Fill phone_number from database if empty
            guestPhone: (prev.guestPhone && prev.guestPhone.trim() !== '') ? prev.guestPhone : (accountData.phone_number || user.phone_number || ''),
            // Keep country default as 'Việt Nam' if not already set
            country: prev.country || 'Việt Nam'
          }));
        } catch (error) {
          console.error('Error fetching profile for auto-fill:', error);
          // Fallback to AuthContext user data
          const fullName = user.full_name || '';
          let firstName = '';
          let lastName = '';
          let guestName = '';
          
          if (fullName) {
            const nameParts = fullName.trim().split(/\s+/);
            if (nameParts.length === 1) {
              firstName = nameParts[0];
              lastName = '';
              guestName = nameParts[0];
            } else if (nameParts.length === 2) {
              firstName = nameParts[1];
              lastName = nameParts[0];
              guestName = fullName;
            } else {
              firstName = nameParts[nameParts.length - 1];
              lastName = nameParts.slice(0, nameParts.length - 1).join(' ');
              guestName = fullName;
            }
          }
          
          setBookingData((prev: any) => ({
            ...prev,
            guestName: (prev.guestName && prev.guestName.trim() !== '') ? prev.guestName : (guestName || ''),
            guestFirstName: (prev.guestFirstName && prev.guestFirstName.trim() !== '') ? prev.guestFirstName : (firstName || ''),
            guestLastName: (prev.guestLastName && prev.guestLastName.trim() !== '') ? prev.guestLastName : (lastName || ''),
            guestEmail: (prev.guestEmail && prev.guestEmail.trim() !== '') ? prev.guestEmail : (user.email || ''),
            guestPhone: (prev.guestPhone && prev.guestPhone.trim() !== '') ? prev.guestPhone : (user.phone_number || ''),
            country: prev.country || 'Việt Nam'
          }));
        }
      }
    };
    
    fetchAndFillProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, user?.account_id]); // Only run when user logs in or user ID changes

  // ✅ FIX: KHÔNG SYNC params vào SearchContext nữa
  // Params chỉ đọc từ URL, không lưu vào context
  // useEffect(() => {
  //   const checkInParam = searchParams.get('checkIn');
  //   const checkOutParam = searchParams.get('checkOut');
  //   const guestsParam = searchParams.get('guests');
  //   const roomsParam = searchParams.get('rooms');
  //   const childrenParam = searchParams.get('children');

  //   if (checkInParam && checkOutParam) {
  //     updateSearchParams({
  //       destination: contextSearchParams.destination,
  //       destinationName: contextSearchParams.destinationName,
  //       checkIn: checkInParam,
  //       checkOut: checkOutParam,
  //       adults: parseInt(guestsParam || '2'),
  //       rooms: parseInt(roomsParam || '1'),
  //       children: parseInt(childrenParam || '0'),
  //     });
  //   }
  // }, []);

  // ✅ Get roomTypeId from query params or from id if id is roomTypeId
  const roomTypeIdParam = searchParams.get('roomTypeId');
  // ✅ Check if id is roomTypeId (starts with "RT") or hotelId (starts with "H")
  const isRoomTypeId = id?.startsWith('RT');
  const actualRoomTypeId = roomTypeIdParam || (isRoomTypeId ? id : null);
  const actualHotelId = isRoomTypeId ? null : id;

  // Fetch hotel/room details and re-check availability
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        // Validate required params
        if (!checkIn || !checkOut) {
          setError('Thiếu thông tin ngày nhận/trả phòng');
          return;
        }

        // ✅ If id is roomTypeId, need to get hotelId first
        let hotelIdToFetch = actualHotelId;
        
        if (isRoomTypeId && actualRoomTypeId) {
          // ✅ Get hotelId from roomTypeId using API
          try {
            const api = (await import('../../api/axiosClient')).default;
            const hotelIdRes = await api.get(`/api/rooms/hotel/${actualRoomTypeId}`);
            
            if (hotelIdRes.data.success && hotelIdRes.data.data?.hotelId) {
              hotelIdToFetch = hotelIdRes.data.data.hotelId;
            } else {
              setError(hotelIdRes.data.message || 'Không tìm thấy khách sạn cho loại phòng này');
              return;
            }
          } catch (err: any) {
            console.error('Error fetching hotelId from roomTypeId:', err);
            setError('Có lỗi xảy ra khi lấy thông tin khách sạn từ loại phòng');
            return;
          }
        }
        
        if (hotelIdToFetch) {
          // ✅ Fetch hotel detail from API using hotelId
          const response = await getHotelDetail(hotelIdToFetch, {
            checkIn,
            checkOut,
            stayType, // ✅ Pass stayType to API
            adults: guests,
            rooms,
            children
          });

          if (!response || !response.success || !response.data?.hotel) {
            setError(response?.message || 'Không tìm thấy khách sạn');
            return;
          }

          const hotelData = response.data.hotel;
          setHotel(hotelData);
        } else {
          setError('Thiếu thông tin khách sạn');
          return;
        }

        // ✅ Set room info from roomTypeId if available
        if (actualRoomTypeId) {
          // Get room type info from available rooms
          // Need to fetch hotel detail again to get availableRooms
          const hotelDetailResponse = await getHotelDetail(hotelIdToFetch || actualHotelId || '', {
            checkIn,
            checkOut,
            stayType, // ✅ Pass stayType here too
            adults: guests,
            rooms,
            children
          });
          
          const availableRooms = hotelDetailResponse.data?.availableRooms || [];
          const selectedRoomType = availableRooms.find((r: any) => r.roomTypeId === actualRoomTypeId);
          
          if (selectedRoomType) {
            setRoom({
              roomId: selectedRoomType.roomId || null,
              roomTypeId: selectedRoomType.roomTypeId,
              roomName: selectedRoomType.roomName,
              roomDescription: selectedRoomType.roomDescription,
              bedType: selectedRoomType.bedType,
              capacity: selectedRoomType.capacity,
              area: selectedRoomType.area,
              totalPrice: selectedRoomType.totalPrice || selectedRoomType.avgPricePerNight || 0,
              avgPricePerNight: selectedRoomType.avgPricePerNight || 0,
              // ✅ Thêm đầy đủ thông tin từ database
              images: selectedRoomType.images || [],
              facilities: selectedRoomType.facilities || [],
              refundable: selectedRoomType.refundable,
              payLater: selectedRoomType.payLater,
              freeCancellation: selectedRoomType.freeCancellation,
              noCreditCard: selectedRoomType.noCreditCard,
              extraBedFee: selectedRoomType.extraBedFee,
              childrenAllowed: selectedRoomType.childrenAllowed,
              petsAllowed: selectedRoomType.petsAllowed
            });
          } else {
            // Fallback: set basic room info from roomTypeId
            setRoom({
              roomTypeId: actualRoomTypeId,
              roomName: 'Phòng đã chọn',
              roomId: null
            });
          }
        } else {
          // Fallback: set basic room info
          setRoom({
            roomType: 'Deluxe',
            roomId: null
          });
        }

        // ✅ Note: Temporary booking creation is handled in separate useEffect below
      } catch (err: any) {
        console.error('Error fetching booking data:', err);
        setError('Có lỗi xảy ra khi tải thông tin đặt phòng');
      } finally {
        setIsLoading(false);
      }
    };

    // ✅ ProtectedRoute ensures user is logged in, so we can safely fetch data
    fetchData();
    // ✅ Remove isCreatingTemporaryBooking from dependencies to prevent infinite loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, checkIn, checkOut, rooms, guests, children, actualRoomTypeId, actualHotelId, isRoomTypeId]);

  // ✅ Create temporary booking in separate useEffect to prevent infinite loop
  useEffect(() => {
    // ✅ CRITICAL FIX: Skip if booking is already complete
    if (bookingComplete) {
      return;
    }

    // ✅ Skip if already creating or no required data
    // Note: actualHotelId can be null if id is roomTypeId, so we check actualRoomTypeId instead
    if (!actualRoomTypeId || !checkIn || !checkOut) {
      return;
    }
    
    // ✅ Skip if hotel/room data not loaded yet
    if (!hotel || !room) {
      return;
    }

    // ✅ Skip if already creating
    if (isCreatingTemporaryBookingRef.current) {
      return;
    }

    // ✅ Check localStorage first to avoid duplicate bookings on reload
    const existingBookingId = localStorage.getItem('temporaryBookingId');
    const existingExpiresAt = localStorage.getItem('temporaryBookingExpiresAt');
    
    // ✅ Validate existing booking with backend (async)
    const validateAndRestoreBooking = async () => {
      if (existingBookingId && existingExpiresAt) {
        const expiresAtDate = new Date(existingExpiresAt);
        const now = new Date();
        
        if (expiresAtDate > now) {
          // ✅ Check if booking still exists in database
          const checkResult = await checkBookingExists(existingBookingId);
          
          if (checkResult.success && checkResult.data) {
            const booking = checkResult.data;
            
            // ✅ Validate booking status - only restore if status is CREATED
            if (booking.status === 'CREATED') {
              // ✅ Calculate expiresAt from backend created_at (BOOKING_EXPIRATION_MINUTES from creation)
              // This ensures we use the correct expiration time even if localStorage has old value
              const createdDate = new Date(booking.created_at);
              const recalculatedExpiresAt = new Date(createdDate.getTime() + BOOKING_EXPIRATION_MINUTES * 60 * 1000);
              
              // ✅ Only restore if booking hasn't expired yet
              if (recalculatedExpiresAt > now) {
                setTemporaryBookingId(existingBookingId);
                setBookingExpiresAt(recalculatedExpiresAt);
                // ✅ Update localStorage with correct expiresAt
                localStorage.setItem('temporaryBookingExpiresAt', recalculatedExpiresAt.toISOString());
                return true; // ✅ Booking restored successfully
              } else {
                // ✅ Booking expired according to backend, clear localStorage
                localStorage.removeItem('temporaryBookingId');
                localStorage.removeItem('temporaryBookingExpiresAt');
                return false;
              }
            } else {
              // Booking status changed (not CREATED), clear localStorage
              localStorage.removeItem('temporaryBookingId');
              localStorage.removeItem('temporaryBookingExpiresAt');
              return false;
            }
          } else {
            // ✅ Booking doesn't exist in database (was deleted), clear localStorage
            localStorage.removeItem('temporaryBookingId');
            localStorage.removeItem('temporaryBookingExpiresAt');
            return false;
          }
        } else {
          // Booking expired, clear localStorage
          localStorage.removeItem('temporaryBookingId');
          localStorage.removeItem('temporaryBookingExpiresAt');
          return false;
        }
      }
      return false;
    };

    // ✅ Validate booking first, then create new one if needed
    const handleBookingValidation = async () => {
      const isRestored = await validateAndRestoreBooking();
      
      // ✅ If booking was restored, don't create new one
      if (isRestored) {
        return;
      }
      
      // ✅ Get hotelId from hotel object (already loaded from fetchData)
      const hotelIdToFetch = hotel?.hotel_id || hotel?.hotelId;
      
      if (!hotelIdToFetch) {
        return;
      }
      
      // ✅ Create new booking if validation failed or no existing booking
      await createTemporaryBookingAsync(hotelIdToFetch);
    };

    const createTemporaryBookingAsync = async (hotelIdToFetch: string) => {
      // ✅ Prevent duplicate calls
      if (isCreatingTemporaryBookingRef.current) {
        return;
      }
      
      isCreatingTemporaryBookingRef.current = true;
      
      try {
        const tempBookingResponse = await createTemporaryBooking({
          hotelId: hotelIdToFetch,
          roomTypeId: actualRoomTypeId!,
          checkIn: checkIn,
          checkOut: checkOut,
          stayType: stayType, // ✅ Pass stayType
          rooms: rooms,
          adults: guests,
          children: children || undefined
        });

        if (tempBookingResponse.success && tempBookingResponse.data) {
          const bookingId = tempBookingResponse.data.bookingId;
          const expiresAt = new Date(tempBookingResponse.data.expiresAt);
          
          // ✅ Save to state
          setTemporaryBookingId(bookingId);
          setBookingExpiresAt(expiresAt);
          
          // ✅ Save to localStorage to persist on reload
          localStorage.setItem('temporaryBookingId', bookingId);
          localStorage.setItem('temporaryBookingExpiresAt', expiresAt.toISOString());
        } else {
          setError(tempBookingResponse.message || 'Không thể tạo booking tạm thời');
        }
    } catch (err: any) {
      console.error('Error creating temporary booking:', err);
      setError('Có lỗi xảy ra khi tạo booking tạm thời');
      } finally {
        isCreatingTemporaryBookingRef.current = false;
      }
    };

    // ✅ Start validation and creation process
    handleBookingValidation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actualRoomTypeId, checkIn, checkOut, rooms, guests, children, hotel, room, bookingComplete]);

  // ✅ Rehydrate booking summary from backend when we have a temporaryBookingId (Step 2 reload safe)
  useEffect(() => {
    const rehydrate = async () => {
      if (!temporaryBookingId) return;
      const res = await getBookingById(temporaryBookingId);
      if (res.success && res.data) {
        const b = res.data;
        // Prefer backend totals
        const subtotalNum = Number(b.subtotal || 0);
        const taxNum = Number(b.tax_amount || 0);
        const totalNum = Number(b.total_amount || subtotalNum + taxNum);
        const nightsNum = Number(b.nights_count || 0);
        setRehydratedTotals({ subtotal: subtotalNum, tax: taxNum, total: totalNum, nights: nightsNum });
        // Sync dates if missing
        if (!bookingData.checkIn || !bookingData.checkOut) {
          setBookingData(prev => ({
            ...prev,
            checkIn: (b.checkin_date || prev.checkIn),
            checkOut: (b.checkout_date || prev.checkOut)
          }));
        }
      }
    };
    rehydrate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [temporaryBookingId]);

  // ✅ Sync timeRemaining when bookingExpiresAt changes (e.g., restored from localStorage)
  useEffect(() => {
    if (bookingExpiresAt && !bookingComplete) {
      const now = new Date();
      const expires = new Date(bookingExpiresAt);
      const remaining = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
      setTimeRemaining(remaining);
    }
  }, [bookingExpiresAt, bookingComplete]);

  // ✅ 2-minute countdown timer (sync với backend constant)
  useEffect(() => {
    if (!temporaryBookingId || !bookingExpiresAt || bookingComplete) return;

    const interval = setInterval(() => {
      const now = new Date();
      const expires = new Date(bookingExpiresAt);
      const remaining = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / 1000));
      
      setTimeRemaining(remaining);

      // ✅ Auto-cancel booking if time expires
      if (remaining === 0) {
        clearInterval(interval);
        handleAutoCancel();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [temporaryBookingId, bookingExpiresAt, bookingComplete]);

  // ✅ Handle auto-cancel when time expires
  const handleAutoCancel = async () => {
    if (!temporaryBookingId) return;

    try {
      await cancelBooking(temporaryBookingId);
      
      // ✅ Clear localStorage
      const expiredBookingId = temporaryBookingId; // Save before clearing
      localStorage.removeItem('temporaryBookingId');
      localStorage.removeItem('temporaryBookingExpiresAt');
      
      setTemporaryBookingId(null);
      setBookingExpiresAt(null);
      
      // ✅ Show booking failure page instead of alert
      setFailedBookingId(expiredBookingId);
      setBookingFailed(true);
      setBookingFailureMessage('Booking đã hết hạn do quá thời gian giữ chỗ. Vui lòng đặt lại.');
    } catch (error) {
      console.error('Error canceling expired booking:', error);
      // ✅ Still show failure page even if cancel fails
      const expiredBookingId = temporaryBookingId; // Save before potential state changes
      setFailedBookingId(expiredBookingId);
      setBookingFailed(true);
      setBookingFailureMessage('Booking đã hết hạn do quá thời gian giữ chỗ. Vui lòng đặt lại.');
      // Clear state even if cancel API fails
      setTemporaryBookingId(null);
      setBookingExpiresAt(null);
      localStorage.removeItem('temporaryBookingId');
      localStorage.removeItem('temporaryBookingExpiresAt');
    }
  };

  // ✅ Track when user leaves page (beforeunload)
  // ⚠️ IMPORTANT: beforeunload fires on:
  // - Page refresh (F5, Ctrl+R) ← KHÔNG nên cancel
  // - Closing tab/browser ← Có thể cancel nhưng không đáng tin cậy
  // - Navigating to external URL ← Có thể cancel
  // - But NOT on in-app navigation (React Router)
  // 
  // ✅ SOLUTION: KHÔNG cancel trong beforeunload
  // - localStorage giữ booking để user có thể resume
  // - Timer frontend tự động cancel khi hết thời gian (2 phút)
  // - Backend có thể có cron job để cleanup expired bookings
  useEffect(() => {
    if (!temporaryBookingId || bookingComplete) return;

    const handleBeforeUnload = () => {
      // ✅ KHÔNG cancel booking khi user refresh hoặc navigate
      // localStorage giữ booking, user có thể resume
      // Timer sẽ tự động cancel khi hết thời gian (2 phút)
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // ✅ KHÔNG cancel khi component unmount
      // User có thể refresh trang và resume booking từ localStorage
    };
  }, [temporaryBookingId, bookingComplete]);

  const calculateNights = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) return 0;
    const start = new Date(bookingData.checkIn);
    const end = new Date(bookingData.checkOut);
    const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return nights > 0 ? nights : 0;
  };

  const nights = rehydratedTotals?.nights ?? calculateNights();
  
  // ✅ Discount code handlers
  const handleApplyDiscountCode = async () => {
    if (!bookingData.discountCode || !temporaryBookingId) return;

    try {
      const validation = await validateDiscountCode({
        code: bookingData.discountCode,
        subtotal: rehydratedTotals?.subtotal || subtotal,
        hotelId: hotel?.hotel_id || hotel?.hotelId,
        roomId: room?.roomId,
        nights: nights
      });

      if (validation.success && validation.discountAmount) {
        setBookingData(prev => ({
          ...prev,
          discountCodeApplied: true,
          discountCodeError: ''
        }));
        
        // ✅ Tính toán lại giá với discount code
        const currentSubtotal = rehydratedTotals?.subtotal || subtotal;
        const currentPackageDiscount = rehydratedTotals?.packageDiscount || 0;
        const currentSubtotalAfterPackage = currentSubtotal - currentPackageDiscount;
        const currentTax = rehydratedTotals?.tax || (currentSubtotalAfterPackage * 0.1);
        const codeDiscountAmount = validation.discountAmount;
        const finalTotal = currentSubtotalAfterPackage + currentTax - codeDiscountAmount;
        
        setRehydratedTotals({
          subtotal: currentSubtotal,
          tax: currentTax,
          total: finalTotal,
          nights: rehydratedTotals?.nights || nights,
          packageDiscount: currentPackageDiscount,
          codeDiscount: codeDiscountAmount,
          subtotalAfterPackage: currentSubtotalAfterPackage
        });
      } else {
        setBookingData(prev => ({
          ...prev,
          discountCodeApplied: false,
          discountCodeError: validation.message || 'Mã giảm giá không hợp lệ'
        }));
      }
    } catch (error: any) {
      console.error('Error applying discount code:', error);
      setBookingData(prev => ({
        ...prev,
        discountCodeApplied: false,
        discountCodeError: 'Lỗi khi áp dụng mã giảm giá'
      }));
    }
  };

  const handleRemoveDiscountCode = () => {
    setBookingData(prev => ({
      ...prev,
      discountCode: '',
      discountCodeApplied: false,
      discountCodeError: ''
    }));
    
    // ✅ Tính toán lại giá không có discount code
    const currentSubtotal = rehydratedTotals?.subtotal || subtotal;
    const currentPackageDiscount = rehydratedTotals?.packageDiscount || 0;
    const currentSubtotalAfterPackage = currentSubtotal - currentPackageDiscount;
    const currentTax = rehydratedTotals?.tax || (currentSubtotalAfterPackage * 0.1);
    const finalTotal = currentSubtotalAfterPackage + currentTax;
    
    setRehydratedTotals({
      subtotal: currentSubtotal,
      tax: currentTax,
      total: finalTotal,
      nights: rehydratedTotals?.nights || nights,
      packageDiscount: currentPackageDiscount,
      codeDiscount: 0,
      subtotalAfterPackage: currentSubtotalAfterPackage
    });
  };
  
  // ✅ Calculate price using useMemo to prevent infinite re-renders
  const { subtotal, tax, total, packageDiscount, codeDiscount, subtotalAfterPackage } = useMemo(() => {
    // Prefer backend values if available
    if (rehydratedTotals) {
      return {
        subtotal: rehydratedTotals.subtotal,
        tax: rehydratedTotals.tax,
        total: rehydratedTotals.total,
        packageDiscount: rehydratedTotals.packageDiscount || 0,
        codeDiscount: rehydratedTotals.codeDiscount || 0,
        subtotalAfterPackage: rehydratedTotals.subtotalAfterPackage || (rehydratedTotals.subtotal - (rehydratedTotals.packageDiscount || 0))
      };
    }
    let basePrice = 0;
    let calculatedSubtotal = 0;
    
    if (room?.totalPrice && room.totalPrice > 0) {
      calculatedSubtotal = room.totalPrice * bookingData.rooms;
    } else if (room?.avgPricePerNight && room.avgPricePerNight > 0) {
      basePrice = room.avgPricePerNight;
      calculatedSubtotal = basePrice * nights * bookingData.rooms;
    } else if (hotel?.price_per_night && hotel.price_per_night > 0) {
      basePrice = hotel.price_per_night;
      calculatedSubtotal = basePrice * nights * bookingData.rooms;
    } else {
      calculatedSubtotal = 0;
    }
    
    const calculatedTax = calculatedSubtotal * 0.1;
    const calculatedTotal = calculatedSubtotal + calculatedTax;
    
    return {
      subtotal: calculatedSubtotal,
      tax: calculatedTax,
      total: calculatedTotal,
      packageDiscount: 0,
      codeDiscount: 0,
      subtotalAfterPackage: calculatedSubtotal
    };
  }, [rehydratedTotals, room?.totalPrice, room?.avgPricePerNight, hotel?.price_per_night, nights, bookingData.rooms]);

  const handleStep1Next = async () => {
    // Validate step 1
    if (!bookingData.guestFirstName && !bookingData.guestLastName && !bookingData.guestName) {
      alert('Vui lòng điền họ và tên');
      return;
    }
    if (!bookingData.guestEmail) {
      alert('Vui lòng điền email');
      return;
    }

    // ✅ Kiểm tra có temporaryBookingId không
    if (!temporaryBookingId) {
      alert('Không tìm thấy booking tạm thời. Vui lòng tạo lại.');
      return;
    }

    // ✅ Tạo payment khi bấm nút "KẾ TIẾP: BƯỚC CUỐI CÙNG"
    // Map paymentMethod từ frontend sang backend
    let confirmPaymentMethod: 'cash' | 'bank_transfer' | 'VNPAY' | 'MOMO';
    if (bookingData.paymentMethod === 'online_payment') {
      confirmPaymentMethod = 'VNPAY'; // Default to VNPAY for online payment
    } else if (bookingData.paymentMethod === 'pay_at_hotel') {
      confirmPaymentMethod = 'cash'; // Pay at hotel -> CASH
    } else {
      confirmPaymentMethod = 'bank_transfer'; // Bank transfer (fallback)
    }

    try {
      setIsLoading(true);

      // ✅ Gọi confirmBooking (tạo payment và cập nhật booking status)
      const confirmResult = await confirmBooking(temporaryBookingId, confirmPaymentMethod);

      if (!confirmResult.success) {
        // ✅ Nếu confirmBooking fail, cancel booking để unlock rooms
        if (temporaryBookingId) {
          try {
            await cancelBooking(temporaryBookingId);
            console.log('✅ [BookingPage] Auto-cancelled booking after confirmBooking failed');
          } catch (cancelErr) {
            console.error('❌ [BookingPage] Error auto-cancelling booking:', cancelErr);
          }
        }
        alert(confirmResult.message || 'Không thể tạo payment. Vui lòng thử lại.');
        setIsLoading(false);
        return;
      }

      // ✅ Payment đã được tạo thành công, chuyển sang step 2
      setCurrentStep(2);
    } catch (err: any) {
      console.error('Error creating payment:', err);
      
      // ✅ Nếu có exception, cancel booking để unlock rooms
      if (temporaryBookingId) {
        try {
          await cancelBooking(temporaryBookingId);
          console.log('✅ [BookingPage] Auto-cancelled booking after confirmBooking exception');
        } catch (cancelErr) {
          console.error('❌ [BookingPage] Error auto-cancelling booking:', cancelErr);
        }
      }
      
      alert('Có lỗi xảy ra khi tạo payment. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Confirm = async () => {
    // ✅ Check authentication
    if (!isLoggedIn) {
      const shouldLogin = confirm('Bạn cần đăng nhập để đặt phòng. Bạn có muốn đăng nhập ngay không?');
      if (shouldLogin) {
        navigate('/login', { state: { returnTo: window.location.pathname + window.location.search } });
      }
      return;
    }

    // Validate step 2 if online payment
    if (bookingData.paymentMethod === 'online_payment') {
      if (!bookingData.cardName || !bookingData.cardNumber || !bookingData.cardExpiry || !bookingData.cardCVC) {
        alert('Vui lòng điền đầy đủ thông tin thanh toán');
        return;
      }
    }

    // Validate guest info
    if (!bookingData.guestFirstName && !bookingData.guestLastName && !bookingData.guestName) {
      alert('Vui lòng điền họ và tên');
      return;
    }
    if (!bookingData.guestEmail) {
      alert('Vui lòng điền email');
      return;
    }

    try {
      setIsLoading(true);

      // ✅ Get hotelId - check if id is roomTypeId
      let hotelIdToUse = id;
      if (id?.startsWith('RT')) {
        // If id is roomTypeId, get hotelId from roomTypeId
        try {
          const api = (await import('../../api/axiosClient')).default;
          const hotelIdRes = await api.get(`/api/rooms/hotel/${id}`);
          if (hotelIdRes.data.success && hotelIdRes.data.data?.hotelId) {
            hotelIdToUse = hotelIdRes.data.data.hotelId;
          } else {
            alert('Không tìm thấy khách sạn cho loại phòng này');
            setIsLoading(false);
            return;
          }
        } catch (err: any) {
          console.error('Error fetching hotelId from roomTypeId:', err);
          alert('Không thể lấy thông tin khách sạn');
          setIsLoading(false);
          return;
        }
      }

      // ✅ Kiểm tra có temporaryBookingId không
      if (!temporaryBookingId) {
        alert('Không tìm thấy booking tạm thời. Vui lòng tạo lại.');
        setIsLoading(false);
        return;
      }

      // ✅ Payment đã được tạo trong handleStep1Next, giờ chỉ cần cập nhật booking info
      // ✅ Map payment method for booking request (for updating guest info)
      let bookingPaymentMethod: 'VNPAY' | 'MOMO' | 'CASH';
      if (bookingData.paymentMethod === 'online_payment') {
        bookingPaymentMethod = 'VNPAY';
      } else {
        bookingPaymentMethod = 'CASH';
      }

      // ✅ Build booking request (for updating guest info)
      const bookingRequest: CreateBookingRequest = {
        // ✅ CRITICAL FIX: Always include bookingId if temporaryBookingId exists
        ...(temporaryBookingId ? { bookingId: temporaryBookingId } : {}),
        hotelId: hotelIdToUse || '',
        // ✅ Only include roomId if it exists and is valid (starts with R)
        ...(room?.roomId && room.roomId.startsWith('R') ? { roomId: room.roomId } : {}),
        // ✅ Include roomTypeId if we have it
        ...(actualRoomTypeId && actualRoomTypeId.startsWith('RT') ? { roomTypeId: actualRoomTypeId } : {}),
        checkIn: bookingData.checkIn,
        checkOut: bookingData.checkOut,
        stayType: stayType, // ✅ Pass stayType
        rooms: bookingData.rooms,
        adults: bookingData.guests,
        children: bookingData.children || undefined,
        guestInfo: {
          firstName: bookingData.guestFirstName || bookingData.guestName.split(' ').slice(1).join(' ') || '',
          lastName: bookingData.guestLastName || bookingData.guestName.split(' ')[0] || '',
          email: bookingData.guestEmail,
          phone: bookingData.guestPhone || '',
          country: bookingData.country || 'Việt Nam'
        },
        specialRequests: bookingData.specialRequests || undefined,
        paymentMethod: bookingPaymentMethod,
        checkInTime: bookingData.checkInTime !== 'unknown' ? bookingData.checkInTime : undefined,
        smokingPreference: bookingData.smokingPreference || undefined,
        bedPreference: bookingData.bedPreference || undefined,
        // ✅ Thêm discount code nếu đã được áp dụng
        ...(bookingData.discountCodeApplied && bookingData.discountCode ? { discountCode: bookingData.discountCode } : {})
      };

      // ✅ Validate request before sending
      if (!bookingRequest.hotelId) {
        alert('Thiếu thông tin khách sạn');
        setIsLoading(false);
        return;
      }
      if (!bookingRequest.roomId && !bookingRequest.roomTypeId) {
        alert('Thiếu thông tin phòng hoặc loại phòng');
        setIsLoading(false);
        return;
      }

      // ✅ CRITICAL: Cập nhật booking info và payment status
      // Backend sẽ tự động update payment status thành SUCCESS và booking status thành PENDING_CONFIRMATION
      console.log(`[BookingPage] handleStep2Confirm: Calling createBooking for booking ${temporaryBookingId}`);
      const createBookingResult = await createBooking(bookingRequest);

      if (createBookingResult.success && createBookingResult.data) {
        console.log(`[BookingPage] createBooking success. Response status: ${createBookingResult.data.status}`);
        
        // ✅ CRITICAL: Fetch lại booking từ backend để lấy status mới nhất (sau khi payment được update thành SUCCESS)
        // Backend đã update payment status thành SUCCESS và booking status thành PENDING_CONFIRMATION
        let finalBookingStatus = createBookingResult.data.status;
        let finalBookingData = createBookingResult.data;
        
        if (temporaryBookingId) {
          try {
            console.log(`[BookingPage] Fetching latest booking status from backend for ${temporaryBookingId}`);
            const latestBookingResult = await getBookingById(temporaryBookingId);
            
            if (latestBookingResult.success && latestBookingResult.data) {
              finalBookingStatus = latestBookingResult.data.status;
              finalBookingData = latestBookingResult.data;
              console.log(`[BookingPage] Latest booking status from backend: ${finalBookingStatus}`);
              
              // ✅ Verify: Nếu status vẫn là CREATED, có thể payment chưa được update
              if (finalBookingStatus === 'CREATED') {
                console.warn(`[BookingPage] WARNING: Booking status is still CREATED after createBooking. Payment may not have been updated.`);
                // Có thể cần retry hoặc thông báo lỗi
              }
            } else {
              console.warn(`[BookingPage] Could not fetch latest booking status, using response status: ${finalBookingStatus}`);
            }
          } catch (fetchErr: any) {
            console.error(`[BookingPage] Error fetching latest booking status:`, fetchErr);
            // Continue with response data if fetch fails
          }
        }

        // ✅ CRITICAL FIX: Clear temporary booking state FIRST before setting bookingComplete
        setTemporaryBookingId(null);
        setBookingExpiresAt(null);
        
        // ✅ Clear localStorage FIRST
        localStorage.removeItem('temporaryBookingId');
        localStorage.removeItem('temporaryBookingExpiresAt');
        
        // ✅ Set bookingComplete AFTER clearing state to prevent useEffect from running
        setBookingComplete(true);
        
        // ✅ Tạo booking confirmation từ data mới nhất
        // finalBookingData có thể là BookingConfirmation hoặc booking data từ database
        const confirmationData = {
          bookingId: temporaryBookingId,
          bookingCode: (finalBookingData as any).booking_code || (finalBookingData as any).bookingCode || `BK${temporaryBookingId.slice(-8).padStart(8, '0')}`,
          status: finalBookingStatus || 'PENDING_CONFIRMATION', // ✅ Sử dụng status mới nhất từ backend
          hotel: {
            id: hotel?.hotel_id || '',
            name: hotel?.name || '',
            address: hotel?.address || '',
            phone: hotel?.phone_number || ''
          },
          room: {
            id: room?.roomId || '',
            name: room?.roomName || '',
            type: room?.bedType || '',
            roomNumber: room?.roomNumber || null
          },
          checkIn: (finalBookingData as any).checkin_date || (finalBookingData as any).checkIn || bookingData.checkIn,
          checkOut: (finalBookingData as any).checkout_date || (finalBookingData as any).checkOut || bookingData.checkOut,
          nights: (finalBookingData as any).number_of_nights || (finalBookingData as any).nights || nights,
          rooms: (finalBookingData as any).number_of_rooms || (finalBookingData as any).rooms || bookingData.rooms,
          adults: (finalBookingData as any).number_of_guests || (finalBookingData as any).adults || bookingData.guests,
          children: (finalBookingData as any).number_of_children || (finalBookingData as any).children || bookingData.children,
          guestInfo: {
            firstName: bookingData.guestFirstName || bookingData.guestName.split(' ').slice(1).join(' ') || '',
            lastName: bookingData.guestLastName || bookingData.guestName.split(' ')[0] || '',
            email: bookingData.guestEmail,
            phone: bookingData.guestPhone || '',
            country: bookingData.country || 'Việt Nam'
          },
          priceBreakdown: {
            subtotal: (finalBookingData as any).subtotal || (finalBookingData as any).priceBreakdown?.subtotal || subtotal,
            taxAmount: (finalBookingData as any).tax_amount || (finalBookingData as any).priceBreakdown?.taxAmount || tax,
            discountAmount: (finalBookingData as any).discount_amount || (finalBookingData as any).priceBreakdown?.discountAmount || 0,
            totalPrice: (finalBookingData as any).total_amount || (finalBookingData as any).priceBreakdown?.totalPrice || total
          },
          paymentMethod: bookingData.paymentMethod === 'online_payment' ? 'VNPAY' : (bookingData.paymentMethod === 'pay_at_hotel' ? 'CASH' : 'BANK_TRANSFER'),
          paymentStatus: (finalBookingStatus === 'PENDING_CONFIRMATION' || finalBookingStatus === 'CONFIRMED' || finalBookingStatus === 'CHECKED_IN' || finalBookingStatus === 'CHECKED_OUT' || finalBookingStatus === 'COMPLETED') ? 'paid' : 'pending', // ✅ Update payment status based on latest booking status
          specialRequests: bookingData.specialRequests,
          createdAt: new Date()
        };
        
        setBookingConfirmation(confirmationData);
        setCurrentStep(3);
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 100);
      } else {
        // ✅ Nếu createBooking fail, cancel booking để unlock rooms và update payment status
        if (temporaryBookingId) {
          try {
            const cancelResult = await cancelBooking(temporaryBookingId);
            if (cancelResult.success) {
              console.log('✅ [BookingPage] Auto-cancelled booking after createBooking failed');
            } else {
              console.error('⚠️ [BookingPage] Failed to auto-cancel booking:', cancelResult.message);
            }
          } catch (cancelErr: any) {
            console.error('❌ [BookingPage] Error auto-cancelling booking:', cancelErr);
          }
        }
        
        // ✅ Clear state after cancelling
        setTemporaryBookingId(null);
        setBookingExpiresAt(null);
        localStorage.removeItem('temporaryBookingId');
        localStorage.removeItem('temporaryBookingExpiresAt');
        
        // ✅ Show failure page instead of alert
        setFailedBookingId(temporaryBookingId);
        setBookingFailed(true);
        setBookingFailureMessage(createBookingResult.message || 'Cập nhật thông tin đặt phòng thất bại');
      }
    } catch (err: any) {
      console.error('Error creating booking:', err);
      
      // ✅ Nếu có exception, cancel booking để unlock rooms và update payment status
      if (temporaryBookingId) {
        try {
          const cancelResult = await cancelBooking(temporaryBookingId);
          if (cancelResult.success) {
            console.log('✅ [BookingPage] Auto-cancelled booking after exception');
          } else {
            console.error('⚠️ [BookingPage] Failed to auto-cancel booking:', cancelResult.message);
          }
        } catch (cancelErr: any) {
          console.error('❌ [BookingPage] Error auto-cancelling booking:', cancelErr);
        }
      }
      
      // ✅ Clear state after cancelling
      setTemporaryBookingId(null);
      setBookingExpiresAt(null);
      localStorage.removeItem('temporaryBookingId');
      localStorage.removeItem('temporaryBookingExpiresAt');
      
      // ✅ Show failure page instead of alert
      setFailedBookingId(temporaryBookingId);
      setBookingFailed(true);
      setBookingFailureMessage(err.message || 'Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStep2Back = () => {
    setCurrentStep(1);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white flex items-center justify-center py-20 min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin đặt phòng...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !hotel) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-2">{error || 'Không tìm thấy khách sạn'}</h2>
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:underline"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    );
  }

  // Step 3: Failure
  if (bookingFailed) {
    return (
      <div className="min-h-screen bg-white">
        <BookingHeader currentStep={2} countdownSeconds={0} />
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingFailure
              hotel={hotel}
              errorMessage={bookingFailureMessage}
              bookingId={failedBookingId || undefined}
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              roomName={room?.name || room?.room_type_name}
              guests={bookingData.guests}
              rooms={bookingData.rooms}
              stayType={stayType}
              onGoHome={() => navigate('/')}
            />
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (currentStep === 3 && bookingComplete) {
    return (
      <div className="min-h-screen bg-white">
        <BookingHeader currentStep={2} countdownSeconds={0} /> {/* ✅ No countdown when complete */}
        <div className="bg-gray-50 min-h-screen py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <BookingSuccess
              hotel={hotel}
              guestName={`${bookingData.guestLastName} ${bookingData.guestFirstName}`.trim() || bookingData.guestName}
              guestEmail={bookingData.guestEmail}
              checkIn={bookingData.checkIn}
              checkOut={bookingData.checkOut}
              total={bookingConfirmation?.priceBreakdown?.totalPrice || total}
              bookingCode={bookingConfirmation?.bookingCode}
              bookingId={bookingConfirmation?.bookingId}
              status={bookingConfirmation?.status} // ✅ Pass status to BookingSuccess
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* ✅ Agoda-style Header with Progress Bar and Countdown */}
      <BookingHeader currentStep={currentStep} countdownSeconds={timeRemaining} />

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Form Steps */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <BookingStep1
                  guestName={bookingData.guestName}
                  guestEmail={bookingData.guestEmail}
                  guestPhone={bookingData.guestPhone}
                  guestFirstName={bookingData.guestFirstName}
                  guestLastName={bookingData.guestLastName}
                  country={bookingData.country}
                  checkInTime={bookingData.checkInTime}
                  smokingPreference={bookingData.smokingPreference}
                  bedPreference={bookingData.bedPreference}
                  specialRequests={bookingData.specialRequests}
                  showMoreRequests={bookingData.showMoreRequests}
                  onNameChange={(value) => setBookingData({ ...bookingData, guestName: value })}
                  onEmailChange={(value) => setBookingData({ ...bookingData, guestEmail: value })}
                  onPhoneChange={(value) => setBookingData({ ...bookingData, guestPhone: value })}
                  onFirstNameChange={(value) => setBookingData({ ...bookingData, guestFirstName: value })}
                  onLastNameChange={(value) => setBookingData({ ...bookingData, guestLastName: value })}
                  onCountryChange={(value) => setBookingData({ ...bookingData, country: value })}
                  onCheckInTimeChange={(value) => setBookingData({ ...bookingData, checkInTime: value })}
                  onSmokingChange={(value) => setBookingData({ ...bookingData, smokingPreference: value })}
                  onBedPreferenceChange={(value) => setBookingData({ ...bookingData, bedPreference: value })}
                  onSpecialRequestsChange={(value) => setBookingData({ ...bookingData, specialRequests: value })}
                  onShowMoreRequestsChange={(value) => setBookingData({ ...bookingData, showMoreRequests: value })}
                  discountCode={bookingData.discountCode}
                  discountCodeApplied={bookingData.discountCodeApplied}
                  discountCodeError={bookingData.discountCodeError}
                  onDiscountCodeChange={(value) => setBookingData({ ...bookingData, discountCode: value })}
                  onApplyDiscountCode={handleApplyDiscountCode}
                  onRemoveDiscountCode={handleRemoveDiscountCode}
                  paymentMethod={bookingData.paymentMethod}
                  checkOut={bookingData.checkOut}
                  onNext={handleStep1Next}
                />
              )}

              {currentStep === 2 && (
                <BookingStep2
                  paymentMethod={bookingData.paymentMethod}
                  cardName={bookingData.cardName}
                  cardNumber={bookingData.cardNumber}
                  cardExpiry={bookingData.cardExpiry}
                  cardCVC={bookingData.cardCVC}
                  guestEmail={bookingData.guestEmail} // ✅ Pass email to BookingStep2
                  onCardNameChange={(value) => setBookingData({ ...bookingData, cardName: value })}
                  onCardNumberChange={(value) => setBookingData({ ...bookingData, cardNumber: value })}
                  onCardExpiryChange={(value) => setBookingData({ ...bookingData, cardExpiry: value })}
                  onCardCVCChange={(value) => setBookingData({ ...bookingData, cardCVC: value })}
                  onConfirm={handleStep2Confirm}
                  onBack={handleStep2Back}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  nights={nights}
                  rooms={bookingData.rooms}
                />
              )}
            </div>

            {/* Right Column - Booking Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-[200px]">
                <BookingSummary
                  hotel={hotel}
                  room={room}
                  checkIn={bookingData.checkIn}
                  checkOut={bookingData.checkOut}
                  stayType={stayType}
                  hotelCheckInTime={(hotel as any).checkin_time}
                  hotelCheckOutTime={(hotel as any).checkout_time}
                  checkInTime={bookingData.checkInTime}
                  guests={bookingData.guests}
                  rooms={bookingData.rooms}
                  children={bookingData.children}
                  nights={nights}
                  subtotal={subtotal}
                  tax={tax}
                  total={total}
                  packageDiscount={packageDiscount}
                  codeDiscount={codeDiscount}
                  subtotalAfterPackage={subtotalAfterPackage}
                  paymentMethod={bookingData.paymentMethod}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
