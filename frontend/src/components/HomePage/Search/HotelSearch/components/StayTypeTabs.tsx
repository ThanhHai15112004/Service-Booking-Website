import { Info } from 'lucide-react';
import type { StayTypeTabsProps } from '../types/hotel.types';

export default function StayTypeTabs({ 
  stayType, 
  onStayTypeChange, 
  showStayTypeTip, 
  onShowTip 
}: StayTypeTabsProps) {
  return (
    <>
      <div className="flex gap-2 mb-4">
        <button 
          className={`px-4 py-2 rounded-full font-medium text-xs transition-all ${
            stayType === 'overnight' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
          onClick={() => onStayTypeChange('overnight')}
        >
          Chỗ Ở Qua Đêm
        </button>
        <button 
          className={`px-4 py-2 rounded-full font-medium text-xs relative transition-all ${
            stayType === 'dayUse' 
              ? 'bg-blue-600 text-white shadow-md' 
              : 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
          }`}
          onClick={() => onStayTypeChange('dayUse')}
          onMouseEnter={() => onShowTip(true)}
          onMouseLeave={() => onShowTip(false)}
        >
          Chỗ Ở Trong Ngày
          {showStayTypeTip && (
            <div className="absolute left-0 top-full mt-2 bg-white p-3 rounded-md shadow-lg text-xs text-gray-700 w-64 z-20 border border-gray-100">
              <div className="flex gap-2">
                <Info className="w-4 h-4 text-blue-600" />
                <p>Là phòng cho thuê không qua đêm, 4-12 tiếng mà không phải trả thêm phí.</p>
              </div>
            </div>
          )}
        </button>
      </div>
      
      {/* Info box cho Chỗ Ở Trong Ngày */}
      {stayType === 'dayUse' && (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-3 mb-4 flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <div className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center">
              <Info className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-pink-900 font-medium text-xs">
              <span className="text-pink-600 font-semibold">Chỗ Ở Trong Ngày</span> là phòng cho thuê không đặt, 4-12 tiếng mà không phải qua đêm. Quý khách sẽ nhận phòng và trả phòng vào cùng một ngày.
            </p>
          </div>
        </div>
      )}
    </>
  );
}