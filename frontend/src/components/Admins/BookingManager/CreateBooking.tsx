import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, Calendar, User, Hotel, Bed, DollarSign, CreditCard, Save, X, ChevronLeft, ChevronRight, CheckCircle, AlertCircle } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface HotelOption {
  hotel_id: string;
  name: string;
}

interface RoomTypeOption {
  room_type_id: string;
  name: string;
  hotel_id: string;
  price_base: number;
  available_rooms: number;
}

interface RoomOption {
  room_id: string;
  room_number: string;
  room_type_id: string;
}

interface AccountOption {
  account_id: string;
  full_name: string;
  email: string;
  phone?: string;
}

const CreateBooking = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  // Form state
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    account_id: "",
    customer_name: "",
    customer_email: "",
    customer_phone: "",
    hotel_id: "",
    check_in: "",
    check_out: "",
    guest_count: 2,
    special_requests: "",
    payment_method: "CASH",
    skip_availability_check: false,
  });

  const [selectedRooms, setSelectedRooms] = useState<Array<{
    room_type_id: string;
    room_id: string;
    price_per_night: number;
    nights: number;
  }>>([]);

  // Options
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeOption[]>([]);
  const [rooms, setRooms] = useState<RoomOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [searchAccountTerm, setSearchAccountTerm] = useState("");

  useEffect(() => {
    fetchHotels();
    fetchAccounts();
  }, []);

  useEffect(() => {
    if (form.hotel_id) {
      fetchRoomTypes();
    }
  }, [form.hotel_id]);

  useEffect(() => {
    if (form.check_in && form.check_out) {
      calculateNights();
    }
  }, [form.check_in, form.check_out]);

  const fetchHotels = async () => {
    try {
      // TODO: API call
      setTimeout(() => {
        setHotels([
          { hotel_id: "H001", name: "Hanoi Old Quarter Hotel" },
          { hotel_id: "H002", name: "My Khe Beach Resort" },
          { hotel_id: "H003", name: "Saigon Riverside Hotel" },
          { hotel_id: "H004", name: "Sofitel Metropole" },
        ]);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách khách sạn");
    }
  };

  const fetchRoomTypes = async () => {
    setLoading(true);
    try {
      // TODO: API call với hotel_id và check-in/out dates
      setTimeout(() => {
        setRoomTypes([
          { room_type_id: "RT001", name: "Deluxe Sea View", hotel_id: form.hotel_id, price_base: 2500000, available_rooms: 5 },
          { room_type_id: "RT002", name: "Executive Suite", hotel_id: form.hotel_id, price_base: 3500000, available_rooms: 3 },
        ]);
        setLoading(false);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải loại phòng");
      setLoading(false);
    }
  };

  const fetchRooms = async (roomTypeId: string) => {
    try {
      // TODO: API call
      setTimeout(() => {
        setRooms([
          { room_id: "R001", room_number: "101", room_type_id: roomTypeId },
          { room_id: "R002", room_number: "102", room_type_id: roomTypeId },
          { room_id: "R003", room_number: "201", room_type_id: roomTypeId },
        ]);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách phòng");
    }
  };

  const fetchAccounts = async () => {
    try {
      // TODO: API call
      setTimeout(() => {
        setAccounts([
          { account_id: "ACC001", full_name: "Nguyễn Văn A", email: "nguyenvana@email.com", phone: "0901234567" },
          { account_id: "ACC002", full_name: "Trần Thị B", email: "tranthib@email.com", phone: "0901234568" },
        ]);
      }, 300);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải danh sách tài khoản");
    }
  };

  const calculateNights = () => {
    if (form.check_in && form.check_out) {
      const checkIn = new Date(form.check_in);
      const checkOut = new Date(form.check_out);
      const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? diffDays : 1;
    }
    return 1;
  };

  const handleAddRoom = (roomTypeId: string, roomId: string, pricePerNight: number) => {
    const nights = calculateNights();
    setSelectedRooms([
      ...selectedRooms,
      {
        room_type_id: roomTypeId,
        room_id: roomId,
        price_per_night: pricePerNight,
        nights: nights,
      },
    ]);
    setRooms([]);
  };

  const handleRemoveRoom = (index: number) => {
    setSelectedRooms(selectedRooms.filter((_, i) => i !== index));
  };

  const handleSelectAccount = (account: AccountOption) => {
    setForm({
      ...form,
      account_id: account.account_id,
      customer_name: account.full_name,
      customer_email: account.email,
      customer_phone: account.phone || "",
    });
    setSearchAccountTerm("");
  };

  const handleSubmit = async () => {
    if (!form.account_id || !form.hotel_id || selectedRooms.length === 0) {
      showToast("error", "Vui lòng điền đầy đủ thông tin");
      return;
    }

    setSubmitting(true);
    try {
      // TODO: API call
      showToast("success", "Tạo booking thành công");
      setTimeout(() => navigate("/admin/bookings"), 1500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tạo booking");
      setSubmitting(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredAccounts = accounts.filter(
    (account) =>
      account.full_name.toLowerCase().includes(searchAccountTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchAccountTerm.toLowerCase())
  );

  const totalAmount = selectedRooms.reduce((sum, room) => sum + room.price_per_night * room.nights, 0);

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}
      {loading && <Loading message="Đang tải dữ liệu..." />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tạo booking thủ công</h1>
          <p className="text-gray-600 mt-1">Tạo đặt phòng cho khách hàng offline</p>
        </div>
        <button
          onClick={() => navigate("/admin/bookings")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <X size={20} />
          Hủy
        </button>
      </div>

      {/* Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          {[1, 2, 3, 4].map((stepNum) => (
            <div key={stepNum} className="flex items-center flex-1">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step >= stepNum ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-600"
              }`}>
                {step > stepNum ? <CheckCircle size={20} /> : stepNum}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${step >= stepNum ? "text-blue-600" : "text-gray-600"}`}>
                  {stepNum === 1 && "Thông tin khách"}
                  {stepNum === 2 && "Chọn phòng"}
                  {stepNum === 3 && "Thanh toán"}
                  {stepNum === 4 && "Xác nhận"}
                </p>
              </div>
              {stepNum < 4 && (
                <div className={`flex-1 h-1 mx-4 ${step > stepNum ? "bg-blue-600" : "bg-gray-200"}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: Customer Information */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <User className="text-blue-600" size={24} />
            Thông tin khách hàng
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tìm kiếm tài khoản</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchAccountTerm}
                  onChange={(e) => setSearchAccountTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              {searchAccountTerm && filteredAccounts.length > 0 && (
                <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-y-auto">
                  {filteredAccounts.map((account) => (
                    <button
                      key={account.account_id}
                      onClick={() => handleSelectAccount(account)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                    >
                      <p className="font-medium text-gray-900">{account.full_name}</p>
                      <p className="text-sm text-gray-600">{account.email}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên khách hàng *</label>
                <input
                  type="text"
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={form.customer_email}
                  onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input
                  type="tel"
                  value={form.customer_phone}
                  onChange={(e) => setForm({ ...form, customer_phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setStep(2)}
                disabled={!form.customer_name || !form.customer_email}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Select Rooms */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <Bed className="text-green-600" size={24} />
            Chọn phòng
          </h2>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn *</label>
                <select
                  value={form.hotel_id}
                  onChange={(e) => setForm({ ...form, hotel_id: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Chọn khách sạn</option>
                  {hotels.map((hotel) => (
                    <option key={hotel.hotel_id} value={hotel.hotel_id}>
                      {hotel.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số khách</label>
                <input
                  type="number"
                  value={form.guest_count}
                  onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) })}
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-in *</label>
                <input
                  type="date"
                  value={form.check_in}
                  onChange={(e) => setForm({ ...form, check_in: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check-out *</label>
                <input
                  type="date"
                  value={form.check_out}
                  onChange={(e) => setForm({ ...form, check_out: e.target.value })}
                  min={form.check_in}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
            </div>

            {/* Room Types */}
            {form.hotel_id && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Loại phòng có sẵn</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomTypes.map((roomType) => (
                    <div
                      key={roomType.room_type_id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{roomType.name}</p>
                          <p className="text-sm text-gray-600">{roomType.available_rooms} phòng có sẵn</p>
                        </div>
                        <p className="font-bold text-blue-600">{new Intl.NumberFormat("vi-VN").format(roomType.price_base)} VNĐ/đêm</p>
                      </div>
                      <button
                        onClick={() => fetchRooms(roomType.room_type_id)}
                        className="w-full mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Chọn phòng
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Room Selection Modal */}
            {rooms.length > 0 && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Chọn phòng</h3>
                    <button onClick={() => setRooms([])} className="text-gray-400 hover:text-gray-600">
                      <X size={24} />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {rooms.map((room) => {
                      const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                      return (
                        <button
                          key={room.room_id}
                          onClick={() => handleAddRoom(room.room_type_id, room.room_id, roomType?.price_base || 0)}
                          className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                        >
                          <p className="font-medium text-gray-900">Phòng {room.room_number}</p>
                          <p className="text-sm text-gray-600">{roomType?.name}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Selected Rooms */}
            {selectedRooms.length > 0 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Phòng đã chọn</h3>
                <div className="space-y-2">
                  {selectedRooms.map((room, index) => {
                    const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                    const roomOption = rooms.find((r) => r.room_id === room.room_id);
                    return (
                      <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{roomType?.name} - Phòng {roomOption?.room_number}</p>
                          <p className="text-sm text-gray-600">
                            {formatPrice(room.price_per_night)} VNĐ/đêm × {room.nights} đêm = {formatPrice(room.price_per_night * room.nights)} VNĐ
                          </p>
                        </div>
                        <button
                          onClick={() => handleRemoveRoom(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedRooms.length === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CreditCard className="text-purple-600" size={24} />
            Thông tin thanh toán
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phương thức thanh toán *</label>
              <select
                value={form.payment_method}
                onChange={(e) => setForm({ ...form, payment_method: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              >
                <option value="CASH">Tiền mặt</option>
                <option value="BANK">Chuyển khoản</option>
                <option value="VNPAY">VNPAY</option>
                <option value="MOMO">MOMO</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Yêu cầu đặc biệt</label>
              <textarea
                value={form.special_requests}
                onChange={(e) => setForm({ ...form, special_requests: e.target.value })}
                placeholder="Nhập yêu cầu đặc biệt từ khách hàng..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg h-24 resize-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="skipAvailability"
                checked={form.skip_availability_check}
                onChange={(e) => setForm({ ...form, skip_availability_check: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="skipAvailability" className="text-sm text-gray-700">
                Bỏ qua kiểm tra availability (overbooking)
              </label>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalAmount)} VNĐ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={() => setStep(4)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Xem lại
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Confirm */}
      {step === 4 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Xác nhận thông tin
          </h2>
          <div className="space-y-6">
            {/* Customer Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin khách hàng</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Tên:</span> {form.customer_name}</p>
                <p><span className="font-medium">Email:</span> {form.customer_email}</p>
                {form.customer_phone && <p><span className="font-medium">SĐT:</span> {form.customer_phone}</p>}
              </div>
            </div>

            {/* Booking Info */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Thông tin booking</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><span className="font-medium">Khách sạn:</span> {hotels.find(h => h.hotel_id === form.hotel_id)?.name}</p>
                <p><span className="font-medium">Check-in:</span> {form.check_in}</p>
                <p><span className="font-medium">Check-out:</span> {form.check_out}</p>
                <p><span className="font-medium">Số khách:</span> {form.guest_count}</p>
              </div>
            </div>

            {/* Rooms */}
            <div>
              <h3 className="font-medium text-gray-900 mb-3">Phòng đã chọn</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                {selectedRooms.map((room, index) => {
                  const roomType = roomTypes.find((rt) => rt.room_type_id === room.room_type_id);
                  return (
                    <p key={index}>
                      {roomType?.name} - {formatPrice(room.price_per_night * room.nights)} VNĐ
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Total */}
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex justify-between text-xl font-bold text-blue-900">
                <span>Tổng cộng:</span>
                <span>{formatPrice(totalAmount)} VNĐ</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={18} />
                {submitting ? "Đang tạo..." : "Tạo booking"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("vi-VN").format(price);
};

export default CreateBooking;
