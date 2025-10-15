import { Plus, Minus } from 'lucide-react';
import type { HotelSearchParams, GuestType } from '../../types/hotel.types';

interface GuestPickerPopupProps {
  searchParams: HotelSearchParams;
  showGuestPicker: boolean;
  incrementGuests: (type: GuestType) => void;
  decrementGuests: (type: GuestType) => void;
}

export default function GuestPickerPopup({
  searchParams,
  showGuestPicker,
  incrementGuests,
  decrementGuests
}: GuestPickerPopupProps) {
  if (!showGuestPicker) return null;

  return (
    <div className="absolute right-0 mt-2 p-4 bg-white rounded-lg shadow-xl z-20 w-80 border border-gray-100">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black">Người lớn</p>
            <p className="text-xs text-gray-500">18 tuổi trở lên</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => decrementGuests('adults')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.adults <= 1 || (searchParams.adults - 1 < searchParams.rooms)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.adults <= 1 || (searchParams.adults - 1 < searchParams.rooms)}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-black">{searchParams.adults}</span>
            <button 
              type="button"
              onClick={() => incrementGuests('adults')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.adults >= 30 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.adults >= 30}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black">Trẻ em</p>
            <p className="text-xs text-gray-500">0-17 tuổi</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => decrementGuests('children')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.children <= 0 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.children <= 0}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-black">{searchParams.children}</span>
            <button 
              type="button"
              onClick={() => incrementGuests('children')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.children >= 10 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.children >= 10}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-black">Phòng</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              type="button"
              onClick={() => decrementGuests('rooms')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.rooms <= 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.rooms <= 1}
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium text-black">{searchParams.rooms}</span>
            <button 
              type="button"
              onClick={() => incrementGuests('rooms')}
              className={`w-8 h-8 flex items-center justify-center rounded-full ${
                searchParams.rooms >= 30 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
              }`}
              disabled={searchParams.rooms >= 30}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Thông báo về quy tắc phòng */}
        <div className="pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            Để xem chính xác giá phòng, hãy đảm bảo nhập đúng tuổi của trẻ.
          </p>
          <p className="text-xs text-gray-500 mt-1">
            <strong>Quy tắc:</strong> Số người lớn phải ≥ số phòng. 
            Trẻ em không tính vào yêu cầu tối thiểu. Khi tăng phòng, hệ thống sẽ tự động tăng người lớn nếu cần.
          </p>
        </div>
      </div>
    </div>
  );
}