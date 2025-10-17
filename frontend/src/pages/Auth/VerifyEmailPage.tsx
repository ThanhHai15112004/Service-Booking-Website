import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loading from "../../components/Loading";
import api from "../../api/axiosClient";
import Header from "../../components/Header";
import { CheckCircle, AlertCircle } from "lucide-react";
import Footer from "../../components/Footer";

function VerifyEmailPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(20);
  const hasCalledAPI = useRef(false); // Đảm bảo API chỉ được gọi 1 lần

  useEffect(() => {
    // Nếu đã gọi API rồi thì không gọi lại
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    console.log("🔍 Token từ URL:", token);
    
    if (!token) {
      console.error("❌ Không có token");
      setError("Không tìm thấy token xác thực!");
      setLoading(false);
      return;
    }

    console.log("📡 Gửi request xác thực với token:", token);
    api.get(`/api/auth/verify-email?token=${token}`)
      .then(res => {
        console.log("✅ Response từ BE:", res.data);
        setLoading(false);
        if (res.data.success) {
          console.log("🎉 Xác thực thành công!");
          setSuccess(true);
        } else {
          console.error("❌ Xác thực thất bại:", res.data.message);
          setError(res.data.message || "Xác thực thất bại!");
        }
      })
      .catch((err) => {
        console.error("❌ Lỗi request:", err.response?.data);
        setLoading(false);
        if (err.response?.data?.success === false) {
          setError(err.response.data.message || "Xác thực thất bại!");
        } else {
          setError("Lỗi xác thực email! Vui lòng thử lại sau.");
        }
      });
  }, []); // Chỉ chạy 1 lần khi component mount

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (success && countdown === 0) {
      navigate("/login");
    }
  }, [success, countdown, navigate]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {loading && <Loading message="Đang xác thực email của bạn..." />}
        
        {!loading && !error && !success && (
          <Loading message="Đang xác thực email của bạn..." />
        )}
        
        {!loading && error && !success && (
          <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-md w-full border-l-4 border-red-500">
            <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold text-red-600 mb-3">Xác thực thất bại!</h2>
            <p className="text-gray-700 text-center mb-6">{error}</p>
            <a href="/login" className="text-blue-600 hover:text-blue-700 font-medium underline">Quay lại đăng nhập</a>
          </div>
        )}

        {!loading && success && !error && (
          <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center max-w-md w-full border-t-4 border-green-500">
            <CheckCircle className="w-20 h-20 text-green-500 mb-6" />
            <h2 className="text-3xl font-bold text-green-600 mb-4 text-center">Xác thực thành công!</h2>
            
            <div className="bg-green-50 rounded-lg p-6 mb-6 w-full">
              <p className="text-gray-700 text-center leading-relaxed mb-4">
                🎉 Chúc mừng bạn đã xác nhận thành công địa chỉ email của mình!
              </p>
              <p className="text-gray-600 text-sm text-center leading-relaxed mb-4">
                Cảm ơn bạn đã tin tưởng và lựa chọn dịch vụ của chúng tôi. Tài khoản của bạn hiện đã sẵn sàng để sử dụng đầy đủ tất cả các tính năng và dịch vụ mà chúng tôi cung cấp.
              </p>
              <p className="text-gray-600 text-sm text-center leading-relaxed">
                Hãy đăng nhập ngay để khám phá những trải nghiệm tuyệt vời và những ưu đãi đặc biệt dành riêng cho bạn.
              </p>
            </div>

            <p className="text-gray-500 text-center mb-6">
              Bạn sẽ được chuyển về trang đăng nhập sau <span className="font-bold text-blue-600 text-lg">{countdown}s</span>
            </p>

            <a 
              href="/login" 
              className="text-blue-600 hover:text-blue-800 font-semibold text-sm underline hover:no-underline transition-all"
            >
              ← Quay lại đăng nhập ngay
            </a>
          </div>
        )}
      </main>
        <Footer />
    </div>
  );
}

export default VerifyEmailPage;