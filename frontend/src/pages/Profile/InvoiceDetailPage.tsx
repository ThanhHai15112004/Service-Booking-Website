import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { getBookingById } from '../../services/bookingService';
import { getHotelDetail } from '../../services/hotelService';
import api from '../../api/axiosClient';
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  Building2,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Users,
  Bed
} from 'lucide-react';

function InvoiceDetailPage() {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState<any>(null);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (bookingId) {
      loadInvoiceData();
      // Nếu có query param download=true, tự động download PDF
      if (searchParams.get('download') === 'true') {
        setTimeout(() => handleDownloadPDF(), 1000);
      }
    }
  }, [bookingId, searchParams]);

  const loadInvoiceData = async () => {
    if (!bookingId) return;

    try {
      setLoading(true);
      
      // Load booking info
      const bookingResponse = await getBookingById(bookingId);
      if (bookingResponse.success && bookingResponse.data) {
        setBooking(bookingResponse.data);
        
        // Load payment info
        try {
          const paymentResponse = await api.get(`/api/payments/booking/${bookingId}`);
          if (paymentResponse.data.success && paymentResponse.data.data) {
            setPaymentInfo(paymentResponse.data.data);
          }
        } catch (paymentErr) {
          console.error('Error loading payment info:', paymentErr);
        }
        
        // Load hotel details
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
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDownloadPDF = async () => {
    if (!bookingId) return;
    
    try {
      // Gọi API để verify (tạm thời, PDF generation sẽ implement sau)
      const response = await api.get(`/api/invoices/${bookingId}/download`);
      
      // Hiện tại sử dụng window.print() để in/tải PDF
      // Có thể implement PDF generation bằng jspdf hoặc backend sau
      window.print();
    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      // Fallback: In trang hiện tại
      alert('Đang sử dụng chức năng in trình duyệt. Vui lòng chọn "Lưu dưới dạng PDF" trong hộp thoại in.');
      window.print();
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-gray-500">Đang tải hóa đơn...</p>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!booking) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center py-12">
              <p className="text-red-600">Không tìm thấy hóa đơn</p>
              <button
                onClick={() => navigate('/bookings')}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
              >
                Quay lại
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  const bookingCode = booking.booking_code || `BK${bookingId?.slice(-8)?.padStart(8, '0')}`;
  const invoiceDate = booking.created_at || new Date().toISOString();
  const paymentMethod = paymentInfo?.method || booking.payment_method || 'CASH';
  const paymentMethodText = paymentMethod === 'VNPAY' ? 'VNPay' :
                            paymentMethod === 'MOMO' ? 'MoMo' :
                            paymentMethod === 'CASH' ? 'Tiền mặt' :
                            paymentMethod === 'BANK_TRANSFER' ? 'Chuyển khoản' : paymentMethod;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header Actions */}
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={() => navigate('/bookings')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4" />
              Tải PDF
            </button>
          </div>

          {/* Invoice Content - Printable */}
          <div className="bg-white rounded-xl shadow-sm p-8 print:shadow-none">
            {/* Invoice Header */}
            <div className="border-b-2 border-gray-200 pb-6 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">HÓA ĐƠN</h1>
                  <p className="text-gray-600">Mã đơn: <span className="font-semibold">{bookingCode}</span></p>
                </div>
                <div className="text-right">
                  <FileText className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Ngày xuất: {formatDate(invoiceDate)}</p>
                </div>
              </div>
            </div>

            {/* Hotel Info */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start gap-3 mb-4">
                <Building2 className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">
                    {booking.hotel_name || hotelDetails?.hotel?.name}
                  </h2>
                  {booking.hotel_address && (
                    <div className="flex items-start gap-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{booking.hotel_address}</span>
                    </div>
                  )}
                  {booking.hotel_phone && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Phone className="w-4 h-4" />
                      <span>{booking.hotel_phone}</span>
                    </div>
                  )}
                  {booking.hotel_email && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Mail className="w-4 h-4" />
                      <span>{booking.hotel_email}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết đặt phòng</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <Bed className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Loại phòng</p>
                    <p className="font-semibold text-gray-900">{booking.room_type_name}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Số khách</p>
                    <p className="font-semibold text-gray-900">{booking.guests_count || 1} khách</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Nhận phòng</p>
                    <p className="font-semibold text-gray-900">{formatDate(booking.checkin_date)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Trả phòng</p>
                    <p className="font-semibold text-gray-900">{formatDate(booking.checkout_date)}</p>
                    {booking.nights_count > 0 && (
                      <p className="text-xs text-gray-500">({booking.nights_count} đêm)</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Details */}
            <div className="mb-6 pb-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Chi tiết thanh toán</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Phương thức thanh toán:</span>
                  <span className="font-semibold text-gray-900">{paymentMethodText}</span>
                </div>
                {booking.subtotal && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Giá phòng:</span>
                    <span className="text-gray-900">{formatCurrency(booking.subtotal)}</span>
                  </div>
                )}
                {booking.tax_amount && booking.tax_amount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế & phí:</span>
                    <span className="text-gray-900">{formatCurrency(booking.tax_amount)}</span>
                  </div>
                )}
                {booking.discount_amount && booking.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Giảm giá:</span>
                    <span>-{formatCurrency(booking.discount_amount)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Total */}
            <div className="mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-bold text-gray-900">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {formatCurrency(booking.total_amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
              <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
              <p className="mt-2">Hóa đơn được tạo tự động vào {formatDateTime(invoiceDate)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .bg-gray-50, .bg-white {
            background: white !important;
          }
          .max-w-4xl, .max-w-4xl * {
            visibility: visible;
          }
          .max-w-4xl {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          button {
            display: none !important;
          }
        }
      `}</style>
    </MainLayout>
  );
}

export default InvoiceDetailPage;

