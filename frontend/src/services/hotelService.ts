import api from "../api/axiosClient";

export const searchHotels = async (params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
  stayType?: 'overnight' | 'dayuse';
  categoryId?: string;
  starMin?: number;
  facilities?: string[];
  bedTypes?: string[];
  policies?: string[];
  maxDistance?: number;
  sort?: string;
}) => {
  try {
    const beParams: any = {
      q: params.destination,
      adults: params.guests,
      rooms: params.rooms,
      children: params.children,
      stayType: params.stayType || 'overnight',
    };

    // Date params
    if (params.stayType === 'dayuse') {
      beParams.date = params.checkIn;
    } else {
      beParams.checkin = params.checkIn;
      beParams.checkout = params.checkOut;
    }

    // Filter params
    if (params.categoryId) beParams.category_id = params.categoryId;
    if (params.starMin) beParams.star_min = params.starMin;
    if (params.facilities && params.facilities.length > 0) beParams.facilities = params.facilities.join(',');
    if (params.bedTypes && params.bedTypes.length > 0) beParams.bed_types = params.bedTypes.join(',');
    if (params.policies && params.policies.length > 0) beParams.policies = params.policies.join(',');
    if (params.maxDistance) beParams.max_distance = params.maxDistance;
    if (params.sort) beParams.sort = params.sort;

    const res = await api.get("/api/hotels/search", { params: beParams });
    return res.data;
  } catch (error: any) {
    console.error("Lỗi gọi API searchHotels:", error);
    return { success: false, message: "Không thể tìm kiếm khách sạn." };
  }
};