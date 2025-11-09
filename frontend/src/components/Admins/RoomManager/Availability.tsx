import { useState, useEffect, useRef } from "react";
import { Calendar, ChevronLeft, ChevronRight, AlertCircle, RefreshCw, X, Bed, Filter, DollarSign, Settings, CreditCard, Percent, Tag, CheckCircle2 } from "lucide-react";
import Toast from "../../Toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { adminService } from "../../../services/adminService";
import SearchableHotelSelector from "./SearchableHotelSelector";

interface AvailabilityData {
  date: string;
  total_available_rooms: number;
  total_rooms: number;
  avg_base_price: number;
  avg_discount_percent: number;
}

interface RoomTypeAvailability {
  room_type_id: string;
  room_type_name: string;
  hotel_id: string;
  hotel_name: string;
  availability: AvailabilityData[];
}

interface AvailabilityProps {
  hotelId?: string;
  roomTypeId?: string;
}

const Availability = ({ hotelId, roomTypeId }: AvailabilityProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [roomTypes, setRoomTypes] = useState<RoomTypeAvailability[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState<string>(hotelId || "");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>(roomTypeId || "");
  const [hotels, setHotels] = useState<Array<{ hotel_id: string; name: string }>>([]);
  const [roomTypesList, setRoomTypesList] = useState<Array<{ room_type_id: string; name: string; hotel_id: string }>>([]);
  const [tooltipDate, setTooltipDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedModalDate, setSelectedModalDate] = useState<Date | null>(null);
  const [availableRooms, setAvailableRooms] = useState<string>("");
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [activeTab, setActiveTab] = useState<"availability" | "policies" | "price" | "discount">("availability");
  
  // Policies state
  const [refundable, setRefundable] = useState<boolean>(true);
  const [payLater, setPayLater] = useState<boolean>(false);
  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  
  // Base price state
  const [basePrice, setBasePrice] = useState<number>(0);
  const [dateBasePrice, setDateBasePrice] = useState<string>("");
  const [updatingBasePrice, setUpdatingBasePrice] = useState(false);
  
  // Discount state
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [updatingDiscount, setUpdatingDiscount] = useState(false);

  const tooltipRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Fetch hotels list
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await adminService.getHotels({ limit: 1000 });
        if (response.success && response.data) {
          setHotels(response.data.hotels.map((h: any) => ({
            hotel_id: h.hotel_id,
            name: h.name
          })));
        }
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
    fetchHotels();
  }, []);

  // Fetch room types when hotel is selected
  useEffect(() => {
    if (selectedHotelId) {
      const fetchRoomTypes = async () => {
        try {
          const response = await adminService.getRoomTypesByHotel(selectedHotelId, { limit: 1000 });
          if (response.success && response.data) {
            setRoomTypesList(response.data.roomTypes.map((rt: any) => ({
              room_type_id: rt.room_type_id,
              name: rt.name,
              hotel_id: rt.hotel_id
            })));
          }
        } catch (error) {
          console.error("Error fetching room types:", error);
          setRoomTypesList([]);
        }
      };
      fetchRoomTypes();
    } else {
      setRoomTypesList([]);
      setSelectedRoomTypeId("");
    }
  }, [selectedHotelId]);

  // Fetch availability when filters or month change
  useEffect(() => {
    if (selectedRoomTypeId) {
    fetchAvailability();
    } else {
      setRoomTypes([]);
    }
  }, [selectedRoomTypeId, currentMonth]);

  // Helper function to compare dates without time
  const isDateBeforeToday = (date: Date): boolean => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);
    return compareDate < today;
  };

  // Format date as YYYY-MM-DD in local timezone
  const formatDateToString = (date: Date): string => {
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const formatNumberToVietnamese = (num: number): string => {
    return num.toLocaleString("vi-VN");
  };

  const parseVietnameseNumber = (str: string): number => {
    return parseInt(str.replace(/\D/g, "")) || 0;
  };

  // Fetch base price when room type changes
  useEffect(() => {
    if (selectedRoomTypeId) {
      const fetchBasePrice = async () => {
        try {
          const response = await adminService.getRoomTypeBasePrice(selectedRoomTypeId);
          if (response.success && response.data) {
            setBasePrice(response.data.basePrice || 0);
          }
        } catch (error) {
          console.error("Error fetching base price:", error);
        }
      };
      fetchBasePrice();
    }
  }, [selectedRoomTypeId]);

  const fetchAvailability = async () => {
    if (!selectedRoomTypeId) return;

    setLoading(true);
    setError(null);
    try {
      const response = await adminService.getRoomTypePriceSchedules(selectedRoomTypeId);
      
      if (response.success && response.data) {
        // Get hotel and room type info
        const hotel = hotels.find(h => h.hotel_id === selectedHotelId);
        const roomType = roomTypesList.find(rt => rt.room_type_id === selectedRoomTypeId);
        
        if (hotel && roomType) {
          setRoomTypes([{
            room_type_id: selectedRoomTypeId,
            room_type_name: roomType.name,
            hotel_id: selectedHotelId,
            hotel_name: hotel.name,
            availability: response.data
          }]);
        }
      } else {
        const errorMsg = response.message || "Không thể tải dữ liệu availability";
        showToast("error", errorMsg);
        setRoomTypes([]);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Không thể tải dữ liệu availability";
      setError(errorMsg);
      showToast("error", errorMsg);
      setRoomTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
        setTooltipDate(null);
        setTooltipPosition(null);
      }
    };

    if (tooltipDate) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [tooltipDate]);

  const handleCellClick = async (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isPast = isDateBeforeToday(date);
    
    // Only allow clicking on current month and future dates (including today)
    if (!isCurrentMonth || isPast) return;
    
    setSelectedModalDate(date);
    setActiveTab("availability");
    
    // Load data for the selected date
    const dateStr = formatDateToString(date);
    const availabilityData = getAvailabilityDataForDate(date);
    
    // Set available rooms
    if (availabilityData) {
      setAvailableRooms(formatNumberToVietnamese(availabilityData.total_available_rooms));
    } else {
      setAvailableRooms("0");
    }
    
    // Load policies
    try {
      const policiesResponse = await adminService.getRoomTypeDatePolicies(selectedRoomTypeId, dateStr);
      if (policiesResponse.success && policiesResponse.data) {
        setRefundable(policiesResponse.data.refundable);
        setPayLater(policiesResponse.data.pay_later);
      } else {
        setRefundable(true);
        setPayLater(false);
      }
    } catch (error) {
      setRefundable(true);
      setPayLater(false);
    }
    
    // Set base price
    if (availabilityData) {
      setDateBasePrice(formatNumberToVietnamese(availabilityData.avg_base_price));
    } else {
      setDateBasePrice(formatNumberToVietnamese(basePrice));
    }
    
    // Set discount
    setDiscountPercent(availabilityData?.avg_discount_percent?.toFixed(0) || "0");
    
    setShowDateModal(true);
  };

  const handleUpdateAvailability = async () => {
    if (!selectedModalDate || !selectedRoomTypeId) return;

    const numericAvailableRooms = parseVietnameseNumber(availableRooms);
    if (numericAvailableRooms < 0) {
      showToast("error", "Số phòng trống phải lớn hơn hoặc bằng 0");
      return;
    }

    setUpdatingAvailability(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDateAvailability(
        selectedRoomTypeId,
        dateStr,
        numericAvailableRooms
      );

      if (response.success) {
        showToast("success", response.message || "Cập nhật số phòng trống thành công");
        await fetchAvailability(); // Refresh data
        setShowDateModal(false);
      } else {
        showToast("error", response.message || "Không thể cập nhật số phòng trống");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật số phòng trống";
      showToast("error", errorMessage);
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleUpdatePolicies = async () => {
    if (!selectedModalDate || !selectedRoomTypeId) return;

    setUpdatingPolicies(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDatePolicies(
        selectedRoomTypeId,
        dateStr,
        refundable,
        payLater
      );
      if (response.success) {
        showToast("success", response.message || "Cập nhật chính sách thành công");
        await fetchAvailability(); // Refresh data
      } else {
        showToast("error", response.message || "Không thể cập nhật chính sách");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật chính sách";
      showToast("error", errorMessage);
    } finally {
      setUpdatingPolicies(false);
    }
  };

  const handleUpdateDateBasePrice = async () => {
    if (!selectedModalDate || !selectedRoomTypeId) return;

    const numericPrice = parseVietnameseNumber(dateBasePrice);
    if (numericPrice < 0) {
      showToast("error", "Giá cơ bản phải lớn hơn hoặc bằng 0");
      return;
    }

    setUpdatingBasePrice(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDateBasePrice(selectedRoomTypeId, dateStr, numericPrice);
      if (response.success) {
        showToast("success", response.message || "Cập nhật giá cơ bản thành công");
        await fetchAvailability(); // Refresh to show updated price
      } else {
        showToast("error", response.message || "Không thể cập nhật giá cơ bản");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật giá cơ bản";
      showToast("error", errorMessage);
    } finally {
      setUpdatingBasePrice(false);
    }
  };

  const handleUpdateDiscount = async () => {
    if (!selectedModalDate || !selectedRoomTypeId) return;

    const numericDiscount = parseFloat(discountPercent || "0");
    if (isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      showToast("error", "Phần trăm giảm giá phải từ 0 đến 100");
      return;
    }

    setUpdatingDiscount(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDateDiscount(selectedRoomTypeId, dateStr, numericDiscount);
      if (response.success) {
        showToast("success", response.message || "Cập nhật khuyến mãi thành công");
        await fetchAvailability(); // Refresh to show updated discount
    } else {
        showToast("error", response.message || "Không thể cập nhật khuyến mãi");
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || "Không thể cập nhật khuyến mãi";
      showToast("error", errorMessage);
    } finally {
      setUpdatingDiscount(false);
    }
  };

  const getAvailabilityDataForDate = (date: Date): AvailabilityData | null => {
    if (roomTypes.length === 0) return null;
    const dateStr = formatDateToString(date);
    return roomTypes[0].availability.find((a) => a.date === dateStr) || null;
  };

  const getDaysInMonth = () => {
    const firstDay = startOfMonth(currentMonth);
    const lastDay = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Add days from previous month to fill the week
    const firstDayOfWeek = firstDay.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(firstDay);
      date.setDate(date.getDate() - i - 1);
      prevMonthDays.push(date);
    }

    // Add days from next month to fill the week
    const lastDayOfWeek = lastDay.getDay();
    const nextMonthDays = [];
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      const date = new Date(lastDay);
      date.setDate(date.getDate() + i);
      nextMonthDays.push(date);
    }

    return [...prevMonthDays, ...days, ...nextMonthDays];
  };

  const getCellColor = (date: Date): string => {
    const availabilityData = getAvailabilityDataForDate(date);
    const isPast = isDateBeforeToday(date);
    const isCurrentMonth = isSameMonth(date, currentMonth);

    if (!isCurrentMonth) {
      return "bg-gray-50 border-gray-100";
    }

    if (isPast) {
      return "bg-gray-100 border-gray-200";
    }

    // If no availability data, show white
    if (!availabilityData || availabilityData.total_rooms === 0) {
      return "bg-white border-gray-200 hover:bg-gray-50";
    }

    const { total_available_rooms, total_rooms } = availabilityData;
    const availabilityPercent = total_rooms > 0 ? (total_available_rooms / total_rooms) * 100 : 0;

    // Red: No rooms available
    if (total_available_rooms === 0) {
      return "bg-red-100 border-red-300 hover:bg-red-200";
    }

    // Orange: Very few rooms (1-10%)
    if (availabilityPercent > 0 && availabilityPercent <= 10) {
      return "bg-orange-100 border-orange-300 hover:bg-orange-200";
    }

    // Yellow: Few rooms (10-30%)
    if (availabilityPercent > 10 && availabilityPercent <= 30) {
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
    }

    // Green: Good availability (>30%)
    return "bg-green-100 border-green-300 hover:bg-green-200";
  };

  const handleCellHover = (date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    if (!isSameMonth(date, currentMonth) || isDateBeforeToday(date)) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setTooltipDate(date);
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
  };

  const handleCellLeave = () => {
    setTooltipDate(null);
    setTooltipPosition(null);
  };

  if (loading && roomTypes.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="grid grid-cols-7 gap-2">
              {[...Array(35)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const days = getDaysInMonth();
  const weekDays = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const tooltipAvailabilityData = tooltipDate ? getAvailabilityDataForDate(tooltipDate) : null;

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header with Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-4">
        <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-blue-600" size={24} />
              Quản lý Phòng Trống
            </h1>
          <p className="text-gray-600 mt-1">Kiểm soát số lượng phòng còn trống theo ngày</p>
        </div>
      </div>

      {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="inline mr-2" size={16} />
              Chọn khách sạn
            </label>
            <SearchableHotelSelector
              value={selectedHotelId}
              onChange={(hotelId) => {
                setSelectedHotelId(hotelId);
                setSelectedRoomTypeId(""); // Reset room type when hotel changes
              }}
              placeholder="Tìm kiếm hoặc chọn khách sạn..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Bed className="inline mr-2" size={16} />
              Chọn loại phòng
            </label>
          <select
              value={selectedRoomTypeId}
              onChange={(e) => setSelectedRoomTypeId(e.target.value)}
              disabled={!selectedHotelId || roomTypesList.length === 0}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">{selectedHotelId ? "Chọn loại phòng..." : "Chọn khách sạn trước"}</option>
              {roomTypesList.map((rt) => (
                <option key={rt.room_type_id} value={rt.room_type_id}>
                  {rt.name}
                </option>
              ))}
          </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchAvailability}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      )}

      {/* Calendar View */}
      {roomTypes.length > 0 && roomTypes.map((roomType) => (
        <div key={roomType.room_type_id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6" ref={calendarRef}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                {roomType.room_type_name}
              </h3>
              <p className="text-sm text-gray-600 mt-1">{roomType.hotel_name}</p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Tháng trước"
                aria-label="Tháng trước"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => setCurrentMonth(new Date())}
                className="px-3 md:px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
              >
                Hôm nay
              </button>
              <span className="px-3 md:px-4 py-2 font-medium text-gray-900 min-w-[150px] md:min-w-[200px] text-center text-sm md:text-base">
                {format(currentMonth, "MMMM yyyy", { locale: vi })}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                title="Tháng sau"
                aria-label="Tháng sau"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Legend */}
          <div className="mb-4 p-3 md:p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Chú giải màu sắc:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 md:gap-3 text-xs md:text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600">Còn nhiều phòng (&gt;30%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600">Ít phòng (10-30%)</span>
                  </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600">Rất ít phòng (1-10%)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border border-red-300 rounded flex-shrink-0"></div>
                <span className="text-gray-600">Hết phòng</span>
              </div>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-700 py-2">
                {day}
              </div>
            ))}
            {days.map((day) => {
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isToday = isSameDay(day, new Date());
              const availabilityData = getAvailabilityDataForDate(day);
              const cellColor = getCellColor(day);
              const showTooltip = tooltipDate && isSameDay(day, tooltipDate);

              return (
                <div
                  key={day.toISOString()}
                  onClick={() => handleCellClick(day)}
                  onMouseEnter={(e) => handleCellHover(day, e)}
                  onMouseLeave={handleCellLeave}
                  className={`
                    p-1 md:p-2 border rounded-lg text-center cursor-pointer transition-all relative
                    ${cellColor}
                    ${!isCurrentMonth ? "opacity-40" : ""}
                    ${isDateBeforeToday(day) ? "cursor-not-allowed opacity-60" : "hover:shadow-md"}
                    min-h-[60px] md:min-h-[80px]
                  `}
                >
                  <div
                    className={`text-xs md:text-sm font-medium ${
                      isToday ? "text-blue-600 font-bold" : isCurrentMonth ? "text-gray-900" : "text-gray-400"
                    }`}
                  >
                    {format(day, "d")}
                    {isToday && <span className="ml-0.5 text-xs">●</span>}
                  </div>
                  {availabilityData && availabilityData.total_rooms > 0 && (
                    <>
                      <div className="text-[10px] md:text-xs text-gray-700 mt-0.5 md:mt-1 font-semibold">
                        {availabilityData.total_available_rooms}/{availabilityData.total_rooms}
                      </div>
                      <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">
                        {((availabilityData.total_available_rooms / availabilityData.total_rooms) * 100).toFixed(0)}%
                      </div>
                    </>
                  )}
                  {availabilityData && availabilityData.avg_base_price > 0 && (
                    <>
                      {availabilityData.avg_discount_percent > 0 ? (
                        <>
                          <div className="text-[8px] md:text-[9px] text-gray-400 line-through mt-0.5">
                            {(availabilityData.avg_base_price / 1000).toFixed(0)}K
                          </div>
                          <div className="text-[9px] md:text-xs text-green-600 font-bold mt-0.5">
                            {((availabilityData.avg_base_price * (1 - availabilityData.avg_discount_percent / 100)) / 1000).toFixed(0)}K
                          </div>
                          <div className="text-[8px] md:text-[9px] text-green-600 font-semibold mt-0.5">
                            -{availabilityData.avg_discount_percent.toFixed(0)}%
                          </div>
                        </>
                      ) : (
                        <div className="text-[9px] md:text-xs text-blue-600 font-semibold mt-0.5">
                          {(availabilityData.avg_base_price / 1000).toFixed(0)}K
                        </div>
                      )}
                    </>
                  )}
                  {(!availabilityData || availabilityData.total_rooms === 0) && (
                    <div className="text-[10px] md:text-xs text-gray-400 mt-0.5 md:mt-1">-</div>
                  )}

                  {/* Tooltip */}
                  {showTooltip && tooltipPosition && tooltipAvailabilityData && (
                    <div
                      ref={tooltipRef}
                      className="fixed z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl max-w-[200px] pointer-events-none"
                      style={{
                        left: `${tooltipPosition.x}px`,
                        top: `${tooltipPosition.y}px`,
                        transform: "translate(-50%, -100%)",
                      }}
                    >
                      <div className="font-semibold mb-2">{format(day, "dd/MM/yyyy")}</div>
                      <div className="space-y-1">
                        <div>
                          Phòng trống: {tooltipAvailabilityData.total_available_rooms}/{tooltipAvailabilityData.total_rooms}
                        </div>
                        <div className="text-gray-300">
                          Tỷ lệ: {tooltipAvailabilityData.total_rooms > 0
                            ? ((tooltipAvailabilityData.total_available_rooms / tooltipAvailabilityData.total_rooms) * 100).toFixed(1)
                            : 0}%
                        </div>
                        {tooltipAvailabilityData.avg_base_price > 0 && (
                          <div className="text-gray-300">
                            Giá: {tooltipAvailabilityData.avg_base_price.toLocaleString("vi-VN")} VNĐ
                          </div>
                        )}
                        {tooltipAvailabilityData.avg_discount_percent > 0 && (
                          <div className="text-green-300">
                            Giảm: {tooltipAvailabilityData.avg_discount_percent.toFixed(1)}%
                          </div>
                        )}
                        {tooltipAvailabilityData.avg_base_price > 0 && tooltipAvailabilityData.avg_discount_percent > 0 && (
                          <div className="text-green-300">
                            Giá sau giảm: {(tooltipAvailabilityData.avg_base_price * (1 - tooltipAvailabilityData.avg_discount_percent / 100)).toLocaleString("vi-VN")} VNĐ
                          </div>
                        )}
                      </div>
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="border-4 border-transparent border-t-gray-900"></div>
            </div>
            </div>
                  )}
            </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* No Data Message */}
      {!loading && selectedRoomTypeId && roomTypes.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chưa có dữ liệu availability</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng chọn khách sạn và loại phòng để xem lịch availability</p>
        </div>
      )}

      {!selectedRoomTypeId && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Filter className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 font-medium">Chọn khách sạn và loại phòng</p>
          <p className="text-sm text-gray-500 mt-2">Vui lòng chọn khách sạn và loại phòng để xem lịch availability</p>
        </div>
      )}

      {/* Edit Availability Modal */}
      {showDateModal && selectedModalDate && selectedRoomTypeId && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDateModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Cấu hình ngày {format(selectedModalDate, "dd/MM/yyyy")}
                </h3>
                <p className="text-sm text-gray-500 mt-1">Quản lý phòng trống, chính sách, giá và khuyến mãi cho ngày này</p>
              </div>
              <button
                onClick={() => setShowDateModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50">
              <button
                onClick={() => setActiveTab("availability")}
                className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "availability"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Calendar size={18} />
                Phòng trống
              </button>
              <button
                onClick={() => setActiveTab("policies")}
                className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "policies"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Settings size={18} />
                Chính sách
              </button>
              <button
                onClick={() => setActiveTab("price")}
                className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "price"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <DollarSign size={18} />
                Giá
              </button>
              <button
                onClick={() => setActiveTab("discount")}
                className={`flex-1 px-4 py-3 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "discount"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <Percent size={18} />
                Khuyến mãi
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Availability Tab */}
              {activeTab === "availability" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Calendar className="text-blue-600" size={20} />
                      Cập nhật Phòng trống
                    </h4>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số phòng trống
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={availableRooms}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "" || /^[\d.,\s]+$/.test(value)) {
                                setAvailableRooms(value);
                              }
                            }}
                            onKeyPress={(e) => {
                              if (e.key === "Enter" && !updatingAvailability) {
                                handleUpdateAvailability();
                              }
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold pr-16"
                            placeholder="Nhập số phòng trống"
                            disabled={updatingAvailability}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                            phòng
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Nhập số phòng còn trống cho ngày này
                        </p>
                      </div>

                      {(() => {
                        const availabilityData = getAvailabilityDataForDate(selectedModalDate);
                        const totalRooms = availabilityData?.total_rooms || 0;
                        const numericAvailable = parseVietnameseNumber(availableRooms);
                        return totalRooms > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <p className="text-sm text-gray-600 mb-1">Tổng số phòng: {totalRooms}</p>
                            <p className="text-sm text-gray-600 mb-1">Số phòng trống: {numericAvailable}</p>
                            <p className="text-sm text-gray-600">
                              Tỷ lệ: {totalRooms > 0 ? ((numericAvailable / totalRooms) * 100).toFixed(1) : 0}%
                            </p>
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowDateModal(false)}
                      disabled={updatingAvailability}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpdateAvailability}
                      disabled={updatingAvailability || availableRooms === ""}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      {updatingAvailability ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Calendar size={16} />
                          Cập nhật phòng trống
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === "policies" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Chính sách thanh toán</h4>
                        
                        {/* Refundable */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="text-blue-600" size={18} />
                                <h5 className="font-semibold text-gray-900">Hoàn tiền (Refundable)</h5>
                              </div>
                              <p className="text-sm text-gray-600 ml-7">
                                Cho phép khách hàng được hoàn tiền khi hủy đặt phòng
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={refundable}
                                onChange={(e) => setRefundable(e.target.checked)}
                                disabled={updatingPolicies}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                          </div>
                        </div>

                        {/* Pay Later */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <CreditCard className="text-green-600" size={18} />
                                <h5 className="font-semibold text-gray-900">Trả sau (Pay Later)</h5>
                              </div>
                              <p className="text-sm text-gray-600 ml-7">
                                Cho phép khách hàng thanh toán sau khi check-in
                              </p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={payLater}
                                onChange={(e) => setPayLater(e.target.checked)}
                                disabled={updatingPolicies}
                                className="sr-only peer"
                              />
                              <div className="w-12 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                  <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                    <button
                      onClick={() => setShowDateModal(false)}
                      disabled={updatingPolicies}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      Hủy
                    </button>
                    <button
                      onClick={handleUpdatePolicies}
                      disabled={updatingPolicies}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                    >
                      {updatingPolicies ? (
                        <>
                          <RefreshCw size={16} className="animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <CheckCircle2 size={16} />
                          Lưu chính sách
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Price Tab */}
              {activeTab === "price" && (() => {
                      const availabilityData = getAvailabilityDataForDate(selectedModalDate);
                      const currentBasePrice = availabilityData ? availabilityData.avg_base_price : basePrice;
                      const numericPrice = parseVietnameseNumber(dateBasePrice);
                      return (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Giá cơ bản</h4>
                          
                          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
                            <p className="text-sm text-gray-600 mb-2">Giá hiện tại</p>
                            <p className="text-xl font-bold text-blue-600">
                              {currentBasePrice.toLocaleString("vi-VN")} VNĐ
                            </p>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Giá cơ bản mới (VNĐ)
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={dateBasePrice}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || /^[\d.,\s]+$/.test(value)) {
                                    setDateBasePrice(value);
                                  }
                                }}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter" && !updatingBasePrice && numericPrice >= 0) {
                                    handleUpdateDateBasePrice();
                                  }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold pr-16"
                                placeholder="Nhập giá cơ bản"
                                disabled={updatingBasePrice}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                VNĐ
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Nhập giá theo định dạng Việt Nam (ví dụ: 1.000.000)
                            </p>
                          </div>

                          {numericPrice > 0 && (
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <p className="text-sm text-gray-600 mb-1">Giá sau khi cập nhật:</p>
                              <p className="text-lg font-bold text-green-600">
                                {numericPrice.toLocaleString("vi-VN")} VNĐ
                              </p>
                            </div>
                          )}
                          </div>

                          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setShowDateModal(false)}
                              disabled={updatingBasePrice}
                              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleUpdateDateBasePrice}
                              disabled={updatingBasePrice || numericPrice < 0}
                              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                            >
                              {updatingBasePrice ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  Đang cập nhật...
                                </>
                              ) : (
                                <>
                                  <DollarSign size={16} />
                                  Cập nhật giá
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}

              {/* Discount Tab */}
              {activeTab === "discount" && (() => {
                      const availabilityData = getAvailabilityDataForDate(selectedModalDate);
                      const currentBasePrice = availabilityData ? availabilityData.avg_base_price : basePrice;
                      const currentDiscount = availabilityData ? availabilityData.avg_discount_percent : 0;
                      const currentPrice = currentBasePrice * (1 - currentDiscount / 100);
                      const numericDiscount = parseFloat(discountPercent || "0");
                      const newPrice = currentBasePrice * (1 - numericDiscount / 100);
                      return (
                        <div className="space-y-6">
                          <div>
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Khuyến mãi</h4>
                          
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Giá gốc</p>
                              <p className="text-base font-bold text-gray-900">
                                {currentBasePrice.toLocaleString("vi-VN")} VNĐ
                              </p>
                            </div>
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-xs text-gray-600 mb-1">Giá hiện tại</p>
                              <p className="text-base font-bold text-blue-600">
                                {currentPrice.toLocaleString("vi-VN")} VNĐ
                              </p>
                              {currentDiscount > 0 && (
                                <p className="text-xs text-blue-500 mt-1">Đã giảm {currentDiscount.toFixed(1)}%</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phần trăm giảm giá (%)
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={discountPercent}
                                onChange={(e) => {
                                  const value = e.target.value;
                                  if (value === "" || (!isNaN(parseFloat(value)) && parseFloat(value) >= 0 && parseFloat(value) <= 100)) {
                                    setDiscountPercent(value);
                                  }
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-semibold pr-12"
                                placeholder="0"
                                disabled={updatingDiscount}
                              />
                              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                                %
                              </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                              Nhập 0 để xóa khuyến mãi (0-100%)
                            </p>
                          </div>

                          {numericDiscount > 0 && (
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                              <div className="flex items-center gap-2 mb-2">
                                <Tag className="text-green-600" size={18} />
                                <p className="text-sm font-semibold text-gray-700">Giá sau khi áp dụng khuyến mãi</p>
                              </div>
                              <p className="text-xl font-bold text-green-600 mb-1">
                                {newPrice.toLocaleString("vi-VN")} VNĐ
                              </p>
                              <p className="text-sm text-gray-600">
                                Tiết kiệm: {(currentBasePrice - newPrice).toLocaleString("vi-VN")} VNĐ ({numericDiscount}%)
                              </p>
                            </div>
                          )}
                          </div>

                          <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                            <button
                              onClick={() => setShowDateModal(false)}
                              disabled={updatingDiscount}
                              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                              Hủy
                            </button>
                            <button
                              onClick={handleUpdateDiscount}
                              disabled={updatingDiscount || discountPercent === ""}
                              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-medium"
                            >
                              {updatingDiscount ? (
                                <>
                                  <RefreshCw size={16} className="animate-spin" />
                                  Đang cập nhật...
                                </>
                              ) : (
                                <>
                                  <Tag size={16} />
                                  Áp dụng khuyến mãi
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Availability;
