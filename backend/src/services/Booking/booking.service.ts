import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import { RoomRepository } from "../../Repository/Hotel/room.repository";
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
  private roomRepo = new RoomRepository();

  // Tạo booking mới
  async createBooking(
    request: CreateBookingRequest,
    accountId: string
  ): Promise<BookingResponse<BookingConfirmation>> {
    try {
      // Step 1: Validate request
      const validation = BookingValidator.validateCreateBookingRequest(request);
      if (!validation.valid) {
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

      // ✅ NEW: Auto-select room if roomTypeId is provided instead of roomId
      let selectedRoomId = request.roomId;
      if (!selectedRoomId && (request as any).roomTypeId) {
        // User chọn room_type, system tự động chọn phòng đầu tiên
        const availableRooms = await this.roomRepo.getAvailableRoomsByRoomTypeId(
          (request as any).roomTypeId,
          request.checkIn,
          request.checkOut,
          request.rooms
        );
        
        if (availableRooms.length === 0) {
          return {
            success: false,
            message: "Không tìm thấy phòng trống cho loại phòng này"
          };
        }
        
        // Chọn phòng đầu tiên từ danh sách
        selectedRoomId = availableRooms[0].roomId;
      }

      // Step 3: Verify room exists, is active, and belongs to hotel
      const room = await this.bookingRepo.getRoomById(selectedRoomId);
      if (!room) {
        return { 
          success: false, 
          message: "Phòng không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // Note: room.hotel_id lấy từ room_type.hotel_id (sau khi xóa room.hotel_id)
      if (room.hotel_id !== request.hotelId) {
        return { 
          success: false, 
          message: "Phòng không thuộc khách sạn này" 
        };
      }

      // Step 3.5: Validate capacity (CRITICAL)
      const totalCapacity = room.capacity * request.rooms;
      const totalGuests = request.adults + (request.children || 0);

      if (totalCapacity < totalGuests) {
        const minRoomsNeeded = Math.ceil(totalGuests / room.capacity);
        return {
          success: false,
          message: `Không đủ chỗ! Phòng ${room.room_type_name || 'này'} chỉ chứa tối đa ` +
                   `${room.capacity} người/phòng. Bạn đặt ${request.rooms} phòng ` +
                   `(tổng capacity: ${totalCapacity} người) nhưng có ${totalGuests} người. ` +
                   `Vui lòng đặt ít nhất ${minRoomsNeeded} phòng hoặc giảm số người.`
        };
      }

      // Step 4: Re-check availability (CRITICAL - prevent double booking)
      const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
        selectedRoomId,
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
      const priceCalculation = await this.bookingRepo.calculateBookingPrice(
        selectedRoomId,
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
      const lockResult = await this.availabilityRepo.reduceAvailableRooms(
        selectedRoomId,
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
        await this.availabilityRepo.increaseAvailableRooms(
          selectedRoomId,
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
      const guestsCount = request.adults + (request.children || 0);
      const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount / request.rooms;

      const bookingDetail: BookingDetail = {
        booking_detail_id: this.bookingRepo.generateBookingDetailId(),
        booking_id: bookingId,
        room_id: selectedRoomId, // ✅ Use selected room ID
        checkin_date: request.checkIn,
        checkout_date: request.checkOut,
        guests_count: guestsCount,
        price_per_night: avgPricePerNight,
        nights_count: priceCalculation.nightsCount,
        total_price: priceCalculation.subtotal
      };

      const detailCreated = await this.bookingRepo.createBookingDetail(bookingDetail);
      if (!detailCreated) {
        // Rollback: cancel booking và tăng lại availability
        await this.bookingRepo.cancelBooking(bookingId);
        await this.availabilityRepo.increaseAvailableRooms(
          selectedRoomId,
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
          id: selectedRoomId, // ✅ Use selected room ID
          name: room.room_type_name,
          type: room.bed_type,
          roomNumber: room.room_number || null // ✅ Include room number for provider
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

      // TODO: Step 11: Send confirmation email
      // await this.sendConfirmationEmail(confirmation);

      return {
        success: true,
        data: confirmation,
        message: "Đặt phòng thành công!"
      };

    } catch (error: any) {
      console.error("[BookingService] createBooking error:", error.message || error);
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
      console.error("[BookingService] getBookingById error:", error.message || error);
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
      console.error("[BookingService] getBookingsByAccount error:", error.message || error);
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
      console.error("[BookingService] cancelBooking error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi hủy booking"
      };
    }
  }
}

