import { useState, useEffect, useRef } from "react";
import { Calendar, DollarSign, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, RefreshCw, X, Tag, Settings, CreditCard, Percent } from "lucide-react";
import Toast from "../../../Toast";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { vi } from "date-fns/locale";
import { adminService } from "../../../../services/adminService";

interface PriceScheduleData {
  date: string;
  avg_base_price: number;
  min_base_price: number;
  max_base_price: number;
  avg_discount_percent: number;
  total_available_rooms: number;
  total_rooms: number;
}

interface RoomPricingTabProps {
  roomTypeId: string;
}

const RoomPricingTab = ({ roomTypeId }: RoomPricingTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [basePrice, setBasePrice] = useState<number>(0);
  const [schedules, setSchedules] = useState<PriceScheduleData[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [tooltipDate, setTooltipDate] = useState<Date | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showDateModal, setShowDateModal] = useState(false);
  const [selectedModalDate, setSelectedModalDate] = useState<Date | null>(null);
  const [activeTab, setActiveTab] = useState<"policies" | "price" | "discount">("policies");
  
  // Policies state
  const [refundable, setRefundable] = useState<boolean>(true);
  const [payLater, setPayLater] = useState<boolean>(false);
  const [updatingPolicies, setUpdatingPolicies] = useState(false);
  
  // Base price state
  const [dateBasePrice, setDateBasePrice] = useState<string>("");
  const [updatingBasePrice, setUpdatingBasePrice] = useState(false);
  
  // Discount state
  const [discountPercent, setDiscountPercent] = useState<string>("");
  const [updatingDiscount, setUpdatingDiscount] = useState(false);
  
  const tooltipRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPricing();
  }, [roomTypeId]);


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

  const formatNumberToVietnamese = (num: number): string => {
    return num.toLocaleString("vi-VN");
  };

  const parseVietnameseNumber = (str: string): number => {
    return parseInt(str.replace(/\D/g, "")) || 0;
  };

  const fetchPricing = async () => {
    setLoading(true);
    setError(null);
    try {
      const [basePriceResponse, schedulesResponse] = await Promise.all([
        adminService.getRoomTypeBasePrice(roomTypeId),
        adminService.getRoomTypePriceSchedules(roomTypeId),
      ]);

      if (basePriceResponse.success && basePriceResponse.data) {
        const price = basePriceResponse.data.basePrice || 0;
        setBasePrice(price);
      }
      // Note: We don't show error for basePrice failure, just use 0 as fallback

      if (schedulesResponse.success && schedulesResponse.data) {
        setSchedules(schedulesResponse.data);
      } else {
        const errorMsg = schedulesResponse.message || "Không thể tải lịch giá";
        showToast("error", errorMsg);
        setSchedules([]);
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || error.message || "Không thể tải dữ liệu giá";
      setError(errorMsg);
      showToast("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };


  // Format date as YYYY-MM-DD in local timezone (avoid timezone conversion issues)
  // This function ensures we get the local date, not UTC date
  const formatDateToString = (date: Date): string => {
    // Create a new date at local midnight to avoid timezone issues
    const localDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, "0");
    const day = String(localDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const handleCellClick = async (date: Date) => {
    const isCurrentMonth = isSameMonth(date, currentMonth);
    const isPast = date < new Date();
    
    // Only allow clicking on current month and future dates
    if (!isCurrentMonth || isPast) return;
    
    setSelectedModalDate(date);
    setActiveTab("policies");
    
    // Load data for the selected date
    const dateStr = formatDateToString(date);
    const priceData = getPriceDataForDate(date);
    
    // Load policies
    try {
      const policiesResponse = await adminService.getRoomTypeDatePolicies(roomTypeId, dateStr);
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
    if (priceData) {
      setDateBasePrice(formatNumberToVietnamese(priceData.avg_base_price));
    } else {
      setDateBasePrice(formatNumberToVietnamese(basePrice));
    }
    
    // Set discount
    setDiscountPercent(priceData?.avg_discount_percent?.toFixed(0) || "0");
    
    setShowDateModal(true);
  };

  const handleUpdatePolicies = async () => {
    if (!selectedModalDate) return;

    setUpdatingPolicies(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDatePolicies(
        roomTypeId,
        dateStr,
        refundable,
        payLater
      );
      if (response.success) {
        showToast("success", response.message || "Cập nhật chính sách thành công");
        await fetchPricing(); // Refresh data
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
    if (!selectedModalDate) return;

    const numericPrice = parseVietnameseNumber(dateBasePrice);
    if (numericPrice < 0) {
      showToast("error", "Giá cơ bản phải lớn hơn hoặc bằng 0");
      return;
    }

    setUpdatingBasePrice(true);
    try {
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDateBasePrice(roomTypeId, dateStr, numericPrice);
      if (response.success) {
        showToast("success", response.message || "Cập nhật giá cơ bản thành công");
        await fetchPricing(); // Refresh to show updated price
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
    if (!selectedModalDate) return;

    const numericDiscount = parseFloat(discountPercent || "0");
    if (isNaN(numericDiscount) || numericDiscount < 0 || numericDiscount > 100) {
      showToast("error", "Phần trăm giảm giá phải từ 0 đến 100");
      return;
    }

    setUpdatingDiscount(true);
    try {
      // Use formatDateToString to avoid timezone issues
      const dateStr = formatDateToString(selectedModalDate);
      const response = await adminService.updateRoomTypeDateDiscount(roomTypeId, dateStr, numericDiscount);
      if (response.success) {
        showToast("success", response.message || "Cập nhật khuyến mãi thành công");
        await fetchPricing(); // Refresh to show updated discount
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

  const getPriceDataForDate = (date: Date): PriceScheduleData | null => {
    // Use formatDateToString to avoid timezone issues
    const dateStr = formatDateToString(date);
    return schedules.find((s) => s.date === dateStr) || null;
  };

  const getCellColor = (date: Date): string => {
    const priceData = getPriceDataForDate(date);
    const isPast = date < new Date();
    const isCurrentMonth = isSameMonth(date, currentMonth);

    if (!isCurrentMonth) {
      return "bg-gray-50 border-gray-100";
    }

    if (isPast) {
      return "bg-gray-100 border-gray-200";
    }

    // If no schedule data, check if base price is set, otherwise white
    if (!priceData) {
      return "bg-white border-gray-200 hover:bg-gray-50";
    }

    const { avg_discount_percent, total_available_rooms, total_rooms } = priceData;
    const availabilityPercent = total_rooms > 0 ? (total_available_rooms / total_rooms) * 100 : 100;

    // PRIORITY 1: Availability status (most important - should override discount)
    // Red: No rooms available (total_available_rooms === 0)
    if (total_rooms > 0 && total_available_rooms === 0) {
      return "bg-red-100 border-red-300 hover:bg-red-200";
    }

    // PRIORITY 2: Discount (second priority - show green if has discount)
    // Green: Has discount (regardless of availability, but not if fully booked)
    if (avg_discount_percent > 0 && total_available_rooms > 0) {
      return "bg-green-100 border-green-300 hover:bg-green-200";
    }

    // PRIORITY 3: Availability warnings (only if no discount)
    // Orange: Very few rooms (1-10%)
    if (availabilityPercent > 0 && availabilityPercent <= 10 && avg_discount_percent === 0) {
      return "bg-orange-100 border-orange-300 hover:bg-orange-200";
    }

    // Yellow: Few rooms (10-30%)
    if (availabilityPercent > 10 && availabilityPercent <= 30 && avg_discount_percent === 0) {
      return "bg-yellow-100 border-yellow-300 hover:bg-yellow-200";
    }

    // White: Normal (no discount, good availability > 30% or no availability data)
    return "bg-white border-gray-200 hover:bg-gray-50";
  };

  const getPriceForDate = (date: Date): number => {
    const priceData = getPriceDataForDate(date);
    if (priceData && priceData.avg_base_price > 0) {
      const finalPrice = priceData.avg_base_price * (1 - (priceData.avg_discount_percent || 0) / 100);
      return finalPrice > 0 ? finalPrice : priceData.avg_base_price;
    }
    // If no schedule data, use current basePrice (might have been updated)
    return basePrice > 0 ? basePrice : 0;
  };

  const handleCellHover = (date: Date, event: React.MouseEvent<HTMLDivElement>) => {
    if (!isSameMonth(date, currentMonth) || date < new Date()) return;
    
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

  if (loading && schedules.length === 0 && basePrice === 0) {
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

  const selectedPriceData = selectedDate ? getPriceDataForDate(selectedDate) : null;
  const selectedPrice = selectedDate ? getPriceForDate(selectedDate) : 0;
  const tooltipPriceData = tooltipDate ? getPriceDataForDate(tooltipDate) : null;
  const tooltipPrice = tooltipDate ? getPriceForDate(tooltipDate) : 0;

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <div className="flex-1">
            <p className="text-sm font-medium text-red-800">Lỗi khi tải dữ liệu</p>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
          <button
            onClick={fetchPricing}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <RefreshCw size={16} />
            Thử lại
          </button>
        </div>
      )}

      {/* Calendar View */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6" ref={calendarRef}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="text-blue-600" size={20} />
            Lịch giá theo ngày
          </h3>
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-3 text-xs md:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-white border border-gray-200 rounded flex-shrink-0"></div>
              <span className="text-gray-600">Bình thường</span>
                </div>
                <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded flex-shrink-0"></div>
              <span className="text-gray-600">Có giảm giá</span>
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
        <div className="grid grid-cols-7 gap-1 md:gap-2" ref={calendarRef}>
          {weekDays.map((day) => (
            <div key={day} className="text-center text-xs md:text-sm font-semibold text-gray-700 py-2">
              {day}
            </div>
          ))}
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const price = getPriceForDate(day);
            const priceData = getPriceDataForDate(day);
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
                  ${isSelected ? "ring-2 ring-blue-500 ring-offset-1 md:ring-offset-2" : ""}
                  ${!isCurrentMonth ? "opacity-40" : ""}
                  ${day < new Date() ? "cursor-not-allowed opacity-60" : "hover:shadow-md"}
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
                <div className="text-[10px] md:text-xs text-gray-600 mt-0.5 md:mt-1 font-medium">
                  {price > 0 ? `${(price / 1000).toFixed(0)}K` : "-"}
                </div>
                {priceData && priceData.avg_discount_percent > 0 && (
                  <div className="text-[10px] md:text-xs text-green-600 font-semibold mt-0.5">
                    -{priceData.avg_discount_percent.toFixed(0)}%
                  </div>
                )}
                {priceData && priceData.total_rooms > 0 && (
                  <div className="text-[9px] md:text-xs text-gray-500 mt-0.5">
                    {priceData.total_rooms - priceData.total_available_rooms}/{priceData.total_rooms}
                  </div>
                )}

                {/* Tooltip */}
                {showTooltip && tooltipPosition && tooltipPriceData && (
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
                      <div>Giá: {tooltipPrice.toLocaleString("vi-VN")} VNĐ</div>
                      {tooltipPriceData.avg_discount_percent > 0 && (
                        <div className="text-green-300">Giảm: {tooltipPriceData.avg_discount_percent.toFixed(1)}%</div>
                      )}
                      <div>
                        Đã đặt: {tooltipPriceData.total_rooms - tooltipPriceData.total_available_rooms}/{tooltipPriceData.total_rooms}
                      </div>
                      <div className="text-gray-300">
                        Trống: {tooltipPriceData.total_available_rooms}/{tooltipPriceData.total_rooms} (
                        {tooltipPriceData.total_rooms > 0
                          ? ((tooltipPriceData.total_available_rooms / tooltipPriceData.total_rooms) * 100).toFixed(1)
                          : 0}
                        %)
                      </div>
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

      {/* Selected Date Details */}
      {selectedDate && selectedPriceData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Chi tiết ngày {format(selectedDate, "dd/MM/yyyy")}
            </h3>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Đóng"
            >
              ×
          </button>
        </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Giá trung bình</p>
              <p className="text-base md:text-lg font-bold text-gray-900">
                {selectedPriceData.avg_base_price.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Giá sau giảm</p>
              <p className="text-base md:text-lg font-bold text-green-600">
                {selectedPrice.toLocaleString("vi-VN")} VNĐ
              </p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Giảm giá</p>
              <p className="text-base md:text-lg font-bold text-orange-600">
                {selectedPriceData.avg_discount_percent > 0
                  ? `${selectedPriceData.avg_discount_percent.toFixed(1)}%`
                  : "0%"}
              </p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-xs md:text-sm text-gray-600 mb-1">Phòng đã đặt</p>
              <p className="text-base md:text-lg font-bold text-blue-600">
                {selectedPriceData.total_rooms - selectedPriceData.total_available_rooms}/{selectedPriceData.total_rooms}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Trống: {selectedPriceData.total_available_rooms}/{selectedPriceData.total_rooms} (
                {selectedPriceData.total_rooms > 0
                  ? ((selectedPriceData.total_available_rooms / selectedPriceData.total_rooms) * 100).toFixed(1)
                  : 0}
                %)
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Date Configuration Modal */}
      {showDateModal && selectedModalDate && (
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
                <p className="text-sm text-gray-500 mt-1">Quản lý chính sách, giá và khuyến mãi cho ngày này</p>
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
                onClick={() => setActiveTab("policies")}
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
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
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
                  activeTab === "price"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-white"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                }`}
              >
                <DollarSign size={18} />
                Giá cơ bản
              </button>
              <button
                onClick={() => setActiveTab("discount")}
                className={`flex-1 px-6 py-4 font-medium transition-colors flex items-center justify-center gap-2 ${
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
              {/* Policies Tab */}
              {activeTab === "policies" && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Chính sách thanh toán</h4>
                    
                    {/* Refundable */}
                    <div className="bg-gray-50 rounded-lg p-5 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="text-blue-600" size={20} />
                            <h5 className="font-semibold text-gray-900">Hoàn tiền (Refundable)</h5>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">
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
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Pay Later */}
                    <div className="bg-gray-50 rounded-lg p-5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CreditCard className="text-green-600" size={20} />
                            <h5 className="font-semibold text-gray-900">Trả sau (Pay Later)</h5>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">
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
                          <div className="w-14 h-7 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
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
                const priceData = getPriceDataForDate(selectedModalDate);
                const currentBasePrice = priceData ? priceData.avg_base_price : basePrice;
                const numericPrice = parseVietnameseNumber(dateBasePrice);
                return (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Giá cơ bản</h4>
                      
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 mb-4">
                        <p className="text-sm text-gray-600 mb-2">Giá hiện tại</p>
                        <p className="text-2xl font-bold text-blue-600">
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
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                          <p className="text-sm text-gray-600 mb-1">Giá sau khi cập nhật:</p>
                          <p className="text-xl font-bold text-green-600">
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
                const priceData = getPriceDataForDate(selectedModalDate);
                const currentBasePrice = priceData ? priceData.avg_base_price : basePrice;
                const currentDiscount = priceData ? priceData.avg_discount_percent : 0;
                const currentPrice = currentBasePrice * (1 - currentDiscount / 100);
                const numericDiscount = parseFloat(discountPercent || "0");
                const newPrice = currentBasePrice * (1 - numericDiscount / 100);
                return (
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Khuyến mãi</h4>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Giá gốc</p>
                          <p className="text-lg font-bold text-gray-900">
                            {currentBasePrice.toLocaleString("vi-VN")} VNĐ
                          </p>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-4">
                          <p className="text-sm text-gray-600 mb-1">Giá hiện tại</p>
                          <p className="text-lg font-bold text-blue-600">
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
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-5 mt-4">
                          <div className="flex items-center gap-2 mb-2">
                            <Tag className="text-green-600" size={20} />
                            <p className="text-sm font-semibold text-gray-700">Giá sau khi áp dụng khuyến mãi</p>
                          </div>
                          <p className="text-2xl font-bold text-green-600 mb-1">
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

export default RoomPricingTab;
