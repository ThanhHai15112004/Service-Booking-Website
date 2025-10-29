import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

interface HotelDetailErrorStateProps {
  error: string;
  hotelId?: string;
  checkIn?: string;
  checkOut?: string;
}

export default function HotelDetailErrorState({ 
  error, 
  hotelId, 
  checkIn, 
  checkOut 
}: HotelDetailErrorStateProps) {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-black mb-2">{error}</h2>
          {hotelId && <p className="text-sm text-gray-600 mb-4">Hotel ID: {hotelId}</p>}
          {checkIn && checkOut && (
            <p className="text-xs text-gray-400 mb-4">
              Check In: {checkIn}, Check Out: {checkOut}
            </p>
          )}
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Quay về trang chủ
          </button>
        </div>
      </div>
    </MainLayout>
  );
}

