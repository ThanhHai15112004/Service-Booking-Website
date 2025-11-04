import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getMyBookings, cancelBooking } from '../../services/bookingService';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Eye,
  X,
  Building2,
  Bed,
  Users
} from 'lucide-react';

interface Booking {
  booking_id: string;
  status: 'CREATED' | 'PAID' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  total_amount: number;
  subtotal?: number;
  tax_amount?: number;
  discount_amount?: number;
  created_at: string;
  updated_at?: string;
  hotel_name: string;
  hotel_image?: string;
  hotel_address?: string;
  hotel_phone?: string;
  checkin_date: string;
  checkout_date: string;
  nights_count: number;
  room_type_name: string;
  rooms_count?: number;
  room_type_names?: string;
  guests_count?: number;
  booking_code?: string;
  special_requests?: string;
}

type FilterStatus = 'all' | 'pending' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

function MyBookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getMyBookings();
      
      if (response.success && response.data) {
        setBookings(response.data);
      } else {
        setError(response.message || 'Không thể tải danh sách đơn đặt chỗ');
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải danh sách đơn đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!selectedBooking) return;

    try {
      setCancelling(true);
      const response = await cancelBooking(selectedBooking.booking_id);
      
      if (response.success) {
        // Reload bookings
        await loadBookings();
        setShowCancelModal(false);
        setSelectedBooking(null);
        // Show success toast
        alert('Hủy đơn đặt chỗ thành công!');
      } else {
        alert(response.message || 'Hủy đơn đặt chỗ thất bại');
      }
    } catch (err: any) {
      alert('Có lỗi xảy ra khi hủy đơn đặt chỗ');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CREATED':
        return {
          label: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          description: 'Đơn đặt chỗ đã được tạo, chờ thanh toán'
        };
      case 'PAID':
        return {
          label: 'Chờ xác nhận',
          color: 'bg-yellow-100 text-yellow-800',
          icon: Clock,
          description: 'Đã thanh toán, chờ xác nhận'
        };
      case 'CONFIRMED':
        return {
          label: 'Đã xác nhận',
          color: 'bg-green-100 text-green-800',
          icon: CheckCircle2,
          description: 'Đơn đặt chỗ đã được xác nhận'
        };
      case 'CANCELLED':
        return {
          label: 'Đã hủy',
          color: 'bg-red-100 text-red-800',
          icon: XCircle,
          description: 'Đơn đặt chỗ đã bị hủy'
        };
      case 'COMPLETED':
        return {
          label: 'Hoàn thành',
          color: 'bg-gray-100 text-gray-800',
          icon: CheckCircle2,
          description: 'Đã hoàn thành chuyến đi'
        };
      default:
        return {
          label: status,
          color: 'bg-gray-100 text-gray-800',
          icon: AlertCircle,
          description: ''
        };
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const filteredBookings = filterStatus === 'all' 
    ? bookings 
    : filterStatus === 'pending'
    ? bookings.filter(b => b.status === 'CREATED' || b.status === 'PAID')
    : bookings.filter(b => b.status === filterStatus);

  const statusCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'CREATED' || b.status === 'PAID').length,
    CONFIRMED: bookings.filter(b => b.status === 'CONFIRMED').length,
    COMPLETED: bookings.filter(b => b.status === 'COMPLETED').length,
    CANCELLED: bookings.filter(b => b.status === 'CANCELLED').length
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách đơn đặt chỗ...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadBookings}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Thử lại
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Đơn đặt chỗ của tôi</h1>
              <p className="text-gray-600">Quản lý và theo dõi tất cả các đơn đặt chỗ của bạn</p>
            </div>
          </div>

          {/* Main Layout: Sidebar + Content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar - Filters (Full Height) */}
            <div className="lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm sticky top-20 h-[calc(100vh-8rem)] flex flex-col">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-bold text-gray-900">Lọc theo trạng thái</h2>
                </div>
                <div className="flex-1 overflow-y-auto p-6 pt-4">
                  <div className="space-y-2 -mx-6 px-6">
                    {/* Tất cả và Đã xác nhận ở trên */}
                    {(['all', 'CONFIRMED'] as FilterStatus[]).map((status) => {
                      const config = status === 'all' 
                        ? { label: 'Tất cả', color: 'bg-gray-100 text-gray-800', icon: null }
                        : getStatusConfig(status);
                      const StatusIcon = config.icon;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {StatusIcon && <StatusIcon className="w-4 h-4" />}
                            {config.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            filterStatus === status
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {statusCounts[status]}
                          </span>
                        </button>
                      );
                    })}
                    
                    {/* Divider */}
                    <div className="my-4 border-t border-gray-200"></div>
                    
                    {/* Các trạng thái khác ở dưới */}
                    {(['pending', 'COMPLETED', 'CANCELLED'] as FilterStatus[]).map((status) => {
                      const config = status === 'pending'
                        ? { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800', icon: Clock }
                        : getStatusConfig(status);
                      const StatusIcon = config.icon;
                      
                      return (
                        <button
                          key={status}
                          onClick={() => setFilterStatus(status)}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                            filterStatus === status
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {StatusIcon && <StatusIcon className="w-4 h-4" />}
                            {config.label}
                          </span>
                          <span className={`px-2 py-0.5 text-xs rounded-full ${
                            filterStatus === status
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {statusCounts[status]}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">

              {/* Bookings List */}
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {filterStatus === 'all' ? 'Chưa có đơn đặt chỗ nào' : `Chưa có đơn ${getStatusConfig(filterStatus).label.toLowerCase()} nào`}
                  </h3>
              <p className="text-gray-600 mb-6">
                {filterStatus === 'all' 
                  ? 'Bắt đầu khám phá và đặt phòng ngay hôm nay!' 
                  : 'Hãy kiểm tra các trạng thái khác'}
              </p>
              {filterStatus === 'all' && (
                <button
                  onClick={() => navigate('/hotels/search')}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Đặt phòng ngay
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const statusConfig = getStatusConfig(booking.status);
                const StatusIcon = statusConfig.icon;
                const isDayUse = booking.checkin_date === booking.checkout_date;

                return (
                  <div
                    key={booking.booking_id}
                    className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/booking-detail/${booking.booking_id}`)}
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Hotel Image */}
                        <div className="lg:w-48 flex-shrink-0">
                          <div className="aspect-video rounded-lg overflow-hidden bg-gray-200">
                            {booking.hotel_image ? (
                              <img
                                src={booking.hotel_image}
                                alt={booking.hotel_name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Building2 className="w-12 h-12 text-gray-400" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Booking Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4 mb-3">
                                <div className="flex-1">
                                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                                    {booking.hotel_name}
                                  </h3>
                                  {booking.hotel_address && (
                                    <div className="flex items-start gap-2 text-sm text-gray-600 mb-2">
                                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                      <span className="line-clamp-2">{booking.hotel_address}</span>
                                    </div>
                                  )}
                                </div>
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${statusConfig.color}`}>
                                  <StatusIcon className="w-4 h-4" />
                                  {statusConfig.label}
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap items-center gap-3 mb-3">
                                <div className="flex items-center gap-2 text-sm">
                                  <Bed className="w-4 h-4 text-blue-600" />
                                  <span className="text-gray-700">
                                    {booking.rooms_count && booking.rooms_count > 1 
                                      ? `${booking.rooms_count} phòng (${booking.room_type_names || booking.room_type_name})` 
                                      : booking.room_type_name}
                                  </span>
                                </div>
                                {booking.guests_count && (
                                  <div className="flex items-center gap-2 text-sm">
                                    <Users className="w-4 h-4 text-blue-600" />
                                    <span className="text-gray-700">{booking.guests_count} khách</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="text-left sm:text-right sm:min-w-[140px]">
                              <p className="text-2xl font-bold text-gray-900 mb-1">
                                {formatCurrency(booking.total_amount)}
                              </p>
                              <p className="text-xs text-gray-500 mb-1">
                                Mã: {booking.booking_code || booking.booking_id.slice(-8)}
                              </p>
                              {booking.subtotal && booking.total_amount !== booking.subtotal && (
                                <p className="text-xs text-gray-400 line-through">
                                  {formatCurrency(booking.subtotal)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày nhận phòng</p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {formatDate(booking.checkin_date)}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-3">
                              <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày trả phòng</p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {formatDate(booking.checkout_date)}
                                  {!isDayUse && booking.nights_count > 0 && (
                                    <span className="text-gray-500 ml-1 text-xs">
                                      ({booking.nights_count} đêm)
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>

                            {booking.hotel_address && (
                              <div className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                                  <p className="font-medium text-gray-900 text-sm line-clamp-2">
                                    {booking.hotel_address}
                                  </p>
                                </div>
                              </div>
                            )}

                            <div className="flex items-start gap-3">
                              <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                                <p className="font-medium text-gray-900 text-sm">
                                  {formatDate(booking.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {(booking.subtotal || booking.tax_amount || booking.discount_amount || booking.hotel_phone) && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pt-4 border-t border-gray-200">
                              {booking.subtotal && booking.total_amount !== booking.subtotal && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Giá gốc</p>
                                  <p className="text-sm font-medium text-gray-900 line-through">
                                    {formatCurrency(booking.subtotal)}
                                  </p>
                                </div>
                              )}
                              {booking.tax_amount && booking.tax_amount > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Thuế & phí</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {formatCurrency(booking.tax_amount)}
                                  </p>
                                </div>
                              )}
                              {booking.discount_amount && booking.discount_amount > 0 && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Giảm giá</p>
                                  <p className="text-sm font-medium text-green-600">
                                    -{formatCurrency(booking.discount_amount)}
                                  </p>
                                </div>
                              )}
                              {booking.hotel_phone && (
                                <div>
                                  <p className="text-xs text-gray-500 mb-1">Liên hệ</p>
                                  <p className="text-sm font-medium text-gray-900">
                                    {booking.hotel_phone}
                                  </p>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                            <div className="text-sm text-gray-600">
                              {statusConfig.description}
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/booking-detail/${booking.booking_id}`);
                                }}
                                className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                                Xem chi tiết
                              </button>
                              {(booking.status === 'CREATED' || booking.status === 'PAID') && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedBooking(booking);
                                    setShowCancelModal(true);
                                  }}
                                  className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors whitespace-nowrap"
                                >
                                  <X className="w-4 h-4" />
                                  Hủy đơn
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Booking Modal */}
      {showCancelModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy đơn đặt chỗ</h3>
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn hủy đơn đặt chỗ tại <strong>{selectedBooking.hotel_name}</strong>?
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">
                  ⚠️ Lưu ý: Sau khi hủy, phòng sẽ được mở lại và có thể được đặt bởi người khác. 
                  Nếu đã thanh toán, tiền sẽ được hoàn lại theo chính sách của khách sạn.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowCancelModal(false);
                  setSelectedBooking(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={cancelling}
              >
                Hủy
              </button>
              <button
                onClick={handleCancelBooking}
                disabled={cancelling}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancelling ? 'Đang xử lý...' : 'Xác nhận hủy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default MyBookingsPage;

