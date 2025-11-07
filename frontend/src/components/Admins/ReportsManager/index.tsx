import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import MainDashboard from "./MainDashboard";
import RevenueReports from "./RevenueReports";
import BookingReports from "./BookingReports";
import OccupancyReports from "./OccupancyReports";
import CustomerInsights from "./CustomerInsights";
import ReviewAnalytics from "./ReviewAnalytics";
import StaffReports from "./StaffReports";
import PackageReports from "./PackageReports";
import ReportsExportCenter from "./ReportsExportCenter";

type ReportView = "main" | "revenue" | "booking" | "occupancy" | "customer" | "review" | "staff" | "package" | "export";

const ReportsManager = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentView = (searchParams.get("tab") || "main") as ReportView;

  // Set default tab if not present
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams({ tab: "main" }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const reportViews = {
    main: <MainDashboard />,
    revenue: <RevenueReports />,
    booking: <BookingReports />,
    occupancy: <OccupancyReports />,
    customer: <CustomerInsights />,
    review: <ReviewAnalytics />,
    staff: <StaffReports />,
    package: <PackageReports />,
    export: <ReportsExportCenter />,
  };

  return (
    <div className="space-y-6">
      {/* Current View */}
      {reportViews[currentView] || reportViews.main}
    </div>
  );
};

export default ReportsManager;
