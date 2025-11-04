import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, Check, Copy } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";

interface PolicyType {
  policy_key: string;
  name: string;
  description?: string;
  data_type: "BOOLEAN" | "TEXT" | "DECIMAL" | "INTEGER";
}

interface HotelPolicy {
  id: number;
  policy_key: string;
  name: string;
  value: string;
  data_type: "BOOLEAN" | "TEXT" | "DECIMAL" | "INTEGER";
  updated_at: string;
}

interface HotelPoliciesTabProps {
  hotelId: string;
}

const HotelPoliciesTab = ({ hotelId }: HotelPoliciesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [policies, setPolicies] = useState<HotelPolicy[]>([]);
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<HotelPolicy | null>(null);
  const [showCloneModal, setShowCloneModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data
      setTimeout(() => {
        setPolicies([
          {
            id: 1,
            policy_key: "free_cancellation",
            name: "Cho phép hoàn tiền",
            value: "1",
            data_type: "BOOLEAN",
            updated_at: "2025-11-01",
          },
          {
            id: 2,
            policy_key: "checkin_time",
            name: "Giờ nhận phòng",
            value: "14:00",
            data_type: "TEXT",
            updated_at: "2025-11-01",
          },
          {
            id: 3,
            policy_key: "parking_fee",
            name: "Phí đỗ xe",
            value: "50000",
            data_type: "DECIMAL",
            updated_at: "2025-11-01",
          },
        ]);
        setPolicyTypes([
          { policy_key: "free_cancellation", name: "Cho phép hoàn tiền", data_type: "BOOLEAN" },
          { policy_key: "pay_later", name: "Thanh toán sau", data_type: "BOOLEAN" },
          { policy_key: "checkin_time", name: "Giờ nhận phòng", data_type: "TEXT" },
          { policy_key: "checkout_time", name: "Giờ trả phòng", data_type: "TEXT" },
          { policy_key: "parking_fee", name: "Phí đỗ xe", data_type: "DECIMAL" },
          { policy_key: "breakfast_included", name: "Bao gồm bữa sáng", data_type: "BOOLEAN" },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  const handleAddPolicy = async (policyKey: string, value: string) => {
    try {
      // TODO: API call
      showToast("success", "Thêm chính sách thành công");
      fetchData();
      setShowAddModal(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể thêm chính sách");
    }
  };

  const handleUpdatePolicy = async (policyId: number, value: string) => {
    try {
      // TODO: API call
      showToast("success", "Cập nhật chính sách thành công");
      fetchData();
      setEditingPolicy(null);
    } catch (error: any) {
      showToast("error", error.message || "Không thể cập nhật chính sách");
    }
  };

  const handleDelete = async (policyId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa chính sách thành công");
      fetchData();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa chính sách");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const getPolicyValueDisplay = (policy: HotelPolicy) => {
    switch (policy.data_type) {
      case "BOOLEAN":
        return policy.value === "1" || policy.value === "true" ? (
          <span className="text-green-600">✅</span>
        ) : (
          <span className="text-red-600">❌</span>
        );
      default:
        return policy.value;
    }
  };

  const availablePolicyTypes = policyTypes.filter(
    (pt) => !policies.some((p) => p.policy_key === pt.policy_key)
  );

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý chính sách</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCloneModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy size={18} />
            Clone từ khách sạn khác
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus size={18} />
            Thêm chính sách
          </button>
        </div>
      </div>

      {/* Policies Table */}
      {policies.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Chưa có chính sách nào</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Chính sách</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cập nhật</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{policy.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{policy.data_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{getPolicyValueDisplay(policy)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{policy.updated_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPolicy(policy)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(policy.id)}
                        className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm chính sách</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            {availablePolicyTypes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không còn chính sách nào để thêm</p>
            ) : (
              <div className="space-y-4">
                {availablePolicyTypes.map((policyType) => (
                  <button
                    key={policyType.policy_key}
                    onClick={() => {
                      const defaultValue = policyType.data_type === "BOOLEAN" ? "1" : "";
                      handleAddPolicy(policyType.policy_key, defaultValue);
                    }}
                    className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                  >
                    <div>
                      <div className="font-medium text-gray-900">{policyType.name}</div>
                      <div className="text-sm text-gray-600">{policyType.data_type}</div>
                    </div>
                    <Plus size={20} className="text-blue-600" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa chính sách</h3>
              <button onClick={() => setEditingPolicy(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{editingPolicy.name}</label>
                {editingPolicy.data_type === "BOOLEAN" ? (
                  <select
                    value={editingPolicy.value}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="1">Có</option>
                    <option value="0">Không</option>
                  </select>
                ) : (
                  <input
                    type={editingPolicy.data_type === "DECIMAL" || editingPolicy.data_type === "INTEGER" ? "number" : "text"}
                    value={editingPolicy.value}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
                )}
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => handleUpdatePolicy(editingPolicy.id, editingPolicy.value)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelPoliciesTab;

