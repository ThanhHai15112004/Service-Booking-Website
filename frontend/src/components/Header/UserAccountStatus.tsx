import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Star, LogOut, User, Heart, Wallet, List } from 'lucide-react';
import { logout as logoutAPI } from '../../services/authService';
import { getProfile } from '../../services/profileService';
import Loading from '../Loading';
import { useAuth } from '../../contexts/AuthContext';
import defaultAvatar from '../../assets/imgs/avatars/user.png';

// Fake user data for demo (colors/tier)
const userDisplayDefaults = {
  tier: 'Đồng',
  tierLabel: 'VIP',
  balance: 0,
  avatarColor: '#e65100',
};

export default function UserAccountStatus() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const { logout: logoutContext, user: authUser, login, accessToken } = useAuth();
  const [avatarUrl, setAvatarUrl] = useState<string>(defaultAvatar);
  const [isLoadingAvatar, setIsLoadingAvatar] = useState(false);

  // Fetch user profile from database to ensure avatar is up-to-date
  useEffect(() => {
    const fetchUserProfile = async () => {
      // ✅ Chỉ fetch khi có user và accessToken
      if (!authUser || !accessToken) return;
      
      try {
        setIsLoadingAvatar(true);
        const response = await getProfile();
        if (response.success && response.data) {
          // Update avatar URL from database
          const dbAvatarUrl = response.data.avatar_url;
          
          // Normalize avatar URL: if it's a relative path, add base URL
          if (dbAvatarUrl && dbAvatarUrl.trim() !== '') {
            let normalizedUrl = dbAvatarUrl.trim();
            
            // If it's a relative path (starts with /), add base URL
            if (normalizedUrl.startsWith('/')) {
              const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
              normalizedUrl = `${baseUrl}${normalizedUrl}`;
            }
            // If it's already a full URL (http:// or https://), use as is
            // If it's a Google avatar URL or external URL, use as is
            
            setAvatarUrl(normalizedUrl);
            
            // Also update context if avatar changed
            if (authUser.avatar_url !== dbAvatarUrl && accessToken) {
              const updatedUser = { ...authUser, avatar_url: dbAvatarUrl };
              const storedRefreshToken = localStorage.getItem('userRefreshToken');
              if (storedRefreshToken) {
                login(updatedUser, accessToken, storedRefreshToken);
              }
            }
          } else {
            // No avatar in database, use default
            setAvatarUrl(defaultAvatar);
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
        // Fallback to avatar from context if API fails
        if (authUser.avatar_url && authUser.avatar_url.trim() !== '') {
          let normalizedUrl = authUser.avatar_url.trim();
          if (normalizedUrl.startsWith('/')) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
            normalizedUrl = `${baseUrl}${normalizedUrl}`;
          }
          setAvatarUrl(normalizedUrl);
        } else {
          setAvatarUrl(defaultAvatar);
        }
      } finally {
        setIsLoadingAvatar(false);
      }
    };

    fetchUserProfile();
  }, [authUser, login, accessToken]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const refreshToken = localStorage.getItem('userRefreshToken') || '';

      // Gọi API logout
      await logoutAPI(refreshToken);

      // Xóa context và localStorage
      logoutContext();
      setLogoutLoading(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      logoutContext();
      setLogoutLoading(false);
      navigate('/');
    }
  };

  if (!authUser) return null;

  const initials = authUser.full_name?.charAt(0)?.toUpperCase() || 'U';

  return (
    <div className="relative" ref={ref}>
      {logoutLoading && <Loading message="Đang đăng xuất..." />}

      <button
        className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 transition min-w-[180px]"
        onClick={() => setOpen((v) => !v)}
      >
        <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
          {isLoadingAvatar ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : avatarUrl === defaultAvatar || !avatarUrl ? (
            <span
              className="text-white font-bold text-lg w-full h-full flex items-center justify-center"
              style={{ background: userDisplayDefaults.avatarColor }}
            >
              {initials}
            </span>
          ) : (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // If image fails to load, fallback to default avatar
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                setAvatarUrl(defaultAvatar);
              }}
            />
          )}
        </div>

        <div className="flex flex-col items-start min-w-0">
          <span className="font-medium text-sm truncate max-w-[90px]">{authUser.full_name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="flex items-center bg-black text-white text-xs px-1.5 py-0.5 rounded font-semibold">
              <Star className="w-3 h-3 mr-1" fill="white" /> VIP
            </span>
            <span className="bg-[#d08c60] text-white text-xs px-2 py-0.5 rounded font-semibold ml-1">
              {userDisplayDefaults.tier}
            </span>
          </div>
        </div>

        <span className="ml-2 text-[#6c47ff] font-bold text-sm whitespace-nowrap">
          {userDisplayDefaults.balance} đ
        </span>
        <ChevronDown className="ml-1 w-4 h-4 text-gray-500" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 animate-fade-in">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">
            TÀI KHOẢN CỦA TÔI
          </div>
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <button 
                onClick={() => {
                  setOpen(false);
                  navigate('/bookings');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <List className="w-4 h-4" /> Đơn đặt chỗ
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setOpen(false);
                  navigate('/profile');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <User className="w-4 h-4" /> Hồ sơ của tôi
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setOpen(false);
                  navigate('/favorites');
                }}
                className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"
              >
                <Heart className="w-4 h-4" /> Danh sách yêu thích
              </button>
            </li>
            <li>
              <div className="w-full flex items-center gap-2 px-4 py-2">
                <span className="flex items-center bg-black text-white text-xs px-2 py-0.5 rounded font-semibold">
                  <Star className="w-3 h-3 mr-1" fill="white" /> VIP
                </span>
                <span className="flex items-center gap-1 bg-[#d08c60] text-white text-xs px-2 py-0.5 rounded font-semibold">
                  <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="8" fill="#b87333" stroke="#a05a2c" strokeWidth="2" />
                    <text x="10" y="15" textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">Đ</text>
                  </svg>
                  Đồng
                </span>
              </div>
            </li>
            <li>
              <button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100">
                <Wallet className="w-4 h-4 text-[#6c47ff]" /> 
                Số dư tài khoản 
                <span className="ml-auto bg-[#f3f0ff] text-[#6c47ff] px-2 py-0.5 rounded text-xs font-bold">
                  {userDisplayDefaults.balance} đ
                </span>
              </button>
            </li>
          </ul>

          <button
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 border-t hover:bg-gray-100 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleLogout}
            disabled={logoutLoading}
          >
            <LogOut className="w-4 h-4" /> ĐĂNG XUẤT
          </button>
        </div>
      )}
    </div>
  );
}
