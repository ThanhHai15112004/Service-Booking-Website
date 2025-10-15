import { useState } from "react";
import { Menu, ChevronDown, Plane, Bed, Car, Ticket, Globe, X, Check } from "lucide-react";

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="absolute -top-3 left-1 rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white shadow-sm">
      {children}
    </span>
  );
}

interface Language {
  code: string;
  name: string;
  flagImg: string;
}

export default function Header() {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  
  const languages: Language[] = [
    { code: 'vi', name: 'Tiếng Việt', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Vietnam.svg/800px-Flag_of_Vietnam.svg.png' },
    { code: 'en', name: 'English', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Flag_of_the_United_States.svg/2560px-Flag_of_the_United_States.svg.png' },
    { code: 'zh', name: '简体中文', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flag_of_China.png/1200px-Flag_of_China.png' },
    { code: 'ja', name: '日本語', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Flag_of_Japan.svg/1280px-Flag_of_Japan.svg.png' },
    { code: 'ko', name: '한국어', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Flag_of_South_Korea.svg/250px-Flag_of_South_Korea.svg.png' },
    { code: 'fr', name: 'Français', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1024px-Flag_of_France.svg.png' },
    { code: 'de', name: 'Deutsch', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Flag_of_Germany.svg/2560px-Flag_of_Germany.svg.png' },
    { code: 'es', name: 'Español', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Flag_of_Spain.svg/2560px-Flag_of_Spain.svg.png' },
    { code: 'ru', name: 'Русский', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/d/d4/Flag_of_Russia.png' },
    { code: 'th', name: 'ภาษาไทย', flagImg: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Flag_of_Thailand.svg/2560px-Flag_of_Thailand.svg.png' }
  ];
  
  const [currentLanguage, setCurrentLanguage] = useState(languages[0]);
  
  const toggleLanguageMenu = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };
  
  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setLanguageMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white text-gray-900 shadow-sm">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <a href="/" className="flex flex-col items-center">
            <div className="flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500" />
              <span className="inline-block h-2 w-2 rounded-full bg-yellow-400" />
              <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
              <span className="inline-block h-2 w-2 rounded-full bg-blue-500" />
              <span className="inline-block h-2 w-2 rounded-full bg-purple-500" />
            </div>
            <span className="text-sm font-semibold tracking-tight">BookStay</span>
          </a>

          {/* Center: Nav (desktop) */}
          <nav className="relative hidden md:block">
            <ul className="flex items-center gap-6 text-[15px]">
              <li className="relative">
                <Badge>Đặt gói để tiết kiệm!</Badge>
                <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
                  <Plane className="h-4 w-4" />
                  <span>Máy bay + K.sạn</span>
                </a>
              </li>

              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
                  <Bed className="h-4 w-4" />
                  <span>Chỗ ở</span>
                </a>
              </li>

              <li className="relative">
                <Badge>Mới!</Badge>
                <button className="flex items-center gap-1.5 hover:text-gray-700">
                  <Car className="h-4 w-4" />
                  <span>Phương tiện di chuyển</span>
                  <ChevronDown className="h-4 w-4" />
                </button>
              </li>

              <li>
                <a href="#" className="hover:text-gray-700">Hoạt động</a>
              </li>

              <li>
                <a href="#" className="flex items-center gap-1.5 hover:text-gray-700">
                  <Ticket className="h-4 w-4" />
                  <span>Phiếu giảm giá và ưu đãi</span>
                </a>
              </li>
            </ul>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="relative">
              <button
                className="hidden rounded-full border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 md:flex items-center gap-2"
                aria-label="Ngôn ngữ"
                onClick={toggleLanguageMenu}
              >
                <img 
                  src={currentLanguage.flagImg} 
                  alt={currentLanguage.name} 
                  className="h-4 w-auto object-cover" 
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <span className="hidden sm:inline">{currentLanguage.name}</span>
                <Globe className="h-4 w-4" />
              </button>
              
              {languageMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg z-50 border border-gray-200 py-2">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                    <h3 className="font-semibold text-gray-800">Chọn ngôn ngữ</h3>
                    <button onClick={() => setLanguageMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="py-2">
                    <h4 className="px-4 text-xs text-gray-500 font-medium mb-1">Ngôn ngữ gợi ý</h4>
                    <button 
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                      onClick={() => selectLanguage(languages[0])}
                    >
                      <img 
                        src={languages[0].flagImg} 
                        alt={languages[0].name} 
                        className="h-5 w-8 object-cover rounded-sm" 
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                      <span>Tiếng Việt</span>
                      <Check className="h-4 w-4 ml-auto text-blue-600" />
                    </button>
                  </div>
                  
                  <div className="border-t border-gray-100 pt-2">
                    <h4 className="px-4 text-xs text-gray-500 font-medium mb-1">Tất cả ngôn ngữ</h4>
                    <div className="max-h-60 overflow-y-auto">
                      {languages.map(language => (
                        <button 
                          key={language.code}
                          className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-3"
                          onClick={() => selectLanguage(language)}
                        >
                          <img 
                            src={language.flagImg} 
                            alt={language.name} 
                            className="h-5 w-8 object-cover rounded-sm" 
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span>{language.name}</span>
                          {currentLanguage.code === language.code && (
                            <Check className="h-4 w-4 ml-auto text-blue-600" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auth */}
            <a href="/login" className="hidden text-sm font-medium text-blue-600 hover:underline md:inline-block">
              Đăng nhập
            </a>
            <a
              href="/register"
              className="hidden rounded-full border border-blue-200 px-4 py-1.5 text-sm font-semibold text-blue-600 hover:bg-blue-50 md:inline-block"
            >
              Tạo tài khoản
            </a>

            {/* Mobile hamburger */}
            <button className="rounded-md p-2 hover:bg-gray-100 md:hidden" aria-label="Mở menu">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
