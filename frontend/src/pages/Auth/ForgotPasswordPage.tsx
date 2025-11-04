import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { Mail, ChevronLeft, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { forgotPassword, verifyResetToken, resetPassword } from '../../services/authService';
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";
import { useAuth } from '../../contexts/AuthContext';

type ForgotStep = 'email' | 'verify' | 'reset' | 'success';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { isLoggedIn, user, isLoading } = useAuth();
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ✅ Redirect nếu đã đăng nhập (trừ khi có token reset trong URL)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');
    
    // Nếu có token trong URL, không redirect (cần reset password)
    if (tokenFromUrl) return;

    if (!isLoading && isLoggedIn && user) {
      if (user.role === 'ADMIN' || user.role === 'STAFF') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isLoggedIn, user, isLoading, navigate]);

  // Hàm showToast tự động ẩn sau 2.5s
  const showToast = (toastObj: { type: "error" | "success"; message: string }) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 2500);
  };

  // Kiểm tra token khi component mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get('token');

    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      verifyTokenAndLoadResetStep(tokenFromUrl);
    }
  }, []);

  const verifyTokenAndLoadResetStep = async (resetToken: string) => {
    setLoading(true);
    try {
      const result = await verifyResetToken(resetToken);
      if (result.success) {
        setStep('reset');
      } else {
        showToast({ type: 'error', message: 'Token không hợp lệ hoặc đã hết hạn!' });
        setStep('email');
      }
    } catch {
      showToast({ type: 'error', message: 'Lỗi xác thực token!' });
      setStep('email');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      showToast({ type: 'error', message: 'Vui lòng nhập email!' });
      return;
    }

    setLoading(true);
    try {
      const result = await forgotPassword(email);
      if (result.success) {
        showToast({ type: 'success', message: 'Nếu email tồn tại, chúng tôi đã gửi liên kết reset!' });
        setStep('verify');
      } else {
        showToast({ type: 'error', message: result.message || 'Gửi email thất bại!' });
      }
    } catch {
      showToast({ type: 'error', message: 'Lỗi gửi email. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      showToast({ type: 'error', message: 'Mật khẩu nhập lại không khớp!' });
      return;
    }

    if (newPassword.length < 6) {
      showToast({ type: 'error', message: 'Mật khẩu phải có ít nhất 6 ký tự!' });
      return;
    }

    setLoading(true);
    try {
      const result = await resetPassword(token, newPassword);
      if (result.success) {
        showToast({ type: 'success', message: 'Đặt lại mật khẩu thành công!' });
        setStep('success');
      } else {
        showToast({ type: 'error', message: result.message || 'Đặt lại mật khẩu thất bại!' });
      }
    } catch {
      showToast({ type: 'error', message: 'Lỗi đặt lại mật khẩu. Vui lòng thử lại!' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === 'verify' || step === 'reset') {
      setStep('email');
      setEmail('');
      setToken('');
    }
  };

  return (
    <MainLayout>
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-6 md:py-12 px-3 md:px-4 min-h-screen md:min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 relative">
            {/* Back Button */}
            {step !== 'success' && (
              <button
                onClick={handleBack}
                className="absolute top-4 md:top-6 left-4 md:left-6 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 md:w-6 h-5 md:h-6" />
              </button>
            )}

            {/* Step 1: Enter Email */}
            {step === 'email' && (
              <div>
                <div className="mb-6 md:mb-8 text-center">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-red-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
                  <p className="text-gray-600">
                    Nhập địa chỉ email của bạn và chúng tôi sẽ gửi liên kết đặt lại mật khẩu.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="your@email.com"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!email || loading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      email && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Đang gửi...' : 'Gửi liên kết reset'}
                  </button>
                </form>

                {loading && <Loading message="Đang gửi email..." />}

                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Nhớ mật khẩu?{' '}
                    <a href="/login" className="text-blue-600 hover:underline font-medium">
                      Đăng nhập
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Check Email */}
            {step === 'verify' && (
              <div>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Kiểm tra email của bạn</h1>
                  <p className="text-gray-600">
                    Chúng tôi đã gửi liên kết đặt lại mật khẩu đến email{' '}
                    <span className="font-semibold text-gray-900">{email}</span>.
                    <br />
                    Vui lòng kiểm tra hộp thư của bạn.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Lưu ý:</strong> Email có thể nằm trong thư mục Spam hoặc Junk. Nếu không thấy, vui lòng kiểm tra các thư mục này.
                  </p>
                </div>

                <button
                  type="button"
                  className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  onClick={() => window.location.href = '/login'}
                >
                  Quay lại đăng nhập
                </button>

                <p className="mt-6 text-xs text-gray-600 text-center">
                  Chưa nhận được email?{' '}
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-blue-600 hover:underline font-medium"
                  >
                    Thử lại với email khác
                  </button>
                </p>
              </div>
            )}

            {/* Step 3: Reset Password */}
            {step === 'reset' && (
              <div>
                <div className="mb-6 md:mb-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">Tạo mật khẩu mới</h1>
                  <p className="text-gray-600">
                    Nhập mật khẩu mới cho tài khoản của bạn.
                  </p>
                </div>

                <form onSubmit={handleResetPassword} className="space-y-5">
                  <div className="relative">
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu mới
                    </label>
                    <input
                      id="newPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 [&::-ms-reveal]:hidden"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 translate-y-1 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="relative">
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Nhập lại mật khẩu
                    </label>
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 [&::-ms-reveal]:hidden"
                      placeholder="Nhập lại mật khẩu"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 translate-y-1 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!newPassword || !confirmPassword || loading}
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      newPassword && confirmPassword && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {loading ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                  </button>
                </form>

                {loading && <Loading message="Đang đặt lại mật khẩu..." />}
              </div>
            )}

            {/* Step 4: Success */}
            {step === 'success' && (
              <div>
                <div className="mb-8 text-center">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-12 h-12 text-green-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-green-600 mb-2">Thành công!</h1>
                  <p className="text-gray-600">
                    Mật khẩu của bạn đã được đặt lại thành công. Vui lòng đăng nhập lại bằng mật khẩu mới.
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>✓ Mật khẩu mới đã được lưu.</strong> Bạn có thể đăng nhập ngay bây giờ.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => window.location.href = '/login'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  Đi đến trang đăng nhập
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default ForgotPasswordPage;
