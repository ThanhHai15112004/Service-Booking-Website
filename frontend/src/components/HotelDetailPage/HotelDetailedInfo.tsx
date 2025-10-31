import React from 'react';

interface HotelDetailedInfoProps {
  description?: string;
  name: string;
}

export default function HotelDetailedInfo({ description, name }: HotelDetailedInfoProps) {
  if (!description) {
    return null;
  }

  return (
    <div className="mb-6 p-5 bg-white rounded-lg border border-gray-200">
      <h2 className="text-lg font-bold text-black mb-4">Giới thiệu chi tiết về khách sạn</h2>
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">
          {description}
        </p>
      </div>
    </div>
  );
}

