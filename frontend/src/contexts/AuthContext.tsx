import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { googleLogin } from '../services/authService';

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

  // Kiểm tra trạng thái đăng nhập khi component mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedAccessToken && storedUser) {
      try {
        setAccessToken(storedAccessToken);
        setUser(JSON.parse(storedUser));
        setIsLoggedIn(true);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (newUser: User, newAccessToken: string, refreshToken: string) => {
    // Update localStorage
    localStorage.setItem('accessToken', newAccessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(newUser));

    // Update state ngay lập tức
    setAccessToken(newAccessToken);
    setUser(newUser);
    setIsLoggedIn(true);
  };

  // Function để update access token khi refresh
  const updateAccessToken = (newAccessToken: string) => {
    localStorage.setItem('accessToken', newAccessToken);
    setAccessToken(newAccessToken);
  };

  const googleLoginHandler = async (id_token: string) => {
    const data = await googleLogin(id_token);
    if (data.success && data.data?.user && data.data?.tokens?.access_token) {
      login(data.data.user, data.data.tokens.access_token, data.data.tokens.refresh_token);
    } else {
      throw new Error(data.message || 'Đăng nhập Google thất bại');
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');

    // Clear state ngay lập tức
    setAccessToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, accessToken, login, updateAccessToken, googleLoginHandler, logout }}>
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
