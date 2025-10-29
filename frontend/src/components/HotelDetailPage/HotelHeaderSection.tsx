import { Breadcrumb, HotelImageGallery, StickyTabNav } from './index';

interface BreadcrumbItem {
  label: string;
  href: string;
  count?: number;
}

interface TabSection {
  id: string;
  label: string;
}

interface HotelHeaderSectionProps {
  breadcrumbItems: BreadcrumbItem[];
  hotel: any;
  images: string[];
  tabSections: TabSection[];
  availableRooms?: any[];  // Thêm rooms để hiển thị tabs
}

export default function HotelHeaderSection({
  breadcrumbItems,
  hotel,
  images,
  tabSections,
  availableRooms = []
}: HotelHeaderSectionProps) {
  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Back Button & Image Gallery - Full Width at Top */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <button
          onClick={() => window.history.back()}
          className="text-black hover:underline mb-4"
        >
          ← Quay lại
        </button>
        <HotelImageGallery
          images={images}
          hotelName={hotel?.name || 'Hotel'}
          allRooms={availableRooms}
        />
      </div>

      {/* Sticky Tab Navigation */}
      <StickyTabNav sections={tabSections} />
    </>
  );
}

