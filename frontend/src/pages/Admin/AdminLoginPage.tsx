import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Shield } from 'lucide-react';
import { login as loginAPI } from '../../services/authService';
import Toast from '../../components/Toast';
import Loading from '../../components/Loading';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

function AdminLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoggedIn, user, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // ✅ Redirect nếu đã đăng nhập và là ADMIN/STAFF
  useEffect(() => {
    if (!isLoading && isLoggedIn && user) {
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        const from = (location.state as any)?.from?.pathname || '/admin/reports';
        navigate(from, { replace: true });
      } else {
        // Nếu là USER thường, redirect về trang chủ
        navigate('/', { replace: true });
      }
    }
  }, [isLoggedIn, user, isLoading, navigate, location.state]);

  // ✅ Redirect nếu đang load
  if (isLoading) {
    return <Loading message="Đang kiểm tra xác thực..." />;
  }

  const showToast = (toastObj: { type: "error" | "success"; message: string }) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      showToast({ type: "error", message: "Vui lòng nhập email và mật khẩu!" });
      return;
    }

    setLoading(true);
    try {
      const res = await loginAPI(formData.email, formData.password);
      
      if (res.success && res.data?.user && res.data?.tokens?.access_token) {
        const userRole = res.data.user.role;
        
        // ✅ Kiểm tra quyền: Chỉ ADMIN và STAFF mới được đăng nhập
        if (userRole !== 'ADMIN' && userRole !== 'STAFF') {
          showToast({ 
            type: "error", 
            message: "Bạn không có quyền truy cập vào trang quản trị. Chỉ ADMIN và STAFF mới được phép." 
          });
          setLoading(false);
          return;
        }

        // Update context ngay lập tức
        login(res.data.user, res.data.tokens.access_token, res.data.tokens.refresh_token);
        
        showToast({ type: "success", message: "Đăng nhập thành công!" });
        
        // ✅ Redirect đến admin reports dashboard (mặc định)
        const from = (location.state as any)?.from?.pathname || '/admin/reports';
        setTimeout(() => {
          navigate(from, { replace: true });
        }, 500);
      } else {
        setLoading(false);
        showToast({ type: "error", message: res.message || "Đăng nhập thất bại!" });
      }
    } catch (error: any) {
      setLoading(false);
      showToast({ 
        type: "error", 
        message: error.response?.data?.message || "Lỗi đăng nhập. Vui lòng thử lại!" 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4 py-12">
      {loading && <Loading message="Đang đăng nhập..." />}
      {toast && <Toast type={toast.type} message={toast.message} />}
      
      <div className="w-full max-w-md">
        
        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full mb-4">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Đăng nhập Admin
            </h1>
            <p className="text-gray-600">
              Trang quản trị hệ thống
            </p>
          </div>

          {/* Warning Box */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  <strong>Lưu ý:</strong> Chỉ dành cho ADMIN và STAFF. Nếu bạn là người dùng thường, vui lòng <Link to="/login" className="underline font-medium">đăng nhập tại đây</Link>.
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                  placeholder="admin@example.com"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 [&::-ms-reveal]:hidden"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Quên mật khẩu?{' '}
              <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 font-medium">
                Đặt lại mật khẩu
              </Link>
            </p>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">
            <Shield className="w-3 h-3 inline mr-1" />
            Trang này được bảo vệ. Mọi hoạt động đều được ghi lại để đảm bảo an toàn.
          </p>
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
