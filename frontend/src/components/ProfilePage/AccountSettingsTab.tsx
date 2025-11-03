import { useState } from 'react';
import { Globe, Clock, DollarSign, Lock, Shield, Bell, Smartphone, Monitor, Save, Eye, EyeOff } from 'lucide-react';

interface AccountSettingsTabProps {
  onPasswordChange: (oldPassword: string, newPassword: string) => Promise<void>;
  saving: boolean;
}

export default function AccountSettingsTab({ onPasswordChange, saving }: AccountSettingsTabProps) {
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [settings, setSettings] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    currency: 'VND',
    twoFactorAuth: false,
    emailNotifications: {
      promotions: true,
      bookingConfirmations: true,
      postTripReviews: true
    },
    smsNotifications: {
      promotions: false,
      bookingConfirmations: true,
      postTripReviews: false
    }
  });

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('Mật khẩu mới không khớp!');
      return;
    }
    await onPasswordChange(passwordForm.old_password, passwordForm.new_password);
    setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
  };

  // Mock devices - sẽ được thay thế bằng API call
  const recentDevices = [
    { id: 1, name: 'Chrome on Windows', location: 'Ho Chi Minh, Vietnam', lastActive: '2025-11-04T10:30:00', isCurrent: true },
    { id: 2, name: 'Safari on iPhone', location: 'Ho Chi Minh, Vietnam', lastActive: '2025-11-03T15:20:00', isCurrent: false },
  ];

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Globe className="w-6 h-6 text-blue-600" />
          Cài đặt chung
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngôn ngữ hiển thị
            </label>
            <select
              value={settings.language}
              onChange={(e) => setSettings({ ...settings, language: e.target.value })}
              className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Múi giờ
            </label>
            <select
              value={settings.timezone}
              onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
              className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Asia/Ho_Chi_Minh">(GMT+7) Ho Chi Minh</option>
              <option value="Asia/Hanoi">(GMT+7) Hanoi</option>
              <option value="UTC">(GMT+0) UTC</option>
              <option value="America/New_York">(GMT-5) New York</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <DollarSign className="w-4 h-4 inline mr-1" />
              Đơn vị tiền tệ mặc định
            </label>
            <select
              value={settings.currency}
              onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
              className="w-full md:w-64 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="VND">VND (₫)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Lock className="w-6 h-6 text-blue-600" />
          Cài đặt bảo mật
        </h2>

        {/* Change Password */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thay đổi mật khẩu</h3>
          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu hiện tại *
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={passwordForm.old_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu mới *
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu mới *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                  className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Lock className="w-4 h-4" />
              {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>

        {/* Two-Factor Authentication */}
        <div className="mb-8 pb-8 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Xác thực hai bước</h3>
              <p className="text-sm text-gray-600">
                Tăng cường bảo mật cho tài khoản của bạn bằng mã xác thực
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.twoFactorAuth}
                onChange={(e) => setSettings({ ...settings, twoFactorAuth: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>

        {/* Recent Devices */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thiết bị đăng nhập gần đây</h3>
          <div className="space-y-3">
            {recentDevices.map((device) => (
              <div
                key={device.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    {device.name.includes('iPhone') ? (
                      <Smartphone className="w-6 h-6 text-blue-600" />
                    ) : (
                      <Monitor className="w-6 h-6 text-blue-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{device.name}</p>
                    <p className="text-sm text-gray-500">{device.location}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(device.lastActive).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                {device.isCurrent && (
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    Thiết bị hiện tại
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <Bell className="w-6 h-6 text-blue-600" />
          Thông báo
        </h2>

        {/* Email Notifications */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo qua Email</h3>
          <div className="space-y-4">
            {Object.entries(settings.emailNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {key === 'promotions' && 'Ưu đãi và khuyến mãi'}
                    {key === 'bookingConfirmations' && 'Xác nhận đặt phòng'}
                    {key === 'postTripReviews' && 'Đánh giá sau chuyến đi'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {key === 'promotions' && 'Nhận thông tin về các ưu đãi đặc biệt'}
                    {key === 'bookingConfirmations' && 'Nhận email xác nhận khi đặt phòng thành công'}
                    {key === 'postTripReviews' && 'Nhắc nhở đánh giá sau khi hoàn thành chuyến đi'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings({
                      ...settings,
                      emailNotifications: {
                        ...settings.emailNotifications,
                        [key]: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* SMS Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông báo qua SMS</h3>
          <div className="space-y-4">
            {Object.entries(settings.smsNotifications).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">
                    {key === 'promotions' && 'Ưu đãi và khuyến mãi'}
                    {key === 'bookingConfirmations' && 'Xác nhận đặt phòng'}
                    {key === 'postTripReviews' && 'Đánh giá sau chuyến đi'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {key === 'promotions' && 'Nhận SMS về các ưu đãi đặc biệt'}
                    {key === 'bookingConfirmations' && 'Nhận SMS xác nhận khi đặt phòng thành công'}
                    {key === 'postTripReviews' && 'Nhắc nhở đánh giá qua SMS'}
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={(e) => setSettings({
                      ...settings,
                      smsNotifications: {
                        ...settings.smsNotifications,
                        [key]: e.target.checked
                      }
                    })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

