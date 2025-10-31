import { Breadcrumb, HotelImageGallery } from './index';

interface BreadcrumbItem {
  label: string;
  href: string;
  count?: number;
}

interface HotelHeaderSectionProps {
  breadcrumbItems: BreadcrumbItem[];
  hotel: any;
  images: string[];
  availableRooms?: any[];
}

export default function HotelHeaderSection({
  breadcrumbItems,
  hotel,
  images,
  availableRooms = []
}: HotelHeaderSectionProps) {
  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Back Button & Image Gallery - Full Width at Top */}
      <div className="max-w-[1200px] mx-auto px-4 pt-0 sm:px-6 lg:px-8 pt-6 pb-4">
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

    </>
  );
}

