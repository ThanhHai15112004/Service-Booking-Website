import { CheckCircle2, CreditCard, Phone, TrendingUp, Clock, AlertCircle } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

interface DashboardTabProps {
  user: any;
  statistics?: {
    total_bookings: number;
    total_spent: number;
    completed_count: number;
    last_booking_date: string | null;
  };
  recentActivity?: Array<{
    type: string;
    description: string;
    date: string;
    booking_id?: string;
  }>;
}

export default function DashboardTab({ user, statistics, recentActivity = [] }: DashboardTabProps) {
  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Chưa có';
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    if (diffDays < 7) return `Cách đây ${diffDays} ngày`;
    if (diffDays < 30) return `Cách đây ${Math.floor(diffDays / 7)} tuần`;
    return `Cách đây ${Math.floor(diffDays / 30)} tháng`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Xin chào, {user?.full_name || 'Người dùng'} 👋
        </h1>
        <p className="text-gray-600">Chào mừng bạn trở lại! Đây là tổng quan về tài khoản của bạn.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Trạng thái tài khoản */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${user?.is_verified ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {user?.is_verified ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Trạng thái tài khoản</h3>
          <p className={`text-lg font-bold ${user?.is_verified ? 'text-green-600' : 'text-yellow-600'}`}>
            {user?.is_verified ? 'Đã xác minh' : 'Chưa xác minh'}
          </p>
          {!user?.is_verified && (
            <p className="text-xs text-gray-500 mt-1">Vui lòng xác minh email</p>
          )}
        </div>

        {/* Loại tài khoản */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-blue-100">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Loại tài khoản</h3>
          <p className="text-lg font-bold text-gray-900">Basic</p>
          <p className="text-xs text-gray-500 mt-1">Nâng cấp để trải nghiệm tốt hơn</p>
        </div>

        {/* Số điện thoại */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${user?.phone_number ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Phone className={`w-6 h-6 ${user?.phone_number ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Số điện thoại</h3>
          <p className="text-lg font-bold text-gray-900">
            {user?.phone_number || 'Chưa thêm'}
          </p>
          {!user?.phone_number && (
            <p className="text-xs text-gray-500 mt-1">Thêm số điện thoại ngay</p>
          )}
        </div>

        {/* Phương thức thanh toán */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-purple-100">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Phương thức thanh toán</h3>
          <p className="text-lg font-bold text-gray-900">Chưa liên kết</p>
          <p className="text-xs text-gray-500 mt-1">Thêm thẻ để thanh toán nhanh</p>
        </div>
      </div>

      {/* Statistics */}
      {statistics && statistics.total_bookings > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-sm opacity-90 mb-1">Tổng số đơn đặt</h3>
            <p className="text-3xl font-bold">{statistics.total_bookings}</p>
            <p className="text-sm opacity-80 mt-2">
              {statistics.completed_count} đơn đã hoàn thành
            </p>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-sm p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 opacity-80" />
            </div>
            <h3 className="text-sm opacity-90 mb-1">Tổng chi tiêu</h3>
            <p className="text-3xl font-bold">
              {formatCurrency(statistics.total_spent || 0)}
            </p>
            {statistics.last_booking_date && (
              <p className="text-sm opacity-80 mt-2">
                Đơn gần nhất: {formatDate(statistics.last_booking_date)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity, idx) => (
              <div 
                key={idx} 
                className={`flex items-center gap-4 ${idx < recentActivity.length - 1 ? 'pb-4 border-b border-gray-200' : ''}`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  activity.type === 'booking' ? 'bg-green-100' : 'bg-blue-100'
                }`}>
                  {activity.type === 'booking' ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatRelativeTime(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">Chưa có hoạt động gần đây</p>
          </div>
        )}
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">🎉 Nâng cấp lên Premium ngay!</h3>
            <p className="text-sm opacity-90 mb-4">
              Tận hưởng ưu đãi độc quyền, tích điểm hoàn tiền và hỗ trợ 24/7
            </p>
            <button className="bg-white text-orange-600 px-6 py-2 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
              Khám phá Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

