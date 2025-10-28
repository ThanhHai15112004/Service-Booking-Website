import { CreditCard } from 'lucide-react';

export default function PaymentForm() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-black mb-4">Thông tin thanh toán</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Số thẻ
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="1234 5678 9012 3456"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Ngày hết hạn
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="MM/YY"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              CVV
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black text-black"
              placeholder="123"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

