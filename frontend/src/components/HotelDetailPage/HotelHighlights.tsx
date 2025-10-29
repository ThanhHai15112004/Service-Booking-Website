import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { getIconByType, DefaultIcon } from './iconMapping';

interface Highlight {
  icon?: string;
  iconType?: string;
  text: string;
  tooltip?: string;
}

interface HotelHighlightsProps {
  highlights: Highlight[];
}

export default function HotelHighlights({ highlights }: HotelHighlightsProps) {
  const [showAll, setShowAll] = useState(false);
  const MAX_VISIBLE_ITEMS = 6;

  if (!highlights || highlights.length === 0) {
    return null;
  }

  const getIcon = (highlight: Highlight) => {
    // Ưu tiên icon URL từ database trước
    if (highlight.icon && highlight.icon.startsWith('http')) {
      return <img src={highlight.icon} alt="" className="w-10 h-10 object-contain" />;
    }
    
    // Nếu có icon text/emoji
    if (highlight.icon && !highlight.icon.startsWith('http')) {
      return <span className="text-xl">{highlight.icon}</span>;
    }
    
    // Fallback: dùng iconType với lucide icons
    if (highlight.iconType) {
      const IconComponent = getIconByType(highlight.iconType);
      return <IconComponent className="w-6 h-6" style={{ color: '#2067da' }} strokeWidth={1.5} />;
    }
    
    // Default icon cuối cùng
    const Icon = DefaultIcon;
    return <Icon className="w-6 h-6" style={{ color: '#2067da' }} strokeWidth={1.5} />;
  };

  const displayedHighlights = showAll ? highlights : highlights.slice(0, MAX_VISIBLE_ITEMS);
  const hasMore = highlights.length > MAX_VISIBLE_ITEMS;

  return (
    <div className="mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <h3 className="text-lg font-bold text-black mb-3">Điểm nổi bật nhất</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {displayedHighlights.map((highlight, index) => (
          <div 
            key={index} 
            className="flex flex-col items-center text-center gap-1.5"
          >
            <div className="flex-shrink-0">
              {getIcon(highlight)}
            </div>
            <p className="text-[12px] text-gray-700 leading-tight">
              {highlight.text}
            </p>
          </div>
        ))}
      </div>
      
      {hasMore && (
        <div className="mt-4 text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium transition-colors hover:bg-gray-50 rounded-lg"
            style={{ color: '#2067da' }}
          >
            {showAll ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Thu gọn
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Xem thêm
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

