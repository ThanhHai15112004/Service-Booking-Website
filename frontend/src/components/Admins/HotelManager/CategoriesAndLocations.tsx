import { useState, useEffect } from "react";
import { Building2, MapPin, Plus, Edit, Trash2, Star, X } from "lucide-react";
import Toast from "../../Toast";
import Loading from "../../Loading";

interface Category {
  category_id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

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

const CategoriesAndLocations = () => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [activeTab, setActiveTab] = useState<"categories" | "locations">("categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      // Mock data
      setTimeout(() => {
        setCategories([
          {
            category_id: "CAT001",
            name: "Khách sạn",
            description: "Khách sạn nghỉ dưỡng, du lịch",
            icon: "🏨",
            created_at: "2025-10-20",
          },
          {
            category_id: "CAT002",
            name: "Resort",
            description: "Khu nghỉ dưỡng cao cấp ven biển",
            icon: "🏖️",
            created_at: "2025-10-20",
          },
          {
            category_id: "CAT003",
            name: "Homestay",
            description: "Nhà dân, căn hộ mini",
            icon: "🏠",
            created_at: "2025-10-20",
          },
        ]);
        setLocations([
          {
            location_id: "LOC_HN_01",
            country: "Việt Nam",
            city: "Hà Nội",
            district: "Hoàn Kiếm",
            ward: "Hàng Bạc",
            area_name: "12 Hàng Bạc",
            latitude: 21.033,
            longitude: 105.85,
            distance_center: 0.5,
            description: "Trung tâm thành phố",
            is_hot: true,
            created_at: "2025-10-20",
          },
          {
            location_id: "LOC_DN_04",
            country: "Việt Nam",
            city: "Đà Nẵng",
            district: "Ngũ Hành Sơn",
            ward: "Mỹ Khê",
            area_name: "99 Võ Nguyên Giáp",
            latitude: 16.07,
            longitude: 108.25,
            distance_center: 10.0,
            description: "Gần biển Mỹ Khê",
            is_hot: true,
            created_at: "2025-10-20",
          },
        ]);
        setLoading(false);
      }, 500);
    } catch (error: any) {
      showToast("error", error.message || "Không thể tải dữ liệu");
      setLoading(false);
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveCategory = async (category: Partial<Category>) => {
    try {
      // TODO: API call
      showToast("success", editingCategory ? "Cập nhật danh mục thành công" : "Thêm danh mục thành công");
      fetchData();
      setShowCategoryModal(false);
      setEditingCategory(null);
    } catch (error: any) {
      showToast("error", error.message || "Không thể lưu danh mục");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa danh mục này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa danh mục thành công");
      fetchData();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa danh mục");
    }
  };

  const handleSaveLocation = async (location: Partial<Location>) => {
    try {
      // TODO: API call
      showToast("success", editingLocation ? "Cập nhật vị trí thành công" : "Thêm vị trí thành công");
      fetchData();
      setShowLocationModal(false);
      setEditingLocation(null);
    } catch (error: any) {
      showToast("error", error.message || "Không thể lưu vị trí");
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vị trí này?")) return;

    try {
      // TODO: API call
      showToast("success", "Xóa vị trí thành công");
      fetchData();
    } catch (error: any) {
      showToast("error", error.message || "Không thể xóa vị trí");
    }
  };

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Danh mục & Vị trí</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab("categories")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "categories"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Building2 size={18} />
              Danh mục
            </button>
            <button
              onClick={() => setActiveTab("locations")}
              className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "locations"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <MapPin size={18} />
              Vị trí
            </button>
          </nav>
        </div>

        <div className="p-6">
          {/* Categories Tab */}
          {activeTab === "categories" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý danh mục khách sạn</h3>
                <button
                  onClick={() => {
                    setEditingCategory(null);
                    setShowCategoryModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Thêm danh mục
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <div key={category.category_id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{category.icon || "🏨"}</span>
                        <div>
                          <h4 className="font-medium text-gray-900">{category.name}</h4>
                          {category.description && <p className="text-sm text-gray-600 mt-1">{category.description}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingCategory(category);
                            setShowCategoryModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.category_id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Locations Tab */}
          {activeTab === "locations" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Quản lý vị trí khách sạn</h3>
                <button
                  onClick={() => {
                    setEditingLocation(null);
                    setShowLocationModal(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus size={18} />
                  Thêm vị trí
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quốc gia</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thành phố</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quận/Huyện</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khoảng cách</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {locations.map((location) => (
                      <tr key={location.location_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{location.city}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {location.district}
                          {location.ward && `, ${location.ward}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {location.distance_center ? `${location.distance_center} km` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {location.is_hot ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Hot
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setEditingLocation(location);
                                setShowLocationModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleDeleteLocation(location.location_id)}
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
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => {
            setShowCategoryModal(false);
            setEditingCategory(null);
          }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Location Modal */}
      {showLocationModal && (
        <LocationModal
          location={editingLocation}
          onClose={() => {
            setShowLocationModal(false);
            setEditingLocation(null);
          }}
          onSave={handleSaveLocation}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({
  category,
  onClose,
  onSave,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (category: Partial<Category>) => void;
}) => {
  const [form, setForm] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{category ? "Chỉnh sửa" : "Thêm"} danh mục</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji hoặc URL)</label>
            <input
              type="text"
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="🏨"
            />
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Location Modal Component
const LocationModal = ({
  location,
  onClose,
  onSave,
}: {
  location: Location | null;
  onClose: () => void;
  onSave: (location: Partial<Location>) => void;
}) => {
  const [form, setForm] = useState({
    country: location?.country || "Việt Nam",
    city: location?.city || "",
    district: location?.district || "",
    ward: location?.ward || "",
    area_name: location?.area_name || "",
    latitude: location?.latitude?.toString() || "",
    longitude: location?.longitude?.toString() || "",
    distance_center: location?.distance_center?.toString() || "",
    description: location?.description || "",
    is_hot: location?.is_hot || false,
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">{location ? "Chỉnh sửa" : "Thêm"} vị trí</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quốc gia</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện</label>
              <input
                type="text"
                value={form.district}
                onChange={(e) => setForm({ ...form, district: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
              <input
                type="text"
                value={form.ward}
                onChange={(e) => setForm({ ...form, ward: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khu vực/Địa chỉ</label>
              <input
                type="text"
                value={form.area_name}
                onChange={(e) => setForm({ ...form, area_name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Khoảng cách đến trung tâm (km)</label>
              <input
                type="number"
                value={form.distance_center}
                onChange={(e) => setForm({ ...form, distance_center: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
              <input
                type="number"
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.000001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
              <input
                type="number"
                value={form.longitude}
                onChange={(e) => setForm({ ...form, longitude: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                step="0.000001"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_hot"
              checked={form.is_hot}
              onChange={(e) => setForm({ ...form, is_hot: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_hot" className="text-sm font-medium text-gray-700">
              Đánh dấu là khu vực "Hot"
            </label>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              Hủy
            </button>
            <button
              onClick={() => onSave(form)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Lưu
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAndLocations;

