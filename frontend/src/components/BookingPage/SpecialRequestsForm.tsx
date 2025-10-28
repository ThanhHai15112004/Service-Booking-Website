interface SpecialRequestsFormProps {
  value: string;
  onChange: (value: string) => void;
}

export default function SpecialRequestsForm({ value, onChange }: SpecialRequestsFormProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-black mb-4">Yêu cầu đặc biệt</h2>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
        placeholder="Ghi chú về yêu cầu đặc biệt của bạn (tùy chọn)"
      />
    </div>
  );
}

