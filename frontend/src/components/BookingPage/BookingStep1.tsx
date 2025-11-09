import { useState, useEffect, useRef } from 'react';
import { Mail, Phone, Globe, Calendar, Clock, CheckCircle, Ban, BedDouble, Bed, ChevronDown, ChevronUp, Tag, X, Search, ChevronRight } from 'lucide-react';
import { getAvailableDiscountCodes, DiscountCode } from '../../services/discountService';

// Use Ban icon for smoking as Cigarette doesn't exist in lucide-react
const SmokingIcon = Ban;

interface AppliedDiscountCode {
  code: string;
  discount_id?: string;
  discountAmount: number;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
}

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
  appliedDiscountCodes?: AppliedDiscountCode[];
  hotelId?: string;
  checkInDate?: string;
  nights?: number;
  subtotal?: number;
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
  onApplyDiscountCode?: (code: string) => Promise<void>;
  onRemoveDiscountCode?: (code: string) => void;
  onSelectDiscountCode?: (code: DiscountCode) => Promise<void>;
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
  appliedDiscountCodes = [],
  hotelId,
  checkInDate,
  nights,
  subtotal: _subtotal = 0,
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
  onSelectDiscountCode,
  paymentMethod = 'pay_at_hotel',
  checkOut,
  onNext
}: BookingStep1Props) {
  // ✅ Modal/Dropdown state for selecting discount codes
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [availableDiscountCodes, setAvailableDiscountCodes] = useState<DiscountCode[]>([]);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [manualDiscountCode, setManualDiscountCode] = useState(discountCode);
  const [applyingCode, setApplyingCode] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // ✅ Fetch available discount codes
  useEffect(() => {
    const fetchAvailableCodes = async () => {
      if (!showDiscountModal) return;
      
      setIsLoadingCodes(true);
      try {
        const codes = await getAvailableDiscountCodes({
          hotelId,
          checkInDate,
          nights,
          limit: 50
        });
        setAvailableDiscountCodes(codes);
      } catch (error) {
        console.error('Error fetching available discount codes:', error);
        setAvailableDiscountCodes([]);
      } finally {
        setIsLoadingCodes(false);
      }
    };

    fetchAvailableCodes();
  }, [showDiscountModal, hotelId, checkInDate, nights]);

  // ✅ Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowDiscountModal(false);
      }
    };

    if (showDiscountModal) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDiscountModal]);

  // ✅ Filter codes based on search query
  const filteredCodes = availableDiscountCodes.filter(code => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return code.code.toLowerCase().includes(query) || 
           (code.description && code.description.toLowerCase().includes(query));
  });

  // ✅ Check if code is already applied
  const isCodeApplied = (code: string) => {
    return appliedDiscountCodes.some(applied => applied.code === code);
  };

  // ✅ Check if max codes reached
  const maxCodesReached = appliedDiscountCodes.length >= 2;

  // ✅ Handle select discount code from list
  const handleSelectDiscountCode = async (code: DiscountCode) => {
    if (isCodeApplied(code.code)) {
      return; // Already applied
    }

    if (maxCodesReached) {
      return; // Max codes reached
    }

    if (onSelectDiscountCode) {
      setApplyingCode(code.code);
      try {
        await onSelectDiscountCode(code);
      } catch (error) {
        console.error('Error applying discount code:', error);
      } finally {
        setApplyingCode(null);
      }
    }
  };

  // ✅ Handle manual discount code apply
  const handleManualApply = async () => {
    if (!manualDiscountCode.trim() || !onApplyDiscountCode) return;

    setApplyingCode(manualDiscountCode);
    try {
      await onApplyDiscountCode(manualDiscountCode);
      setManualDiscountCode(''); // Clear input after successful apply
    } catch (error) {
      console.error('Error applying manual discount code:', error);
    } finally {
      setApplyingCode(null);
    }
  };

  // ✅ Format discount value for display
  const formatDiscountValue = (code: DiscountCode) => {
    if (code.discount_type === 'PERCENT') {
      return `Giảm ${code.discount_value}%${code.max_discount ? ` (tối đa ${code.max_discount.toLocaleString('vi-VN')} VND)` : ''}`;
    } else {
      return `Giảm ${code.discount_value.toLocaleString('vi-VN')} VND`;
    }
  };

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
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-bold text-black">Mã giảm giá</h2>
          {appliedDiscountCodes.length > 0 && (
            <span className="text-xs text-gray-500">
              ({appliedDiscountCodes.length}/2 mã đã áp dụng)
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-4">
          Chọn mã giảm giá từ danh sách hoặc nhập mã của bạn (tối đa 2 mã)
        </p>

        {/* ✅ Applied discount codes list */}
        {appliedDiscountCodes.length > 0 && (
          <div className="space-y-2 mb-4">
            {appliedDiscountCodes.map((applied, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <span className="text-sm font-medium text-green-800">
                      Mã <strong>{applied.code}</strong>
                    </span>
                    {applied.discountAmount > 0 && (
                      <span className="text-xs text-green-700 block">
                        Giảm {applied.discountAmount.toLocaleString('vi-VN')} VND
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onRemoveDiscountCode?.(applied.code)}
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                  title="Xóa mã giảm giá"
                >
                  <X className="w-4 h-4 text-green-600" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ✅ Select discount code button and manual input */}
        {!maxCodesReached && (
          <div className="space-y-3">
            {/* Button to open modal/dropdown */}
            <button
              type="button"
              onClick={() => setShowDiscountModal(!showDiscountModal)}
              className="w-full flex items-center justify-between px-4 py-2.5 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">
                  Chọn mã giảm giá
                </span>
              </div>
              <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${showDiscountModal ? 'rotate-90' : ''}`} />
            </button>

            {/* ✅ Modal/Dropdown for selecting discount codes */}
            {showDiscountModal && (
              <div 
                ref={modalRef}
                className="relative z-50 border border-gray-200 rounded-lg bg-white shadow-lg max-h-96 overflow-hidden flex flex-col"
              >
                {/* Search input */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm mã giảm giá..."
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>

                {/* Discount codes list */}
                <div className="overflow-y-auto flex-1">
                  {isLoadingCodes ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      Đang tải mã giảm giá...
                    </div>
                  ) : filteredCodes.length === 0 ? (
                    <div className="p-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'Không tìm thấy mã giảm giá' : 'Không có mã giảm giá khả dụng'}
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-200">
                      {filteredCodes.map((code) => {
                        const isApplied = isCodeApplied(code.code);
                        const isApplying = applyingCode === code.code;

                        return (
                          <button
                            key={code.discount_id}
                            type="button"
                            onClick={() => !isApplied && handleSelectDiscountCode(code)}
                            disabled={isApplied || isApplying || maxCodesReached}
                            className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                              isApplied 
                                ? 'bg-green-50 cursor-not-allowed opacity-60' 
                                : isApplying 
                                ? 'bg-blue-50 cursor-wait' 
                                : maxCodesReached
                                ? 'cursor-not-allowed opacity-50'
                                : 'cursor-pointer'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-bold text-blue-600 text-sm">
                                    {code.code}
                                  </span>
                                  {isApplied && (
                                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded">
                                      Đã áp dụng
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm font-medium text-gray-900 mb-1">
                                  {formatDiscountValue(code)}
                                </p>
                                {code.description && (
                                  <p className="text-xs text-gray-500 line-clamp-2">
                                    {code.description}
                                  </p>
                                )}
                                {code.expires_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Hết hạn: {new Date(code.expires_at).toLocaleDateString('vi-VN')}
                                  </p>
                                )}
                              </div>
                              {!isApplied && !isApplying && !maxCodesReached && (
                                <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                              )}
                              {isApplying && (
                                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 border-t border-gray-300"></div>
              <span className="text-xs text-gray-500">hoặc</span>
              <div className="flex-1 border-t border-gray-300"></div>
            </div>

            {/* Manual input */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none z-10" />
                <input
                  type="text"
                  value={manualDiscountCode}
                  onChange={(e) => {
                    setManualDiscountCode(e.target.value);
                    onDiscountCodeChange?.(e.target.value);
                  }}
                  placeholder="Nhập mã giảm giá"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && manualDiscountCode.trim()) {
                      handleManualApply();
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleManualApply}
                disabled={!manualDiscountCode.trim() || applyingCode !== null}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {applyingCode === manualDiscountCode ? 'Đang áp dụng...' : 'Áp dụng'}
              </button>
            </div>
          </div>
        )}

        {/* Max codes reached message */}
        {maxCodesReached && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Bạn đã áp dụng tối đa 2 mã giảm giá. Vui lòng xóa một mã để áp dụng mã khác.
            </p>
          </div>
        )}

        {/* Error message */}
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

