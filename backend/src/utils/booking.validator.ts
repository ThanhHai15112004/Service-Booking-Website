import { CreateBookingRequest, GuestInfo, PaymentMethod } from "../models/Booking/booking.model";

interface ValidationResult<T = any> {
  valid: boolean;
  message?: string;
  data?: T;
}

export class BookingValidator {
  // Validate booking ID format
  static validateBookingId(bookingId: string): ValidationResult {
    if (!bookingId || typeof bookingId !== 'string') {
      return { valid: false, message: "Booking ID không hợp lệ" };
    }

    if (!bookingId.match(/^BK\d{12}$/)) {
      return { valid: false, message: "Booking ID phải có format BKxxxxxxxxxx" };
    }

    return { valid: true };
  }

  // Validate hotel ID
  static validateHotelId(hotelId: string): ValidationResult {
    if (!hotelId || typeof hotelId !== 'string') {
      return { valid: false, message: "Hotel ID không hợp lệ" };
    }

    if (!hotelId.match(/^H\d{3,}$/)) {
      return { valid: false, message: "Hotel ID không đúng format" };
    }

    return { valid: true };
  }

  // Validate room ID
  static validateRoomId(roomId: string): ValidationResult {
    if (!roomId || typeof roomId !== 'string') {
      return { valid: false, message: "Room ID không hợp lệ" };
    }

    if (!roomId.match(/^R\d{3,}$/)) {
      return { valid: false, message: "Room ID không đúng format" };
    }

    return { valid: true };
  }

  // Validate date format and logic
  static validateDates(checkIn: string, checkOut: string): ValidationResult<{ checkIn: Date; checkOut: Date }> {
    // Check format YYYY-MM-DD
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    if (!datePattern.test(checkIn)) {
      return { valid: false, message: "Check-in date phải có format YYYY-MM-DD" };
    }
    if (!datePattern.test(checkOut)) {
      return { valid: false, message: "Check-out date phải có format YYYY-MM-DD" };
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Validate dates
    if (isNaN(checkInDate.getTime())) {
      return { valid: false, message: "Check-in date không hợp lệ" };
    }
    if (isNaN(checkOutDate.getTime())) {
      return { valid: false, message: "Check-out date không hợp lệ" };
    }

    // Check-in phải từ hôm nay trở đi
    if (checkInDate < today) {
      return { valid: false, message: "Check-in date không được là ngày quá khứ" };
    }

    // Check-out phải sau check-in
    if (checkOutDate <= checkInDate) {
      return { valid: false, message: "Check-out date phải sau check-in date" };
    }

    // Không cho phép đặt quá 30 ngày
    const daysDiff = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      return { valid: false, message: "Không thể đặt phòng quá 30 ngày" };
    }

    return {
      valid: true,
      data: { checkIn: checkInDate, checkOut: checkOutDate }
    };
  }

  // Validate số phòng
  static validateRoomsCount(rooms: number): ValidationResult {
    if (typeof rooms !== 'number' || !Number.isInteger(rooms)) {
      return { valid: false, message: "Số phòng phải là số nguyên" };
    }

    if (rooms < 1) {
      return { valid: false, message: "Số phòng phải >= 1" };
    }

    if (rooms > 10) {
      return { valid: false, message: "Không thể đặt quá 10 phòng cùng lúc" };
    }

    return { valid: true };
  }

  // Validate số người lớn và trẻ em
  static validateGuests(adults: number, children?: number): ValidationResult {
    if (typeof adults !== 'number' || !Number.isInteger(adults)) {
      return { valid: false, message: "Số người lớn phải là số nguyên" };
    }

    if (adults < 1) {
      return { valid: false, message: "Phải có ít nhất 1 người lớn" };
    }

    if (adults > 20) {
      return { valid: false, message: "Số người lớn không được quá 20" };
    }

    if (children !== undefined) {
      if (typeof children !== 'number' || !Number.isInteger(children)) {
        return { valid: false, message: "Số trẻ em phải là số nguyên" };
      }

      if (children < 0) {
        return { valid: false, message: "Số trẻ em không được âm" };
      }

      if (children > 10) {
        return { valid: false, message: "Số trẻ em không được quá 10" };
      }
    }

    return { valid: true };
  }

  // Validate guest info
  static validateGuestInfo(guestInfo: GuestInfo): ValidationResult {
    if (!guestInfo) {
      return { valid: false, message: "Thông tin khách hàng là bắt buộc" };
    }

    // Validate firstName
    if (!guestInfo.firstName || typeof guestInfo.firstName !== 'string') {
      return { valid: false, message: "Tên khách hàng là bắt buộc" };
    }
    if (guestInfo.firstName.trim().length < 2) {
      return { valid: false, message: "Tên khách hàng phải có ít nhất 2 ký tự" };
    }

    // Validate lastName
    if (!guestInfo.lastName || typeof guestInfo.lastName !== 'string') {
      return { valid: false, message: "Họ khách hàng là bắt buộc" };
    }
    if (guestInfo.lastName.trim().length < 2) {
      return { valid: false, message: "Họ khách hàng phải có ít nhất 2 ký tự" };
    }

    // Validate email
    if (!guestInfo.email || typeof guestInfo.email !== 'string') {
      return { valid: false, message: "Email là bắt buộc" };
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(guestInfo.email)) {
      return { valid: false, message: "Email không hợp lệ" };
    }

    // Validate phone
    if (!guestInfo.phone || typeof guestInfo.phone !== 'string') {
      return { valid: false, message: "Số điện thoại là bắt buộc" };
    }
    const phonePattern = /^[0-9+\-\s()]{8,20}$/;
    if (!phonePattern.test(guestInfo.phone)) {
      return { valid: false, message: "Số điện thoại không hợp lệ" };
    }

    return { valid: true };
  }

  // Validate payment method
  static validatePaymentMethod(method: string): ValidationResult<PaymentMethod> {
    const validMethods: PaymentMethod[] = ['VNPAY', 'MOMO', 'CASH'];
    
    if (!validMethods.includes(method as PaymentMethod)) {
      return { 
        valid: false, 
        message: `Payment method phải là một trong: ${validMethods.join(', ')}` 
      };
    }

    return { valid: true, data: method as PaymentMethod };
  }

  // Validate toàn bộ create booking request
  static validateCreateBookingRequest(request: CreateBookingRequest): ValidationResult<CreateBookingRequest> {
    // Validate hotel ID
    const hotelValidation = this.validateHotelId(request.hotelId);
    if (!hotelValidation.valid) {
      return hotelValidation;
    }

    // Validate room ID
    const roomValidation = this.validateRoomId(request.roomId);
    if (!roomValidation.valid) {
      return roomValidation;
    }

    // Validate dates
    const datesValidation = this.validateDates(request.checkIn, request.checkOut);
    if (!datesValidation.valid) {
      return { valid: false, message: datesValidation.message };
    }

    // Validate rooms count
    const roomsValidation = this.validateRoomsCount(request.rooms);
    if (!roomsValidation.valid) {
      return roomsValidation;
    }

    // Validate guests
    const guestsValidation = this.validateGuests(request.adults, request.children);
    if (!guestsValidation.valid) {
      return guestsValidation;
    }

    // Validate guest info
    const guestInfoValidation = this.validateGuestInfo(request.guestInfo);
    if (!guestInfoValidation.valid) {
      return guestInfoValidation;
    }

    // Validate payment method
    const paymentValidation = this.validatePaymentMethod(request.paymentMethod);
    if (!paymentValidation.valid) {
      return { valid: false, message: paymentValidation.message };
    }

    // Validate special requests (optional)
    if (request.specialRequests && request.specialRequests.length > 500) {
      return { valid: false, message: "Yêu cầu đặc biệt không được quá 500 ký tự" };
    }

    return { valid: true, data: request };
  }
}

