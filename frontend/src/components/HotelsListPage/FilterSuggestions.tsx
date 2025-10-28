import { Star, DollarSign, Wifi, MapPin, Coffee } from 'lucide-react';

interface FilterSuggestionsProps {
  onApplySuggestion: (type: string, value: any) => void;
}

export default function FilterSuggestions({ onApplySuggestion }: FilterSuggestionsProps) {
  const suggestions = [
    {
      icon: <Star className="w-4 h-4 text-yellow-500" />,
      label: '5 sao',
      type: 'starRating',
      value: 5,
      color: 'bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100'
    },
    {
      icon: <DollarSign className="w-4 h-4 text-blue-500" />,
      label: 'Dưới 2 triệu',
      type: 'priceRange',
      value: [0, 2000000],
      color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
    },
    {
      icon: <Wifi className="w-4 h-4 text-green-500" />,
      label: 'Wifi miễn phí',
      type: 'facility',
      value: 'wifi',
      color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
    },
    {
      icon: <Coffee className="w-4 h-4 text-purple-500" />,
      label: 'Bữa sáng miễn phí',
      type: 'facility',
      value: 'breakfast',
      color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
    },
    {
      icon: <MapPin className="w-4 h-4 text-red-500" />,
      label: 'Gần trung tâm',
      type: 'distance',
      value: 'center',
      color: 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Gợi ý bộ lọc phổ biến:</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onApplySuggestion(suggestion.type, suggestion.value)}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm border transition-colors ${suggestion.color}`}
          >
            {suggestion.icon}
            <span>{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

