import { useState } from "react";
import { Download, FileText, FileSpreadsheet, Calendar, Filter, Save, CheckCircle, Loader2 } from "lucide-react";
import Toast from "../../Toast";

interface ExportPreset {
  id: string;
  name: string;
  reportType: string;
  filters: Record<string, any>;
  format: "CSV" | "EXCEL" | "PDF";
  createdAt: string;
}

const ReportsExportCenter = () => {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [exportConfig, setExportConfig] = useState({
    reportType: "",
    format: "EXCEL" as "CSV" | "EXCEL" | "PDF",
    startDate: "",
    endDate: "",
    hotel: "",
    city: "",
    status: "",
    customFilters: {} as Record<string, any>,
  });
  const [presets, setPresets] = useState<ExportPreset[]>([
    {
      id: "1",
      name: "Báo cáo định kỳ hàng tháng",
      reportType: "revenue",
      filters: { period: "month" },
      format: "PDF",
      createdAt: "2025-11-01",
    },
  ]);
  const [exporting, setExporting] = useState(false);
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [presetName, setPresetName] = useState("");

  const reportTypes = [
    { value: "revenue", label: "Doanh thu", icon: "💰" },
    { value: "booking", label: "Booking", icon: "📅" },
    { value: "occupancy", label: "Tỷ lệ lấp đầy", icon: "📊" },
    { value: "customer", label: "Khách hàng", icon: "👥" },
    { value: "review", label: "Đánh giá", icon: "⭐" },
    { value: "staff", label: "Nhân viên", icon: "👔" },
    { value: "package", label: "Gói tài khoản", icon: "📦" },
  ];

  const handleExport = async () => {
    if (!exportConfig.reportType) {
      showToast("error", "Vui lòng chọn loại báo cáo");
      return;
    }

    setExporting(true);
    try {
      // TODO: API call to export
      await new Promise((resolve) => setTimeout(resolve, 2000));
      showToast("success", `Đang xuất báo cáo ${exportConfig.reportType} định dạng ${exportConfig.format}...`);
      setExporting(false);
    } catch (error: any) {
      showToast("error", error.message || "Không thể xuất báo cáo");
      setExporting(false);
    }
  };

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      showToast("error", "Vui lòng nhập tên preset");
      return;
    }

    const newPreset: ExportPreset = {
      id: Date.now().toString(),
      name: presetName,
      reportType: exportConfig.reportType,
      filters: {
        startDate: exportConfig.startDate,
        endDate: exportConfig.endDate,
        hotel: exportConfig.hotel,
        city: exportConfig.city,
        status: exportConfig.status,
        ...exportConfig.customFilters,
      },
      format: exportConfig.format,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setPresets([...presets, newPreset]);
    setPresetName("");
    setShowPresetModal(false);
    showToast("success", "Đã lưu preset thành công");
  };

  const handleLoadPreset = (preset: ExportPreset) => {
    setExportConfig({
      reportType: preset.reportType,
      format: preset.format,
      startDate: preset.filters.startDate || "",
      endDate: preset.filters.endDate || "",
      hotel: preset.filters.hotel || "",
      city: preset.filters.city || "",
      status: preset.filters.status || "",
      customFilters: preset.filters,
    });
    showToast("success", `Đã tải preset: ${preset.name}`);
  };

  const handleDeletePreset = (id: string) => {
    setPresets(presets.filter((p) => p.id !== id));
    showToast("success", "Đã xóa preset");
  };

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  };

  return (
    <div className="space-y-6">
      {toast && <Toast type={toast.type} message={toast.message} />}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Trung tâm Xuất Báo cáo</h1>
          <p className="text-gray-600 mt-1">Cho phép admin xuất dữ liệu báo cáo có chọn lọc</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" size={20} />
              Chọn loại báo cáo
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {reportTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setExportConfig({ ...exportConfig, reportType: type.value })}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    exportConfig.reportType === type.value
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="text-2xl mb-2">{type.icon}</div>
                  <div className="text-sm font-medium text-gray-900">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="text-purple-600" size={20} />
              Bộ lọc
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                <input
                  type="date"
                  value={exportConfig.startDate}
                  onChange={(e) => setExportConfig({ ...exportConfig, startDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                <input
                  type="date"
                  value={exportConfig.endDate}
                  onChange={(e) => setExportConfig({ ...exportConfig, endDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Khách sạn</label>
                <select
                  value={exportConfig.hotel}
                  onChange={(e) => setExportConfig({ ...exportConfig, hotel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tất cả khách sạn</option>
                  <option value="H001">Hanoi Old Quarter Hotel</option>
                  <option value="H002">My Khe Beach Resort</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thành phố</label>
                <select
                  value={exportConfig.city}
                  onChange={(e) => setExportConfig({ ...exportConfig, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Tất cả thành phố</option>
                  <option value="Hanoi">Hà Nội</option>
                  <option value="HCM">TP. Hồ Chí Minh</option>
                  <option value="DaNang">Đà Nẵng</option>
                </select>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Download className="text-green-600" size={20} />
              Chọn định dạng xuất
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setExportConfig({ ...exportConfig, format: "CSV" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "CSV"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet className="mx-auto mb-2 text-gray-600" size={32} />
                <div className="text-sm font-medium text-gray-900">CSV</div>
              </button>
              <button
                onClick={() => setExportConfig({ ...exportConfig, format: "EXCEL" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "EXCEL"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileSpreadsheet className="mx-auto mb-2 text-green-600" size={32} />
                <div className="text-sm font-medium text-gray-900">Excel</div>
              </button>
              <button
                onClick={() => setExportConfig({ ...exportConfig, format: "PDF" })}
                className={`p-4 rounded-lg border-2 transition-all ${
                  exportConfig.format === "PDF"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className="mx-auto mb-2 text-red-600" size={32} />
                <div className="text-sm font-medium text-gray-900">PDF</div>
              </button>
            </div>
          </div>

          {/* Export Button */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              onClick={handleExport}
              disabled={exporting || !exportConfig.reportType}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {exporting ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Đang xuất báo cáo...</span>
                </>
              ) : (
                <>
                  <Download size={20} />
                  <span>Xuất báo cáo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Presets Sidebar */}
        <div className="space-y-6">
          {/* Save Preset */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Save className="text-purple-600" size={20} />
              Lưu preset
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                value={presetName}
                onChange={(e) => setPresetName(e.target.value)}
                placeholder="Tên preset..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              />
              <button
                onClick={handleSavePreset}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                <Save size={18} />
                Lưu cấu hình hiện tại
              </button>
            </div>
          </div>

          {/* Saved Presets */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="text-green-600" size={20} />
              Preset đã lưu
            </h3>
            <div className="space-y-3">
              {presets.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Chưa có preset nào</p>
              ) : (
                presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{preset.name}</p>
                        <p className="text-xs text-gray-500">
                          {reportTypes.find((t) => t.value === preset.reportType)?.label} • {preset.format} • {formatDate(preset.createdAt)}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeletePreset(preset.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        ✕
                      </button>
                    </div>
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="w-full text-xs px-3 py-1 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                    >
                      Tải preset
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsExportCenter;

