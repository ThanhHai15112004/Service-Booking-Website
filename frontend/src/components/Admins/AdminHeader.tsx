import { Bell, Search, User, LogOut, Moon, Sun, Command } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../contexts/AdminAuthContext";
import { useTheme } from "../../contexts/ThemeContext";
import adminApi from "../../api/adminAxiosClient";

interface AdminHeaderProps {
  onLogout: () => void;
  adminName?: string;
}

const AdminHeader = ({ onLogout, adminName = "Admin" }: AdminHeaderProps) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<any[]>([]);
  const { user: authUser } = useAdminAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fetch admin profile from database to get avatar
  useEffect(() => {
    const fetchAdminProfile = async () => {
      if (!authUser) return;
      
      try {
        setIsLoadingAvatar(true);
        const response = await adminApi.get('/api/profile');
        if (response.data.success && response.data.data) {
          const dbAvatarUrl = response.data.data.avatar_url;
          
          // Normalize avatar URL: if it's a relative path, add base URL
          if (dbAvatarUrl && dbAvatarUrl.trim() !== '') {
            let normalizedUrl = dbAvatarUrl.trim();
            
            // If it's a relative path (starts with /), add base URL
            if (normalizedUrl.startsWith('/')) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
              normalizedUrl = `${baseUrl}${normalizedUrl}`;
            }
            // If it's already a full URL (http:// or https://), use as is
            
            setAvatarUrl(normalizedUrl);
          } else {
            setAvatarUrl(null);
          }
        }
      } catch (error) {
        console.error('Error fetching admin profile:', error);
        // Fallback to avatar from context if API fails
        if (authUser?.avatar_url && authUser.avatar_url.trim() !== '') {
          let normalizedUrl = authUser.avatar_url.trim();
          if (normalizedUrl.startsWith('/')) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            normalizedUrl = `${baseUrl}${normalizedUrl}`;
          }
          setAvatarUrl(normalizedUrl);
        } else {
          setAvatarUrl(null);
        }
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    fetchAdminProfile();
  }, [authUser]);

  // Use adminName from props or fallback to authUser full_name
  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      if (e.key === 'Escape') {
        setShowSearch(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load notifications (mock data for now)
  useEffect(() => {
    // TODO: Replace with actual API call
    setNotifications([
      { id: 1, type: 'booking', message: 'Có đặt phòng mới từ Nguyễn Văn A', time: '5 phút trước', read: false },
      { id: 2, type: 'payment', message: 'Thanh toán thành công cho booking #1234', time: '10 phút trước', read: false },
      { id: 3, type: 'review', message: 'Đánh giá mới từ khách hàng', time: '1 giờ trước', read: true },
    ]);
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;
    
    // Simple search routing
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('user') || lowerQuery.includes('tài khoản')) {
      navigate('/admin/accounts');
    } else if (lowerQuery.includes('hotel') || lowerQuery.includes('khách sạn')) {
      navigate('/admin/hotels');
    } else if (lowerQuery.includes('booking') || lowerQuery.includes('đặt phòng')) {
      navigate('/admin/bookings');
    } else if (lowerQuery.includes('payment') || lowerQuery.includes('thanh toán')) {
      navigate('/admin/payments');
    } else if (lowerQuery.includes('report') || lowerQuery.includes('báo cáo')) {
      navigate('/admin/reports');
    } else {
      // Default search in accounts
      navigate(`/admin/accounts?search=${encodeURIComponent(query)}`);
    }
    setShowSearch(false);
    setSearchQuery("");
  };

  const displayName = adminName !== "Admin" ? adminName : (authUser?.full_name || "Admin");
  const initials = displayName.charAt(0).toUpperCase();
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="h-16 bg-white border-b border-gray-200 fixed top-0 right-0 left-64 z-10 transition-all duration-300">
      <div className="h-full flex items-center justify-between px-8">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl relative" ref={searchRef}>
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search or type command..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearch(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(searchQuery);
                }
              }}
              className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border-0 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            />
            <kbd className="absolute right-4 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-200 text-xs text-gray-600 font-mono hidden md:flex items-center gap-1">
              <Command className="w-3 h-3" />
              K
            </kbd>
          </div>

          {/* Search Dropdown */}
          {showSearch && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
              {searchQuery.trim() ? (
                <div className="p-4">
                  <div className="space-y-1">
                    <button
                      onClick={() => handleSearch(searchQuery)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="font-medium text-gray-900">Tìm kiếm "{searchQuery}"</div>
                        <div className="text-xs text-gray-500">Nhấn Enter để tìm kiếm</div>
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="text-sm text-gray-500 mb-2">Quick links:</div>
                  <div className="space-y-1">
                    <button
                      onClick={() => { navigate('/admin/accounts'); setShowSearch(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                    >
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Quản lý tài khoản</span>
                    </button>
                    <button
                      onClick={() => { navigate('/admin/hotels'); setShowSearch(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Quản lý khách sạn</span>
                    </button>
                    <button
                      onClick={() => { navigate('/admin/bookings'); setShowSearch(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Quản lý đặt phòng</span>
                    </button>
                    <button
                      onClick={() => { navigate('/admin/reports'); setShowSearch(false); }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 rounded flex items-center gap-3"
                    >
                      <Search className="w-4 h-4 text-gray-400" />
                      <span className="text-sm">Báo cáo</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
            >
              <Bell size={20} className="text-gray-600" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Thông báo</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {unreadCount} mới
                    </span>
                  )}
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => {
                          // Handle notification click
                          setShowNotifications(false);
                        }}
                        className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                          !notif.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${!notif.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                          <div className="flex-1">
                            <p className="text-sm text-gray-900">{notif.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-8 text-center text-gray-500">
                      <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>Không có thông báo nào</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-gray-100 transition-colors duration-200 rounded-lg"
            title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}
          >
            {theme === 'light' ? (
              <Moon size={20} className="text-gray-600" />
            ) : (
              <Sun size={20} className="text-yellow-500" />
            )}
          </button>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 p-2 hover:bg-gray-100 transition-colors duration-200"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-black text-white font-medium text-sm">
                {isLoadingAvatar ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                ) : avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Admin Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      // If image fails to load, hide it and show initial
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      setAvatarUrl(null);
                    }}
                  />
                ) : (
                  <span className="w-full h-full flex items-center justify-center">
                    {initials}
                  </span>
                )}
              </div>
              <span className="text-sm font-medium text-gray-700">
                {displayName}
              </span>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 shadow-lg animate-fadeIn">
                <div className="py-2">
                  <Link
                    to="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-200"
                  >
                    <LogOut size={16} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
