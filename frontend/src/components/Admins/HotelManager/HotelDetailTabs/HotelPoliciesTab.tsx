import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

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
  const [selectedPolicyType, setSelectedPolicyType] = useState<PolicyType | null>(null);
  const [newPolicyValue, setNewPolicyValue] = useState<string>("");
  const [editingPolicy, setEditingPolicy] = useState<HotelPolicy | null>(null);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [policiesRes, policyTypesRes] = await Promise.all([
        adminService.getHotelPolicies(hotelId),
        adminService.getPolicyTypes(),
      ]);

      if (policiesRes.success && policiesRes.data) {
        setPolicies(policiesRes.data.map((p: any, index: number) => ({
          id: p.id || index + 1,
          policy_key: p.policy_key,
          name: p.name_vi || p.name_en || p.policy_key,
          value: p.value,
          data_type: p.data_type,
          updated_at: p.updated_at || new Date().toISOString().split('T')[0],
        })));
      }

      if (policyTypesRes.success && policyTypesRes.data) {
        setPolicyTypes(policyTypesRes.data.map((pt: any) => ({
          policy_key: pt.policy_key,
          name: pt.name_vi || pt.name_en || pt.policy_key,
          description: pt.description,
          data_type: pt.data_type,
        })));
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = async (policyKey: string, value: string) => {
    // Validate value based on data type
    const policyType = policyTypes.find(pt => pt.policy_key === policyKey);
    if (!policyType) {
      showToast("error", "Không tìm thấy loại chính sách");
      return;
    }

    if (policyType.data_type === "BOOLEAN") {
      // BOOLEAN is always valid (1 or 0)
      if (!value || (value !== "1" && value !== "0")) {
        value = "1"; // Default to true
      }
    } else if (policyType.data_type === "DECIMAL" || policyType.data_type === "INTEGER") {
      // DECIMAL and INTEGER require a value
      if (!value || value.trim() === "") {
        showToast("error", `Vui lòng nhập giá trị cho "${policyType.name}"`);
        return;
      }
      const numValue = policyType.data_type === "DECIMAL" ? parseFloat(value) : parseInt(value);
      if (isNaN(numValue) || numValue < 0) {
        showToast("error", "Giá trị phải là số dương hợp lệ");
        return;
      }
    } else if (policyType.data_type === "TEXT") {
      if (!value || value.trim() === "") {
        showToast("error", `Vui lòng nhập giá trị cho "${policyType.name}"`);
        return;
      }
    }

    try {
      const response = await adminService.setHotelPolicy(hotelId, policyKey, value);
      if (response.success) {
        showToast("success", response.message || "Thêm chính sách thành công");
        fetchData();
        setShowAddModal(false);
        setSelectedPolicyType(null);
        setNewPolicyValue("");
      } else {
        showToast("error", response.message || "Không thể thêm chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể thêm chính sách");
    }
  };

  const handleSelectPolicyType = (policyType: PolicyType) => {
    setSelectedPolicyType(policyType);
    // Set default value based on type
    if (policyType.data_type === "BOOLEAN") {
      setNewPolicyValue("1");
    } else {
      setNewPolicyValue("");
    }
  };

  const handleUpdatePolicy = async (policy: HotelPolicy, value: string) => {
    try {
      const response = await adminService.setHotelPolicy(hotelId, policy.policy_key, value);
      if (response.success) {
        showToast("success", response.message || "Cập nhật chính sách thành công");
        fetchData();
        setEditingPolicy(null);
      } else {
        showToast("error", response.message || "Không thể cập nhật chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể cập nhật chính sách");
    }
  };

  const handleDelete = async (policy: HotelPolicy) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;

    try {
      const response = await adminService.removeHotelPolicy(hotelId, policy.policy_key);
      if (response.success) {
        showToast("success", response.message || "Xóa chính sách thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa chính sách");
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
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Có
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Không
          </span>
        );
      case "DECIMAL":
        const decimalValue = parseFloat(policy.value);
        if (!isNaN(decimalValue)) {
          return (
            <span className="font-medium text-gray-900">
              {new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
              }).format(decimalValue)}
            </span>
          );
        }
        return <span className="text-gray-600">{policy.value}</span>;
      case "INTEGER":
        const intValue = parseInt(policy.value);
        if (!isNaN(intValue)) {
          // Check if it's likely a price (large number)
          if (intValue > 1000) {
            return (
              <span className="font-medium text-gray-900">
                {new Intl.NumberFormat('vi-VN', {
                  style: 'currency',
                  currency: 'VND'
                }).format(intValue)}
              </span>
            );
          }
          return <span className="font-medium text-gray-900">{intValue.toLocaleString('vi-VN')}</span>;
        }
        return <span className="text-gray-600">{policy.value}</span>;
      case "TEXT":
        return <span className="text-gray-900">{policy.value || "-"}</span>;
      default:
        return <span className="text-gray-600">{policy.value || "-"}</span>;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
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
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm chính sách
        </button>
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
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {policy.data_type === "BOOLEAN" ? "Có/Không" : 
                       policy.data_type === "DECIMAL" ? "Số thập phân" :
                       policy.data_type === "INTEGER" ? "Số nguyên" :
                       "Văn bản"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">{getPolicyValueDisplay(policy)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(policy.updated_at)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingPolicy(policy)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(policy)}
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
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setSelectedPolicyType(null);
              setNewPolicyValue("");
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {selectedPolicyType ? "Nhập giá trị chính sách" : "Thêm chính sách"}
              </h3>
              <button 
                onClick={() => {
                  setShowAddModal(false);
                  setSelectedPolicyType(null);
                  setNewPolicyValue("");
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            {selectedPolicyType ? (
              // Show input form for selected policy
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="font-medium text-gray-900 mb-1">{selectedPolicyType.name}</div>
                  {selectedPolicyType.description && (
                    <div className="text-sm text-gray-600 mb-2">{selectedPolicyType.description}</div>
                  )}
                  <div className="text-xs text-gray-500">
                    Loại: <span className="font-medium">{selectedPolicyType.data_type}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {selectedPolicyType.data_type === "BOOLEAN" 
                      ? "Chọn giá trị" 
                      : selectedPolicyType.data_type === "DECIMAL" || selectedPolicyType.data_type === "INTEGER"
                      ? "Nhập số tiền / giá trị *"
                      : "Nhập giá trị *"}
                  </label>
                  
                  {selectedPolicyType.data_type === "BOOLEAN" ? (
                    <select
                      value={newPolicyValue}
                      onChange={(e) => setNewPolicyValue(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="1">Có</option>
                      <option value="0">Không</option>
                    </select>
                  ) : selectedPolicyType.data_type === "DECIMAL" ? (
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={newPolicyValue}
                        onChange={(e) => setNewPolicyValue(e.target.value)}
                        placeholder="Ví dụ: 50000 (phí giữ xe)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {newPolicyValue && !isNaN(parseFloat(newPolicyValue)) && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Hiển thị:</span>{" "}
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(parseFloat(newPolicyValue))}
                        </div>
                      )}
                    </div>
                  ) : selectedPolicyType.data_type === "INTEGER" ? (
                    <div>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={newPolicyValue}
                        onChange={(e) => setNewPolicyValue(e.target.value)}
                        placeholder="Ví dụ: 18 (tuổi tối thiểu)"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                      {newPolicyValue && !isNaN(parseInt(newPolicyValue)) && parseInt(newPolicyValue) > 1000 && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="font-medium">Hiển thị:</span>{" "}
                          {new Intl.NumberFormat('vi-VN', {
                            style: 'currency',
                            currency: 'VND'
                          }).format(parseInt(newPolicyValue))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={newPolicyValue}
                      onChange={(e) => setNewPolicyValue(e.target.value)}
                      placeholder="Nhập giá trị..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}
                </div>

                <div className="flex items-center gap-3 justify-end pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedPolicyType(null);
                      setNewPolicyValue("");
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Quay lại
                  </button>
                  <button
                    onClick={() => handleAddPolicy(selectedPolicyType.policy_key, newPolicyValue)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thêm chính sách
                  </button>
                </div>
              </div>
            ) : (
              // Show list of available policies
              availablePolicyTypes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Không còn chính sách nào để thêm</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {availablePolicyTypes.map((policyType) => (
                    <button
                      key={policyType.policy_key}
                      onClick={() => handleSelectPolicyType(policyType)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 text-sm">{policyType.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{policyType.data_type}</div>
                        {policyType.description && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">{policyType.description}</div>
                        )}
                      </div>
                      <Plus size={18} className="text-blue-600 ml-2 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPolicy && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingPolicy(null);
            }
          }}
        >
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Có</option>
                    <option value="0">Không</option>
                  </select>
                ) : editingPolicy.data_type === "DECIMAL" ? (
                  <div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editingPolicy.value}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, value: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {editingPolicy.value && !isNaN(parseFloat(editingPolicy.value)) && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Hiển thị:</span>{" "}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(parseFloat(editingPolicy.value))}
                      </div>
                    )}
                  </div>
                ) : editingPolicy.data_type === "INTEGER" ? (
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={editingPolicy.value}
                      onChange={(e) =>
                        setEditingPolicy({ ...editingPolicy, value: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {editingPolicy.value && !isNaN(parseInt(editingPolicy.value)) && parseInt(editingPolicy.value) > 1000 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Hiển thị:</span>{" "}
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(parseInt(editingPolicy.value))}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={editingPolicy.value}
                    onChange={(e) =>
                      setEditingPolicy({ ...editingPolicy, value: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  onClick={() => handleUpdatePolicy(editingPolicy, editingPolicy.value)}
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

