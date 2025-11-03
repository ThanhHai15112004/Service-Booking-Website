import { Check, X, Crown, Sparkles } from 'lucide-react';

export default function UpgradeAccountTab() {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-xl shadow-lg p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-10 rounded-full -ml-24 -mb-24" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-10 h-10" />
            <h1 className="text-3xl font-bold">Nâng cấp tài khoản của bạn 💎</h1>
          </div>
          <p className="text-lg opacity-95 mb-6 max-w-2xl">
            Tận hưởng trải nghiệm đặt phòng cao cấp với các ưu đãi độc quyền, tích điểm hoàn tiền và hỗ trợ 24/7
          </p>
          <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-bold text-lg hover:bg-orange-50 transition-colors shadow-lg">
            Nâng cấp ngay
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">So sánh gói</h2>
          <p className="text-gray-600 mt-2">Chọn gói phù hợp với nhu cầu của bạn</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-4 text-left text-sm font-semibold text-gray-900">Tính năng</th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900">
                  <div className="flex flex-col items-center">
                    <span>Basic</span>
                    <span className="text-xs font-normal text-gray-500 mt-1">Miễn phí</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 bg-green-50">
                  <div className="flex flex-col items-center">
                    <span className="text-green-600 font-bold">Standard</span>
                    <span className="text-xs font-normal text-green-600 font-bold mt-1">199.000₫/tháng</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 bg-blue-50">
                  <div className="flex flex-col items-center">
                    <Crown className="w-6 h-6 text-yellow-500 mb-1" />
                    <span>Premium</span>
                    <span className="text-xs font-normal text-blue-600 font-bold mt-1">499.000₫/tháng</span>
                  </div>
                </th>
                <th className="px-4 py-4 text-center text-sm font-semibold text-gray-900 bg-purple-50">
                  <div className="flex flex-col items-center">
                    <Sparkles className="w-6 h-6 text-purple-500 mb-1" />
                    <span>VIP</span>
                    <span className="text-xs font-normal text-purple-600 font-bold mt-1">999.000₫/tháng</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Đặt phòng nhanh</td>
                <td className="px-4 py-4 text-center">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Ưu đãi độc quyền</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <span className="text-xs text-green-600 font-semibold">5%</span>
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <span className="text-xs text-blue-600 font-semibold">15%</span>
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <span className="text-xs text-purple-600 font-semibold">30%</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Hỗ trợ khách hàng</td>
                <td className="px-4 py-4 text-center">
                  <span className="text-xs text-gray-600">Giờ hành chính</span>
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Tích điểm hoàn tiền</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <span className="text-xs text-green-600 font-semibold">1%</span>
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <span className="text-xs text-blue-600 font-semibold">3%</span>
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <span className="text-xs text-purple-600 font-semibold">5%</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Ưu tiên đặt phòng</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Miễn phí hủy đặt phòng</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <span className="text-xs text-gray-600">48h trước</span>
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <span className="text-xs text-blue-600">24h trước</span>
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Phòng VIP upgrade</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Quà tặng chào mừng</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <span className="text-xs text-blue-600">Voucher 100k</span>
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <span className="text-xs text-purple-600">Voucher 500k</span>
                </td>
              </tr>
              <tr>
                <td className="px-4 py-4 text-sm text-gray-700">Ưu đãi đặc biệt</td>
                <td className="px-4 py-4 text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-green-50">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-4 py-4 text-center bg-blue-50">
                  <span className="text-xs text-blue-600">Flash sale</span>
                </td>
                <td className="px-4 py-4 text-center bg-purple-50">
                  <span className="text-xs text-purple-600">Early bird</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-200">
          <div className="flex justify-center gap-4 flex-wrap">
            <button className="px-6 py-3 border-2 border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              Ở lại Basic
            </button>
            <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-all shadow-lg">
              Nâng cấp Standard
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg font-bold hover:from-yellow-500 hover:to-orange-600 transition-all shadow-lg flex items-center gap-2">
              <Crown className="w-5 h-5" />
              Nâng cấp Premium
            </button>
            <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Nâng cấp VIP
            </button>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Sparkles className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Ưu đãi độc quyền</h3>
          <p className="text-sm text-gray-600">
            Giảm giá lên đến 30% tại các khách sạn đối tác
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
            <Check className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Hỗ trợ 24/7</h3>
          <p className="text-sm text-gray-600">
            Đội ngũ hỗ trợ chuyên nghiệp luôn sẵn sàng giúp đỡ bạn
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
            <Crown className="w-6 h-6 text-yellow-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2">Tích điểm hoàn tiền</h3>
          <p className="text-sm text-gray-600">
            Tích điểm cho mỗi đặt phòng và đổi thành tiền mặt
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
            <Check className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Linh hoạt và minh bạch</h3>
            <p className="text-sm text-gray-700">
              Bạn có thể hủy nâng cấp bất kỳ lúc nào. Không có phí ẩn, không có cam kết dài hạn.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

