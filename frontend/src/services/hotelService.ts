import api from "../api/axiosClient";

export const searchHotels = async (params: {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  children: number;
  stayType?: 'overnight' | 'dayuse';
}) => {
  try {
    const beParams: any = {
      q: params.destination,
      adults: params.guests,
      rooms: params.rooms,
      children: params.children,
      stayType: params.stayType || 'overnight', // ✅ Thêm stayType
    };

    // Nếu là dayuse, gửi 'date', nếu overnight gửi 'checkin' và 'checkout'
    if (params.stayType === 'dayuse') {
      beParams.date = params.checkIn; // Chỉ gửi checkIn (là ngày được chọn)
    } else {
      beParams.checkin = params.checkIn;
      beParams.checkout = params.checkOut;
    }

    const res = await api.get("/api/hotels/search", { params: beParams });
    return res.data;
  } catch (error: any) {
    console.error("Lỗi gọi API searchHotels:", error);
    return { success: false, message: "Không thể tìm kiếm khách sạn." };
  }
};