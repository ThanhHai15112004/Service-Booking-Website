import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logo from '../../assets/imgs/logos/logo1.png';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img 
                src={logo} 
                alt="Book Homestay" 
                className="h-20 w-40"
              />
            </div>
            <p className="text-gray-600 text-sm mb-4">
              Nền tảng đặt phòng khách sạn hàng đầu Việt Nam. Tìm kiếm và đặt phòng dễ dàng với giá tốt nhất.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Facebook className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Twitter className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Instagram className="w-5 h-5 text-black" />
              </a>
              <a href="#" className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors">
                <Linkedin className="w-5 h-5 text-black" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Về chúng tôi</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Đối tác
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Báo chí
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Hỗ trợ</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Chính sách hủy đặt phòng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Điều khoản sử dụng
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-600 hover:text-black text-sm transition-colors">
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-black mb-4">Liên hệ</h3>
            <ul className="space-y-2">
              <li className="text-gray-600 text-sm">
                Hotline: 1900 1234
              </li>
              <li className="text-gray-600 text-sm">
                Email: support@bookstay.vn
              </li>
              <li className="text-gray-600 text-sm">
                Thời gian: 24/7
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            © 2024 BookStay. Bản quyền thuộc về BookStay.
          </p>
        </div>
      </div>
    </footer>
  );
}
