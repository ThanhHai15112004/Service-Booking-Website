interface HotelInfoProps {
  description: string;
}

export default function HotelInfo({ description }: HotelInfoProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-black mb-4">Về khách sạn</h2>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

