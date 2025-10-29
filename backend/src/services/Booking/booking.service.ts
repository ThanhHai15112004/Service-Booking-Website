import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import {
  CreateBookingRequest,
  BookingConfirmation,
  BookingResponse,
  Booking,
  BookingDetail
} from "../../models/Booking/booking.model";
import { BookingValidator } from "../../utils/booking.validator";
import { calculateNights } from "../../helpers/date.helper";

export class BookingService {
  private bookingRepo = new BookingRepository();
  private availabilityRepo = new AvailabilityRepository();

  // Tạo booking mới
  async createBooking(
    request: CreateBookingRequest,
    accountId: string
  ): Promise<BookingResponse<BookingConfirmation>> {
    try {
      console.log(`\n🎫 === CREATE BOOKING ===`);
      console.log(`👤 Account ID: ${accountId}`);
      console.log(`🏨 Hotel ID: ${request.hotelId}`);
      console.log(`🚪 Room ID: ${request.roomId}`);
      console.log(`📅 ${request.checkIn} → ${request.checkOut}`);
      console.log(`🔢 Rooms: ${request.rooms}, Adults: ${request.adults}, Children: ${request.children || 0}`);

      // Step 1: Validate request
      const validation = BookingValidator.validateCreateBookingRequest(request);
      if (!validation.valid) {
        console.log(`❌ Validation failed: ${validation.message}`);
        return { success: false, message: validation.message };
      }

      // Step 2: Verify hotel exists and is active
      const hotel = await this.bookingRepo.getHotelById(request.hotelId);
      if (!hotel) {
        return { 
          success: false, 
          message: "Khách sạn không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // Step 3: Verify room exists, is active, and belongs to hotel
      const room = await this.bookingRepo.getRoomById(request.roomId);
      if (!room) {
        return { 
          success: false, 
          message: "Phòng không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      if (room.hotel_id !== request.hotelId) {
        return { 
          success: false, 
          message: "Phòng không thuộc khách sạn này" 
        };
      }

      // Step 4: Re-check availability (CRITICAL - prevent double booking)
      console.log(`🔍 Re-checking availability...`);
      const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
        request.roomId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );

      if (!hasEnough) {
        return {
          success: false,
          message: `Không đủ phòng trống. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
        };
      }

      // Step 5: Calculate price
      console.log(`💰 Calculating price...`);
      const priceCalculation = await this.bookingRepo.calculateBookingPrice(
        request.roomId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );

      if (!priceCalculation) {
        return {
          success: false,
          message: "Không tìm thấy thông tin giá cho khoảng thời gian này"
        };
      }

      // Step 6: Lock rooms - Reduce availability (ATOMIC OPERATION)
      console.log(`🔒 Locking ${request.rooms} room(s)...`);
      const lockResult = await this.availabilityRepo.reduceAvailableRooms(
        request.roomId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );

      if (!lockResult.success) {
        return {
          success: false,
          message: "Không thể đặt phòng. Phòng có thể đã được đặt bởi người khác."
        };
      }

      // Step 7: Create booking record
      console.log(`📝 Creating booking record...`);
      const bookingId = this.bookingRepo.generateBookingId();
      const bookingCode = this.bookingRepo.generateBookingCode();

      const booking: Omit<Booking, 'created_at' | 'updated_at'> = {
        booking_id: bookingId,
        account_id: accountId,
        hotel_id: request.hotelId,
        status: 'CONFIRMED',
        subtotal: priceCalculation.subtotal,
        tax_amount: priceCalculation.taxAmount,
        discount_amount: priceCalculation.discountAmount,
        total_amount: priceCalculation.totalAmount,
        special_requests: request.specialRequests
      };

      const bookingCreated = await this.bookingRepo.createBooking(booking);
      if (!bookingCreated) {
        // Rollback: tăng lại availability
        console.log(`❌ Booking creation failed, rolling back...`);
        await this.availabilityRepo.increaseAvailableRooms(
          request.roomId,
          request.checkIn,
          request.checkOut,
          request.rooms
        );
        return {
          success: false,
          message: "Không thể tạo booking. Vui lòng thử lại."
        };
      }

      // Step 8: Create booking detail
      console.log(`📋 Creating booking detail...`);
      const totalGuests = request.adults + (request.children || 0);
      const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount / request.rooms;

      const bookingDetail: BookingDetail = {
        booking_detail_id: this.bookingRepo.generateBookingDetailId(),
        booking_id: bookingId,
        room_id: request.roomId,
        checkin_date: request.checkIn,
        checkout_date: request.checkOut,
        guests_count: totalGuests,
        price_per_night: avgPricePerNight,
        nights_count: priceCalculation.nightsCount,
        total_price: priceCalculation.subtotal
      };

      const detailCreated = await this.bookingRepo.createBookingDetail(bookingDetail);
      if (!detailCreated) {
        // Rollback: cancel booking và tăng lại availability
        console.log(`❌ Booking detail creation failed, rolling back...`);
        await this.bookingRepo.cancelBooking(bookingId);
        await this.availabilityRepo.increaseAvailableRooms(
          request.roomId,
          request.checkIn,
          request.checkOut,
          request.rooms
        );
        return {
          success: false,
          message: "Không thể tạo booking detail. Vui lòng thử lại."
        };
      }

      // Step 9: Calculate payment deadline (24 hours from now for CASH/bank transfer)
      let paymentDeadline: string | undefined;
      if (request.paymentMethod !== 'VNPAY' && request.paymentMethod !== 'MOMO') {
        const deadline = new Date();
        deadline.setHours(deadline.getHours() + 24);
        paymentDeadline = deadline.toISOString();
      }

      // Step 10: Prepare booking confirmation
      const confirmation: BookingConfirmation = {
        bookingId: bookingId,
        bookingCode: bookingCode,
        status: 'CONFIRMED',
        hotel: {
          id: hotel.hotel_id,
          name: hotel.name,
          address: hotel.address,
          phone: hotel.phone_number
        },
        room: {
          id: room.room_id,
          name: room.room_type_name,
          type: room.bed_type
        },
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        nights: priceCalculation.nightsCount,
        rooms: request.rooms,
        adults: request.adults,
        children: request.children,
        guestInfo: request.guestInfo,
        priceBreakdown: {
          subtotal: priceCalculation.subtotal,
          taxAmount: priceCalculation.taxAmount,
          discountAmount: priceCalculation.discountAmount,
          totalPrice: priceCalculation.totalAmount
        },
        paymentMethod: request.paymentMethod,
        paymentStatus: 'pending',
        paymentDeadline: paymentDeadline,
        specialRequests: request.specialRequests,
        createdAt: new Date()
      };

      console.log(`✅ Booking created successfully: ${bookingId}`);
      console.log(`📧 Booking code: ${bookingCode}`);

      // TODO: Step 11: Send confirmation email
      // await this.sendConfirmationEmail(confirmation);

      return {
        success: true,
        data: confirmation,
        message: "Đặt phòng thành công!"
      };

    } catch (error: any) {
      console.error("❌ Service error - createBooking:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo booking"
      };
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<BookingResponse<any>> {
    try {
      const validation = BookingValidator.validateBookingId(bookingId);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking"
        };
      }

      return {
        success: true,
        data: booking
      };
    } catch (error: any) {
      console.error("❌ Service error - getBookingById:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy thông tin booking"
      };
    }
  }

  // Get bookings by account ID
  async getBookingsByAccount(accountId: string): Promise<BookingResponse<any[]>> {
    try {
      const bookings = await this.bookingRepo.getBookingsByAccountId(accountId);
      
      return {
        success: true,
        data: bookings
      };
    } catch (error: any) {
      console.error("❌ Service error - getBookingsByAccount:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi lấy danh sách booking"
      };
    }
  }

  // Cancel booking
  async cancelBooking(bookingId: string, accountId: string): Promise<BookingResponse<any>> {
    try {
      const validation = BookingValidator.validateBookingId(bookingId);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      // Get booking to verify ownership and get room info
      const booking = await this.bookingRepo.getBookingById(bookingId);
      if (!booking) {
        return {
          success: false,
          message: "Không tìm thấy booking"
        };
      }

      // Verify ownership
      if (booking.account_id !== accountId) {
        return {
          success: false,
          message: "Bạn không có quyền hủy booking này"
        };
      }

      // Check if already cancelled
      if (booking.status === 'CANCELLED') {
        return {
          success: false,
          message: "Booking đã được hủy trước đó"
        };
      }

      // Cancel booking
      const cancelled = await this.bookingRepo.cancelBooking(bookingId);
      if (!cancelled) {
        return {
          success: false,
          message: "Không thể hủy booking"
        };
      }

      // Release rooms - increase availability
      const roomsCount = 1; // TODO: Lấy từ booking detail nếu có nhiều phòng
      await this.availabilityRepo.increaseAvailableRooms(
        booking.room_id,
        booking.checkin_date,
        booking.checkout_date,
        roomsCount
      );

      return {
        success: true,
        message: "Hủy booking thành công"
      };
    } catch (error: any) {
      console.error("❌ Service error - cancelBooking:", error);
      return {
        success: false,
        message: error.message || "Lỗi khi hủy booking"
      };
    }
  }
}

