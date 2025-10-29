import { Breadcrumb, HotelHeader, HotelImageGallery, StickyTabNav } from './index';

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
}

export default function HotelHeaderSection({
  breadcrumbItems,
  hotel,
  images,
  tabSections
}: HotelHeaderSectionProps) {
  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumb items={breadcrumbItems} />

      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Hotel Header */}
        <HotelHeader
          name={hotel?.name || 'Đang tải...'}
          address={hotel?.address || ''}
          city={hotel?.city || ''}
          starRating={hotel?.starRating || hotel?.star_rating || 0}
          rating={hotel?.avgRating || hotel?.rating || 0}
          reviewsCount={hotel?.reviewCount || hotel?.reviews_count || 0}
        />

        {/* Image Gallery */}
        <HotelImageGallery
          images={images}
          hotelName={hotel?.name || 'Hotel'}
        />
      </div>

      {/* Sticky Tab Navigation */}
      <StickyTabNav sections={tabSections} />
    </>
  );
}

