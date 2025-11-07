import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X, Copy, Search, Settings, Info } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface PolicyType {
  policy_key: string;
  name: string;
  description?: string | null;
  data_type: "BOOLEAN" | "TEXT" | "DECIMAL" | "INTEGER" | string;
}

interface RoomPolicy {
  id?: number;
  policy_key: string;
  name: string;
  value: string;
  data_type: "BOOLEAN" | "TEXT" | "DECIMAL" | "INTEGER" | string;
  icon?: string | null;
  updated_at: string;
}

interface RoomPoliciesTabProps {
  roomTypeId: string;
}

const RoomPoliciesTab = ({ roomTypeId }: RoomPoliciesTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [policies, setPolicies] = useState<RoomPolicy[]>([]);
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<RoomPolicy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, [roomTypeId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch policies and policy types in parallel
      const [policiesResponse, policyTypesResponse] = await Promise.all([
        adminService.getRoomTypePolicies(roomTypeId),
        adminService.getAllPolicyTypes("ROOM"),
      ]);

      if (policiesResponse.success && policiesResponse.data) {
        setPolicies(policiesResponse.data as RoomPolicy[]);
      } else {
        showToast("error", policiesResponse.message || "Không thể tải danh sách chính sách");
        setPolicies([]);
      }

      if (policyTypesResponse.success && policyTypesResponse.data) {
        setPolicyTypes(policyTypesResponse.data as PolicyType[]);
      } else {
        showToast("error", policyTypesResponse.message || "Không thể tải danh sách loại chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
      setPolicies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPolicy = async (policyKey: string, value: string) => {
    try {
      const response = await adminService.addRoomTypePolicy(roomTypeId, policyKey, value);
      if (response.success) {
        showToast("success", response.message || "Thêm chính sách thành công");
        fetchData();
        setShowAddModal(false);
      } else {
        showToast("error", response.message || "Không thể thêm chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể thêm chính sách");
    }
  };

  const handleUpdatePolicy = async (policyKey: string, value: string) => {
    if (!editingPolicy) return;
    try {
      const response = await adminService.updateRoomTypePolicy(roomTypeId, policyKey, value);
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

  const handleDelete = async (policyKey: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa chính sách này?")) return;

    try {
      const response = await adminService.removeRoomTypePolicy(roomTypeId, policyKey);
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

  const getPolicyValueDisplay = (policy: RoomPolicy) => {
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

  // Filter available policy types by search term
  const filteredAvailablePolicyTypes = availablePolicyTypes.filter((pt) =>
    pt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (pt.description && pt.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getDataTypeBadge = (dataType: string) => {
    const badges: Record<string, { bg: string; text: string; label: string }> = {
      BOOLEAN: { bg: "bg-green-100", text: "text-green-800", label: "Boolean" },
      TEXT: { bg: "bg-blue-100", text: "text-blue-800", label: "Text" },
      DECIMAL: { bg: "bg-purple-100", text: "text-purple-800", label: "Decimal" },
      INTEGER: { bg: "bg-orange-100", text: "text-orange-800", label: "Integer" },
    };
    const badge = badges[dataType] || { bg: "bg-gray-100", text: "text-gray-800", label: dataType };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý chính sách phòng</h3>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {/* TODO: Copy from another room type */}}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Copy size={18} />
            Copy từ room type khác
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loại dữ liệu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Giá trị</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày cập nhật</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {policies.map((policy) => (
                <tr key={policy.policy_key} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {policy.icon && (
                        policy.icon.startsWith("http://") || policy.icon.startsWith("https://") ? (
                          <img src={policy.icon} alt={policy.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <span className="text-lg">{policy.icon}</span>
                        )
                      )}
                      <span className="font-medium text-gray-900">{policy.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600">{policy.data_type}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{getPolicyValueDisplay(policy)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(policy.updated_at).toLocaleDateString("vi-VN")}
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
                        onClick={() => handleDelete(policy.policy_key)}
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
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
              setSearchTerm("");
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Settings className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Thêm chính sách</h3>
                  <p className="text-sm text-gray-600 mt-1">Chọn chính sách bạn muốn thêm vào loại phòng này</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm("");
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Search Bar */}
            {availablePolicyTypes.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Tìm kiếm chính sách..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {searchTerm && (
                  <p className="text-sm text-gray-600 mt-2">
                    Tìm thấy {filteredAvailablePolicyTypes.length} chính sách
                  </p>
                )}
              </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {availablePolicyTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Settings className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Không còn chính sách nào để thêm</p>
                  <p className="text-gray-400 text-sm mt-2">Tất cả các chính sách đã được thêm vào loại phòng này</p>
                </div>
              ) : filteredAvailablePolicyTypes.length === 0 ? (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Search className="text-gray-400" size={32} />
                  </div>
                  <p className="text-gray-500 text-lg font-medium">Không tìm thấy chính sách</p>
                  <p className="text-gray-400 text-sm mt-2">Thử tìm kiếm với từ khóa khác</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredAvailablePolicyTypes.map((policyType) => (
                    <button
                      key={policyType.policy_key}
                      onClick={() => {
                        const defaultValue = policyType.data_type === "BOOLEAN" ? "1" : "";
                        handleAddPolicy(policyType.policy_key, defaultValue);
                      }}
                      className="group relative p-5 bg-white border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-lg transition-all text-left"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Settings className="text-blue-600" size={20} />
                            </div>
                            <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                              {policyType.name}
                            </h4>
                          </div>
                          {policyType.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {policyType.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            {getDataTypeBadge(policyType.data_type)}
                            {policyType.data_type === "BOOLEAN" && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Info size={12} />
                                Có / Không
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-600 group-hover:bg-blue-700 rounded-full flex items-center justify-center transition-colors">
                            <Plus className="text-white" size={20} />
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {availablePolicyTypes.length > 0 && (
                  <>
                    Hiển thị {filteredAvailablePolicyTypes.length} / {availablePolicyTypes.length} chính sách
                  </>
                )}
              </p>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm("");
                }}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPolicy && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingPolicy(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <Edit className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Chỉnh sửa chính sách</h3>
                  <p className="text-sm text-gray-600 mt-1">{editingPolicy.name}</p>
                </div>
              </div>
              <button
                onClick={() => setEditingPolicy(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-white rounded-lg"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Policy Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {editingPolicy.icon && (
                      editingPolicy.icon.startsWith("http://") || editingPolicy.icon.startsWith("https://") ? (
                        <img src={editingPolicy.icon} alt={editingPolicy.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">{editingPolicy.icon}</span>
                      )
                    )}
                    <div>
                      <h4 className="font-semibold text-gray-900">{editingPolicy.name}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        {getDataTypeBadge(editingPolicy.data_type)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Value Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Giá trị <span className="text-red-500">*</span>
                  </label>
                  {editingPolicy.data_type === "BOOLEAN" ? (
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                        <input
                          type="radio"
                          name="policyValue"
                          value="1"
                          checked={editingPolicy.value === "1" || editingPolicy.value === "true"}
                          onChange={(e) =>
                            setEditingPolicy({ ...editingPolicy, value: e.target.value })
                          }
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Có</div>
                          <div className="text-sm text-gray-600">Chính sách này được áp dụng</div>
                        </div>
                        <div className="text-2xl">✅</div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-red-500 hover:bg-red-50 transition-colors">
                        <input
                          type="radio"
                          name="policyValue"
                          value="0"
                          checked={editingPolicy.value === "0" || editingPolicy.value === "false"}
                          onChange={(e) =>
                            setEditingPolicy({ ...editingPolicy, value: e.target.value })
                          }
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Không</div>
                          <div className="text-sm text-gray-600">Chính sách này không được áp dụng</div>
                        </div>
                        <div className="text-2xl">❌</div>
                      </label>
                    </div>
                  ) : editingPolicy.data_type === "DECIMAL" ? (
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        value={editingPolicy.value}
                        onChange={(e) =>
                          setEditingPolicy({ ...editingPolicy, value: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Nhập giá trị số thập phân"
                      />
                      <p className="text-xs text-gray-500 mt-2">Ví dụ: 100.50, 1000.00</p>
                    </div>
                  ) : editingPolicy.data_type === "INTEGER" ? (
                    <div>
                      <input
                        type="number"
                        step="1"
                        value={editingPolicy.value}
                        onChange={(e) =>
                          setEditingPolicy({ ...editingPolicy, value: e.target.value })
                        }
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                        placeholder="Nhập giá trị số nguyên"
                      />
                      <p className="text-xs text-gray-500 mt-2">Ví dụ: 1, 10, 100</p>
                    </div>
                  ) : (
                    <div>
                      <textarea
                        value={editingPolicy.value}
                        onChange={(e) =>
                          setEditingPolicy({ ...editingPolicy, value: e.target.value })
                        }
                        rows={4}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập giá trị văn bản"
                      />
                      <p className="text-xs text-gray-500 mt-2">Nhập mô tả hoặc giá trị văn bản cho chính sách này</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditingPolicy(null)}
                className="px-5 py-2.5 border-2 border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={() => handleUpdatePolicy(editingPolicy.policy_key, editingPolicy.value)}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              >
                <Edit size={18} />
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomPoliciesTab;

