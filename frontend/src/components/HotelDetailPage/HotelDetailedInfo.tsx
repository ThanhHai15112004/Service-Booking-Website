import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface HotelDetailedInfoProps {
  description?: string;
  name: string;
  bannerImage?: string; // ✅ Thêm prop cho banner image
}

export default function HotelDetailedInfo({ description, name, bannerImage }: HotelDetailedInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return null;
  }

  // Số dòng tối đa khi collapsed
  const maxLines = 3;

  // Check if description is long enough to need truncation
  // Kiểm tra dựa trên số ký tự và số dòng xuống hàng
  const lineCount = description.split('\n').length;
  const charCount = description.length;
  const needsTruncation = lineCount > maxLines || charCount > 250;

  return (
    <div className="mb-6 bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* ✅ Banner Image */}
      {bannerImage && (
        <div className="w-full h-64 md:h-80 overflow-hidden">
          <img
            src={bannerImage}
            alt={`Banner ${name}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-5">
        <h2 className="text-lg font-bold text-black mb-4">Giới thiệu chi tiết về khách sạn</h2>
        
        <div className="prose prose-sm max-w-none">
          <div 
            className={`text-gray-700 leading-relaxed whitespace-pre-line relative ${
              !isExpanded && needsTruncation ? 'overflow-hidden' : ''
            }`}
          >
            <p
              className={
                !isExpanded && needsTruncation 
                  ? 'line-clamp-3' 
                  : ''
              }
              style={
                !isExpanded && needsTruncation
                  ? {
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }
                  : {}
              }
            >
              {description}
            </p>
          </div>

          {/* ✅ "Xem thêm" / "Thu gọn" Button */}
          {needsTruncation && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  <span>Thu gọn</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  <span>Xem thêm</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

