export default function HotelPolicies() {
  const policies = [
    { label: 'Nhận phòng', value: 'Từ 14:00' },
    { label: 'Trả phòng', value: 'Trước 12:00' },
    { label: 'Hủy đặt phòng', value: 'Miễn phí hủy trước 48h' },
    { label: 'Thú cưng', value: 'Không cho phép' }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-black mb-4">Chính sách khách sạn</h2>
      <div className="space-y-3 text-gray-600">
        {policies.map((policy, index) => (
          <div key={index} className="flex justify-between py-3 border-b border-gray-200">
            <span className="font-medium">{policy.label}</span>
            <span>{policy.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

