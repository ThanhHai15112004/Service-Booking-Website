import { HotelSearchParams } from "../models/hotel.model";
import { computeRequiredPerRoom } from "./occupancy.helper";

export interface ValidatedSearch {
  success: boolean;
  message?: string;
  data?: {
    q: string;
    checkin?: string;
    checkout?: string;
    nights?: number;

    date?: string;

    rooms: number;
    adults: number;
    children: number;
    childAges: number[];
    requiredPerRoom: number;
  };
}

export function validateHotelSearchOvernight(params: HotelSearchParams): ValidatedSearch {
  const {
    q = "",
    checkin,
    checkout,
    rooms,
    adults,
    children = 0,
    // thêm optional nếu bạn truyền từ controller: ?childAges=13,6,15,3
    // (không có thì coi như [])
    childAges = [],
  } = params as any;

  if (!checkin || !checkout) {
    return { success: false, message: "Thiếu ngày nhận/trả phòng." };
  }

  if (!rooms || rooms < 1 || !adults || adults < 1) {
    return { success: false, message: "Số phòng hoặc số người không hợp lệ." };
  }

  const nights = Math.max(
    Math.ceil((new Date(checkout).getTime() - new Date(checkin).getTime()) / (1000 * 60 * 60 * 24)),
    0
  );
  if (nights < 1) {
    return { success: false, message: "Ngày trả phòng phải sau ngày nhận phòng." };
  }

  const { requiredPerRoom } = computeRequiredPerRoom({
    rooms,
    adults,
    children,
    childAges,
    mode: "adults_only",
  });

  return {
    success: true,
    data: {
      q,
      checkin,
      checkout,
      rooms,
      adults,
      children,
      childAges,
      requiredPerRoom,
      nights,
    },
  };
}

// Validate tìm kiếm day-use
export function validateHotelSearchDayuse(params: HotelSearchParams): ValidatedSearch {
  const {
    q="",
    date,
    rooms,
    adults,
    children = 0,
    childAges = [],
  } = params as any;

  if (!date) {
    return { success: false, message: "Thiếu ngày lưu trú (day-use)." };
  }

  if (!rooms || rooms < 1 || !adults || adults < 1) {
    return { success: false, message: "Số phòng hoặc số người không hợp lệ." };
  }

  const {requiredPerRoom} = computeRequiredPerRoom({
    rooms,
    adults,
    children,
    childAges,
    mode: "adults_only",
  });

  const nights = 1;

   return {
    success: true,
    data: {
      q,
      date,
      rooms,
      adults,
      children,
      childAges,
      requiredPerRoom,
      nights: 1,
    },
  }

}