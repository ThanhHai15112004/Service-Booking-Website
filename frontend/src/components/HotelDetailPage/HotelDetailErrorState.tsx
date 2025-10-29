import MainLayout from '../../layouts/MainLayout';
import { ErrorState } from '../common';

interface HotelDetailErrorStateProps {
  error: string;
  hotelId?: string;
  checkIn?: string;
  checkOut?: string;
}

/**
 * Hotel Detail Page Error State
 * Uses common ErrorState component
 */
export default function HotelDetailErrorState({ 
  error, 
  hotelId, 
  checkIn, 
  checkOut 
}: HotelDetailErrorStateProps) {
  return (
    <MainLayout>
      <div className="bg-white flex items-center justify-center min-h-screen">
        <div className="w-full max-w-md">
          <ErrorState 
            error={error}
            title="Không thể tải thông tin khách sạn"
            showHomeButton
          />
          
          {/* Additional debug info */}
          {(hotelId || (checkIn && checkOut)) && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg text-center">
              {hotelId && (
                <p className="text-xs text-gray-600">Hotel ID: {hotelId}</p>
              )}
              {checkIn && checkOut && (
                <p className="text-xs text-gray-500 mt-1">
                  {checkIn} → {checkOut}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

