import { useState } from 'react';

interface HotelInfoProps {
  description: string;
}

export default function HotelInfo({ description }: HotelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldTruncate = description.length > 200;
  const displayText = isExpanded || !shouldTruncate 
    ? description 
    : description.slice(0, 200) + '...';

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-black mb-3">Về khách sạn</h2>
      <p className="text-gray-700 leading-relaxed text-sm">
        {displayText}
      </p>
      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-700 font-medium mt-2 text-sm"
        >
          {isExpanded ? 'Thu gọn' : 'Đọc thêm'}
        </button>
      )}
    </div>
  );
}

