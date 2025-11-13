import { useState, useEffect, useRef } from "react";
import { Shield, Plus, Edit, Trash2, X, Upload } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";
import adminApi from "../../../api/adminAxiosClient";

interface PolicyType {
  policy_key: string;
  name_vi: string;
  name_en?: string;
  description?: string;
  data_type: "BOOLEAN" | "INTEGER" | "DECIMAL" | "TEXT";
  applicable_to: "HOTEL" | "ROOM" | "BOTH";
  icon?: string;
  display_order: number;
  is_active: boolean;
}

const PolicyTypesTab = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [policyTypes, setPolicyTypes] = useState<PolicyType[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPolicyType, setEditingPolicyType] = useState<PolicyType | null>(null);
  const [formData, setFormData] = useState<Partial<PolicyType>>({
    policy_key: "",
    name_vi: "",
    name_en: "",
    description: "",
    data_type: "BOOLEAN",
    applicable_to: "BOTH",
    icon: "",
    display_order: 0,
    is_active: true,
  });
  const [uploadingIcon, setUploadingIcon] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setEditingPolicyType(null);
      }
    };

    if (showModal) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showModal]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await adminService.getAllPolicyTypes();
      if (response.success && response.data) {
        setPolicyTypes(response.data);
      } else {
        showToast("error", response.message || "Không thể tải loại chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleIconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingIcon(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("image", file);

      const response = await adminApi.post("/api/upload/image", formDataUpload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success && (response.data.data?.url || response.data.data?.imageUrl)) {
        const imageUrl = response.data.data.url || response.data.data.imageUrl;
        setFormData({ ...formData, icon: imageUrl });
        showToast("success", "Upload icon thành công");
      } else {
        showToast("error", "Không thể upload icon");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || "Không thể upload icon");
    } finally {
      setUploadingIcon(false);
    }
  };

  const handleOpenModal = (policyType?: PolicyType) => {
    if (policyType) {
      setEditingPolicyType(policyType);
      setFormData(policyType);
    } else {
      setEditingPolicyType(null);
      setFormData({
        policy_key: "",
        name_vi: "",
        name_en: "",
        description: "",
        data_type: "BOOLEAN",
        applicable_to: "BOTH",
        icon: "",
        display_order: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  const generatePolicyKey = () => {
    // Generate based on name_vi (convert to uppercase, remove diacritics, replace spaces with underscore)
    if (!formData.name_vi) return `POLICY_${Date.now()}`;
    
    const normalized = formData.name_vi
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "_")
      .replace(/_+/g, "_")
      .replace(/^_|_$/g, "");
    
    return normalized || `POLICY_${Date.now()}`;
  };

  const handleSave = async () => {
    try {
      if (editingPolicyType) {
        const response = await adminService.updatePolicyType(editingPolicyType.policy_key, formData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật loại chính sách thành công");
          fetchData();
          setShowModal(false);
          setEditingPolicyType(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật loại chính sách");
        }
      } else {
        if (!formData.name_vi) {
          showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }
        const autoKey = generatePolicyKey();
        const response = await adminService.createPolicyType({
          policy_key: autoKey,
          name_vi: formData.name_vi,
          name_en: formData.name_en,
          description: formData.description,
          data_type: formData.data_type,
          applicable_to: formData.applicable_to,
          icon: formData.icon,
          display_order: formData.display_order,
          is_active: formData.is_active,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm loại chính sách thành công");
          fetchData();
          setShowModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm loại chính sách");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu loại chính sách");
    }
  };

  const handleDelete = async (policyKey: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa loại chính sách này?")) return;

    try {
      const response = await adminService.deletePolicyType(policyKey);
      if (response.success) {
        showToast("success", response.message || "Xóa loại chính sách thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa loại chính sách");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa loại chính sách");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý loại chính sách</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm loại chính sách
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tên (Tiếng Việt)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kiểu dữ liệu</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áp dụng cho</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {policyTypes.map((policyType) => (
                <tr key={policyType.policy_key} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{policyType.policy_key}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{policyType.name_vi}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      {policyType.data_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        policyType.applicable_to === "HOTEL"
                          ? "bg-blue-100 text-blue-800"
                          : policyType.applicable_to === "ROOM"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {policyType.applicable_to === "HOTEL"
                        ? "Khách sạn"
                        : policyType.applicable_to === "ROOM"
                        ? "Phòng"
                        : "Cả hai"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {policyType.is_active ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Hoạt động</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Tắt</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(policyType)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(policyType.policy_key)}
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPolicyType ? "Chỉnh sửa loại chính sách" : "Thêm loại chính sách mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPolicyType(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingPolicyType && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Policy Key
                    </label>
                    <input
                      type="text"
                      value={formData.policy_key || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      placeholder="ALLOW_PETS"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên (Tiếng Việt) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name_vi || ""}
                    onChange={(e) => setFormData({ ...formData, name_vi: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Cho phép thú cưng"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên (English)</label>
                  <input
                    type="text"
                    value={formData.name_en || ""}
                    onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Allow Pets"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kiểu dữ liệu <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.data_type || "BOOLEAN"}
                    onChange={(e) => setFormData({ ...formData, data_type: e.target.value as PolicyType["data_type"] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="BOOLEAN">Boolean</option>
                    <option value="INTEGER">Integer</option>
                    <option value="DECIMAL">Decimal</option>
                    <option value="TEXT">Text</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Áp dụng cho <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.applicable_to || "BOTH"}
                    onChange={(e) => setFormData({ ...formData, applicable_to: e.target.value as PolicyType["applicable_to"] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="HOTEL">Khách sạn</option>
                    <option value="ROOM">Phòng</option>
                    <option value="BOTH">Cả hai</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự hiển thị</label>
                  <input
                    type="number"
                    value={formData.display_order || 0}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active || false}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_active" className="ml-2 text-sm font-medium text-gray-700">
                    Hoạt động
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mô tả về loại chính sách..."
                />
              </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={formData.icon || ""}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="URL icon hoặc emoji"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                        <Upload size={16} />
                        <span className="text-sm font-medium">
                          {uploadingIcon ? "Đang upload..." : "Upload ảnh"}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIconUpload}
                          disabled={uploadingIcon}
                          className="hidden"
                        />
                      </label>
                      {formData.icon && (
                        <div className="w-10 h-10 border border-gray-300 rounded-lg overflow-hidden flex items-center justify-center bg-gray-50">
                          {formData.icon.startsWith("http") ? (
                            <img src={formData.icon} alt="Icon" className="w-full h-full object-contain" />
                          ) : formData.icon.startsWith("/") ? (
                            <img src={`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000"}${formData.icon}`} alt="Icon" className="w-full h-full object-contain" />
                          ) : (
                            <span className="text-2xl">{formData.icon}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingPolicyType(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingPolicyType ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyTypesTab;

