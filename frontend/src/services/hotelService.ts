import api from "../api/axiosClient";

export const searchHotels = async (params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
}) => {
  try {
    const beParams = {
      q: params.destination,
      checkin: params.checkIn,
      checkout: params.checkOut,
      adults: params.guests,
      rooms: params.rooms,
      children: params.children,
    };
    const res = await api.get("/api/hotels/search", { params: beParams });
    return res.data;
  } catch (error: any) {
    console.error("Lỗi gọi API searchHotels:", error);
    return { success: false, message: "Không thể tìm kiếm khách sạn." };
  }
};