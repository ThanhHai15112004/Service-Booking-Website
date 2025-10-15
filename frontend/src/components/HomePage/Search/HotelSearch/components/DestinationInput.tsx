import { Search } from 'lucide-react';
import type { DestinationInputProps } from '../types/hotel.types';

export default function DestinationInput({ destination, onDestinationChange }: DestinationInputProps) {
  return (
    <div className="w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="UNU C&B homestay"
          className="text-black w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-sm transition-all hover:border-gray-300"
          value={destination}
          onChange={(e) => onDestinationChange(e.target.value)}
        />
      </div>
    </div>
  );
}