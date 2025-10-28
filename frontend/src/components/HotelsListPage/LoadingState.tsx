import { Loader } from 'lucide-react';

export default function LoadingState() {
  return (
    <div className="flex justify-center items-center py-12">
      <div className="text-center">
        <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-3" />
        <p className="text-gray-600">Đang tải khách sạn...</p>
      </div>
    </div>
  );
}

