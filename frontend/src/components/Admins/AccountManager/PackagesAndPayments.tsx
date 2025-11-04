import { useState, useEffect } from "react";
import { Package, Calendar, CreditCard, RefreshCw, X, DollarSign, CheckCircle, Clock, AlertCircle, Star, Trash2, Eye, Filter, Plus, Edit, Settings } from "lucide-react";
import Loading from "../../Loading";
import Toast from "../../Toast";
import { adminService } from "../../../services/adminService";

interface PackagesAndPaymentsProps {
  accountId: string;
  showHeader?: boolean;
}

interface CurrentPackage {
  package_id: string;
  display_name: string;
  name: string;
  price_monthly: number;
  price_yearly: number | null;
  description: string;
  features: string[];
  discount_percent: number;
  cashback_percent: number;
  priority_booking: boolean;
  free_cancellation_hours: number | null;
  vip_room_upgrade: boolean;
  welcome_voucher: number;
}

interface Subscription {
  subscription_id: string;
  package_id: string;
  package_name: string;
  display_name: string;
  status: "ACTIVE" | "CANCELLED" | "EXPIRED" | "SUSPENDED";
  start_date: string;
  end_date: string | null;
  payment_method: string | null;
  auto_renew: boolean;
  created_at: string;
}

interface PaymentCard {
  card_id: string;
  card_type: string;
  last_four_digits: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status: "ACTIVE" | "EXPIRED" | "DELETED";
}

interface Payment {
  payment_id: string;
  booking_id: string;
  booking_hotel_name?: string;
  method: "VNPAY" | "MOMO" | "CASH" | "BANK_TRANSFER";
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  amount_due: number;
  amount_paid: number;
  created_at: string;
  updated_at: string;
}

interface PackageOption {
  package_id: string;
  display_name: string;
  name: string;
  price_monthly: number;
  price_yearly: number | null;
  description: string;
  features: string[];
}

const PackagesAndPayments = ({ accountId, showHeader = true }: PackagesAndPaymentsProps) => {
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"package" | "subscriptions" | "cards" | "payments">("package");
  
  // Current Package & Subscription
  const [currentPackage, setCurrentPackage] = useState<CurrentPackage | null>(null);
  const [currentSubscription, setCurrentSubscription] = useState<Subscription | null>(null);
  
  // Subscriptions History
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  
  // Payment Cards
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showEditCardModal, setShowEditCardModal] = useState<PaymentCard | null>(null);
  
  // Payments
  const [payments, setPayments] = useState<Payment[]>([]);
  const [showPaymentDetail, setShowPaymentDetail] = useState<Payment | null>(null);
  const [paymentFilters, setPaymentFilters] = useState({
    status: "",
    method: "",
    dateFrom: "",
    dateTo: "",
  });
  
  // Package Options (for upgrade/downgrade)
  const [packageOptions, setPackageOptions] = useState<PackageOption[]>([]);
  const [showChangePackageModal, setShowChangePackageModal] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, [accountId]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [packageRes, subscriptionRes, cardsRes, paymentsRes] = await Promise.all([
        adminService.getAccountPackages(accountId),
        adminService.getAccountSubscriptions(accountId),
        adminService.getAccountPaymentCards(accountId),
        adminService.getAccountPayments(accountId, paymentFilters),
      ]);

      setCurrentPackage(packageRes.data.currentPackage);
      setCurrentSubscription(packageRes.data.currentSubscription);
      setSubscriptions(subscriptionRes.data || []);
      setPaymentCards(cardsRes.data || []);
      setPayments(paymentsRes.data || []);
    } catch (error) {
      console.error("Error fetching packages data:", error);
      showToast("error", "Lỗi khi tải thông tin gói và thanh toán");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      EXPIRED: "bg-gray-100 text-gray-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
      SUCCESS: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
      REFUNDED: "bg-blue-100 text-blue-800",
    };
    return (
      <span className={`px-3 py-1 text-xs font-medium rounded-full ${styles[status as keyof typeof styles] || styles.ACTIVE}`}>
        {status}
      </span>
    );
  };

  const getCardIcon = (cardType: string) => {
    const colors = {
      VISA: "text-blue-600",
      MASTERCARD: "text-red-600",
      AMEX: "text-green-600",
      JCB: "text-orange-600",
    };
    return colors[cardType as keyof typeof colors] || "text-gray-600";
  };

  const handleToggleAutoRenew = async () => {
    if (!currentSubscription) return;
    try {
      // TODO: Implement API call
      // await adminService.toggleSubscriptionAutoRenew(currentSubscription.subscription_id);
      setCurrentSubscription({
        ...currentSubscription,
        auto_renew: !currentSubscription.auto_renew,
      });
      showToast("success", `Đã ${currentSubscription.auto_renew ? "tắt" : "bật"} tự động gia hạn`);
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thay đổi cài đặt");
    }
  };

  const handleSetDefaultCard = async (cardId: string) => {
    try {
      // TODO: Implement API call
      // await adminService.setDefaultPaymentCard(cardId);
      setPaymentCards(cards =>
        cards.map(card => ({
          ...card,
          is_default: card.card_id === cardId,
        }))
      );
      showToast("success", "Đã đặt thẻ làm mặc định");
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi đặt thẻ mặc định");
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa thẻ này không?")) return;
    try {
      // TODO: Implement API call
      // await adminService.deletePaymentCard(cardId);
      setPaymentCards(cards => cards.filter(card => card.card_id !== cardId));
      showToast("success", "Đã xóa thẻ thanh toán");
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi xóa thẻ");
    }
  };

  const handleCancelSubscription = async () => {
    if (!currentSubscription) return;
    if (!confirm("Bạn có chắc chắn muốn hủy gói hiện tại không? Gói sẽ hết hạn vào ngày kết thúc.")) return;
    try {
      // TODO: Implement API call
      // await adminService.cancelSubscription(currentSubscription.subscription_id);
      setCurrentSubscription({
        ...currentSubscription,
        auto_renew: false,
        status: "CANCELLED",
      });
      showToast("success", "Đã hủy đăng ký gói");
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi hủy đăng ký");
    }
  };

  const handleChangePackage = async (newPackageId: string) => {
    try {
      // TODO: Implement API call
      // await adminService.changePackage(accountId, newPackageId);
      showToast("success", "Đã thay đổi gói thành công");
      setShowChangePackageModal(false);
      fetchAllData();
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Lỗi khi thay đổi gói");
    }
  };

  const isExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const daysUntilExpiry = Math.ceil(
      (new Date(endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isExpired = (endDate: string | null) => {
    if (!endDate) return false;
    return new Date(endDate).getTime() < new Date().getTime();
  };

  if (loading) {
    return <Loading message="Đang tải thông tin gói và thanh toán..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {showHeader && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-black">Quản lý Gói & Thanh toán</h2>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto">
          {[
            { id: "package" as const, label: "Gói hiện tại", icon: <Package size={18} /> },
            { id: "subscriptions" as const, label: "Lịch sử đăng ký", icon: <Calendar size={18} /> },
            { id: "cards" as const, label: "Thẻ thanh toán", icon: <CreditCard size={18} /> },
            { id: "payments" as const, label: "Lịch sử thanh toán", icon: <DollarSign size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-black text-black"
                  : "border-transparent text-gray-600 hover:text-black"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Current Package Tab */}
      {activeTab === "package" && currentPackage && currentSubscription && (
        <div className={`bg-gradient-to-r ${
          currentSubscription.status === "ACTIVE" 
            ? "from-blue-50 to-purple-50 border-blue-200" 
            : "from-gray-50 to-gray-100 border-gray-200"
        } border rounded-lg p-6`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Package className={currentSubscription.status === "ACTIVE" ? "text-blue-600" : "text-gray-600"} size={24} />
              <div>
                <h3 className="text-lg font-bold text-black">Gói tài khoản hiện tại</h3>
                {isExpiringSoon(currentSubscription.end_date) && (
                  <p className="text-xs text-yellow-600 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    Gói sẽ hết hạn trong {Math.ceil((new Date(currentSubscription.end_date!).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} ngày
                  </p>
                )}
                {isExpired(currentSubscription.end_date) && (
                  <p className="text-xs text-red-600 flex items-center gap-1 mt-1">
                    <AlertCircle size={12} />
                    Gói đã hết hạn
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(currentSubscription.status)}
              <button
                onClick={() => setShowChangePackageModal(true)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 text-sm"
              >
                Đổi gói
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Tên gói</p>
              <p className="text-xl font-bold text-black">{currentPackage.display_name}</p>
              <p className="text-sm text-gray-500 mt-1">{currentPackage.description}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Giá</p>
              <div className="flex items-baseline gap-2">
                <p className="text-xl font-bold text-black">{formatCurrency(currentPackage.price_monthly)}</p>
                <span className="text-sm text-gray-500">/tháng</span>
              </div>
              {currentPackage.price_yearly && (
                <p className="text-xs text-gray-500 mt-1">
                  Hoặc {formatCurrency(currentPackage.price_yearly)}/năm (Tiết kiệm {formatCurrency((currentPackage.price_monthly * 12) - currentPackage.price_yearly)})
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Ngày bắt đầu</p>
              <p className="text-sm font-medium text-black flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(currentSubscription.start_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Ngày kết thúc</p>
              <p className="text-sm font-medium text-black flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(currentSubscription.end_date)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Phương thức thanh toán</p>
              <p className="text-sm font-medium text-black">
                {currentSubscription.payment_method || "N/A"}
              </p>
            </div>
          </div>

          <div className="border-t border-blue-200 pt-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-black">Tự động gia hạn</p>
                  <p className="text-xs text-gray-600">
                    {currentSubscription.auto_renew 
                      ? "Gói sẽ tự động gia hạn khi hết hạn" 
                      : "Gói sẽ không tự động gia hạn"}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleAutoRenew}
                  className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
                    currentSubscription.auto_renew
                      ? "bg-green-100 text-green-800 hover:bg-green-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  {currentSubscription.auto_renew ? "Đang bật" : "Đang tắt"}
                </button>
                {currentSubscription.auto_renew && (
                  <button
                    onClick={handleCancelSubscription}
                    className="px-4 py-2 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    Hủy đăng ký
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Features */}
          {currentPackage.features && currentPackage.features.length > 0 && (
            <div className="border-t border-blue-200 pt-4 mt-4">
              <p className="text-sm font-medium text-black mb-2">Tính năng bao gồm:</p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {currentPackage.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
                    <CheckCircle size={14} className="text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Subscriptions History Tab */}
      {activeTab === "subscriptions" && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-bold text-black">Lịch sử đăng ký / gia hạn</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Mã subscription</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Gói</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày bắt đầu</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày kết thúc</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Phương thức thanh toán</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Tự động gia hạn</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      Chưa có lịch sử subscription
                    </td>
                  </tr>
                ) : (
                  subscriptions.map((sub) => (
                    <tr key={sub.subscription_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{sub.subscription_id}</td>
                      <td className="px-6 py-4 font-medium">{sub.display_name}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sub.start_date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{formatDate(sub.end_date)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{sub.payment_method || "N/A"}</td>
                      <td className="px-6 py-4">
                        {sub.auto_renew ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={14} />
                            Có
                          </span>
                        ) : (
                          <span className="text-gray-400">Không</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Payment Cards Tab */}
      {activeTab === "cards" && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-bold text-black">Thẻ thanh toán đã lưu</h3>
            <button
              onClick={() => setShowAddCardModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
            >
              <Plus size={16} />
              Thêm thẻ mới
            </button>
          </div>
          <div className="p-4">
            {paymentCards.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CreditCard size={48} className="mx-auto mb-4 text-gray-400" />
                <p>Chưa có thẻ thanh toán nào</p>
                <button
                  onClick={() => setShowAddCardModal(true)}
                  className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
                >
                  Thêm thẻ đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentCards.map((card) => (
                  <div
                    key={card.card_id}
                    className={`border-2 rounded-lg p-4 ${
                      card.is_default ? "border-black bg-gray-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <CreditCard className={`${getCardIcon(card.card_type)}`} size={24} />
                        <div>
                          <p className="font-medium text-black">{card.card_type}</p>
                          <p className="text-xs text-gray-500">**** **** **** {card.last_four_digits}</p>
                        </div>
                      </div>
                      {card.is_default && (
                        <span className="px-2 py-1 bg-black text-white text-xs font-medium rounded">Mặc định</span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Chủ thẻ:</span>
                        <span className="text-black">{card.cardholder_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Hết hạn:</span>
                        <span className="text-black">
                          {String(card.expiry_month).padStart(2, "0")}/{card.expiry_year}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Trạng thái:</span>
                        {getStatusBadge(card.status)}
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-200">
                      {!card.is_default && (
                        <button
                          onClick={() => handleSetDefaultCard(card.card_id)}
                          className="flex-1 px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors duration-200"
                        >
                          Đặt mặc định
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteCard(card.card_id)}
                        className="flex-1 px-3 py-2 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors duration-200"
                      >
                        <Trash2 size={14} className="inline mr-1" />
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Payment History Tab */}
      {activeTab === "payments" && (
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-black">Lịch sử thanh toán</h3>
            </div>
          </div>
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Trạng thái</label>
                <select
                  value={paymentFilters.status}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="SUCCESS">SUCCESS</option>
                  <option value="PENDING">PENDING</option>
                  <option value="FAILED">FAILED</option>
                  <option value="REFUNDED">REFUNDED</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Phương thức</label>
                <select
                  value={paymentFilters.method}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                >
                  <option value="">Tất cả</option>
                  <option value="VNPAY">VNPAY</option>
                  <option value="MOMO">MOMO</option>
                  <option value="CASH">CASH</option>
                  <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Từ ngày</label>
                <input
                  type="date"
                  value={paymentFilters.dateFrom}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Đến ngày</label>
                <input
                  type="date"
                  value={paymentFilters.dateTo}
                  onChange={(e) => setPaymentFilters({ ...paymentFilters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black text-sm"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Mã thanh toán</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Booking</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Khách sạn</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Số tiền</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Phương thức</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Trạng thái</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Ngày</th>
                  <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      Chưa có lịch sử thanh toán
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.payment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 font-mono text-sm">{payment.payment_id}</td>
                      <td className="px-6 py-4 font-mono text-sm text-blue-600">{payment.booking_id}</td>
                      <td className="px-6 py-4 text-sm">{payment.booking_hotel_name || "N/A"}</td>
                      <td className="px-6 py-4 font-medium">{formatCurrency(payment.amount_paid)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{payment.method}</td>
                      <td className="px-6 py-4">{getStatusBadge(payment.status)}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(payment.created_at).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => setShowPaymentDetail(payment)}
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
      )}

      {/* Change Package Modal */}
      {showChangePackageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowChangePackageModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Thay đổi gói tài khoản</h3>
              <button onClick={() => setShowChangePackageModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {packageOptions.map((pkg) => (
                <button
                  key={pkg.package_id}
                  onClick={() => handleChangePackage(pkg.package_id)}
                  disabled={pkg.package_id === currentPackage?.package_id}
                  className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                    pkg.package_id === currentPackage?.package_id
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-black"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="font-bold text-lg mb-2">{pkg.display_name}</div>
                  <div className="text-sm mb-2">{pkg.description}</div>
                  <div className="font-medium mb-2">
                    {pkg.price_monthly === 0 ? "Miễn phí" : formatCurrency(pkg.price_monthly) + "/tháng"}
                  </div>
                  <ul className="text-xs space-y-1 mt-2">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-1">
                        <CheckCircle size={12} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCardModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddCardModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Thêm thẻ thanh toán</h3>
              <button onClick={() => setShowAddCardModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <p className="text-gray-600 mb-4">
              Form thêm thẻ sẽ được hiển thị sau khi liên kết với backend API.
            </p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddCardModal(false)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Detail Modal */}
      {showPaymentDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowPaymentDetail(null)}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Chi tiết thanh toán</h3>
              <button onClick={() => setShowPaymentDetail(null)} className="p-2 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã thanh toán</p>
                  <p className="font-mono font-medium">{showPaymentDetail.payment_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mã booking</p>
                  <p className="font-mono font-medium">{showPaymentDetail.booking_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số tiền phải trả</p>
                  <p className="font-medium text-lg">{formatCurrency(showPaymentDetail.amount_due)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Số tiền đã trả</p>
                  <p className="font-medium text-lg">{formatCurrency(showPaymentDetail.amount_paid)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Phương thức</p>
                  <p className="font-medium">{showPaymentDetail.method}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                  {getStatusBadge(showPaymentDetail.status)}
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày tạo</p>
                  <p>{new Date(showPaymentDetail.created_at).toLocaleString("vi-VN")}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ngày cập nhật</p>
                  <p>{new Date(showPaymentDetail.updated_at).toLocaleString("vi-VN")}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowPaymentDetail(null)}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200"
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

export default PackagesAndPayments;

