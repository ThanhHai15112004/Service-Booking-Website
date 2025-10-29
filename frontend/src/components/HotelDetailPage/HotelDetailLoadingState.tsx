import MainLayout from '../../layouts/MainLayout';
import { PageLoading } from '../common';

interface HotelDetailLoadingStateProps {
  hotelId?: string;
}

/**
 * Hotel Detail Page Loading State
 * Uses common PageLoading component
 */
export default function HotelDetailLoadingState({ hotelId }: HotelDetailLoadingStateProps) {
  return (
    <MainLayout>
      <PageLoading message="Đang tải thông tin khách sạn..." />
      {hotelId && (
        <p className="text-xs text-gray-400 text-center -mt-20">
          Hotel ID: {hotelId}
        </p>
      )}
    </MainLayout>
  );
}

