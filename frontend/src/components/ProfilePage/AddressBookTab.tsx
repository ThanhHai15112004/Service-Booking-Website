import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit2, Trash2 } from 'lucide-react';
import { getAddresses, createAddress, updateAddress, deleteAddress } from '../../services/profileService';

interface Address {
  address_id?: string;
  id?: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  district?: string;
  street_name?: string;
  house_number?: string;
  is_default?: boolean;
  isDefault?: boolean;
}

interface AddressBookTabProps {
  addresses?: Address[];
}

export default function AddressBookTab({ addresses: initialAddresses }: AddressBookTabProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    country: 'VN',
    district: '',
    street_name: '',
    house_number: '',
    is_default: false
  });

  // Load addresses from API
  useEffect(() => {
    const loadAddresses = async () => {
      setLoading(true);
      try {
        const response = await getAddresses();
        if (response.success && response.data) {
          // Map backend format to frontend format
          const mapped = response.data.map((addr: any) => ({
            id: addr.address_id,
            address_id: addr.address_id,
            name: addr.name,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            country: addr.country,
            district: addr.district || '',
            street_name: addr.street_name || '',
            house_number: addr.house_number || '',
            isDefault: Boolean(addr.is_default),
            is_default: Boolean(addr.is_default)
          }));
          setAddresses(mapped);
        } else if (initialAddresses) {
          setAddresses(initialAddresses);
        }
      } catch (error) {
        console.error('Error loading addresses:', error);
      } finally {
        setLoading(false);
      }
    };
    loadAddresses();
  }, []);

  const handleAdd = async () => {
    try {
      if (editingId) {
        const response = await updateAddress(editingId, formData);
        if (response.success) {
          // Reload addresses
          const refreshResponse = await getAddresses();
          if (refreshResponse.success && refreshResponse.data) {
            const mapped = refreshResponse.data.map((addr: any) => ({
              id: addr.address_id,
              address_id: addr.address_id,
              name: addr.name,
              phone: addr.phone,
              address: addr.address,
              city: addr.city,
              country: addr.country,
              district: addr.district || '',
              street_name: addr.street_name || '',
              house_number: addr.house_number || '',
              isDefault: Boolean(addr.is_default),
              is_default: Boolean(addr.is_default)
            }));
            setAddresses(mapped);
          }
          setEditingId(null);
          setFormData({ name: '', phone: '', address: '', city: '', country: 'VN', district: '', street_name: '', house_number: '', is_default: false });
          setShowAddForm(false);
        } else {
          alert(response.message || 'Cập nhật địa chỉ thất bại');
        }
      } else {
        const response = await createAddress(formData);
        if (response.success) {
          // Reload addresses
          const refreshResponse = await getAddresses();
          if (refreshResponse.success && refreshResponse.data) {
            const mapped = refreshResponse.data.map((addr: any) => ({
              id: addr.address_id,
              address_id: addr.address_id,
              name: addr.name,
              phone: addr.phone,
              address: addr.address,
              city: addr.city,
              country: addr.country,
              district: addr.district || '',
              street_name: addr.street_name || '',
              house_number: addr.house_number || '',
              isDefault: Boolean(addr.is_default),
              is_default: Boolean(addr.is_default)
            }));
            setAddresses(mapped);
          }
          setFormData({ name: '', phone: '', address: '', city: '', country: 'VN', district: '', street_name: '', house_number: '', is_default: false });
          setShowAddForm(false);
        } else {
          alert(response.message || 'Tạo địa chỉ thất bại');
        }
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Có lỗi xảy ra khi lưu địa chỉ');
    }
  };

  const handleEdit = (address: Address, e?: React.MouseEvent) => {
    // Ngăn click event bubble lên card nếu click vào nút edit
    if (e) {
      e.stopPropagation();
    }
    setFormData({
      name: address.name,
      phone: address.phone,
      address: address.address || '',
      city: address.city,
      country: address.country,
      district: (address as any).district || '',
      street_name: (address as any).street_name || '',
      house_number: (address as any).house_number || '',
      is_default: Boolean(address.is_default || address.isDefault)
    });
    setEditingId(address.address_id || address.id || '');
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa địa chỉ này?')) {
      try {
        const response = await deleteAddress(id);
        if (response.success) {
          // Reload addresses
          const refreshResponse = await getAddresses();
          if (refreshResponse.success && refreshResponse.data) {
            const mapped = refreshResponse.data.map((addr: any) => ({
              id: addr.address_id,
              address_id: addr.address_id,
              name: addr.name,
              phone: addr.phone,
              address: addr.address,
              city: addr.city,
              country: addr.country,
              district: addr.district || '',
              street_name: addr.street_name || '',
              house_number: addr.house_number || '',
              isDefault: Boolean(addr.is_default),
              is_default: Boolean(addr.is_default)
            }));
            setAddresses(mapped);
          }
        } else {
          alert(response.message || 'Xóa địa chỉ thất bại');
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Có lỗi xảy ra khi xóa địa chỉ');
      }
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await updateAddress(id, { is_default: true });
      if (response.success) {
        // Reload addresses
        const refreshResponse = await getAddresses();
        if (refreshResponse.success && refreshResponse.data) {
          const mapped = refreshResponse.data.map((addr: any) => ({
            id: addr.address_id,
            address_id: addr.address_id,
            name: addr.name,
            phone: addr.phone,
            address: addr.address,
            city: addr.city,
            country: addr.country,
            district: addr.district || '',
            street_name: addr.street_name || '',
            house_number: addr.house_number || '',
            isDefault: Boolean(addr.is_default),
            is_default: Boolean(addr.is_default)
          }));
          setAddresses(mapped);
        }
      } else {
        alert(response.message || 'Đặt địa chỉ mặc định thất bại');
      }
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Có lỗi xảy ra');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Sổ địa chỉ của bạn</h2>
        <button
          onClick={() => {
            setShowAddForm(!showAddForm);
            setEditingId(null);
            setFormData({ name: '', phone: '', address: '', city: '', country: 'VN', district: '', street_name: '', house_number: '', is_default: false });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Thêm địa chỉ mới
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên người nhận *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số điện thoại *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quốc gia *</label>
              <select
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="VN">Việt Nam</option>
                <option value="US">United States</option>
                <option value="BD">Bangladesh</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thành phố *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Hồ Chí Minh, Hà Nội"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Quận/Huyện *</label>
              <input
                type="text"
                value={formData.district}
                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Quận 1, Quận Ba Đình"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tên đường *</label>
              <input
                type="text"
                value={formData.street_name}
                onChange={(e) => setFormData({ ...formData, street_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: Nguyễn Huệ, Lê Lợi"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Số nhà / Đường *</label>
              <input
                type="text"
                value={formData.house_number}
                onChange={(e) => setFormData({ ...formData, house_number: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ví dụ: 123, 45A"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Địa chỉ đầy đủ (tự động tạo từ các trường trên)</label>
              <input
                type="text"
                value={[formData.house_number, formData.street_name, formData.district, formData.city, formData.country === 'VN' ? 'Việt Nam' : formData.country].filter(Boolean).join(', ')}
                readOnly
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
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
                <span className="text-sm text-gray-700">Đặt làm địa chỉ mặc định</span>
              </label>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => {
                setShowAddForm(false);
                setEditingId(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Hủy
            </button>
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {editingId ? 'Cập nhật' : 'Thêm địa chỉ'}
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Đang tải địa chỉ...</p>
        </div>
      ) : addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => {
            const isDefault = address.isDefault || address.is_default;
            const addressId = address.address_id || address.id || '';
            
            // Tạo địa chỉ hiển thị từ các trường riêng lẻ hoặc từ address
            const displayAddress = () => {
              const parts = [];
              if ((address as any).house_number) parts.push((address as any).house_number);
              if ((address as any).street_name) parts.push((address as any).street_name);
              if ((address as any).district) parts.push((address as any).district);
              if (address.city) parts.push(address.city);
              if (address.country === 'VN') parts.push('Việt Nam');
              else if (address.country) parts.push(address.country);
              
              return parts.length > 0 ? parts.join(', ') : address.address || '';
            };
            
            return (
              <div
                key={addressId}
                onClick={() => {
                  // Click vào card để đặt mặc định (nếu chưa phải default)
                  if (!isDefault) {
                    handleSetDefault(addressId);
                  }
                }}
                className={`p-5 border-2 rounded-lg cursor-pointer transition-all ${
                  isDefault
                    ? 'border-blue-500 bg-blue-50 hover:shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className={`w-5 h-5 ${isDefault ? 'text-blue-600' : 'text-gray-400'}`} />
                      <h3 className="font-semibold text-gray-900">{address.name}</h3>
                      {isDefault && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                          Mặc định
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{address.phone}</p>
                    <p className="text-sm text-gray-700">
                      {displayAddress()}
                    </p>
                  </div>
                </div>
                <div 
                  className="flex items-center gap-3 pt-3 border-t border-gray-200"
                  onClick={(e) => e.stopPropagation()} // Ngăn click vào actions bubble lên card
                >
                  <button
                    onClick={() => handleEdit(address)}
                    className="text-blue-600 hover:text-blue-700 p-1 hover:bg-blue-50 rounded"
                    title="Chỉnh sửa"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(addressId)}
                    className="text-red-600 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">Bạn chưa có địa chỉ nào được lưu.</p>
          <p className="text-sm text-gray-500">Thêm địa chỉ để đặt phòng nhanh hơn!</p>
        </div>
      )}
    </div>
  );
}

