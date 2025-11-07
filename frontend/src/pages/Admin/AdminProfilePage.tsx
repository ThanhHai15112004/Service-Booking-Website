import { useState, useEffect, useRef } from 'react';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import adminApi from '../../api/adminAxiosClient';
import AdminLayout from '../../components/Admins/AdminLayout';
import { User, Lock, Upload, Eye, EyeOff, Save, X } from 'lucide-react';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';

interface AdminProfileData {
  account_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'ADMIN' | 'STAFF';
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
}

interface ToastProps {
  type: 'success' | 'error';
  message: string;
}

function AdminProfilePage() {
  const { user: authUser, login } = useAdminAuth();
  const [profileData, setProfileData] = useState<AdminProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'security'>('personal');
  const [toast, setToast] = useState<ToastProps | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    email: '',
    avatar_url: ''
  });
  
  // Password form states
  const [passwordForm, setPasswordForm] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const showToast = (toastObj: ToastProps) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 3000);
  };

  // Load profile data
  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await adminApi.get('/api/profile');
        if (response.data.success && response.data.data) {
          const data = response.data.data;
          setProfileData(data);
          setFormData({
            full_name: data.full_name || '',
            phone_number: data.phone_number || '',
            email: data.email || '',
            avatar_url: data.avatar_url || ''
          });
        } else {
          showToast({ type: 'error', message: response.data.message || 'Không thể tải thông tin profile' });
        }
      } catch (error: any) {
        showToast({ type: 'error', message: 'Lỗi khi tải thông tin profile' });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Scroll to top when tab changes
  useEffect(() => {
    if (mainContentRef.current) {
      mainContentRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeTab]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast({ type: 'error', message: 'Chỉ chấp nhận file ảnh' });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast({ type: 'error', message: 'Kích thước ảnh không được vượt quá 5MB' });
      return;
    }

    try {
      setSaving(true);
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await adminApi.post('/api/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success && response.data.data?.imageUrl) {
        const imageUrl = response.data.data.imageUrl.startsWith('http')
          ? response.data.data.imageUrl
          : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${response.data.data.imageUrl}`;
        
        setFormData(prev => ({ ...prev, avatar_url: imageUrl }));
        showToast({ type: 'success', message: 'Tải ảnh lên thành công' });
      } else {
        showToast({ type: 'error', message: response.data.message || 'Tải ảnh lên thất bại' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Lỗi khi tải ảnh lên' });
    } finally {
      setSaving(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.full_name.trim()) {
      showToast({ type: 'error', message: 'Vui lòng nhập họ tên' });
      return;
    }

    try {
      setSaving(true);
      const response = await adminApi.put('/api/profile', {
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim() || null,
        avatar_url: formData.avatar_url || null
      });

      if (response.data.success) {
        const updatedData = response.data.data;
        setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
        
        // Update context if needed
        if (authUser && updatedData) {
          login({
            ...authUser,
            full_name: updatedData.full_name,
            phone_number: updatedData.phone_number,
            avatar_url: updatedData.avatar_url
          }, localStorage.getItem('adminAccessToken') || '', localStorage.getItem('adminRefreshToken') || '');
        }
        
        showToast({ type: 'success', message: 'Cập nhật thông tin thành công' });
      } else {
        showToast({ type: 'error', message: response.data.message || 'Cập nhật thông tin thất bại' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Lỗi khi cập nhật thông tin' });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.old_password || !passwordForm.new_password || !passwordForm.confirm_password) {
      showToast({ type: 'error', message: 'Vui lòng điền đầy đủ thông tin' });
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showToast({ type: 'error', message: 'Mật khẩu mới và xác nhận không khớp' });
      return;
    }

    if (passwordForm.new_password.length < 6) {
      showToast({ type: 'error', message: 'Mật khẩu mới phải có ít nhất 6 ký tự' });
      return;
    }

    try {
      setSaving(true);
      const response = await adminApi.put('/api/profile/password', {
        old_password: passwordForm.old_password,
        new_password: passwordForm.new_password
      });

      if (response.data.success) {
        showToast({ type: 'success', message: 'Đổi mật khẩu thành công' });
        setPasswordForm({
          old_password: '',
          new_password: '',
          confirm_password: ''
        });
      } else {
        showToast({ type: 'error', message: response.data.message || 'Đổi mật khẩu thất bại' });
      }
    } catch (error: any) {
      showToast({ type: 'error', message: error.response?.data?.message || 'Lỗi khi đổi mật khẩu' });
    } finally {
      setSaving(false);
    }
  };

  const getAvatarUrl = () => {
    if (formData.avatar_url) {
      return formData.avatar_url.startsWith('http')
        ? formData.avatar_url
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}${formData.avatar_url}`;
    }
    return null;
  };

  const getInitials = () => {
    return formData.full_name?.charAt(0)?.toUpperCase() || 'A';
  };

  if (loading) {
    return (
      <AdminLayout>
        <Loading message="Đang tải thông tin profile..." />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div ref={mainContentRef} className="max-w-6xl mx-auto">
        {toast && <Toast type={toast.type} message={toast.message} />}

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thông tin cá nhân</h1>
          <p className="text-gray-600">Quản lý thông tin tài khoản và cài đặt bảo mật</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('personal')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'personal'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Thông tin cá nhân
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'security'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Lock className="w-4 h-4 inline mr-2" />
                Bảo mật
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'personal' && (
              <div className="space-y-6">
                {/* Avatar Upload */}
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                      {getAvatarUrl() ? (
                        <img
                          src={getAvatarUrl()!}
                          alt="Avatar"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <span className="text-3xl font-bold text-gray-400">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={saving}
                      className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Ảnh đại diện</h3>
                    <p className="text-sm text-gray-600">JPG, PNG hoặc GIF. Tối đa 5MB.</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Họ và tên <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập họ và tên"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email không thể thay đổi</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Số điện thoại
                    </label>
                    <input
                      type="tel"
                      value={formData.phone_number}
                      onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Nhập số điện thoại"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vai trò
                    </label>
                    <input
                      type="text"
                      value={profileData?.role === 'ADMIN' ? 'Quản trị viên' : 'Nhân viên'}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <p className="text-sm text-blue-700">
                    <strong>Lưu ý:</strong> Sau khi đổi mật khẩu, bạn sẽ cần đăng nhập lại với mật khẩu mới.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu hiện tại <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showOldPassword ? 'text' : 'password'}
                        value={passwordForm.old_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, old_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="Nhập mật khẩu hiện tại"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setShowOldPassword(!showOldPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_password}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                        placeholder="Nhập lại mật khẩu mới"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setPasswordForm({ old_password: '', new_password: '', confirm_password: '' })}
                    disabled={saving}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Hủy
                  </button>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    <Lock className="w-4 h-4" />
                    {saving ? 'Đang đổi...' : 'Đổi mật khẩu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminProfilePage;

