import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { googleLogin, logout as logoutAPI, checkRefreshToken as checkRefreshTokenAPI } from '../services/authService';

interface User {
  account_id: string;
  full_name: string;
  username?: string;
  email: string;
  phone_number?: string;
  role: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_verified: boolean;
  avatar_url?: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  updateAccessToken: (newAccessToken: string) => void;
  googleLoginHandler: (id_token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    // Gọi API logout để revoke refresh token
    const refreshToken = localStorage.getItem('userRefreshToken');
    if (refreshToken) {
      try {
        await logoutAPI(refreshToken);
      } catch (error) {
        console.error('Error during user logout:', error);
      }
    }

    // Clear localStorage
    localStorage.removeItem('userAccessToken');
    localStorage.removeItem('userRefreshToken');
    localStorage.removeItem('userInfo');

    // Clear state ngay lập tức
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }, []);

  // Function để update access token khi refresh
  const updateAccessToken = useCallback((newAccessToken: string) => {
    localStorage.setItem('userAccessToken', newAccessToken);
    setAccessToken(newAccessToken);
  }, []);

  // Kiểm tra trạng thái đăng nhập user khi component mount
  useEffect(() => {
    const checkAuth = async () => {
      // ✅ Backward compatibility: Check cả keys cũ và keys mới
      let storedAccessToken = localStorage.getItem('userAccessToken') || localStorage.getItem('accessToken');
      let storedRefreshToken = localStorage.getItem('userRefreshToken') || localStorage.getItem('refreshToken');
      let storedUser = localStorage.getItem('userInfo') || localStorage.getItem('user');

      const keysFound = {
        userAccessToken: !!localStorage.getItem('userAccessToken'),
        accessToken: !!localStorage.getItem('accessToken'),
        userRefreshToken: !!localStorage.getItem('userRefreshToken'),
        refreshToken: !!localStorage.getItem('refreshToken'),
        userInfo: !!localStorage.getItem('userInfo'),
        user: !!localStorage.getItem('user')
      };
      
      const allKeys = Object.keys(localStorage);
      
      console.log('AuthContext.checkAuth - Checking stored tokens:', {
        hasAccessToken: !!storedAccessToken,
        hasRefreshToken: !!storedRefreshToken,
        hasUser: !!storedUser,
        currentIsLoggedIn: isLoggedIn,
        keysFound,
        allKeys,
        // Log chi tiết từng key
        refreshTokenValue: localStorage.getItem('refreshToken')?.substring(0, 30) + '...',
        userValue: localStorage.getItem('user')?.substring(0, 50) + '...',
        userRefreshTokenValue: localStorage.getItem('userRefreshToken')?.substring(0, 30) + '...',
        userInfoValue: localStorage.getItem('userInfo')?.substring(0, 50) + '...'
      }); // Debug log

      // ✅ Nếu tìm thấy keys cũ, migrate sang keys mới
      const hasOldRefreshToken = !!localStorage.getItem('refreshToken');
      const hasOldUser = !!localStorage.getItem('user');
      const hasNewRefreshToken = !!localStorage.getItem('userRefreshToken');
      const hasNewUser = !!localStorage.getItem('userInfo');
      
      console.log('AuthContext.checkAuth - Migration check:', {
        hasOldRefreshToken,
        hasOldUser,
        hasNewRefreshToken,
        hasNewUser,
        shouldMigrate: hasOldRefreshToken && !hasNewRefreshToken
      });
      
      if (hasOldRefreshToken && !hasNewRefreshToken) {
        const oldRefreshToken = localStorage.getItem('refreshToken');
        const oldUser = localStorage.getItem('user');
        if (oldRefreshToken) {
          localStorage.setItem('userRefreshToken', oldRefreshToken);
          storedRefreshToken = oldRefreshToken;
          console.log('AuthContext.checkAuth - ✅ Migrated refreshToken to userRefreshToken');
        }
        if (oldUser) {
          localStorage.setItem('userInfo', oldUser);
          storedUser = oldUser;
          console.log('AuthContext.checkAuth - ✅ Migrated user to userInfo');
        }
        // Lưu accessToken nếu có (có thể từ axios interceptor)
        const oldAccessToken = localStorage.getItem('accessToken');
        if (oldAccessToken && !localStorage.getItem('userAccessToken')) {
          localStorage.setItem('userAccessToken', oldAccessToken);
          storedAccessToken = oldAccessToken;
          console.log('AuthContext.checkAuth - ✅ Migrated accessToken to userAccessToken');
        }
        // Xóa keys cũ sau khi migrate
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        console.log('AuthContext.checkAuth - ✅ Removed old keys');
        
        // Re-read sau khi migrate
        storedAccessToken = localStorage.getItem('userAccessToken') || localStorage.getItem('accessToken');
        storedRefreshToken = localStorage.getItem('userRefreshToken') || localStorage.getItem('refreshToken');
        storedUser = localStorage.getItem('userInfo') || localStorage.getItem('user');
      }

      // ✅ Nếu có refreshToken và user, nhưng không có accessToken, vẫn có thể restore session
      if (storedRefreshToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          // Chỉ set nếu là USER (không phải ADMIN/STAFF)
          if (parsedUser.role === 'USER') {
            // ✅ Nếu đã có state và user match, không cần check lại
            if (isLoggedIn && user && user.account_id === parsedUser.account_id) {
              console.log('AuthContext.checkAuth - Already logged in, skipping check'); // Debug log
              setIsLoading(false);
              return;
            }
            
            // Kiểm tra refresh token có còn tồn tại trong DB không
            try {
              const tokenCheck = await checkRefreshTokenAPI(storedRefreshToken);
              if (!tokenCheck.success || !tokenCheck.valid) {
                // Refresh token không hợp lệ → logout
                console.log('AuthContext.checkAuth - Refresh token không hợp lệ, tự động logout'); // Debug log
                await logout(); // Use the logout function
                setIsLoading(false);
                return;
              }

              console.log('AuthContext.checkAuth - Token valid, setting auth state'); // Debug log
              
              // ✅ Nếu không có accessToken, sẽ được refresh tự động bởi axios interceptor khi cần
              // Nhưng để đảm bảo UI hiển thị đúng, set user và isLoggedIn ngay
              if (storedAccessToken) {
                setAccessToken(storedAccessToken);
              }
              setUser(parsedUser);
              setIsLoggedIn(true);
            } catch (error) {
              // Nếu API call fail (network error, etc.), không logout ngay
              // Chỉ logout nếu chắc chắn token không hợp lệ
              console.error('AuthContext.checkAuth - Error checking refresh token:', error);
              // Vẫn set auth state từ localStorage để không mất login
              // AccessToken sẽ được refresh tự động khi cần
              if (storedAccessToken) {
                setAccessToken(storedAccessToken);
              }
              setUser(parsedUser);
              setIsLoggedIn(true);
            }
          } else {
            // Nếu là admin, clear user tokens
            console.log('AuthContext.checkAuth - Not USER role, clearing tokens'); // Debug log
            localStorage.removeItem('userAccessToken');
            localStorage.removeItem('userRefreshToken');
            localStorage.removeItem('userInfo');
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setIsLoggedIn(false);
          }
        } catch (error) {
          console.error('AuthContext.checkAuth - Error parsing stored user:', error);
          localStorage.removeItem('userAccessToken');
          localStorage.removeItem('userRefreshToken');
          localStorage.removeItem('userInfo');
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          setIsLoggedIn(false);
        }
      } else {
        console.log('AuthContext.checkAuth - No stored tokens found'); // Debug log
        setIsLoggedIn(false);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Check refresh token định kỳ mỗi 5 phút
    const interval = setInterval(async () => {
      const storedRefreshToken = localStorage.getItem('userRefreshToken');
      if (storedRefreshToken && isLoggedIn) {
        try {
          const tokenCheck = await checkRefreshTokenAPI(storedRefreshToken);
          if (!tokenCheck.success || !tokenCheck.valid) {
            // Refresh token không hợp lệ → logout
            console.log('Refresh token không hợp lệ, tự động logout');
            await logout();
          }
        } catch (error) {
          // Nếu API call fail, không logout ngay (có thể là network error)
          console.error('Error checking refresh token:', error);
          // Chỉ log error, không logout để tránh mất login khi network có vấn đề
        }
      }
    }, 5 * 60 * 1000); // 5 phút

    return () => clearInterval(interval);
  }, [isLoggedIn, logout, updateAccessToken]);

  const login = (newUser: User, newAccessToken: string, refreshToken: string) => {
    // Chỉ cho phép USER role
    if (newUser.role !== 'USER') {
      throw new Error('Chỉ USER role mới được đăng nhập tại đây');
    }

    console.log('AuthContext.login called with:', { 
      user: newUser.email, 
      role: newUser.role,
      accessTokenLength: newAccessToken?.length,
      refreshTokenLength: refreshToken?.length
    }); // Debug log

    // Update localStorage với keys riêng cho user
    localStorage.setItem('userAccessToken', newAccessToken);
    localStorage.setItem('userRefreshToken', refreshToken);
    localStorage.setItem('userInfo', JSON.stringify(newUser));

    console.log('AuthContext.login - localStorage set:', {
      userAccessToken: localStorage.getItem('userAccessToken')?.substring(0, 20) + '...',
      userRefreshToken: localStorage.getItem('userRefreshToken')?.substring(0, 20) + '...',
      userInfo: localStorage.getItem('userInfo')
    }); // Debug log

    // Update state ngay lập tức
    setAccessToken(newAccessToken);
    setUser(newUser);
    setIsLoggedIn(true);
    
    console.log('AuthContext.login - State updated:', { 
      isLoggedIn: true, 
      user: newUser.email 
    }); // Debug log
  };

  // Listen for custom events from axios interceptors
  useEffect(() => {
    const handleLogoutRequired = () => {
      console.log('User logout required event received');
      logout();
    };

    const handleTokenRefreshed = (event: CustomEvent<{ accessToken: string }>) => {
      console.log('User token refreshed event received');
      updateAccessToken(event.detail.accessToken);
    };

    window.addEventListener('userLogoutRequired', handleLogoutRequired as EventListener);
    window.addEventListener('userTokenRefreshed', handleTokenRefreshed as EventListener);

    return () => {
      window.removeEventListener('userLogoutRequired', handleLogoutRequired as EventListener);
      window.removeEventListener('userTokenRefreshed', handleTokenRefreshed as EventListener);
    };
  }, [logout, updateAccessToken]);

  const googleLoginHandler = async (id_token: string) => {
    const data = await googleLogin(id_token);
    if (data.success && data.data?.user && data.data?.tokens?.access_token) {
      login(data.data.user, data.data.tokens.access_token, data.data.tokens.refresh_token);
    } else {
      throw new Error(data.message || 'Đăng nhập Google thất bại');
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, accessToken, isLoading, login, updateAccessToken, googleLoginHandler, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
