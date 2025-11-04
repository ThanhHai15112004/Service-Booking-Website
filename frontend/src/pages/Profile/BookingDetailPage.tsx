import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getBookingById, cancelBooking } from '../../services/bookingService';
import { getHotelDetail } from '../../services/hotelService';
import api from '../../api/axiosClient';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Users,
  Bed,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Building2,
  X,
  FileText,
  Wallet,
  Star,
  Coffee,
  Tag,
  Home
} from 'lucide-react';

function BookingDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (bookingId) {
      loadBookingDetails();
    }
  }, [bookingId]);

  const loadBookingDetails = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Load booking info
      const bookingResponse = await getBookingById(bookingId);

      if (bookingResponse.success && bookingResponse.data) {
        console.log('📦 Booking data:', bookingResponse.data);
        setBooking(bookingResponse.data);
        
        // Load payment info nếu cần (fallback nếu booking không có payment_method)
        if (!bookingResponse.data.payment_method) {
          try {
            const paymentResponse = await api.get(`/api/payments/booking/${bookingId}`);
            console.log('💳 Payment data:', paymentResponse.data);
            if (paymentResponse.data.success && paymentResponse.data.data) {
              setPaymentInfo(paymentResponse.data.data);
            }
          } catch (paymentErr) {
            console.error('Error loading payment info:', paymentErr);
            // Không block nếu không load được payment info
          }
        } else {
          console.log('✅ Payment method from booking:', bookingResponse.data.payment_method);
        }
        
        // Load hotel details với images, facilities, amenities
        if (bookingResponse.data.hotel_id) {
          try {
            const hotelResponse = await getHotelDetail(bookingResponse.data.hotel_id, {
              checkIn: bookingResponse.data.checkin_date,
              checkOut: bookingResponse.data.checkout_date,
              adults: bookingResponse.data.guests_count || 2,
              rooms: 1
            });
            
            if (hotelResponse.success && hotelResponse.data) {
              setHotelDetails(hotelResponse.data);
            }
          } catch (hotelErr) {
            console.error('Error loading hotel details:', hotelErr);
            // Không block nếu không load được hotel details
          }
        }
      } else {
        setError(bookingResponse.message || 'Không thể tải thông tin đơn đặt chỗ');
      }
    } catch (err: any) {
      setError('Có lỗi xảy ra khi tải thông tin đơn đặt chỗ');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!bookingId) return;

    try {
      setCancelling(true);
      const response = await cancelBooking(bookingId);

      if (response.success) {
        // Reload booking details
        await loadBookingDetails();
        setShowCancelModal(false);
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
          label: 'Đã tạo',
          color: 'bg-blue-100 text-blue-800',
          icon: Clock,
          description: 'Đơn đặt chỗ đã được tạo, chờ thanh toán'
        };
      case 'PAID':
        return {
          label: 'Đã thanh toán',
          color: 'bg-purple-100 text-purple-800',
          icon: CreditCard,
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (timeStr: string, defaultTime: string = '14:00') => {
    if (!timeStr || timeStr === 'unknown') return defaultTime;
    // Nếu timeStr đã là format HH:mm thì giữ nguyên
    if (timeStr.match(/^\d{2}:\d{2}$/)) return timeStr;
    return defaultTime;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin đơn đặt chỗ...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error || !booking) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Có lỗi xảy ra</h2>
            <p className="text-gray-600 mb-4">{error || 'Không tìm thấy đơn đặt chỗ'}</p>
            <button
              onClick={() => navigate('/bookings')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Quay lại danh sách
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const statusConfig = getStatusConfig(booking.status);
  const StatusIcon = statusConfig.icon;
  const isDayUse = booking.checkin_date === booking.checkout_date;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <button
            onClick={() => navigate('/bookings')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Quay lại danh sách đơn đặt chỗ</span>
          </button>

          {/* Header Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${statusConfig.color}`}>
                    <StatusIcon className="w-5 h-5" />
                    {statusConfig.label}
                  </div>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{booking.hotel_name}</h1>
                <p className="text-gray-600 mb-1">
                  <span className="font-medium">Mã đặt chỗ:</span> {booking.booking_code || booking.booking_id}
                </p>
                <p className="text-sm text-gray-500">
                  Đặt lúc: {formatDateTime(booking.created_at)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 mb-1">Tổng tiền</p>
                <p className="text-3xl font-bold text-gray-900">{formatCurrency(booking.total_amount)}</p>
              </div>
            </div>

            {statusConfig.description && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">{statusConfig.description}</p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Main Content - Full Width Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Hotel Information with Facilities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-6 h-6 text-blue-600" />
                  Thông tin khách sạn
                </h2>
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Tên khách sạn</p>
                        <p className="font-medium text-gray-900">{booking.hotel_name}</p>
                      </div>
                    </div>
                    {booking.hotel_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Địa chỉ</p>
                          <p className="font-medium text-gray-900">{booking.hotel_address}</p>
                        </div>
                      </div>
                    )}
                    {booking.hotel_phone && (
                      <div className="flex items-start gap-3">
                        <Phone className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Số điện thoại</p>
                          <p className="font-medium text-gray-900">{booking.hotel_phone}</p>
                        </div>
                      </div>
                    )}
                    {(hotelDetails?.hotel?.email || booking.hotel_email) && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Email</p>
                          <p className="font-medium text-gray-900">{hotelDetails?.hotel?.email || booking.hotel_email}</p>
                        </div>
                      </div>
                    )}
                    {hotelDetails?.hotel?.website && (
                      <div className="flex items-start gap-3">
                        <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Website</p>
                          <a 
                            href={hotelDetails.hotel.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="font-medium text-blue-600 hover:underline"
                          >
                            {hotelDetails.hotel.website}
                          </a>
                        </div>
                      </div>
                    )}
                    {hotelDetails?.hotel?.checkin_time && hotelDetails?.hotel?.checkout_time && (
                      <>
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Giờ nhận phòng</p>
                            <p className="font-medium text-gray-900">{hotelDetails.hotel.checkin_time}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Giờ trả phòng</p>
                            <p className="font-medium text-gray-900">{hotelDetails.hotel.checkout_time}</p>
                          </div>
                        </div>
                      </>
                    )}
                    {hotelDetails?.hotel?.star_rating && (
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Hạng sao</p>
                          <div className="flex items-center gap-1">
                            <span className="font-medium text-gray-900">{hotelDetails.hotel.star_rating}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                          </div>
                        </div>
                      </div>
                    )}
                    {hotelDetails?.hotel?.avg_rating && (
                      <div className="flex items-start gap-3">
                        <Star className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Đánh giá</p>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">{hotelDetails.hotel.avg_rating}</span>
                            <span className="text-sm text-gray-500">
                              ({hotelDetails.hotel.review_count || 0} đánh giá)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                  </div>

                  {/* Hotel Facilities */}
                  {hotelDetails?.hotel?.facilities && hotelDetails.hotel.facilities.length > 0 && (
                    <div className="border-t border-gray-200 pt-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Coffee className="w-5 h-5 text-blue-600" />
                        Tiện nghi khách sạn
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {hotelDetails.hotel.facilities.map((facility: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                            {facility.facility?.icon ? (
                              <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                {facility.facility.icon.length <= 3 ? (
                                  <span className="text-base">{facility.facility.icon}</span>
                                ) : (
                                  <img src={facility.facility.icon} alt={facility.facility.name} className="w-5 h-5" />
                                )}
                              </div>
                            ) : (
                              <Coffee className="w-5 h-5 text-blue-600 flex-shrink-0" />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {facility.facility?.name || facility.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Room Details with Amenities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Bed className="w-6 h-6 text-blue-600" />
                  Thông tin phòng
                </h2>
                <div className="space-y-6">
                  {booking.rooms && booking.rooms.length > 0 ? (
                    booking.rooms.map((room: any, index: number) => (
                      <div key={room.roomId || index} className="border-b pb-4 mb-4 last:border-b-0 last:pb-0 last:mb-0">
                        <h3 className="font-semibold text-lg text-gray-800 mb-3">Phòng {index + 1}: {room.roomTypeName}</h3>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                              <Bed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-sm text-gray-500 mb-1">Loại phòng</p>
                                <p className="font-medium text-gray-900">{room.roomTypeName}</p>
                              </div>
                            </div>

                            {room.roomNumber && (
                              <div className="flex items-start gap-3">
                                <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Số phòng</p>
                                  <p className="font-medium text-gray-900">Phòng {room.roomNumber}</p>
                                </div>
                              </div>
                            )}

                            {room.capacity && (
                              <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Sức chứa</p>
                                  <p className="font-medium text-gray-900">{room.capacity} người</p>
                                </div>
                              </div>
                            )}

                            {room.bedType && (
                              <div className="flex items-start gap-3">
                                <Bed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Loại giường</p>
                                  <p className="font-medium text-gray-900">{room.bedType}</p>
                                </div>
                              </div>
                            )}

                            {room.pricePerNight && (
                              <div className="flex items-start gap-3">
                                <Wallet className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Giá mỗi đêm</p>
                                  <p className="font-medium text-gray-900">{formatCurrency(room.pricePerNight)}</p>
                                </div>
                              </div>
                            )}

                            {room.guestsCount && (
                              <div className="flex items-start gap-3">
                                <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <p className="text-sm text-gray-500 mb-1">Số khách</p>
                                  <p className="font-medium text-gray-900">{room.guestsCount} người</p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Room Amenities */}
                          {room.amenities && room.amenities.length > 0 && (
                            <div className="mt-4 border-t border-gray-200 pt-4">
                              <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                <Coffee className="w-4 h-4 text-blue-600" />
                                Tiện nghi phòng
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {room.amenities.map((amenity: any, amenityIdx: number) => {
                                  const facility = amenity.facility || amenity;
                                  const facilityName = facility?.name || amenity?.name || amenity;
                                  const facilityIcon = facility?.icon || amenity?.icon;
                                  
                                  return (
                                    <div key={amenityIdx} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                                      {facilityIcon ? (
                                        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
                                          {facilityIcon.length <= 3 ? (
                                            <span className="text-base">{facilityIcon}</span>
                                          ) : (
                                            <img src={facilityIcon} alt={facilityName} className="w-5 h-5" />
                                          )}
                                        </div>
                                      ) : (
                                        <Coffee className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                      )}
                                      <span className="text-sm font-medium text-gray-900">
                                        {facilityName}
                                      </span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    // Fallback: hiển thị thông tin phòng cũ nếu không có rooms array
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                          <Bed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-500 mb-1">Loại phòng</p>
                            <p className="font-medium text-gray-900">{booking.room_type_name || 'N/A'}</p>
                          </div>
                        </div>

                        {booking.room_number && (
                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Số phòng</p>
                              <p className="font-medium text-gray-900">Phòng {booking.room_number}</p>
                            </div>
                          </div>
                        )}

                        {booking.room_capacity && (
                          <div className="flex items-start gap-3">
                            <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Sức chứa</p>
                              <p className="font-medium text-gray-900">{booking.room_capacity} người</p>
                            </div>
                          </div>
                        )}

                        {booking.bed_type && (
                          <div className="flex items-start gap-3">
                            <Bed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Loại giường</p>
                              <p className="font-medium text-gray-900">{booking.bed_type}</p>
                            </div>
                          </div>
                        )}

                        {booking.room_area && (
                          <div className="flex items-start gap-3">
                            <Building2 className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-sm text-gray-500 mb-1">Diện tích</p>
                              <p className="font-medium text-gray-900">{booking.room_area} m²</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Booking Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Chi tiết đặt phòng
                </h2>
                <div className="space-y-4">
                  {/* Basic Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Số khách */}
                    {booking.guests_count && (
                      <div className="flex items-start gap-3">
                        <Users className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Số khách</p>
                          <p className="font-medium text-gray-900">{booking.guests_count} người</p>
                        </div>
                      </div>
                    )}

                    {/* Mã đặt chỗ */}
                    {(booking.booking_code || booking.booking_id) && (
                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mã đặt chỗ</p>
                          <p className="font-medium text-gray-900 font-mono">
                            {booking.booking_code || `BK${booking.booking_id?.slice(-8)?.padStart(8, '0')}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Loại phòng */}
                    {booking.room_type_name && (
                      <div className="flex items-start gap-3">
                        <Bed className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Loại phòng</p>
                          <p className="font-medium text-gray-900">{booking.room_type_name}</p>
                        </div>
                      </div>
                    )}

                    {/* Số lượng phòng */}
                    <div className="flex items-start gap-3">
                      <Home className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Số lượng phòng</p>
                        <p className="font-medium text-gray-900">
                          {booking.rooms && booking.rooms.length > 0 ? `${booking.rooms.length} phòng` : '1 phòng'}
                        </p>
                      </div>
                    </div>

                    {/* Ngày đặt */}
                    {booking.created_at && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ngày đặt</p>
                          <p className="font-medium text-gray-900">
                            {new Date(booking.created_at).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Số đêm */}
                    {!isDayUse && booking.nights_count && booking.nights_count > 0 && (
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Thời gian lưu trú</p>
                          <p className="font-medium text-gray-900">{booking.nights_count} đêm</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-4"></div>

                  {/* Check-in Information */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-600 rounded-full p-2 mt-0.5">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-900 mb-1">Check-in</p>
                        <p className="font-bold text-lg text-gray-900 mb-1">
                          {formatDate(booking.checkin_date)}
                        </p>
                        <p className="text-sm text-gray-700">
                          Lúc <span className="font-semibold text-blue-700">
                            {hotelDetails?.hotel?.checkin_time 
                              ? formatTime(hotelDetails.hotel.checkin_time, '14:00')
                              : isDayUse ? '12:00' : '14:00'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Check-out Information */}
                  <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-600 rounded-full p-2 mt-0.5">
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900 mb-1">Check-out</p>
                        <p className="font-bold text-lg text-gray-900 mb-1">
                          {formatDate(booking.checkout_date)}
                          {!isDayUse && booking.nights_count > 0 && (
                            <span className="text-gray-600 ml-2 text-base font-normal">({booking.nights_count} đêm)</span>
                          )}
                        </p>
                        <p className="text-sm text-gray-700">
                          Lúc <span className="font-semibold text-green-700">
                            {hotelDetails?.hotel?.checkout_time 
                              ? formatTime(hotelDetails.hotel.checkout_time, '12:00')
                              : isDayUse ? '18:00' : '12:00'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Wallet className="w-6 h-6 text-blue-600" />
                  Chi tiết thanh toán
                </h2>
                <div className="space-y-4">
                  {/* Payment Method & Status */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200">
                    {/* Payment Method */}
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phương thức thanh toán</p>
                        <p className="font-medium text-gray-900">
                          {(paymentInfo?.method || booking.payment_method) === 'VNPAY' ? 'VNPay' :
                           (paymentInfo?.method || booking.payment_method) === 'MOMO' ? 'MoMo' :
                           (paymentInfo?.method || booking.payment_method) === 'CASH' ? 'Tiền mặt' :
                           (paymentInfo?.method || booking.payment_method) ? 
                             String(paymentInfo?.method || booking.payment_method) : 'Chưa chọn'}
                        </p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className={`w-5 h-5 mt-0.5 flex-shrink-0 ${
                        booking.status === 'PAID' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                          ? 'text-green-600'
                          : booking.status === 'CANCELLED'
                          ? 'text-red-600'
                          : 'text-yellow-600'
                      }`} />
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Trạng thái thanh toán</p>
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm font-medium ${
                          booking.status === 'PAID' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : booking.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status === 'PAID' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
                            ? 'Đã thanh toán'
                            : booking.status === 'CANCELLED'
                            ? 'Đã hủy'
                            : booking.status === 'CREATED'
                            ? 'Chờ thanh toán'
                            : 'Chưa thanh toán'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    {/* Giá gốc (nếu có discount) */}
                    {booking.discount_amount && booking.discount_amount > 0 && booking.subtotal && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Giá gốc</span>
                        <span className="font-medium text-gray-500 line-through text-sm">
                          {formatCurrency(booking.subtotal + booking.discount_amount)}
                        </span>
                      </div>
                    )}

                    {/* Giá phòng */}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Giá phòng</span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(booking.subtotal || booking.total_amount)}
                      </span>
                    </div>

                    {/* Thuế & phí */}
                    {booking.tax_amount && booking.tax_amount > 0 && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Thuế & phí</span>
                        <span className="font-medium text-gray-900">{formatCurrency(booking.tax_amount)}</span>
                      </div>
                    )}

                    {/* Giảm giá */}
                    {booking.discount_amount && booking.discount_amount > 0 && (
                      <>
                        <div className="flex justify-between items-center text-green-600">
                          <span className="flex items-center gap-2">
                            <Tag className="w-4 h-4" />
                            Giảm giá
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Khuyến mãi
                            </span>
                          </span>
                          <span className="font-medium">-{formatCurrency(booking.discount_amount)}</span>
                        </div>
                        {/* Thông tin khuyến mãi */}
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Tag className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-green-900 mb-1">Chương trình khuyến mãi</p>
                              <p className="text-xs text-green-700">
                                Bạn đã tiết kiệm {formatCurrency(booking.discount_amount)} từ chương trình khuyến mãi của chúng tôi
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Tổng cộng */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Tổng cộng</span>
                        <div className="text-right">
                          {booking.discount_amount && booking.discount_amount > 0 && booking.subtotal && (
                            <p className="text-sm text-gray-500 line-through mb-1">
                              {formatCurrency((booking.subtotal + booking.discount_amount) + (booking.tax_amount || 0))}
                            </p>
                          )}
                          <span className="text-2xl font-bold text-blue-600">
                            {formatCurrency(booking.total_amount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Date */}
                  {booking.updated_at && (booking.status === 'PAID' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Thanh toán lúc: <span className="font-medium text-gray-900">
                            {new Date(booking.updated_at).toLocaleString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {booking.special_requests && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-600" />
                    Yêu cầu đặc biệt
                  </h2>
                  <p className="text-gray-700 whitespace-pre-wrap">{booking.special_requests}</p>
                </div>
              )}

            </div>

            {/* Booking Status Timeline - Progress Bar - Full Width at Bottom */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-6 h-6 text-blue-600" />
                Trạng thái đơn đặt chỗ
              </h2>
                {(() => {
                  // Define all possible status steps
                  const allSteps = [
                    { 
                      key: 'CREATED', 
                      label: 'Đã tạo đơn', 
                      icon: FileText,
                      description: 'Đơn đặt chỗ đã được tạo'
                    },
                    { 
                      key: 'PAID', 
                      label: 'Đã thanh toán', 
                      icon: CreditCard,
                      description: 'Đã hoàn tất thanh toán'
                    },
                    { 
                      key: 'CONFIRMED', 
                      label: 'Đã xác nhận', 
                      icon: CheckCircle2,
                      description: 'Khách sạn đã xác nhận đơn đặt chỗ'
                    },
                    { 
                      key: 'CHECKED_IN', 
                      label: 'Đã nhận phòng', 
                      icon: Calendar,
                      description: 'Đã check-in và nhận phòng'
                    },
                    { 
                      key: 'CHECKED_OUT', 
                      label: 'Đã trả phòng', 
                      icon: Calendar,
                      description: 'Đã check-out và trả phòng'
                    },
                    { 
                      key: 'COMPLETED', 
                      label: 'Hoàn thành', 
                      icon: CheckCircle2,
                      description: 'Chuyến đi đã hoàn thành'
                    }
                  ];

                  // Determine current status index (0-based, indicating which step is completed)
                  const getCompletedStepIndex = () => {
                    if (booking.status === 'CANCELLED') return -1; // Special case
                    const statusMap: { [key: string]: number } = {
                      'CREATED': 0,  // Step 0 (CREATED) is completed
                      'PAID': 1,     // Step 0, 1 (CREATED, PAID) are completed
                      'CONFIRMED': 2, // Step 0, 1, 2 are completed
                      'CHECKED_IN': 3,
                      'CHECKED_OUT': 4,
                      'COMPLETED': 5
                    };
                    return statusMap[booking.status] ?? 0;
                  };

                  const completedStepIndex = getCompletedStepIndex();
                  const isCancelled = booking.status === 'CANCELLED';

                  // Filter steps based on booking status - show completed + next 2 steps
                  let activeSteps = [];
                  if (isCancelled) {
                    // Show only CREATED step for cancelled bookings
                    activeSteps = allSteps.slice(0, 1);
                  } else {
                    // Show up to current completed step + next 2 pending steps (or until end)
                    const endIndex = Math.min(completedStepIndex + 3, allSteps.length);
                    activeSteps = allSteps.slice(0, endIndex);
                  }

                  // Calculate progress percentage
                  const progressPercentage = isCancelled 
                    ? 0 
                    : activeSteps.length > 0 
                      ? ((completedStepIndex + 1) / allSteps.length) * 100 
                      : 0;

                  return (
                    <div className="relative">
                      {/* Progress Bar Background */}
                      <div className="absolute top-6 left-0 right-0 h-1 bg-gray-200 rounded-full">
                        {/* Progress Fill */}
                        {!isCancelled && (
                          <div 
                            className="h-full bg-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        )}
                        {isCancelled && (
                          <div className="h-full bg-red-600 rounded-full w-full" />
                        )}
                      </div>

                      {/* Steps */}
                      <div className="relative flex justify-between">
                        {activeSteps.map((step, index) => {
                          const StepIcon = step.icon;
                          const isCompleted = !isCancelled && index <= completedStepIndex;
                          const isCurrent = !isCancelled && index === completedStepIndex + 1;

                          return (
                            <div key={step.key} className="flex flex-col items-center flex-1">
                              {/* Icon Circle */}
                              <div
                                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                                  isCancelled
                                    ? 'bg-red-100 border-red-500'
                                    : isCompleted
                                    ? 'bg-blue-600 border-blue-600 text-white'
                                    : isCurrent
                                    ? 'bg-yellow-400 border-yellow-400 text-white'
                                    : 'bg-white border-gray-300 text-gray-400'
                                }`}
                              >
                                <StepIcon className="w-6 h-6" />
                                {isCompleted && (
                                  <CheckCircle2 className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 text-white rounded-full border-2 border-white" />
                                )}
                              </div>
                              
                              {/* Label */}
                              <div className="mt-4 text-center max-w-[120px]">
                                <p
                                  className={`text-sm font-semibold ${
                                    isCancelled
                                      ? 'text-red-600'
                                      : isCompleted || isCurrent
                                      ? 'text-gray-900'
                                      : 'text-gray-500'
                                  }`}
                                >
                                  {step.label}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                                
                                {/* Status Date/Time */}
                                {(isCompleted || isCurrent) && booking.created_at && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    {index === 0 && formatDateTime(booking.created_at)}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}

                        {/* Cancelled Status (if applicable) */}
                        {isCancelled && (
                          <div className="flex flex-col items-center flex-1">
                            <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-4 bg-red-100 border-red-500">
                              <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                            <div className="mt-4 text-center max-w-[120px]">
                              <p className="text-sm font-semibold text-red-600">Đã hủy</p>
                              <p className="text-xs text-gray-500 mt-1">Đơn đặt chỗ đã bị hủy</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
            </div>

            {/* History and Actions - Full Width */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lịch sử */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Lịch sử
                </h3>
                <div className="space-y-4">
                  {/* Tạo đơn */}
                  <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                    <div className="w-2 h-2 rounded-full bg-blue-600 mt-2"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Tạo đơn đặt chỗ</p>
                      <p className="text-xs text-gray-500 mt-1">{formatDateTime(booking.created_at)}</p>
                    </div>
                  </div>

                  {/* Thanh toán */}
                  {(booking.status === 'PAID' || booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Xác nhận thanh toán</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.updated_at ? formatDateTime(booking.updated_at) : formatDateTime(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Xác nhận */}
                  {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                    <div className="flex items-start gap-3 pb-4 border-b border-gray-200">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Khách sạn xác nhận đơn đặt chỗ</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.updated_at ? formatDateTime(booking.updated_at) : formatDateTime(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hủy */}
                  {booking.status === 'CANCELLED' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-red-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Hủy đơn đặt chỗ</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.updated_at ? formatDateTime(booking.updated_at) : formatDateTime(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hoàn thành */}
                  {booking.status === 'COMPLETED' && (
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">Hoàn thành chuyến đi</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {booking.updated_at ? formatDateTime(booking.updated_at) : formatDateTime(booking.created_at)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Hotel Card - Like in Hotel List */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Khách sạn
                </h3>
                <div 
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (booking.checkin_date) params.set('checkIn', booking.checkin_date);
                    if (booking.checkout_date) params.set('checkOut', booking.checkout_date);
                    if (booking.guests_count) params.set('guests', booking.guests_count.toString());
                    params.set('rooms', '1');
                    navigate(`/hotel/${booking.hotel_id}?${params.toString()}`);
                  }}
                  className="bg-white rounded-lg border border-gray-200 hover:shadow-lg transition-all cursor-pointer overflow-hidden"
                >
                  {/* Hotel Image */}
                  <div className="relative h-48 overflow-hidden bg-gray-200">
                    <img
                      src={booking.hotel_main_image || hotelDetails?.hotel?.main_image || 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg'}
                      alt={booking.hotel_name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                    
                    {/* Rating Overlay */}
                    {hotelDetails?.hotel?.avg_rating && (
                      <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-3 py-2 rounded-md shadow-lg">
                        <div className="text-base font-bold text-gray-900">{hotelDetails.hotel.avg_rating}</div>
                        {hotelDetails.hotel.review_count && (
                          <div className="text-[11px] text-gray-600">
                            {hotelDetails.hotel.review_count} đánh giá
                          </div>
                        )}
                      </div>
                    )}
                    
                    {/* Star Rating */}
                    {hotelDetails?.hotel?.star_rating && (
                      <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm px-2 py-1.5 rounded-md shadow-lg flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="text-sm font-semibold text-gray-900">{hotelDetails.hotel.star_rating}</span>
                      </div>
                    )}
                  </div>

                  {/* Hotel Info */}
                  <div className="p-4">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">{booking.hotel_name}</h4>
                    
                    {booking.hotel_address && (
                      <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-2">{booking.hotel_address}</span>
                      </div>
                    )}

                    {/* Facilities */}
                    {hotelDetails?.hotel?.facilities && hotelDetails.hotel.facilities.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {hotelDetails.hotel.facilities.slice(0, 5).map((facility: any, idx: number) => (
                          <span 
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                          >
                            {facility.facility?.icon && facility.facility.icon.length <= 3 && (
                              <span>{facility.facility.icon}</span>
                            )}
                            {facility.facility?.name || facility.name}
                          </span>
                        ))}
                        {hotelDetails.hotel.facilities.length > 5 && (
                          <span className="inline-flex items-center px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md">
                            +{hotelDetails.hotel.facilities.length - 5} tiện nghi khác
                          </span>
                        )}
                      </div>
                    )}

                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
                      Xem chi tiết khách sạn
                    </button>
                  </div>
                </div>

                {/* Cancel Button */}
                {(booking.status === 'CREATED' || booking.status === 'PAID') && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full mt-4 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <X className="w-5 h-5" />
                    Hủy đơn đặt chỗ
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Xác nhận hủy đơn đặt chỗ</h3>
              <button
                onClick={() => setShowCancelModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Bạn có chắc chắn muốn hủy đơn đặt chỗ tại <strong>{booking.hotel_name}</strong>?
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
                onClick={() => setShowCancelModal(false)}
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

export default BookingDetailPage;

