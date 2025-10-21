import { Hotel, Home, Plane, Car } from 'lucide-react';

interface SearchTypeTabsProps {
  value: string;
  onChange: (value: string) => void;
}

const types = [
  { key: 'hotel', label: 'Khách sạn', icon: Hotel },
  { key: 'apartment', label: 'Nhà và Căn hộ', icon: Home },
  { key: 'flight_hotel', label: 'Máy bay + K.sạn', icon: Plane },
  { key: 'flight', label: 'Vé máy bay', icon: Plane },
  { key: 'airport', label: 'Đưa đón sân bay', icon: Car },
];

export default function SearchTypeTabs({ value, onChange }: SearchTypeTabsProps) {
  return (
    <div className="flex gap-3 mb-5 justify-start flex-wrap">
      {types.map(type => {
        const IconComponent = type.icon;
        return (
          <button
            key={type.key}
            type="button"
            className={`px-4 py-2.5 rounded-full font-medium text-sm border transition-all flex items-center gap-2 ${
              value === type.key 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
            } ${type.key !== 'hotel' ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => type.key === 'hotel' && onChange(type.key)}
            disabled={type.key !== 'hotel'}
          >
            <IconComponent className="w-4 h-4" />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
