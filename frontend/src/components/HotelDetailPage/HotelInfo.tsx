import { useState } from 'react';

interface HotelInfoProps {
  description: string;
}

export default function HotelInfo({ description }: HotelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 300;
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.slice(0, 300) + '...';

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-black mb-3">Về chúng tôi</h2>
      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hover:underline font-medium mt-2 text-xs inline-flex items-center gap-1"
          style={{ color: '#2067da' }}
        >
          {isExpanded ? 'Thu gọn' : 'Đọc thêm'}
        </button>
      )}
    </div>
  );
}

