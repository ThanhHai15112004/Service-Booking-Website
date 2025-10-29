import { 
  Wifi, 
  UtensilsCrossed, 
  Car, 
  Clock, 
  Waves,
  Wind,
  Info,
  Dumbbell,
  Sparkles,
  Utensils
} from 'lucide-react';

/**
 * Shared icon mapping for hotel facilities and amenities
 * Used across HotelHighlights and HotelAmenities components
 */

// Icon mapping by type (for highlights from backend)
export const iconTypeMap: Record<string, any> = {
  'wifi': Wifi,
  'restaurant': UtensilsCrossed,
  'parking': Car,
  'reception': Clock,
  'pool': Waves,
  'aircon': Wind,
  'gym': Dumbbell,
  'spa': Sparkles,
};

// Icon mapping by facility name (Vietnamese)
export const facilityNameMap: Record<string, any> = {
  // WiFi variants
  'WiFi miễn phí': Wifi,
  'Wifi miễn phí': Wifi,
  'Wi-Fi miễn phí': Wifi,
  'wifi': Wifi,
  
  // Pool variants
  'Bể bơi': Waves,
  'Hồ bơi': Waves,
  'pool': Waves,
  
  // Restaurant variants
  'Nhà hàng': UtensilsCrossed,
  'Restaurant': UtensilsCrossed,
  'Ẩm thực': Utensils,
  
  // Parking variants
  'Đỗ xe miễn phí': Car,
  'Bãi đỗ xe': Car,
  'Chỗ đỗ xe': Car,
  'parking': Car,
  
  // Other facilities
  'Phòng gym': Dumbbell,
  'Gym': Dumbbell,
  'Fitness': Dumbbell,
  'Spa': Sparkles,
  'Lễ tân 24 giờ': Clock,
  'Reception 24h': Clock,
  'Điều hòa': Wind,
  'Máy lạnh': Wind,
  'Air conditioning': Wind,
};

// Default icon for unknown facilities
export const DefaultIcon = Info;

/**
 * Get icon component by type
 */
export const getIconByType = (iconType: string): any => {
  return iconTypeMap[iconType.toLowerCase()] || DefaultIcon;
};

/**
 * Get icon component by facility name
 */
export const getIconByName = (facilityName: string): any => {
  // Try exact match first
  if (facilityNameMap[facilityName]) {
    return facilityNameMap[facilityName];
  }
  
  // Try case-insensitive partial match
  const lowerName = facilityName.toLowerCase();
  for (const [key, icon] of Object.entries(facilityNameMap)) {
    if (key.toLowerCase().includes(lowerName) || lowerName.includes(key.toLowerCase())) {
      return icon;
    }
  }
  
  return DefaultIcon;
};

