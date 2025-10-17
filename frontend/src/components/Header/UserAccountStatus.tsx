import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, Star, LogOut, User, Heart, Wallet, List } from 'lucide-react';
import { logout as logoutAPI } from '../../services/authService';
import Loading from '../Loading';
import { useAuth } from '../../contexts/AuthContext';

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
  const { logout: logoutContext, user: authUser } = useAuth();

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
      const refreshToken = localStorage.getItem('refreshToken') || '';
      
      // Gọi API logout trước
      const response = await logoutAPI(refreshToken);
      
      // Chỉ xóa localStorage & context AFTER API response thành công
      if (response.success) {
        logoutContext();
        setLogoutLoading(false);
        navigate('/');
      } else {
        // Nếu API trả về error nhưng status 200, vẫn xóa và redirect
        logoutContext();
        setLogoutLoading(false);
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Xóa context anyway nếu có lỗi
      logoutContext();
      setLogoutLoading(false);
      navigate('/');
    }
  };

  if (!authUser) return null;

  // Lấy initials từ full_name
  const initials = authUser.full_name.charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      {logoutLoading && <Loading message="Đang đăng xuất..." />}
      <button
        className="flex items-center gap-3 px-3 py-2 rounded-full hover:bg-gray-100 transition min-w-[180px]"
        onClick={() => setOpen((v) => !v)}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: userDisplayDefaults.avatarColor }}>
          {initials}
        </div>
        {/* Info */}
        <div className="flex flex-col items-start min-w-0">
          <span className="font-medium text-sm truncate max-w-[90px]">{authUser.full_name}</span>
          <div className="flex items-center gap-1 mt-0.5">
            <span className="flex items-center bg-black text-white text-xs px-1.5 py-0.5 rounded font-semibold">
              <Star className="w-3 h-3 mr-1" fill="white" /> VIP
            </span>
            <span className="bg-[#d08c60] text-white text-xs px-2 py-0.5 rounded font-semibold ml-1">Đồng</span>
          </div>
        </div>
        {/* Balance */}
        <span className="ml-2 text-[#6c47ff] font-bold text-sm whitespace-nowrap">{userDisplayDefaults.balance} đ</span>
        <ChevronDown className="ml-1 w-4 h-4 text-gray-500" />
      </button>
      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border z-50 animate-fade-in">
          <div className="px-4 py-3 border-b font-semibold text-gray-700">TÀI KHOẢN CỦA TÔI</div>
          <ul className="py-2 text-sm text-gray-700">
            <li><button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><List className="w-4 h-4" /> Đơn đặt chỗ</button></li>
            <li><button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><User className="w-4 h-4" /> Hồ sơ của tôi</button></li>
            <li><button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><Heart className="w-4 h-4" /> Danh sách yêu thích</button></li>
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
            <li><button className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-100"><Wallet className="w-4 h-4 text-[#6c47ff]" /> Số dư tài khoản <span className="ml-auto bg-[#f3f0ff] text-[#6c47ff] px-2 py-0.5 rounded text-xs font-bold">{userDisplayDefaults.balance} đ</span></button></li>
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
