import { useState, useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { Mail, ChevronLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
// Countdown circle component
function CountdownCircle({ seconds, total }: { seconds: number; total: number }) {
  const radius = 18;
  const stroke = 3;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const progress = seconds / total;
  const offset = circumference * (1 - progress);
  return (
    <svg height={radius * 2} width={radius * 2} className="inline-block align-middle" style={{ transform: 'scale(0.85)', transformOrigin: 'center' }}>
      <circle
        stroke="#e5e7eb"
        fill="none"
        strokeWidth={stroke}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
      />
      <circle
        stroke="#2563eb"
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        r={normalizedRadius}
        cx={radius}
        cy={radius}
        style={{ transition: 'stroke-dashoffset 1s linear' }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dy=".35em"
        fontSize="13"
        fill="#2563eb"
        fontWeight="bold"
      >
        {seconds}s
      </text>
    </svg>
  );
}
import { checkEmailExists, registerAccount, resendVerificationEmail } from '../../services/authService';
import Toast from "../../components/Toast";
import Loading from "../../components/Loading";

type RegisterStep = 'method' | 'email' | 'info' | 'password' | 'verify';

function RegisterPage() {
  const [step, setStep] = useState<RegisterStep>('method');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false,
    agreeMarketing: false
  });
  const [toast, setToast] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  // resend email state
  const [resendCount, setResendCount] = useState(0); // số lần đã gửi lại
  const [resendCooldown, setResendCooldown] = useState(0); // giây còn lại
  const resendMax = 5;
  const cooldownSeconds = 180;
  const resendTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Thêm state để hiện/ẩn mật khẩu
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Hàm showToast tự động ẩn sau 2.5s
  const showToast = (toastObj: { type: "error" | "success"; message: string }) => {
    setToast(toastObj);
    setTimeout(() => setToast(null), 2500);
  };
  // Đếm ngược cooldown gửi lại email
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    } else if (resendTimerRef.current) {
      clearTimeout(resendTimerRef.current);
    }
    return () => {
      if (resendTimerRef.current) clearTimeout(resendTimerRef.current);
    };
  }, [resendCooldown]);

  // Reset resend state khi quay lại step trước
  useEffect(() => {
    if (step !== 'verify') {
      setResendCooldown(0);
      setResendCount(0);
    }
  }, [step]);

  // Cleanup: Clear all timers khi component unmount
  useEffect(() => {
    return () => {
      if (resendTimerRef.current) {
        clearTimeout(resendTimerRef.current);
      }
    };
  }, []);

  // Nếu user đã xác thực email thành công (navigate từ VerifyEmailPage), redirect tới login
  useEffect(() => {
    // Check xem có thông báo từ VerifyEmailPage (qua URL params hoặc sessionStorage)
    const params = new URLSearchParams(window.location.search);
    const verifySuccess = params.get('verified') === 'true';
    
    if (verifySuccess) {
      // Clear form data và redirect
      sessionStorage.removeItem('registerData');
      window.location.href = '/login';
    }
  }, []);

  // Monitor verify step - nếu quá lâu thì reset
  useEffect(() => {
    if (step !== 'verify') return;

    const verifyTimeout = setTimeout(() => {
      setStep('method');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false,
        agreeMarketing: false
      });
      setResendCooldown(0);
      setResendCount(0);
      showToast({ type: 'error', message: 'Phiên đăng ký đã hết hạn. Vui lòng thử lại.' });
    }, 30 * 60 * 1000); // 30 phút

    return () => clearTimeout(verifyTimeout);
  }, [step]);

  const handleMethodSelect = (method: 'email' | 'social') => {
    if (method === 'email') {
      setStep('email');
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email) {
      showToast({ type: "error", message: "Vui lòng nhập email!" });
      return;
    }
    setLoading(true);
    try {
      const result = await checkEmailExists(formData.email);
      setLoading(false);
      
      // Kiểm tra email hợp lệ trước
      if (!result.isValid) {
        showToast({ type: "error", message: result.message || "Email không hợp lệ!" });
        return;
      }
      
      // Kiểm tra email đã tồn tại
      if (result.exists) {
        showToast({ type: "error", message: "Email đã tồn tại trong hệ thống!" });
        return; 
      }
      
      setStep("info");
    } catch {
      setLoading(false);
      showToast({ type: "error", message: "Lỗi kiểm tra email. Vui lòng thử lại!" });
    }
  };

  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.agreeTerms) {
      showToast({ type: "error", message: "Vui lòng đồng ý với điều khoản sử dụng!" });
      return;
    }

    // Bắt đầu loading ngay khi bấm button
    setLoading(true);
    // Ngay sau đó chuyển sang step password
    // Loading sẽ tự động tắt khi UI re-render (useEffect sẽ handle)
    setStep('password');
  };

  // useEffect để tắt loading khi step thay đổi (UI render xong)
  // Điều này đảm bảo loading chỉ hiển thị trong thời gian chuyển đổi step
  useEffect(() => {
    if ((step === 'password' || step === 'verify') && loading) {
      setLoading(false);
    }
  }, [step]);

  const handleBack = () => {
    if (step === 'email') {
      setStep('method');
    } else if (step === 'info') {
      setStep('email');
    } else if (step === 'password') {
      setStep('info');
    } else if (step === 'verify') {
      setStep('password');
    }
  };

  const handleSubmitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      showToast({ type: "error", message: "Mật khẩu nhập lại không khớp!" });
      return;
    }
    setLoading(true);
    try {
      const res = await registerAccount({
        full_name: `${formData.lastName} ${formData.firstName}`,
        email: formData.email,
        password: formData.password,
        phone_number: formData.phone,
      });
      if (res.success) {
        // Chuyển sang verify step - Loading sẽ tắt khi step thay đổi via useEffect
        setStep('verify');
      } else {
        setLoading(false);
        showToast({ type: "error", message: res.message || "Đăng ký thất bại!" });
      }
    } catch {
      setLoading(false);
      showToast({ type: "error", message: "Lỗi đăng ký. Vui lòng thử lại!" });
    }
  };

  return (
    <MainLayout>
      {toast && <Toast type={toast.type} message={toast.message} />}
      <div className="flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 py-6 md:py-12 px-3 md:px-4 min-h-screen md:min-h-[calc(100vh-80px)]">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-5 md:p-8 relative">
            {/* Back Button */}
            {step !== 'method' && (
              <button
                onClick={handleBack}
                className="absolute top-4 md:top-6 left-4 md:left-6 text-gray-600 hover:text-gray-900"
              >
                <ChevronLeft className="w-5 md:w-6 h-5 md:h-6" />
              </button>
            )}

            {/* Step 1: Choose Method */}
            {step === 'method' && (
              <div>
                <div className="mb-6 md:mb-8">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                    Đăng ký tài khoản
                  </h1>
                  <p className="text-sm md:text-base text-gray-600">
                    Đăng ký miễn phí hoặc đăng nhập để nhận được các ưu đãi và quyền lợi hấp dẫn!
                  </p>
                </div>

                <div className="space-y-2 md:space-y-3 mb-4 md:mb-6">
                  {/* Google */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('social')}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium text-sm md:text-base"
                  >
                    <svg className="w-4 md:w-5 h-4 md:h-5" viewBox="0 0 24 24">
                      <path fill="white" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="white" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="white" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="white" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="hidden md:inline">Đăng ký bằng Google</span>
                    <span className="md:hidden">Google</span>
                  </button>

                  {/* Facebook */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('social')}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 bg-white border-2 border-gray-300 text-gray-700 rounded-full hover:bg-gray-50 transition-colors font-medium text-sm md:text-base"
                  >
                    <svg className="w-4 md:w-5 h-4 md:h-5" fill="#1877F2" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="hidden md:inline">Đăng ký với Facebook</span>
                    <span className="md:hidden">Facebook</span>
                  </button>

                  {/* Apple */}
                  <button
                    type="button"
                    onClick={() => handleMethodSelect('social')}
                    className="w-full flex items-center justify-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3.5 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors font-medium text-sm md:text-base"
                  >
                    <svg className="w-4 md:w-5 h-4 md:h-5" fill="white" viewBox="0 0 24 24">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    <span className="hidden md:inline">Đăng ký bằng Apple</span>
                    <span className="md:hidden">Apple</span>
                  </button>
                </div>

                <div className="relative my-4 md:my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-xs md:text-sm">
                    <span className="px-2 bg-white text-gray-500">hoặc</span>
                  </div>
                </div>

                {/* Email Button */}
                <button
                  onClick={() => handleMethodSelect('email')}
                  className="w-full flex items-center justify-center gap-2 px-3 md:px-4 py-2 md:py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700 text-sm md:text-base"
                >
                  <Mail className="w-4 md:w-5 h-4 md:h-5" />
                  <span>Email</span>
                </button>

                <div className="mt-4 md:mt-6">
                  <button
                    type="button"
                    className="w-full text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 text-sm md:text-base"
                  >
                    <span>Đăng nhập bằng cách khác</span>
                    <ArrowRight className="w-3 md:w-4 h-3 md:h-4" />
                  </button>
                </div>

                <p className="mt-4 md:mt-6 text-xs text-gray-600 text-center">
                  Khi đăng nhập, tôi đồng ý với các{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Step 2: Enter Email */}
            {step === 'email' && (
              <div>
                <div className="mb-4 md:mb-6 mt-2 md:mt-4">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1 md:mb-2">
                    Nhập địa chỉ email của bạn
                  </h1>
                  <p className="text-gray-600">
                    Vui lòng cung cấp email để chúng tôi có thể tạo tài khoản cho bạn.
                  </p>
                </div>

                <form onSubmit={handleEmailSubmit} className="space-y-5">
                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="example@email.com"
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      formData.email && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!formData.email || loading}
                  >
                    {loading ? 'Đang kiểm tra...' : 'Tiếp tục'}
                  </button>
                </form>

                {loading && <Loading message="Đang kiểm tra email..." />}

                <p className="mt-6 text-xs text-gray-600 text-center">
                  Khi đăng nhập, tôi đồng ý với các{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Step 3: User Info */}
            {step === 'info' && (
              <div>
                <div className="mb-6 mt-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Đầu tiên, hãy cho chúng tôi biết tên ưu tiên của quý khách.
                  </h1>
                  <p className="text-gray-600">
                    Chúng tôi đang thiết lập tài khoản cho <span className="font-semibold">{formData.email}</span>. Vui lòng cho chúng tôi biết tên yêu thích của quý khách để bắt đầu.
                  </p>
                </div>

                <form onSubmit={handleSubmitInfo} className="space-y-5">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      Tên
                    </label>
                    <input
                      id="firstName"
                      type="text"
                      required
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Tên"
                      disabled={loading}
                    />
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Họ
                    </label>
                    <input
                      id="lastName"
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400"
                      placeholder="Họ"
                      disabled={loading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium transition-colors ${
                      formData.firstName && formData.lastName && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!formData.firstName || !formData.lastName || loading}
                  >
                    {loading ? 'Đang lưu...' : 'Tiếp tục'}
                  </button>
                  
                  {/* Terms */}
                  <div className="flex items-start">
                    <input
                      id="terms"
                      type="checkbox"
                      checked={formData.agreeTerms}
                      onChange={(e) => setFormData({ ...formData, agreeTerms: e.target.checked })}
                      className="w-4 h-4 mt-1 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      disabled={loading}
                    />
                    <label htmlFor="terms" className="ml-2 text-xs text-gray-600">
                      Tôi đồng ý nhận thông tin cập nhật và chương trình khuyến mại về BookStay và các chi nhánh hoặc đối tác kinh doanh của BookStay thông qua nhiều kênh, bao gồm WhatsApp. Có thể ngưng nhận thông tin bất cứ lúc nào. Đọc thêm trong{' '}
                      <a href="#" className="text-blue-600 hover:underline">
                        Chính sách Quyền riêng tư
                      </a>
                      .
                    </label>
                  </div>
                </form>

                {loading && <Loading message="Đang lưu thông tin..." />}

                <p className="mt-6 text-xs text-gray-600 text-center">
                  Khi đăng nhập, tôi đồng ý với các{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Điều khoản sử dụng
                  </a>{' '}
                  và{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Chính sách bảo mật
                  </a>
                  .
                </p>
              </div>
            )}

            {/* Step 4: Email Verification */}
            {step === 'verify' && (
              <div>
                <div className="mb-8 text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-8 h-8 text-blue-600" />
                  </div>
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Kiểm tra email của bạn
                  </h1>
                  <p className="text-gray-600">
                    Chúng tôi đã gửi link xác thực đến email{' '}
                    <span className="font-semibold text-gray-900">{formData.email || 'của bạn'}</span>.
                    <br />
                    Vui lòng kiểm tra hộp thư và click vào link để kích hoạt tài khoản.
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-700">
                    <strong>Lưu ý:</strong> Email có thể nằm trong thư mục Spam hoặc Junk. Nếu không thấy email, vui lòng kiểm tra các thư mục này.
                  </p>
                </div>

                <div className="space-y-3 relative">
                  {/* Overlay loading khi gửi lại */}
                  {loading && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 rounded-lg">
                      <svg className="animate-spin h-8 w-8 text-blue-600 mb-2" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      <span className="text-blue-600 font-medium">Đang gửi lại...</span>
                    </div>
                  )}
                  <button
                    type="button"
                    className={`w-full bg-blue-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${resendCooldown > 0 || resendCount >= resendMax || loading ? 'opacity-60 cursor-not-allowed' : 'hover:bg-blue-700'}`}
                    onClick={async () => {
                      if (resendCooldown > 0 || resendCount >= resendMax || loading) return;
                      setLoading(true);
                      try {
                        const data = await resendVerificationEmail(formData.email);
                        if (data.success) {
                          showToast({ type: 'success', message: 'Đã gửi lại email xác thực!' });
                          setResendCount(c => c + 1);
                          setResendCooldown(cooldownSeconds);
                        } else {
                          showToast({ type: 'error', message: data.message || 'Gửi lại email thất bại!' });
                        }
                      } catch (err) {
                        showToast({ type: 'error', message: 'Gửi lại email thất bại!' });
                      }
                      setLoading(false);
                    }}
                    disabled={resendCooldown > 0 || resendCount >= resendMax || loading}
                  >
                    {resendCooldown > 0 ? (
                      <>
                        <CountdownCircle seconds={resendCooldown} total={cooldownSeconds} />
                        <span>Vui lòng chờ để gửi lại</span>
                        <span className="font-bold">{Math.floor(resendCooldown / 60)}:{(resendCooldown % 60).toString().padStart(2, '0')}</span>
                      </>
                    ) : resendCount >= resendMax ? (
                      <span>Bạn đã vượt quá số lần gửi lại!</span>
                    ) : (
                      <span>Gửi lại email xác thực</span>
                    )}
                  </button>
                  <p className={`text-xs text-center mt-1 ${resendCount >= resendMax ? 'text-red-600 font-semibold' : 'text-gray-500'}`}>
                    Bạn chỉ có thể gửi lại tối đa 5 lần mỗi ngày. ({resendCount}/{resendMax})
                  </p>

                  <button
                    type="button"
                    className="w-full border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                    onClick={() => window.location.href = '/login'}
                  >
                    Về trang đăng nhập
                  </button>
                </div>

                <p className="mt-6 text-xs text-gray-600 text-center">
                  Bạn chưa nhận được email?{' '}
                  <a href="#" className="text-blue-600 hover:underline">
                    Liên hệ hỗ trợ
                  </a>
                </p>
              </div>
            )}

            {/* Step 5: Set Password */}
            {step === 'password' && (
              <div>
                <div className="mb-6 mt-4">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">
                    Tạo mật khẩu cho tài khoản
                  </h1>
                  <p className="text-gray-600">
                    Vui lòng nhập mật khẩu để bảo vệ tài khoản của bạn.
                  </p>
                </div>
                <form onSubmit={handleSubmitPassword} className="space-y-5">
                  <div className="relative">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Mật khẩu
                    </label>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 [&::-ms-reveal]:hidden"
                      placeholder="Nhập mật khẩu"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 translate-y-1 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                      onClick={() => setShowPassword((v) => !v)}
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
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full pl-4 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder-gray-400 [&::-ms-reveal]:hidden"
                      placeholder="Nhập lại mật khẩu"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      className="absolute right-3 top-1/2 translate-y-1 text-gray-400 hover:text-gray-600 transition-colors pointer-events-auto"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center ${
                      formData.password && formData.confirmPassword && !loading
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    disabled={!formData.password || !formData.confirmPassword || loading}
                  >
                    {loading ? 'Đang tạo tài khoản...' : 'Tiếp tục'}
                  </button>
                </form>

                {loading && <Loading message="Đang gửi email xác thực..." />}
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default RegisterPage;
