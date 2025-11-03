import { useState, useEffect } from 'react';
import { Plus, CreditCard, Trash2, Eye, Download, CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useNavigate } from 'react-router-dom';
import { 
  getPaymentCards, 
  createPaymentCard, 
  deletePaymentCard, 
  setDefaultPaymentCard 
} from '../../services/profileService';

interface PaymentBillingTabProps {
  bookings?: any[];
}

interface PaymentCard {
  card_id: string;
  card_type: string;
  last_four_digits: string;
  cardholder_name: string;
  expiry_month: number;
  expiry_year: number;
  is_default: boolean;
  status: string;
}

export default function PaymentBillingTab({ bookings = [] }: PaymentBillingTabProps) {
  const navigate = useNavigate();
  const [showAddCard, setShowAddCard] = useState(false);
  const [paymentCards, setPaymentCards] = useState<PaymentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    card_number: '',
    card_type: 'VISA',
    cardholder_name: '',
    expiry_month: '',
    expiry_year: '',
    cvv: '',
    is_default: false
  });

  // Load payment cards
  useEffect(() => {
    loadCards();
  }, []);

  const loadCards = async () => {
    setLoading(true);
    try {
      const response = await getPaymentCards();
      if (response.success && response.data) {
        // Ensure is_default is boolean, not 0/1
        const normalizedCards = response.data.map((card: any) => ({
          ...card,
          is_default: Boolean(card.is_default === 1 || card.is_default === true)
        }));
        setPaymentCards(normalizedCards);
      }
    } catch (error) {
      console.error('Error loading cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
    // Format với khoảng trắng mỗi 4 số
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = value;
    
    // Auto detect card type from first digit
    const firstDigit = value.replace(/\s/g, '')[0];
    if (firstDigit === '4') {
      setFormData({ ...formData, card_type: 'VISA', card_number: value });
    } else if (firstDigit === '5' || firstDigit === '2') {
      setFormData({ ...formData, card_type: 'MASTERCARD', card_number: value });
    } else if (firstDigit === '3') {
      setFormData({ ...formData, card_type: 'AMEX', card_number: value });
    } else {
      setFormData({ ...formData, card_number: value });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    e.target.value = value;
    const [month, year] = value.split('/');
    setFormData({ ...formData, expiry_month: month || '', expiry_year: year || '' });
  };

  const handleSaveCard = async () => {
    const cardNumber = formData.card_number.replace(/\s/g, '');
    const lastFour = cardNumber.slice(-4);
    
    if (!cardNumber || cardNumber.length < 13) {
      alert('Số thẻ không hợp lệ');
      return;
    }

    if (!formData.cardholder_name) {
      alert('Vui lòng nhập tên chủ thẻ');
      return;
    }

    if (!formData.expiry_month || !formData.expiry_year) {
      alert('Vui lòng nhập ngày hết hạn');
      return;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      alert('CVV không hợp lệ');
      return;
    }

    try {
      const response = await createPaymentCard({
        card_type: formData.card_type,
        last_four_digits: lastFour,
        cardholder_name: formData.cardholder_name,
        expiry_month: parseInt(formData.expiry_month),
        expiry_year: 2000 + parseInt(formData.expiry_year), // Convert YY to YYYY
        is_default: formData.is_default
      });

      if (response.success) {
        await loadCards();
        setShowAddCard(false);
        setFormData({
          card_number: '',
          card_type: 'VISA',
          cardholder_name: '',
          expiry_month: '',
          expiry_year: '',
          cvv: '',
          is_default: false
        });
        alert('Thêm thẻ thành công!');
      } else {
        alert(response.message || 'Thêm thẻ thất bại');
      }
    } catch (error) {
      console.error('Error saving card:', error);
      alert('Có lỗi xảy ra khi thêm thẻ');
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa thẻ này?')) return;
    
    try {
      const response = await deletePaymentCard(cardId);
      if (response.success) {
        await loadCards();
        alert('Xóa thẻ thành công!');
      } else {
        alert(response.message || 'Xóa thẻ thất bại');
      }
    } catch (error) {
      console.error('Error deleting card:', error);
      alert('Có lỗi xảy ra khi xóa thẻ');
    }
  };

  const handleSetDefault = async (cardId: string) => {
    try {
      const response = await setDefaultPaymentCard(cardId);
      if (response.success) {
        await loadCards();
      } else {
        alert(response.message || 'Đặt thẻ mặc định thất bại');
      }
    } catch (error) {
      console.error('Error setting default card:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const formatExpiry = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  // Mock invoices - sẽ được thay thế bằng API call
  const invoices = bookings?.slice(0, 5).map((booking: any) => ({
    id: booking.booking_id,
    code: booking.booking_code || `BK${booking.booking_id?.slice(-8)?.padStart(8, '0')}`,
    date: booking.created_at,
    amount: booking.total_amount,
    status: booking.status,
    hotelName: booking.hotel_name
  })) || [];

  return (
    <div className="space-y-6">
      {/* Payment Methods Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Phương thức thanh toán</h2>
          <button
            onClick={() => setShowAddCard(!showAddCard)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm thẻ mới
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Đang tải thẻ...</p>
          </div>
        ) : paymentCards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentCards.map((card) => (
              <div key={card.card_id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-8 rounded flex items-center justify-center text-white font-bold text-xs ${
                      card.card_type === 'VISA' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      card.card_type === 'MASTERCARD' ? 'bg-gradient-to-r from-red-500 to-orange-500' :
                      card.card_type === 'AMEX' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
                      'bg-gradient-to-r from-purple-500 to-purple-600'
                    }`}>
                      {card.card_type}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">•••• •••• •••• {card.last_four_digits}</p>
                      <p className="text-sm text-gray-500">{card.cardholder_name}</p>
                    </div>
                  </div>
                  {card.is_default && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                      Mặc định
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Hết hạn: {formatExpiry(card.expiry_month, card.expiry_year)}</p>
                  <div className="flex gap-2">
                    {!card.is_default && (
                      <button 
                        onClick={() => handleSetDefault(card.card_id)}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Đặt mặc định
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeleteCard(card.card_id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">Bạn chưa có phương thức thanh toán nào</p>
            <button
              onClick={() => setShowAddCard(true)}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Thêm thẻ ngay
            </button>
          </div>
        )}

        {/* Add Card Form */}
        {showAddCard && (
          <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Thêm thẻ mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Số thẻ *</label>
                <input
                  type="text"
                  maxLength={19}
                  placeholder="1234 5678 9012 3456"
                  onChange={handleCardNumberChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loại thẻ</label>
                <select
                  value={formData.card_type}
                  onChange={(e) => setFormData({ ...formData, card_type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="VISA">VISA</option>
                  <option value="MASTERCARD">Mastercard</option>
                  <option value="AMEX">American Express</option>
                  <option value="JCB">JCB</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tên chủ thẻ *</label>
                <input
                  type="text"
                  value={formData.cardholder_name}
                  onChange={(e) => setFormData({ ...formData, cardholder_name: e.target.value.toUpperCase() })}
                  placeholder="NGUYEN VAN A"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ngày hết hạn *</label>
                <input
                  type="text"
                  maxLength={5}
                  placeholder="MM/YY"
                  onChange={handleExpiryChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CVV *</label>
                <input
                  type="text"
                  maxLength={4}
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                  placeholder="123"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Đặt làm thẻ mặc định</span>
                </label>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setFormData({
                    card_number: '',
                    card_type: 'VISA',
                    cardholder_name: '',
                    expiry_month: '',
                    expiry_year: '',
                    cvv: '',
                    is_default: false
                  });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveCard}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Lưu thẻ
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Billing History Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Hóa đơn / Lịch sử thanh toán</h2>
        
        {invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold text-gray-900">Mã đơn: {invoice.code}</p>
                      <p className="text-sm text-gray-600">{invoice.hotelName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{formatDate(invoice.date)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'PAID' || invoice.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-800'
                        : invoice.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {invoice.status === 'PAID' || invoice.status === 'CONFIRMED' ? 'Đã thanh toán' :
                       invoice.status === 'CANCELLED' ? 'Đã hủy' : 'Chờ thanh toán'}
                    </span>
                  </div>
                </div>
                <div className="text-right mr-4">
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => navigate(`/invoice/${invoice.id}`)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Xem chi tiết"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/invoice/${invoice.id}?download=true`)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg"
                    title="Tải hóa đơn"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Bạn chưa có hóa đơn nào</p>
          </div>
        )}
      </div>
    </div>
  );
}

