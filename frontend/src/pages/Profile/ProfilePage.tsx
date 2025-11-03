import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../services/profileService';
import { User, Save, Lock, Eye, EyeOff, Camera, Bell, Briefcase, Link2 } from 'lucide-react';
import MainLayout from '../../layouts/MainLayout';

interface ProfileData {
  account_id: string;
  username?: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  provider?: string;
  statistics?: {
    total_bookings: number;
    created_count: number;
    paid_count: number;
    confirmed_count: number;
    completed_count: number;
    cancelled_count: number;
    total_spent: number;
    last_booking_date: string | null;
  };
}

interface ToastProps {
  type: 'success' | 'error';
  message: string;
}

function ProfilePage() {
  const { user: authUser, login } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'password' | 'notifications' | 'businesses' | 'integration'>('personal');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [toast, setToast] = useState<ToastProps | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    phone_number: '',
    avatar_url: '',
    country: '',
    city: '',
    zip_code: ''
  });
  
  // Split full_name into first and last
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const showToast = (toastObj: ToastProps) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 3000);
  };

  // Load profile data
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getProfile();
        if (response.success) {
          setProfileData(response.data);
          const fullName = response.data.full_name || '';
          const nameParts = fullName.split(' ');
          const first = nameParts[0] || '';
          const last = nameParts.slice(1).join(' ') || '';
          
          setFirstName(first);
          setLastName(last);
          setProfileForm({
            full_name: fullName,
            phone_number: response.data.phone_number || '',
            avatar_url: response.data.avatar_url || '',
            country: '',
            city: '',
            zip_code: ''
          });
        } else {
          showToast({ type: 'error', message: response.message });
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Lỗi khi tải thông tin profile' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // Handle profile update
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Combine first and last name
      const fullName = `${firstName} ${lastName}`.trim();
      const updateData = {
        ...profileForm,
        full_name: fullName
      };
      
      const response = await updateProfile(updateData);
      if (response.success) {
        showToast({ type: 'success', message: 'Cập nhật profile thành công!' });
        
        // Reload profile data
        const refreshResponse = await getProfile();
        if (refreshResponse.success) {
          setProfileData(refreshResponse.data);
        }
        
        // Update auth context với thông tin mới
        if (authUser) {
          const updatedUser = { ...authUser, ...updateData };
          login(updatedUser, localStorage.getItem('accessToken') || '', localStorage.getItem('refreshToken') || '');
        }
      } else {
        showToast({ type: 'error', message: response.message });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Lỗi khi cập nhật profile' });
    } finally {
      setSaving(false);
    }
  };

  // Handle avatar upload
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // For now, we'll use a URL (in production, you'd upload to a server)
    const imageUrl = URL.createObjectURL(file);
    setProfileForm({ ...profileForm, avatar_url: imageUrl });
    
    // TODO: Upload to server and get actual URL
  };

  // Handle password change
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast({ type: 'error', message: 'Mật khẩu mới không khớp!' });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự!' });
      return;
    }

    setSaving(true);

    try {
      const response = await changePassword({
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });
      
      if (response.success) {
        showToast({ type: 'success', message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập lại.' });
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        
        // Logout user sau khi đổi mật khẩu
        setTimeout(() => {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }, 2000);
      } else {
        showToast({ type: 'error', message: response.message });
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Lỗi khi đổi mật khẩu' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý hồ sơ người dùng</h1>
            <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt tài khoản của bạn</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm sticky top-20">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Quản lý hồ sơ</h2>
                </div>
                <nav className="p-2">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      activeTab === 'personal'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <User className="w-5 h-5" />
                    Thông tin cá nhân
                  </button>
                  <button
                    onClick={() => setActiveTab('password')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      activeTab === 'password'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Lock className="w-5 h-5" />
                    Email & Mật khẩu
                  </button>
                  <button
                    onClick={() => setActiveTab('notifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      activeTab === 'notifications'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Bell className="w-5 h-5" />
                    Thông báo
                  </button>
                  <button
                    onClick={() => setActiveTab('businesses')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors mb-1 ${
                      activeTab === 'businesses'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Briefcase className="w-5 h-5" />
                    Doanh nghiệp
                  </button>
                  <button
                    onClick={() => setActiveTab('integration')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === 'integration'
                        ? 'bg-green-50 text-green-700 border border-green-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Link2 className="w-5 h-5" />
                    Tích hợp
                  </button>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Personal Info Tab */}
              {activeTab === 'personal' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Thông tin cá nhân</h2>
                    {saving && (
                      <div className="flex items-center gap-2 text-sm text-green-600">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                        Đang lưu thay đổi
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Profile Picture */}
                    <div className="flex items-center gap-6 mb-8">
                      <div className="relative group">
                        {profileForm.avatar_url || profileData?.avatar_url ? (
                          <img
                            src={profileForm.avatar_url || profileData?.avatar_url}
                            alt={profileData?.full_name || 'Avatar'}
                            className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-gray-200">
                            <User className="w-12 h-12 text-white" />
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={handleAvatarClick}
                          className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full border-4 border-white hover:bg-blue-700 transition-colors shadow-lg"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarChange}
                          className="hidden"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 mb-1">Ảnh đại diện</p>
                        <p className="text-xs text-gray-500">JPG, PNG hoặc GIF. Tối đa 5MB.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Họ *
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tên *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ email
                        </label>
                        <input
                          type="email"
                          value={profileData?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Số điện thoại
                        </label>
                        <div className="flex gap-2">
                          <select className="w-24 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="+84">+84</option>
                            <option value="+1">+1</option>
                            <option value="+880">+880</option>
                          </select>
                          <input
                            type="tel"
                            value={profileForm.phone_number}
                            onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
                            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="1681 788 203"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Quốc gia
                        </label>
                        <select
                          value={profileForm.country}
                          onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn quốc gia</option>
                          <option value="VN">Việt Nam</option>
                          <option value="US">United States</option>
                          <option value="BD">Bangladesh</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Thành phố
                        </label>
                        <select
                          value={profileForm.city}
                          onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Chọn thành phố</option>
                          <option value="HCM">Hồ Chí Minh</option>
                          <option value="HN">Hà Nội</option>
                          <option value="DN">Đà Nẵng</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mã bưu điện
                        </label>
                        <input
                          type="text"
                          value={profileForm.zip_code}
                          onChange={(e) => setProfileForm({ ...profileForm, zip_code: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="3100"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Save className="w-4 h-4" />
                        {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Password Tab */}
              {activeTab === 'password' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Email & Mật khẩu</h2>
                  <form onSubmit={handlePasswordSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Địa chỉ email
                        </label>
                        <input
                          type="email"
                          value={profileData?.email || ''}
                          disabled
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                        />
                        <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mật khẩu hiện tại *
                        </label>
                        <div className="relative">
                          <input
                            type={showOldPassword ? 'text' : 'password'}
                            value={passwordForm.old_password}
                            onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                        <input
                          type="password"
                          value={passwordForm.confirm_password}
                          onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-200">
                      <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                      >
                        <Lock className="w-4 h-4" />
                        {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Thông báo</h2>
                  <p className="text-gray-600">Tính năng đang được phát triển...</p>
                </div>
              )}

              {/* Businesses Tab */}
              {activeTab === 'businesses' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Doanh nghiệp</h2>
                  <p className="text-gray-600">Tính năng đang được phát triển...</p>
                </div>
              )}

              {/* Integration Tab */}
              {activeTab === 'integration' && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Tích hợp</h2>
                  <p className="text-gray-600">Tính năng đang được phát triển...</p>
                </div>
              )}

              {/* Delete Account Section */}
              {activeTab === 'personal' && (
                <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
                  <h2 className="text-xl font-bold text-red-600 mb-4">Xóa tài khoản</h2>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Sau khi yêu cầu xóa, bạn sẽ có <strong>6 tháng</strong> để duy trì tài khoản này.
                    </p>
                    <p className="text-sm text-gray-600">
                      Để xóa vĩnh viễn toàn bộ tài khoản của bạn, hãy nhấp vào nút bên dưới. Điều này có nghĩa là bạn sẽ không thể truy cập vào các đơn đặt chỗ và dữ liệu cá nhân của mình.
                    </p>
                    <button
                      type="button"
                      className="px-6 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      Xóa tài khoản
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}
    </MainLayout>
  );
}

export default ProfilePage;
