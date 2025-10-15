// Flight Search Component
// Coming Soon - Sẽ được implement sau

interface FlightSearchProps {
  onSearch: (params: any) => void;
}

export default function FlightSearchForm({ onSearch }: FlightSearchProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 -mt-8 relative z-10 max-w-7xl mx-auto">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          ✈️ Tìm kiếm chuyến bay
        </h2>
        <p className="text-gray-600">
          Tính năng tìm kiếm chuyến bay sẽ sớm được ra mắt!
        </p>
      </div>
    </div>
  );
}