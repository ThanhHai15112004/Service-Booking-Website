import { useState, useEffect } from "react";
import { MapPin, Plus, Edit, Trash2, Star } from "lucide-react";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface AccountAddressesTabProps {
  accountId: string;
}

const AccountAddressesTab = ({ accountId }: AccountAddressesTabProps) => {
  const [loading, setLoading] = useState(true);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchAddresses();
  }, [accountId]);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAccountAddresses(accountId);
      setAddresses(response.data || []);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading message="Đang tải danh sách địa chỉ..." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-black">Địa chỉ & Thông tin cá nhân</h3>
          <p className="text-sm text-gray-600 mt-1">
            Quản lý các địa chỉ mà người dùng đã lưu (tối đa 5 địa chỉ)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          disabled={addresses.length >= 5}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={16} />
          Thêm địa chỉ
        </button>
      </div>

      {/* Addresses Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Tên người nhận</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">SĐT</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Địa chỉ chi tiết</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-600 uppercase">Thành phố</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase">Mặc định</th>
                <th className="px-6 py-4 text-center text-xs font-medium text-gray-600 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {addresses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <MapPin size={32} className="text-gray-400" />
                      <span>Chưa có địa chỉ nào.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                addresses.map((address) => (
                  <tr key={address.address_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{address.name || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{address.phone || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{address.address || "N/A"}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{address.city || "N/A"}</td>
                    <td className="px-6 py-4 text-center">
                      {address.is_default ? (
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <Star size={16} className="fill-green-600" />
                          <span className="text-xs">Mặc định</span>
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="p-2 hover:bg-blue-50 rounded transition-colors duration-200"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} className="text-blue-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-50 rounded transition-colors duration-200"
                          title="Xóa"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-white rounded-lg p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-black mb-4">Thêm địa chỉ mới</h3>
            <p className="text-gray-600 mb-4">
              Form thêm địa chỉ sẽ được hiển thị sau khi liên kết với backend API.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddModal(false)}
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

export default AccountAddressesTab;

