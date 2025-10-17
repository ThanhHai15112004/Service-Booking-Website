interface SearchTabProps {
  value: 'overnight' | 'dayuse';
  onChange: (value: 'overnight' | 'dayuse') => void;
}

export default function SearchTab({ value, onChange }: SearchTabProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        type="button"
        className={`px-5 py-2 rounded-full border font-medium text-sm transition-all ${value === 'overnight' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
        onClick={() => onChange('overnight')}
      >
        Chỗ Ở Qua Đêm
      </button>
      <button
        type="button"
        className={`px-5 py-2 rounded-full border font-medium text-sm transition-all ${value === 'dayuse' ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
        onClick={() => onChange('dayuse')}
      >
        Chỗ Ở Trong Ngày
      </button>
    </div>
  );
}
