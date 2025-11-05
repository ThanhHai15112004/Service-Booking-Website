import { useState, useEffect } from "react";
import { Plus, Trash2, Edit, X } from "lucide-react";
import Toast from "../../../Toast";
import Loading from "../../../Loading";
import { adminService } from "../../../../services/adminService";

interface Highlight {
  highlight_id: string;
  name: string;
  description?: string;
  icon?: string;
  icon_type?: string;
}

interface HotelHighlight {
  highlight_id: string;
  name: string;
  description?: string;
  icon?: string;
  icon_type?: string;
  custom_text?: string;
  sort_order: number;
}

interface HotelHighlightsTabProps {
  hotelId: string;
}

const HotelHighlightsTab = ({ hotelId }: HotelHighlightsTabProps) => {
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [hotelHighlights, setHotelHighlights] = useState<HotelHighlight[]>([]);
  const [allHighlights, setAllHighlights] = useState<Highlight[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<HotelHighlight | null>(null);

  useEffect(() => {
    fetchData();
  }, [hotelId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hotelHighlightsRes, allHighlightsRes] = await Promise.all([
        adminService.getHotelHighlights(hotelId),
        adminService.getAllHighlights(),
      ]);

      if (hotelHighlightsRes.success && hotelHighlightsRes.data) {
        setHotelHighlights(hotelHighlightsRes.data.map((h: any) => ({
          highlight_id: h.highlight_id,
          name: h.name,
          description: h.description,
          icon: h.icon_url,
          icon_type: "URL",
          custom_text: h.custom_text,
          sort_order: h.sort_order || 0,
        })));
      }

      if (allHighlightsRes.success && allHighlightsRes.data) {
        setAllHighlights(allHighlightsRes.data.map((h: any) => ({
          highlight_id: h.highlight_id,
          name: h.name,
          description: h.description,
          icon: h.icon_url,
        })));
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const handleAddHighlight = async (highlightId: string, customText?: string, sortOrder?: number) => {
    try {
      const response = await adminService.addHotelHighlight(hotelId, { highlightId, customText, sortOrder });
      if (response.success) {
        showToast("success", response.message || "Thêm highlight thành công");
        fetchData();
        setShowAddModal(false);
      } else {
        showToast("error", response.message || "Không thể thêm highlight");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể thêm highlight");
    }
  };

  const handleDelete = async (highlightId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa highlight này?")) return;

    try {
      const response = await adminService.removeHotelHighlight(hotelId, highlightId);
      if (response.success) {
        showToast("success", response.message || "Xóa highlight thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể xóa highlight");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể xóa highlight");
    }
  };

  const handleUpdateSort = async (highlightId: string, newOrder: number, customText?: string) => {
    try {
      const response = await adminService.updateHotelHighlight(hotelId, highlightId, { sortOrder: newOrder, customText });
      if (response.success) {
        showToast("success", response.message || "Cập nhật thứ tự thành công");
        fetchData();
      } else {
        showToast("error", response.message || "Không thể cập nhật thứ tự");
      }
    } catch (error: any) {
      showToast("error", error.response?.data?.message || error.message || "Không thể cập nhật thứ tự");
    }
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const availableHighlights = allHighlights.filter(
    (highlight) => !hotelHighlights.some((hh) => hh.highlight_id === highlight.highlight_id)
  );

  const sortedHighlights = [...hotelHighlights].sort((a, b) => a.sort_order - b.sort_order);

  if (loading) {
    return <Loading message="Đang tải dữ liệu..." />;
  }

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Quản lý điểm nổi bật</h3>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={18} />
          Thêm highlight
        </button>
      </div>

      {/* Highlights List */}
      {sortedHighlights.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>Chưa có highlight nào</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Icon</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên highlight</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mô tả</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thứ tự</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedHighlights.map((highlight) => (
                <tr key={highlight.highlight_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {highlight.icon ? (
                      highlight.icon.startsWith('http') ? (
                        <img src={highlight.icon} alt={highlight.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">{highlight.icon}</span>
                      )
                    ) : (
                      <span className="text-2xl">⭐</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{highlight.custom_text || highlight.name}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{highlight.description || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="number"
                      value={highlight.sort_order}
                      onChange={(e) => handleUpdateSort(highlight.highlight_id, parseInt(e.target.value))}
                      className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      min="1"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditingHighlight(highlight)}
                        className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(highlight.highlight_id)}
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

      {/* Edit Modal */}
      {editingHighlight && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setEditingHighlight(null);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Chỉnh sửa highlight</h3>
              <button onClick={() => setEditingHighlight(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên highlight</label>
                <input
                  type="text"
                  value={editingHighlight.custom_text || editingHighlight.name}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, custom_text: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder={editingHighlight.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={editingHighlight.sort_order}
                  onChange={(e) => setEditingHighlight({ ...editingHighlight, sort_order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  min="1"
                />
              </div>
              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={() => setEditingHighlight(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  onClick={() => {
                    handleUpdateSort(editingHighlight.highlight_id, editingHighlight.sort_order, editingHighlight.custom_text);
                    setEditingHighlight(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAddModal(false);
            }
          }}
        >
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Thêm highlight</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>
            {availableHighlights.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Không còn highlight nào để thêm</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {availableHighlights.map((highlight) => (
                  <button
                    key={highlight.highlight_id}
                    onClick={() => handleAddHighlight(highlight.highlight_id, undefined, hotelHighlights.length + 1)}
                    className="flex items-start gap-3 p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors text-left"
                  >
                    {highlight.icon ? (
                      highlight.icon.startsWith('http') ? (
                        <img src={highlight.icon} alt={highlight.name} className="w-8 h-8 object-contain" />
                      ) : (
                        <span className="text-2xl">{highlight.icon}</span>
                      )
                    ) : (
                      <span className="text-2xl">⭐</span>
                    )}
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{highlight.name}</div>
                      {highlight.description && <div className="text-sm text-gray-600 mt-1">{highlight.description}</div>}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HotelHighlightsTab;

