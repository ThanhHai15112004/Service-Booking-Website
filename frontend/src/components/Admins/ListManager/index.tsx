import { useState } from "react";
import { MapPin, Building2, Wifi, Star, Bed, Shield } from "lucide-react";
import LocationsTab from "./LocationsTab";
import CategoriesTab from "./CategoriesTab";
import FacilitiesTab from "./FacilitiesTab";
import HighlightsTab from "./HighlightsTab";
import BedTypesTab from "./BedTypesTab";
import PolicyTypesTab from "./PolicyTypesTab";

type TabType = "locations" | "categories" | "facilities" | "highlights" | "bed-types" | "policy-types";

const ListManager = () => {
  const [activeTab, setActiveTab] = useState<TabType>("locations");

  const tabs = [
    { id: "locations" as TabType, label: "Vị trí", icon: <MapPin size={20} /> },
    { id: "categories" as TabType, label: "Danh mục", icon: <Building2 size={20} /> },
    { id: "facilities" as TabType, label: "Tiện ích", icon: <Wifi size={20} /> },
    { id: "highlights" as TabType, label: "Điểm nổi bật", icon: <Star size={20} /> },
    { id: "bed-types" as TabType, label: "Loại giường", icon: <Bed size={20} /> },
    { id: "policy-types" as TabType, label: "Loại chính sách", icon: <Shield size={20} /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý Danh sách</h1>
        <p className="text-gray-600">Quản lý các danh mục, vị trí, tiện ích và cấu hình hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "locations" && <LocationsTab />}
        {activeTab === "categories" && <CategoriesTab />}
        {activeTab === "facilities" && <FacilitiesTab />}
        {activeTab === "highlights" && <HighlightsTab />}
        {activeTab === "bed-types" && <BedTypesTab />}
        {activeTab === "policy-types" && <PolicyTypesTab />}
      </div>
    </div>
  );
};

export default ListManager;

