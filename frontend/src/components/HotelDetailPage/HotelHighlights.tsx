import { 
  Wifi, 
  UtensilsCrossed, 
  Car, 
  Clock, 
  Waves,
  Wind,
  Info,
  Dumbbell,
  Sparkles
} from 'lucide-react';

interface Highlight {
  icon?: string;
  iconType?: string;
  text: string;
  tooltip?: string;
}

interface HotelHighlightsProps {
  highlights: Highlight[];
}

const iconMap: Record<string, any> = {
  'wifi': Wifi,
  'restaurant': UtensilsCrossed,
  'parking': Car,
  'reception': Clock,
  'pool': Waves,
  'aircon': Wind,
  'gym': Dumbbell,
  'spa': Sparkles,
};

export default function HotelHighlights({ highlights }: HotelHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null;
  }

  const getIcon = (highlight: Highlight) => {
    if (highlight.iconType && iconMap[highlight.iconType]) {
      const IconComponent = iconMap[highlight.iconType];
      return <IconComponent className="w-6 h-6 text-gray-700" />;
    }
    
    if (highlight.icon) {
      // If icon is emoji or image URL
      if (highlight.icon.startsWith('http')) {
        return <img src={highlight.icon} alt="" className="w-6 h-6" />;
      }
      return <span className="text-2xl">{highlight.icon}</span>;
    }
    
    // Default icon
    return <Info className="w-6 h-6 text-gray-700" />;
  };

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg">
      <h3 className="text-base font-bold text-gray-900 mb-3">Điểm nổi bật của chỗ nghỉ</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {highlights.map((highlight, index) => (
          <div 
            key={index} 
            className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="flex-shrink-0">
              {getIcon(highlight)}
            </div>
            <div className="flex-1">
              <p className="text-gray-900">
                {highlight.text}
                {highlight.tooltip && (
                  <button
                    className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400 text-xs"
                    title={highlight.tooltip}
                    aria-label="More information"
                  >
                    ⓘ
                  </button>
                )}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

