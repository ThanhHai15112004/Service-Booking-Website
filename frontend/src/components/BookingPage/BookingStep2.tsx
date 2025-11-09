import { Lock, Info } from 'lucide-react';
import { useState } from 'react';

interface BookingStep2Props {
  paymentMethod: 'pay_at_hotel' | 'online_payment';
  cardName: string;
  cardNumber: string;
  cardExpiry: string;
  cardCVC: string;
  guestEmail?: string; // ✅ Add email prop
  onCardNameChange: (value: string) => void;
  onCardNumberChange: (value: string) => void;
  onCardExpiryChange: (value: string) => void;
  onCardCVCChange: (value: string) => void;
  onConfirm: () => void;
  onBack: () => void;
  subtotal: number;
  tax: number;
  total: number;
  discount?: number;
  couponApplied?: boolean;
  nights: number;
  rooms: number;
  packageDiscount?: number;
  codeDiscount?: number;
  subtotalAfterPackage?: number;
}

export default function BookingStep2({
  paymentMethod,
  cardName,
  cardNumber,
  cardExpiry,
  cardCVC,
  guestEmail = '', // ✅ Add email with default value
  onCardNameChange,
  onCardNumberChange,
  onCardExpiryChange,
  onCardCVCChange,
  onConfirm,
  onBack,
  subtotal,
  tax,
  total,
  discount = 0,
  couponApplied = false,
  nights,
  rooms,
  packageDiscount = 0,
  codeDiscount = 0,
  subtotalAfterPackage
}: BookingStep2Props) {
  const finalSubtotalAfterPackage = subtotalAfterPackage ?? (subtotal - packageDiscount);
  // ✅ State để quản lý support level được chọn
  const [supportLevel, setSupportLevel] = useState<'standard' | 'fast'>('fast');
  
  const formatPrice = (price: number) => {
    if (!price || isNaN(price)) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0
    }).format(price);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const canProceed = () => {
    if (paymentMethod === 'pay_at_hotel') {
      return true; // No payment info needed
    }
    return cardName && cardNumber.replace(/\s/g, '').length >= 13 && cardExpiry.length === 5 && cardCVC.length >= 3;
  };

  return (
    <div className="space-y-6">
      {/* Support Level Upgrade */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-black">Nâng cấp mức hỗ trợ của quý khách</h2>
          <a href="#" className="text-blue-600 text-sm hover:underline">Tìm hiểu thêm</a>
        </div>
        <div className="space-y-3">
          {/* Tiêu chuẩn */}
          <label 
            onClick={() => setSupportLevel('standard')}
            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              supportLevel === 'standard' 
                ? 'border-gray-600 bg-gray-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input 
              type="radio" 
              name="support" 
              checked={supportLevel === 'standard'}
              onChange={() => setSupportLevel('standard')}
              className="mt-1" 
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-black">Tiêu chuẩn</span>
                <span className="font-bold text-black">{formatPrice(0)}</span>
              </div>
              <p className="text-sm text-gray-600">Hỗ trợ trực tiếp 24/7</p>
            </div>
          </label>
          
          {/* Hỗ trợ nhanh */}
          <label 
            onClick={() => setSupportLevel('fast')}
            className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer relative transition-colors ${
              supportLevel === 'fast' 
                ? 'border-green-600 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400 bg-white'
            }`}
          >
            <input 
              type="radio" 
              name="support" 
              checked={supportLevel === 'fast'}
              onChange={() => setSupportLevel('fast')}
              className="mt-1" 
            />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1 relative">
                <span className="font-medium text-black">Hỗ trợ nhanh</span>
                <div className="flex items-center gap-2">
                  {supportLevel === 'fast' && (
                    <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                      Phổ biến
                    </span>
                  )}
                  <span className="font-bold text-black">{formatPrice(17063)}</span>
                </div>
              </div>
              <ul className={`text-sm space-y-1 ${
                supportLevel === 'fast' ? 'text-green-700' : 'text-gray-600'
              }`}>
                <li>• Mã khuyến mại 263.296 ₫ cho chuyến đi tiếp theo của quý khách</li>
                <li>• Hỗ trợ trực tiếp 24/7</li>
                <li>• Hỗ trợ ưu tiên</li>
              </ul>
            </div>
          </label>
        </div>
      </div>

      {/* Payment Section */}
      {paymentMethod === 'online_payment' ? (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Secure Payment Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-center gap-3">
            <Lock className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              Tất cả thông tin thẻ đều được mã hóa hoàn toàn, an toàn và được bảo vệ.
            </p>
          </div>

          <h2 className="text-lg font-bold text-black mb-4">THẺ TÍN DỤNG/GHI NỢ</h2>
          
          {/* Card Logos */}
          <div className="flex gap-2 mb-6">
            <div className="w-12 h-8 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
            <div className="w-12 h-8 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
            <div className="w-12 h-8 bg-blue-800 rounded text-white text-xs flex items-center justify-center font-bold">JCB</div>
            <div className="w-12 h-8 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
            <div className="w-12 h-8 bg-green-600 rounded text-white text-xs flex items-center justify-center font-bold">UP</div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Form Fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Hình thức thanh toán *
                </label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black">
                  <option>Visa / Mastercard / Amex / JCB</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tên trên thẻ *
                </label>
                <input
                  type="text"
                  required
                  value={cardName}
                  onChange={(e) => onCardNameChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  placeholder="Tên trên thẻ"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Số thẻ tín dụng/thẻ ghi nợ *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => onCardNumberChange(formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="1234 5678 9012 3456"
                  />
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Ngày hết hạn *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => onCardExpiryChange(formatExpiry(e.target.value))}
                    maxLength={5}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Mã bảo mật CVC *
                  </label>
                  <input
                    type="text"
                    required
                    value={cardCVC}
                    onChange={(e) => onCardCVCChange(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    placeholder="123"
                  />
                </div>
              </div>

              <p className="text-sm text-green-600 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Tất cả thông tin thẻ đều được mã hóa hoàn toàn và bảo mật
              </p>
            </div>

            {/* Right: Card Preview */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 text-white h-fit">
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <div className="w-12 h-8 bg-yellow-400 rounded"></div>
                  <Lock className="w-6 h-6" />
                </div>
                <div className="text-2xl font-mono tracking-wider mb-4">
                  {cardNumber || '**** **** **** ****'}
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-1">Tên chủ thẻ</p>
                    <p className="text-sm font-semibold">{cardName.toUpperCase() || 'TÊN CHỦ THẺ'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-1">Hết hạn</p>
                    <p className="text-sm font-semibold">{cardExpiry || 'MM/YY'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Pay at Hotel - Confirmation */
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-green-800 mb-2">
              Thanh toán tại nơi ở
            </h3>
            <p className="text-sm text-green-700 mb-4">
              Bạn sẽ thanh toán khi đến nhận phòng. Không cần thẻ tín dụng để đặt phòng.
            </p>
            <div className="bg-white rounded-lg p-4 mt-4">
              <p className="text-xs text-gray-600 mb-2">Chúng tôi sẽ gởi xác nhận đặt phòng của quý khách đến</p>
              <p className="text-sm font-semibold text-black">{guestEmail || 'email@example.com'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Price Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="bg-red-600 text-white text-xs font-bold text-center py-2 rounded mb-4">
          GIẢM 75% HÔM NAY
        </div>
        <div className="space-y-2 text-sm mb-4">
          <div className="flex justify-between text-gray-600">
            <span>Giá phòng ({rooms} phòng × {nights} đêm)</span>
            <span className="font-medium">{formatPrice(subtotal)}</span>
          </div>
          
          {/* Package Discount */}
          {packageDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá gói thành viên</span>
              <span>-{formatPrice(packageDiscount)}</span>
            </div>
          )}
          
          {/* Subtotal after package */}
          {packageDiscount > 0 && (
            <div className="flex justify-between text-gray-700 font-medium">
              <span>Tổng sau giảm giá gói</span>
              <span>{formatPrice(finalSubtotalAfterPackage)}</span>
            </div>
          )}
          
          {/* Code Discount */}
          {codeDiscount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Giảm giá mã khuyến mãi</span>
              <span>-{formatPrice(codeDiscount)}</span>
            </div>
          )}
          
          <div className="flex justify-between text-gray-600">
            <span>Thuế VAT (10%)</span>
            <span className="font-medium">{formatPrice(tax)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Phí đặt trước</span>
            <span className="text-green-600 font-medium">MIỄN PHÍ</span>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-3 mt-3">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-black">Giá tiền</span>
              <Info className="w-4 h-4 text-gray-400" />
            </div>
            <span className="text-xl font-bold text-red-600">{formatPrice(total - discount)}</span>
          </div>
          <p className="text-xs text-gray-500">
            Giá đã bao gồm thuế VAT 10%
          </p>
        </div>
      </div>

      {/* Marketing Consent */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" className="mt-1" />
          <p className="text-xs text-gray-600">
            Tôi đồng ý nhận thông tin cập nhật và chương trình khuyến mại về HomeStay và các chi nhánh hoặc đối tác kinh doanh của HomeStay thông qua nhiều kênh, bao gồm WhatsApp. Có thể ngừng nhận thông tin bất cứ lúc nào. Đọc thêm trong{' '}
            <a href="#" className="text-blue-600 hover:underline">Chính sách Quyền riêng tư</a>.
          </p>
        </label>
      </div>

      {/* Terms */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-xs text-gray-600 mb-4">
          Thực hiện bước tiếp theo đồng nghĩa với việc quý khách chấp nhận tuân theo{' '}
          <a href="#" className="text-blue-600 hover:underline">Điều khoản Sử dụng</a> và{' '}
          <a href="#" className="text-blue-600 hover:underline">Chính sách Quyền riêng tư</a> của HomeStay.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          Quay lại
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={!canProceed()}
          className="flex-1 bg-blue-600 text-white py-4 rounded-lg hover:bg-blue-700 transition-colors font-bold text-lg disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-5 h-5" />
          ĐẶT NGAY!
        </button>
      </div>
      <p className="text-sm text-green-600 text-center font-medium">
        KHÔNG SỢ RỦI RO Hủy không tốn phí
      </p>
    </div>
  );
}

