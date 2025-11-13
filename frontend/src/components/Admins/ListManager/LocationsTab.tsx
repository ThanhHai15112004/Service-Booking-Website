import { useState, useEffect, useRef } from "react";
import { MapPin, Plus, Edit, Trash2, X } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";
import { adminService } from "../../../services/adminService";

interface Location {
  location_id: string;
  country: string;
  city: string;
  district?: string;
  ward?: string;
  area_name?: string;
  latitude?: number;
  longitude?: number;
  distance_center?: number;
  description?: string;
  is_hot: boolean;
  created_at: string;
}

const LocationsTab = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [formData, setFormData] = useState<Partial<Location>>({
    location_id: "",
    country: "Vietnam",
    city: "",
    district: "",
    ward: "",
    area_name: "",
    latitude: undefined,
    longitude: undefined,
    distance_center: undefined,
    description: "",
    is_hot: false,
  });
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, []);

  // Click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowModal(false);
        setEditingLocation(null);
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
      const response = await adminService.getLocations();
      if (response.success && response.data) {
        setLocations(response.data);
      } else {
        showToast("error", response.message || "Không thể tải vị trí");
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

  const handleOpenModal = (location?: Location) => {
    if (location) {
      setEditingLocation(location);
      setFormData(location);
    } else {
      setEditingLocation(null);
      setFormData({
        location_id: "",
        country: "Vietnam",
        city: "",
        district: "",
        ward: "",
        area_name: "",
        latitude: undefined,
        longitude: undefined,
        distance_center: undefined,
        description: "",
        is_hot: false,
      });
    }
    setShowModal(true);
  };

  const generateLocationId = () => {
    const maxId = locations.reduce((max, location) => {
      const match = location.location_id.match(/^LOC(\d+)$/);
      if (match) {
        const num = parseInt(match[1]);
        return num > max ? num : max;
      }
      return max;
    }, 0);
    const newNum = maxId + 1;
    return `LOC${String(newNum).padStart(3, '0')}`;
  };

  const handleSave = async () => {
    try {
      if (editingLocation) {
        const response = await adminService.updateLocation(editingLocation.location_id, formData);
        if (response.success) {
          showToast("success", response.message || "Cập nhật vị trí thành công");
          fetchData();
          setShowModal(false);
          setEditingLocation(null);
        } else {
          showToast("error", response.message || "Không thể cập nhật vị trí");
        }
      } else {
        if (!formData.country || !formData.city) {
          showToast("error", "Vui lòng điền đầy đủ thông tin bắt buộc");
          return;
        }
        const autoId = generateLocationId();
        const response = await adminService.createLocation({
          location_id: autoId,
          country: formData.country,
          city: formData.city,
          district: formData.district,
          ward: formData.ward,
          area_name: formData.area_name,
          latitude: formData.latitude,
          longitude: formData.longitude,
          distance_center: formData.distance_center,
          description: formData.description,
          is_hot: formData.is_hot,
        });
        if (response.success) {
          showToast("success", response.message || "Thêm vị trí thành công");
          fetchData();
          setShowModal(false);
        } else {
          showToast("error", response.message || "Không thể thêm vị trí");
        }
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể lưu vị trí");
    }
  };

  const handleDelete = async (locationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vị trí này?")) return;

    try {
      const response = await adminService.deleteLocation(locationId);
      if (response.success) {
        showToast("success", response.message || "Xóa vị trí thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa vị trí");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa vị trí");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý vị trí</h3>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm vị trí
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quốc gia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thành phố</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quận/Huyện</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phường/Xã</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khu vực</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hot</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {locations.map((location) => (
                <tr key={location.location_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{location.location_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.country}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.city}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{location.district || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{location.ward || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{location.area_name || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {location.is_hot ? (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Hot</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(location)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(location.location_id)}
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
                {editingLocation ? "Chỉnh sửa vị trí" : "Thêm vị trí mới"}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLocation(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {editingLocation && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Location ID
                    </label>
                    <input
                      type="text"
                      value={formData.location_id || ""}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
                      placeholder="LOC_001"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quốc gia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vietnam"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Thành phố <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Hồ Chí Minh"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
                  <input
                    type="text"
                    value={formData.district || ""}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Quận 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
                  <input
                    type="text"
                    value={formData.ward || ""}
                    onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Phường Bến Nghé"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực</label>
                  <input
                    type="text"
                    value={formData.area_name || ""}
                    onChange={(e) => setFormData({ ...formData, area_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nhà Thờ Đức Bà"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vĩ độ</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.latitude || ""}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="10.779783"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kinh độ</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.longitude || ""}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="106.699018"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách trung tâm (km)</label>
                  <input
                    type="number"
                    step="any"
                    value={formData.distance_center || ""}
                    onChange={(e) => setFormData({ ...formData, distance_center: e.target.value ? parseFloat(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.5"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_hot"
                    checked={formData.is_hot || false}
                    onChange={(e) => setFormData({ ...formData, is_hot: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="is_hot" className="ml-2 text-sm font-medium text-gray-700">
                    Điểm nổi bật (Hot)
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
                  placeholder="Mô tả về vị trí..."
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingLocation(null);
                }}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {editingLocation ? "Cập nhật" : "Thêm mới"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationsTab;

