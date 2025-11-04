import { useState, useEffect } from "react";
import { Eye, Filter, Calendar, DollarSign, Hotel, X } from "lucide-react";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface AccountBookingsTabProps {
  accountId: string;
}

const AccountBookingsTab = ({ accountId }: AccountBookingsTabProps) => {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    fetchBookings();
  }, [accountId, filters]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccountBookings(accountId, {
        ...filters,
        page: 1,
        limit: 100,
      });
      setBookings(response.data || []);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingDetail = async (bookingId: string) => {
    try {
      const response = await adminService.getBookingDetail(bookingId);
      setSelectedBooking(response.data);
      setShowDetailModal(true);
    } catch (error) {
      console.error("Error fetching booking detail:", error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      CREATED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      PAID: "bg-purple-100 text-purple-800",
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.CREATED}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return <Loading message="Đang tải danh sách booking..." />;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-3 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="text-sm font-medium text-gray-700">Bộ lọc</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            >
              <option value="">Tất cả</option>
              <option value="CREATED">CREATED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="PAID">PAID</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Từ ngày</label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1.5">Đến ngày</label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
            />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Mã booking</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Tên khách sạn</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày đặt</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Tổng tiền</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Thanh toán</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có booking nào.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.booking_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-mono text-sm">{booking.booking_id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Hotel size={16} className="text-gray-400" />
                        <span className="text-sm">{booking.hotel_name || "N/A"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(booking.created_at).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 font-medium">{formatCurrency(booking.total_amount || 0)}</td>
                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{booking.payment_method || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => fetchBookingDetail(booking.booking_id)}
                        className="p-2 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="Xem chi tiết"
                      >
                        <Eye size={16} className="text-blue-600" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {showDetailModal && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowDetailModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-black">Chi tiết Booking</h3>
              <button onClick={() => setShowDetailModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Booking Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Mã booking</p>
                    <p className="font-mono font-medium text-lg">{selectedBooking.booking_id}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Trạng thái</p>
                    <div className="mt-1">{getStatusBadge(selectedBooking.status)}</div>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Khách sạn</p>
                    <p className="font-medium flex items-center gap-2">
                      <Hotel size={16} className="text-gray-400" />
                      {selectedBooking.hotel_name}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Ngày đặt</p>
                    <p className="text-sm">{new Date(selectedBooking.created_at).toLocaleString("vi-VN")}</p>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              {selectedBooking.booking_details && selectedBooking.booking_details.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Chi tiết phòng</h4>
                  <div className="space-y-4">
                    {selectedBooking.booking_details.map((detail: any) => (
                      <div key={detail.booking_detail_id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="font-medium text-black">{detail.room_name}</p>
                            {detail.room_type && (
                              <p className="text-xs text-gray-500">{detail.room_type}</p>
                            )}
                          </div>
                          <p className="font-medium">{formatCurrency(detail.total_price)}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Check-in</p>
                            <p className="font-medium">
                              {new Date(detail.checkin_date).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Check-out</p>
                            <p className="font-medium">
                              {new Date(detail.checkout_date).toLocaleDateString("vi-VN")}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Số đêm</p>
                            <p className="font-medium">{detail.nights_count} đêm</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-600 mb-1">Số khách</p>
                            <p className="font-medium">{detail.guests_count} người</p>
                          </div>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Giá / đêm:</span>
                            <span className="font-medium">{formatCurrency(detail.price_per_night)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Payment Info */}
              {selectedBooking.payment_id && (
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Thông tin thanh toán</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã thanh toán:</span>
                      <span className="font-mono font-medium">{selectedBooking.payment_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phương thức:</span>
                      <span className="font-medium">{selectedBooking.payment_method || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Trạng thái thanh toán:</span>
                      <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                        selectedBooking.payment_status === "SUCCESS" ? "bg-green-100 text-green-800" :
                        selectedBooking.payment_status === "FAILED" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {selectedBooking.payment_status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền phải trả:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.amount_due || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Số tiền đã trả:</span>
                      <span className="font-medium">{formatCurrency(selectedBooking.amount_paid || 0)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Pricing Breakdown */}
              <div>
                <h4 className="text-lg font-bold text-black mb-4">Chi tiết giá</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tổng phụ:</span>
                    <span className="font-medium">{formatCurrency(selectedBooking.subtotal || 0)}</span>
                  </div>
                  {selectedBooking.discount_amount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm giá:</span>
                      <span className="font-medium">-{formatCurrency(selectedBooking.discount_amount)}</span>
                    </div>
                  )}
                  {selectedBooking.discount_code && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Mã giảm giá:</span>
                      <span className="font-mono">{selectedBooking.discount_code}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Thuế (10%):</span>
                    <span className="font-medium">{formatCurrency(selectedBooking.tax_amount || 0)}</span>
                  </div>
                  <div className="pt-2 border-t border-gray-300 flex justify-between font-bold text-lg">
                    <span>Tổng cộng:</span>
                    <span className="text-black">{formatCurrency(selectedBooking.total_amount || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.special_requests && (
                <div>
                  <h4 className="text-lg font-bold text-black mb-4">Yêu cầu đặc biệt</h4>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700">{selectedBooking.special_requests}</p>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>Ngày tạo: {new Date(selectedBooking.created_at).toLocaleString("vi-VN")}</p>
                {selectedBooking.updated_at && (
                  <p>Cập nhật lần cuối: {new Date(selectedBooking.updated_at).toLocaleString("vi-VN")}</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountBookingsTab;

