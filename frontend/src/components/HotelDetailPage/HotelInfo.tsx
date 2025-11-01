import { useState } from 'react';

// ✅ Text mặc định theo ảnh người dùng gửi - luôn dùng text này
const DEFAULT_DESCRIPTION = `Hãy để chuyến đi của quý khách có một khởi đầu tuyệt vời khi ở lại khách sạn này, nơi có Wi-Fi miễn phí trong tất cả các phòng. Quý khách lui tới và gần với các điểm thu hút và tham quan địa phương. Chỗ nghỉ này giúp cho kỳ nghỉ của quý khách thêm thư thái và đáng nhớ.`;

export default function HotelInfo() {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // ✅ Luôn dùng text mặc định, không dùng description từ database
  const displayDescription = DEFAULT_DESCRIPTION;
  
  const shouldTruncate = displayDescription.length > 300;
  const displayText = isExpanded || !shouldTruncate 
    ? displayDescription 
    : displayDescription.slice(0, 300) + '...';

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

