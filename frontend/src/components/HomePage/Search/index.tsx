import HotelSearchForm from './HotelSearch/HotelSearchForm';
import type { HotelSearchParams } from './HotelSearch/types/hotel.types';

interface SearchProps {
  onSearch: (params: HotelSearchParams) => void;
}

export default function Search({ onSearch }: SearchProps) {
  // Currently only hotel search is implemented
  // Flight, car, and combo search will be added in future iterations
  
  return (
    <div className="w-full">
      <HotelSearchForm onSearch={onSearch} />
    </div>
  );
}