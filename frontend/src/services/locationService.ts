import api from "../api/axiosClient";

export interface Location {
  locationId: string;
  country: string;
  city: string;
  district?: string | null;
  ward?: string | null;
  areaName?: string | null;
}

// Tìm kiếm locations theo query
export const searchLocations = async (query: string, limit: number = 10) => {
  try {
    const res = await api.get('/api/locations', {
      params: { q: query, limit }
    });
    
    if (res.data.success && res.data.items) {
      return {
        success: true,
        items: res.data.items as Location[]
      };
    }
    
    return {
      success: false,
      items: []
    };
  } catch (error) {
    console.error('Lỗi tìm kiếm địa điểm:', error);
    return {
      success: false,
      items: []
    };
  }
};

// Format location display name
export const formatLocationDisplay = (location: Location): string => {
  return [location.city, location.district, location.country]
    .filter(Boolean)
    .join(', ');
};

// Format location detail
export const formatLocationDetail = (location: Location): string => {
  return [location.ward, location.areaName, location.country]
    .filter(Boolean)
    .join(' • ');
};
