import { User, LayoutDashboard, CreditCard, MapPin, Star, Settings, LogOut, Crown, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface ProfileSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
    username?: string;
    is_verified?: boolean;
  } | null;
}

export default function ProfileSidebar({ activeTab, onTabChange, user }: ProfileSidebarProps) {
  const { logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'personal', label: 'Thông tin cá nhân', icon: User },
    { id: 'payment', label: 'Thanh toán & Hóa đơn', icon: CreditCard },
    { id: 'address', label: 'Địa chỉ & Liên hệ', icon: MapPin },
    { id: 'reviews', label: 'Bình luận & Đánh giá', icon: Star },
    { id: 'upgrade', label: 'Nâng cấp tài khoản', icon: Crown },
    { id: 'settings', label: 'Cài đặt tài khoản', icon: Settings },
  ];

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất không?')) {
      logout();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm sticky top-20 h-[calc(100vh-8rem)] flex flex-col">
      {/* Avatar & User Info */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            {user?.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name || 'Avatar'}
                className="w-20 h-20 rounded-full object-cover border-4 border-blue-100"
              />
            ) : (
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center border-4 border-blue-100">
                <User className="w-10 h-10 text-white" />
              </div>
            )}
            {user?.is_verified && (
              <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-1.5 border-2 border-white">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">
            {user?.full_name || 'Người dùng'}
          </h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <Mail className="w-3 h-3" />
            <span>{user?.email || 'email@example.com'}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 overflow-y-auto p-4">
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={(e) => {
                  e.preventDefault();
                  onTabChange(item.id);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-500'}`} />
                <span>{item.label}</span>
                {item.id === 'upgrade' && (
                  <span className="ml-auto px-2 py-0.5 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs rounded-full font-bold">
                    PRO
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
}

