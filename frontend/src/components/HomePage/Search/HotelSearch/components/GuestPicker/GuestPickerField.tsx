import { Users } from 'lucide-react';
import { getGuestSummary } from '../../utils';
import type { HotelSearchParams } from '../../types/hotel.types';

interface GuestPickerFieldProps {
  searchParams: HotelSearchParams;
  onGuestClick: () => void;
}

export default function GuestPickerField({ searchParams, onGuestClick }: GuestPickerFieldProps) {
  return (
    <div 
      className="relative cursor-pointer" 
      onClick={onGuestClick}
    >
      <div className="bg-white border-2 border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-all min-h-[86px]">
        <div className="flex items-center justify-between h-full">
          <div className="flex-1">
            <div className="text-xs text-gray-500 mb-1">Khách & Phòng</div>
            <div className="text-sm font-semibold text-gray-900">
              {getGuestSummary(searchParams.adults, searchParams.children, searchParams.rooms)}
            </div>
          </div>
          <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
    </div>
  );
}