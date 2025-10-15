import { Calendar } from 'lucide-react';
import type { FlexibleStayDuration } from '../../types/hotel.types';

interface FlexibleTabProps {
  flexibleStayDuration: FlexibleStayDuration;
  setFlexibleStayDuration: (duration: FlexibleStayDuration) => void;
  selectedFlexibleMonth: Date | null;
  setSelectedFlexibleMonth: (month: Date | null) => void;
  setShowDatePicker: (show: boolean) => void;
  setShowGuestPicker: (show: boolean) => void;
  onFlexibleDateSelect: (checkIn: Date, checkOut: Date) => void;
}

export default function FlexibleTab({
  flexibleStayDuration,
  setFlexibleStayDuration,
  selectedFlexibleMonth,
  setSelectedFlexibleMonth,
  setShowDatePicker,
  setShowGuestPicker,
  onFlexibleDateSelect
}: FlexibleTabProps) {
  const handleFlexibleBooking = () => {
    if (selectedFlexibleMonth) {
      const checkIn = new Date(selectedFlexibleMonth);
      checkIn.setDate(1);
      const checkOut = new Date(checkIn);
      
      if (flexibleStayDuration === '3days') {
        checkOut.setDate(checkOut.getDate() + 3);
      } else if (flexibleStayDuration === '1week') {
        checkOut.setDate(checkOut.getDate() + 7);
      } else {
        checkOut.setMonth(checkOut.getMonth() + 1);
      }
      
      onFlexibleDateSelect(checkIn, checkOut);
      
      setTimeout(() => {
        setShowDatePicker(false);
        setShowGuestPicker(true);
      }, 300);
    }
  };

  return (
    <div className="space-y-6">
      {/* Câu hỏi về thời gian lưu trú */}
      <div>
        <h3 className="text-gray-700 font-semibold mb-4">Quý khách muốn lưu trú trong bao lâu?</h3>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setFlexibleStayDuration('3days')}
            className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
              flexibleStayDuration === '3days'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            3 đêm
          </button>
          <button
            type="button"
            onClick={() => setFlexibleStayDuration('1week')}
            className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
              flexibleStayDuration === '1week'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            1 tuần
          </button>
          <button
            type="button"
            onClick={() => setFlexibleStayDuration('1month')}
            className={`px-6 py-2 rounded-full border-2 font-medium transition-all ${
              flexibleStayDuration === '1month'
                ? 'border-blue-600 bg-blue-50 text-blue-600'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            1 tháng
          </button>
        </div>
      </div>

      {/* Câu hỏi về thời điểm đi */}
      <div>
        <h3 className="text-gray-700 font-semibold mb-3">Quý khách muốn đi vào lúc nào?</h3>
        <p className="text-sm text-gray-500 mb-4">Có thể chọn nhiều tháng</p>
        
        {/* Danh sách tháng */}
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, index) => {
            const monthDate = new Date();
            monthDate.setMonth(monthDate.getMonth() + index);
            const monthName = monthDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });
            const isSelected = selectedFlexibleMonth?.getMonth() === monthDate.getMonth() && 
                             selectedFlexibleMonth?.getFullYear() === monthDate.getFullYear();
            
            return (
              <button
                key={index}
                type="button"
                onClick={() => setSelectedFlexibleMonth(monthDate)}
                className={`p-4 rounded-lg border-2 transition-all text-center ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Calendar className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                <div className={`text-sm font-medium ${isSelected ? 'text-blue-600' : 'text-gray-700'}`}>
                  {monthName.charAt(0).toUpperCase() + monthName.slice(1)}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Nút hành động */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <button
          type="button"
          onClick={() => {
            setSelectedFlexibleMonth(null);
            setFlexibleStayDuration('1week');
          }}
          className="px-6 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
        >
          Xóa
        </button>
        <button
          type="button"
          onClick={handleFlexibleBooking}
          className="px-6 py-2 bg-blue-600 text-white font-medium hover:bg-blue-700 rounded-lg transition-colors"
        >
          Chọn
        </button>
      </div>
    </div>
  );
}