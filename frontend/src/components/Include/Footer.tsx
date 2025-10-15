import { Hotel, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Hotel className="w-8 h-8" />
              <span className="text-2xl font-bold">BookStay</span>
            </div>
            <p className="text-gray-400 mb-4">
              Nền tảng đặt phòng khách sạn hàng đầu với hàng nghìn lựa chọn trên toàn quốc.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Mail className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <Phone className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <MapPin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Về chúng tôi</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Giới thiệu</a></li>
              <li><a href="#" className="hover:text-white transition">Tuyển dụng</a></li>
              <li><a href="#" className="hover:text-white transition">Tin tức</a></li>
              <li><a href="#" className="hover:text-white transition">Liên hệ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Trung tâm trợ giúp</a></li>
              <li><a href="#" className="hover:text-white transition">Điều khoản sử dụng</a></li>
              <li><a href="#" className="hover:text-white transition">Chính sách bảo mật</a></li>
              <li><a href="#" className="hover:text-white transition">Chính sách hoàn hủy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Đối tác</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Đăng ký khách sạn</a></li>
              <li><a href="#" className="hover:text-white transition">Quản lý đặt phòng</a></li>
              <li><a href="#" className="hover:text-white transition">Affiliate</a></li>
              <li><a href="#" className="hover:text-white transition">API</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BookStay. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
