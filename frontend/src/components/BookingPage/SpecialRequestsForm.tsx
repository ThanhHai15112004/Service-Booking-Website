import { useState } from 'react';
import { Ban, BedDouble, Bed, ChevronDown, ChevronUp } from 'lucide-react';

// Use Ban icon rotated for smoking as Smoking doesn't exist
const Smoking = Ban;

interface SpecialRequestsFormProps {
  value: string;
  onChange: (value: string) => void;
  smokingPreference?: 'non-smoking' | 'smoking' | null;
  bedPreference?: 'large-bed' | 'twin-beds' | null;
  onSmokingChange?: (value: 'non-smoking' | 'smoking' | null) => void;
  onBedPreferenceChange?: (value: 'large-bed' | 'twin-beds' | null) => void;
}

export default function SpecialRequestsForm({ 
  value, 
  onChange,
  smokingPreference = 'non-smoking',
  bedPreference = null,
  onSmokingChange,
  onBedPreferenceChange
}: SpecialRequestsFormProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h2 className="text-lg font-bold text-black mb-2">Yêu cầu đặc biệt</h2>
      <p className="text-sm text-gray-600 mb-4">
        Hãy cho chúng tôi biết về sở thích của quý khách. Phụ thuộc vào tình trạng thực tế.
      </p>

      {/* Smoking Preference */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-black mb-3">
          Phòng hút thuốc/Không hút thuốc
        </h3>
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
            smokingPreference === 'non-smoking' 
              ? 'border-green-600 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="smoking"
              value="non-smoking"
              checked={smokingPreference === 'non-smoking'}
              onChange={() => onSmokingChange?.('non-smoking')}
              className="sr-only"
            />
            <Ban className={`w-5 h-5 ${
              smokingPreference === 'non-smoking' ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              smokingPreference === 'non-smoking' ? 'text-green-800' : 'text-gray-700'
            }`}>
              Phòng không hút thuốc
            </span>
          </label>

          <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
            smokingPreference === 'smoking' 
              ? 'border-green-600 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="smoking"
              value="smoking"
              checked={smokingPreference === 'smoking'}
              onChange={() => onSmokingChange?.('smoking')}
              className="sr-only"
            />
              <Smoking className={`w-5 h-5 rotate-180 ${
                smokingPreference === 'smoking' ? 'text-green-600' : 'text-gray-400'
              }`} />
            <span className={`text-sm font-medium ${
              smokingPreference === 'smoking' ? 'text-green-800' : 'text-gray-700'
            }`}>
              Phòng hút thuốc
            </span>
          </label>
        </div>
      </div>

      {/* Bed Type Preference */}
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-black mb-3">
          Chọn loại giường
        </h3>
        <div className="flex gap-4">
          <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
            bedPreference === 'large-bed' 
              ? 'border-green-600 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="bedType"
              value="large-bed"
              checked={bedPreference === 'large-bed'}
              onChange={() => onBedPreferenceChange?.('large-bed')}
              className="sr-only"
            />
            <BedDouble className={`w-5 h-5 ${
              bedPreference === 'large-bed' ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              bedPreference === 'large-bed' ? 'text-green-800' : 'text-gray-700'
            }`}>
              Tôi muốn lấy giường lớn
            </span>
          </label>

          <label className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg cursor-pointer transition-all ${
            bedPreference === 'twin-beds' 
              ? 'border-green-600 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}>
            <input
              type="radio"
              name="bedType"
              value="twin-beds"
              checked={bedPreference === 'twin-beds'}
              onChange={() => onBedPreferenceChange?.('twin-beds')}
              className="sr-only"
            />
            <Bed className={`w-5 h-5 ${
              bedPreference === 'twin-beds' ? 'text-green-600' : 'text-gray-400'
            }`} />
            <span className={`text-sm font-medium ${
              bedPreference === 'twin-beds' ? 'text-green-800' : 'text-gray-700'
            }`}>
              Tôi muốn lấy phòng 2 giường
            </span>
          </label>
        </div>
      </div>

      {/* Additional Special Requests */}
      <div>
        <button
          type="button"
          onClick={() => setShowMore(!showMore)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-3"
        >
          {showMore ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Thêm yêu cầu đặc biệt
            </>
          )}
        </button>

        {showMore && (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={4}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            placeholder="Ghi chú về yêu cầu đặc biệt của bạn (tùy chọn)"
          />
        )}
      </div>
    </div>
  );
}
