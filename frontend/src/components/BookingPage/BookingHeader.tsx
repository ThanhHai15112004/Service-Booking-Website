import { useState, useEffect } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface BookingHeaderProps {
  currentStep?: number;
  countdownSeconds?: number;
}

export default function BookingHeader({ 
  currentStep = 1, 
  countdownSeconds = 1200 // 20 phút
}: BookingHeaderProps) {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
      {/* Progress Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-center gap-4 mb-3">
          <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {currentStep > 1 ? <CheckCircle2 className="w-5 h-5" /> : '1'}
            </div>
            <span className="text-sm font-medium">Thông tin khách hàng</span>
          </div>
          
          <div className={`flex-1 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`} />
          
          <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'
            }`}>
              {currentStep > 2 ? <CheckCircle2 className="w-5 h-5" /> : '2'}
            </div>
            <span className="text-sm font-medium">Đã xác nhận đặt chỗ!</span>
          </div>
        </div>
      </div>

      {/* Price Hold Timer */}
      {timeLeft > 0 && (
        <div className="bg-red-600 text-white py-2">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">
              Chúng tôi đang giữ giá cho quý khách...
            </span>
            <span className="text-sm font-bold ml-2">{formatTime(timeLeft)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

