import { Calendar } from 'lucide-react';
import { formatDate } from '../../utils';
import type { HotelSearchParams } from '../../types/hotel.types';

interface DatePickerFieldProps {
  searchParams: HotelSearchParams;
  onDateClick: () => void;
  type: 'checkin' | 'checkout';
}

export default function DatePickerField({ searchParams, onDateClick, type }: DatePickerFieldProps) {
  const getFieldLabel = () => {
    if (type === 'checkin') {
      return searchParams.stayType === 'overnight' ? 'Nhận phòng' : 'Ngày';
    }
    return 'Trả phòng';
  };

  const getFieldValue = () => {
    if (type === 'checkin') {
      if (searchParams.stayType === 'overnight') {
        return searchParams.checkIn 
          ? formatDate(searchParams.checkIn, false) 
          : '17 tháng 10 2025\nThứ Sáu';
      } else {
        return searchParams.checkIn 
          ? formatDate(searchParams.checkIn, true) 
          : '21 tháng 11 2025\nThứ Sáu | Trả phòng trong ngày';
      }
    } else {
      return searchParams.checkOut 
        ? formatDate(searchParams.checkOut) 
        : '25 tháng 10 2025\nThứ Bảy';
    }
  };

  return (
    <div 
      className="relative cursor-pointer" 
      onClick={onDateClick}
    >
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all min-h-[70px]">
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">
              {getFieldLabel()}
            </div>
            <div className="text-sm font-semibold text-gray-900 whitespace-pre-line">
              {getFieldValue()}
            </div>
          </div>
          <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}