import MainLayout from '../../layouts/MainLayout';

interface HotelDetailLoadingStateProps {
  hotelId?: string;
}

export default function HotelDetailLoadingState({ hotelId }: HotelDetailLoadingStateProps) {
  return (
    <MainLayout>
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin khách sạn...</p>
          {hotelId && <p className="text-xs text-gray-400 mt-2">Hotel ID: {hotelId}</p>}
        </div>
      </div>
    </MainLayout>
  );
}

