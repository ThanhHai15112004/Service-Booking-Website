import { useState } from "react";
import { Globe, X, Check } from "lucide-react";

interface Language {
  code: string;
  name: string;
  flagImg: string;
}

const LANGUAGES: Language[] = [
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

export default function LanguageSelector() {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(LANGUAGES[0]);
  
  const toggleLanguageMenu = () => {
    setLanguageMenuOpen(!languageMenuOpen);
  };
  
  const selectLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setLanguageMenuOpen(false);
  };

  return (
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
              onClick={() => selectLanguage(LANGUAGES[0])}
            >
              <img 
                src={LANGUAGES[0].flagImg} 
                alt={LANGUAGES[0].name} 
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
              {LANGUAGES.map(language => (
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
  );
}
