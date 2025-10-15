// Car Rental Search Component
// Coming Soon - Sẽ được implement sau

interface CarSearchProps {
  onSearch: (params: any) => void;
}

export default function CarSearchForm({ onSearch }: CarSearchProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 -mt-8 relative z-10 max-w-7xl mx-auto">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🚗 Thuê xe
        </h2>
        <p className="text-gray-600">
          Tính năng thuê xe sẽ sớm được ra mắt!
        </p>
      </div>
    </div>
  );
}