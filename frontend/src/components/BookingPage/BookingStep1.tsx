import { Mail, Phone, Globe, Calendar, Clock, CheckCircle, Ban, BedDouble, Bed, ChevronDown, ChevronUp, Tag, X } from 'lucide-react';

// Use Ban icon for smoking as Cigarette doesn't exist in lucide-react
const SmokingIcon = Ban;

interface BookingStep1Props {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestFirstName: string;
  guestLastName: string;
  country: string;
  checkInTime: string;
  smokingPreference: 'non-smoking' | 'smoking' | null;
  bedPreference: 'large-bed' | 'twin-beds' | null;
  specialRequests: string;
  showMoreRequests: boolean;
  discountCode?: string;
  discountCodeApplied?: boolean;
  discountCodeError?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onFirstNameChange: (value: string) => void;
  onLastNameChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onCheckInTimeChange: (value: string) => void;
  onSmokingChange: (value: 'non-smoking' | 'smoking' | null) => void;
  onBedPreferenceChange: (value: 'large-bed' | 'twin-beds' | null) => void;
  onSpecialRequestsChange: (value: string) => void;
  onShowMoreRequestsChange: (value: boolean) => void;
  onDiscountCodeChange?: (value: string) => void;
  onApplyDiscountCode?: () => void;
  onRemoveDiscountCode?: () => void;
  paymentMethod?: 'pay_at_hotel' | 'online_payment';
  checkOut?: string;
  onNext: () => void;
}

export default function BookingStep1({
  guestName,
  guestEmail,
  guestPhone,
  guestFirstName,
  guestLastName,
  country,
  checkInTime,
  smokingPreference,
  bedPreference,
  specialRequests,
  showMoreRequests,
  discountCode = '',
  discountCodeApplied = false,
  discountCodeError = '',
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onFirstNameChange,
  onLastNameChange,
  onCountryChange,
  onCheckInTimeChange,
  onSmokingChange,
  onBedPreferenceChange,
  onSpecialRequestsChange,
  onShowMoreRequestsChange,
  onDiscountCodeChange,
  onApplyDiscountCode,
  onRemoveDiscountCode,
  paymentMethod = 'pay_at_hotel',
  checkOut,
  onNext
}: BookingStep1Props) {
  const handleNameChange = (value: string) => {
    onNameChange(value);
    // Auto-split into first and last name
    const parts = value.trim().split(' ');
    if (parts.length > 1) {
      onLastNameChange(parts[0]);
      onFirstNameChange(parts.slice(1).join(' '));
    } else if (parts.length === 1) {
      onFirstNameChange(parts[0]);
    }
  };

  const canProceed = () => {
    return (guestFirstName && guestLastName) || guestName;
  };

  return (
    <div className="space-y-6">
      {/* Guest Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {/* No Credit Card Required Banner */}
        {paymentMethod === 'pay_at_hotel' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-800 text-sm mb-1">
                  Không yêu cầu thẻ tín dụng
                </p>
                <p className="text-xs text-green-700">
                  Bạn có thể đặt phòng mà không cần cung cấp thông tin thanh toán. Thanh toán sẽ được thực hiện tại nơi ở khi bạn đến.
                </p>
              </div>
            </div>
          </div>
        )}

        <h2 className="text-lg font-bold text-black mb-4">Ai là khách chính?</h2>
        <p className="text-sm text-gray-600 mb-4">
          Bạn có thể thêm tên khách sau khi xác nhận đặt phòng.
        </p>
        <p className="text-xs text-red-600 mb-4 flex items-center gap-1">
          <span className="text-red-600">*</span>
          <span>Mục bắt buộc</span>
        </p>

        <div className="space-y-4">
          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={guestFirstName}
                onChange={(e) => onFirstNameChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Tên của bạn"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Họ (vd: Nguyễn) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={guestLastName}
                onChange={(e) => onLastNameChange(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="Họ của bạn"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Email ID <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                required
                value={guestEmail}
                onChange={(e) => onEmailChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="email@example.com"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Chúng tôi sẽ gửi xác nhận đặt phòng và thông tin quan trọng đến địa chỉ email này. Vui lòng nhập đúng email.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Quốc gia cư trú <span className="text-red-600">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <select
                value={country}
                onChange={(e) => onCountryChange(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black appearance-none bg-white"
              >
                <option value="Việt Nam">Việt Nam</option>
                <option value="USA">USA</option>
                <option value="Thailand">Thailand</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Số điện thoại (không bắt buộc)
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={guestPhone}
                onChange={(e) => onPhoneChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="0912345678"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stay Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-black mb-4">Thông tin lưu trú bổ sung</h2>
        <div>
          <p className="text-sm font-medium text-black mb-2">
            Bạn đã biết khi nào sẽ đến nhận phòng chưa?
          </p>
          <p className="text-xs text-gray-600 mb-3">
            Chỗ nghỉ sẽ được thông báo về thời gian đến ước tính của quý khách.
          </p>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
            <select
              value={checkInTime}
              onChange={(e) => onCheckInTimeChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black appearance-none bg-white"
            >
              <option value="unknown">Tôi chưa biết</option>
              <option value="morning">Sáng (6:00 - 12:00)</option>
              <option value="afternoon">Chiều (12:00 - 18:00)</option>
              <option value="evening">Tối (18:00 - 24:00)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Special Requests */}
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
                onChange={() => onSmokingChange('non-smoking')}
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
                onChange={() => onSmokingChange('smoking')}
                className="sr-only"
              />
              <SmokingIcon className={`w-5 h-5 rotate-180 ${
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
                onChange={() => onBedPreferenceChange('large-bed')}
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
                onChange={() => onBedPreferenceChange('twin-beds')}
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
            onClick={() => onShowMoreRequestsChange(!showMoreRequests)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-3"
          >
            {showMoreRequests ? (
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

          {showMoreRequests && (
            <textarea
              value={specialRequests}
              onChange={(e) => onSpecialRequestsChange(e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Ghi chú về yêu cầu đặc biệt của bạn (tùy chọn)"
            />
          )}
        </div>
      </div>

      {/* Discount Code */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-bold text-black mb-2">Mã giảm giá</h2>
        <p className="text-sm text-gray-600 mb-4">
          Nhập mã giảm giá của bạn để được giảm giá đặc biệt
        </p>

        {!discountCodeApplied ? (
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
              <input
                type="text"
                value={discountCode}
                onChange={(e) => onDiscountCodeChange?.(e.target.value)}
                placeholder="Nhập mã giảm giá"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && discountCode && onApplyDiscountCode) {
                    onApplyDiscountCode();
                  }
                }}
              />
            </div>
            <button
              type="button"
              onClick={onApplyDiscountCode}
              disabled={!discountCode || !onApplyDiscountCode}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              Áp dụng
            </button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Mã giảm giá <strong>{discountCode}</strong> đã được áp dụng
              </span>
            </div>
            <button
              type="button"
              onClick={onRemoveDiscountCode}
              className="p-1 hover:bg-green-100 rounded transition-colors"
              title="Xóa mã giảm giá"
            >
              <X className="w-4 h-4 text-green-600" />
            </button>
          </div>
        )}

        {discountCodeError && (
          <p className="mt-2 text-sm text-red-600">{discountCodeError}</p>
        )}
      </div>

      {/* Free Room Benefits */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-sm font-semibold text-green-700 mb-3">Quyền lợi phòng miễn phí</h3>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-3 flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Calendar className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-black mb-1">
                Không rủi ro và được hoàn lại toàn bộ
              </p>
              <p className="text-xs text-gray-600">
                Hủy trước {checkOut && new Date(checkOut).toLocaleDateString('vi-VN')} và quý khách sẽ không phải trả gì cả.
              </p>
            </div>
          </div>
          <button type="button" className="bg-green-600 text-white text-xs font-bold px-3 py-1 rounded ml-4">
            BAO GỒM
          </button>
        </div>
        <div className="flex items-start gap-3">
          <Mail className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-600">
            Chúng tôi sẽ gởi xác nhận cho đặt phòng của bạn theo địa chỉ email được cung cấp
          </p>
        </div>
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={onNext}
        disabled={!canProceed()}
        className="w-full bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        KẾ TIẾP: BƯỚC CUỐI CÙNG
      </button>
      <p className="text-sm text-green-600 text-center font-medium">
        Có liền xác nhận đặt phòng!
      </p>
    </div>
  );
}

