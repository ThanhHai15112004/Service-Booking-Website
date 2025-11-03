// Export all HotelDetailPage components
export { default as Breadcrumb } from './Breadcrumb';
export { default as HotelHeader } from './HotelHeader';
export { default as HotelImageGallery } from './HotelImageGallery';
export { default as HotelHighlights } from './HotelHighlights';
export { default as HotelInfo } from './HotelInfo';
export { default as HotelAmenities } from './HotelAmenities';
export { default as BookingCard } from './BookingCard';
export { default as StickyTabNav } from './StickyTabNav';
export { default as RoomFilters } from './RoomFilters';
export { default as RoomList } from './RoomList';
export { default as HotelSearchUpdateBar } from './HotelSearchUpdateBar';
export { default as HotelReviews } from './HotelReviews';
export { default as HotelReviewsDetailed } from './HotelReviewsDetailed';
export { default as WriteReviewForm } from './WriteReviewForm';
export { default as HotelLocation } from './HotelLocation';
export { default as HotelSlider } from './HotelSlider';
export { default as HotelLocationMap } from './HotelLocationMap';
export { default as TopDestinationsSlider } from './TopDestinationsSlider';
export { default as TrendingCitiesSlider } from './TrendingCitiesSlider';

// Export wrapper components
export { default as HotelDetailLoadingState } from './HotelDetailLoadingState';
export { default as HotelDetailErrorState } from './HotelDetailErrorState';
export { default as HotelHeaderSection } from './HotelHeaderSection';
export { default as HotelMainContent } from './HotelMainContent';

// Re-export hook from hooks folder
export { useHotelDetail } from '../../hooks/useHotelDetail';
export type { UseHotelDetailReturn } from '../../hooks/useHotelDetail';

// Re-export types from types folder (for convenience)
export type {
  HotelDetail,
  HotelImage,
  HotelFacility,
  HotelHighlight,
  HotelBadge,
  HotelPolicies as HotelPoliciesType,
  HotelCounts,
  Room,
  RoomFacility,
  RoomDailyAvailability,
  RoomFiltersState,
  FilterCounts,
  BreadcrumbItem,
  TabSection,
  ReviewCategory,
  Review
} from '../../types';

