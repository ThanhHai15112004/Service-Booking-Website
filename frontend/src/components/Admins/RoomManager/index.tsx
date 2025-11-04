import { useState } from "react";
import Dashboard from "./Dashboard";
import RoomTypesList from "./RoomTypesList";
import RoomTypeDetail from "./RoomTypeDetail";
import RoomsList from "./RoomsList";
import Availability from "./Availability";

type ViewType = "dashboard" | "types" | "typeDetail" | "rooms" | "availability";

const RoomManager = () => {
  const [currentView, setCurrentView] = useState<ViewType>("dashboard");
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);

  const handleViewChange = (view: ViewType, roomTypeId?: string) => {
    setCurrentView(view);
    if (roomTypeId) {
      setSelectedRoomTypeId(roomTypeId);
    }
  };

  return (
    <div className="space-y-6">
      {currentView === "dashboard" && <Dashboard />}
      {currentView === "types" && <RoomTypesList onViewDetail={(id) => handleViewChange("typeDetail", id)} />}
      {currentView === "typeDetail" && selectedRoomTypeId && (
        <RoomTypeDetail roomTypeId={selectedRoomTypeId} onBack={() => handleViewChange("types")} />
      )}
      {currentView === "rooms" && <RoomsList />}
      {currentView === "availability" && <Availability />}
    </div>
  );
};

export default RoomManager;

