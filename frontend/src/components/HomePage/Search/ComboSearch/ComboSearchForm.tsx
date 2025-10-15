// Combo Search Component  
// Coming Soon - Sẽ được implement sau

interface ComboSearchProps {
  onSearch: (params: any) => void;
}

export default function ComboSearchForm({ onSearch }: ComboSearchProps) {
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-8 -mt-8 relative z-10 max-w-7xl mx-auto">
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          🎯 Combo du lịch
        </h2>
        <p className="text-gray-600">
          Tính năng combo du lịch (hotel + flight + car) sẽ sớm được ra mắt!
        </p>
      </div>
    </div>
  );
}