import { Mail, Phone, Globe } from 'lucide-react';
import { CheckCircle } from 'lucide-react';

interface GuestInfoFormProps {
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestFirstName?: string;
  guestLastName?: string;
  country?: string;
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onFirstNameChange?: (value: string) => void;
  onLastNameChange?: (value: string) => void;
  onCountryChange?: (value: string) => void;
  paymentMethod?: 'pay_at_hotel' | 'online_payment';
}

export default function GuestInfoForm({
  guestName,
  guestEmail,
  guestPhone,
  guestFirstName = '',
  guestLastName = '',
  country = 'Việt Nam',
  onNameChange,
  onEmailChange,
  onPhoneChange,
  onFirstNameChange,
  onLastNameChange,
  onCountryChange,
  paymentMethod = 'pay_at_hotel'
}: GuestInfoFormProps) {
  const handleNameChange = (value: string) => {
    onNameChange(value);
    // Auto-split into first and last name if provided
    if (onFirstNameChange && onLastNameChange) {
      const parts = value.trim().split(' ');
      if (parts.length > 1) {
        onLastNameChange(parts[0]);
        onFirstNameChange(parts.slice(1).join(' '));
      } else if (parts.length === 1) {
        onFirstNameChange(parts[0]);
      }
    }
  };

  return (
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
        {/* First Name & Last Name - Agoda style */}
        {(onFirstNameChange && onLastNameChange) ? (
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
        ) : (
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Họ và tên <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              placeholder="Nguyễn Văn A"
            />
          </div>
        )}

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
              onChange={(e) => onCountryChange?.(e.target.value)}
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
  );
}

