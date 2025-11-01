import { BookingRepository } from "../../Repository/Booking/booking.repository";
import { AvailabilityRepository } from "../../Repository/Hotel/availability.repository";
import { RoomRepository } from "../../Repository/Hotel/room.repository";
import {
  CreateBookingRequest,
  CreateTemporaryBookingRequest,
  BookingConfirmation,
  BookingResponse,
  Booking,
  BookingDetail,
  BookingStatus
} from "../../models/Booking/booking.model";
import { BookingValidator } from "../../utils/booking.validator";
import { calculateNights } from "../../helpers/date.helper";

export class BookingService {
  private bookingRepo = new BookingRepository();
  private availabilityRepo = new AvailabilityRepository();
  private roomRepo = new RoomRepository();

  // ✅ Tạo booking tạm thời (status CREATED) khi vào trang booking
  async createTemporaryBooking(
    request: CreateTemporaryBookingRequest,
    accountId: string
  ): Promise<BookingResponse<{ bookingId: string; bookingCode: string; expiresAt: Date }>> {
    try {
      // Validate basic info
      if (!request.hotelId || !request.roomTypeId || !request.checkIn || !request.checkOut) {
        return { 
          success: false, 
          message: "Thiếu thông tin cần thiết để tạo booking tạm thời" 
        };
      }

      // Verify hotel exists
      const hotel = await this.bookingRepo.getHotelById(request.hotelId);
      if (!hotel) {
        return { 
          success: false, 
          message: "Khách sạn không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // ✅ Check availability by roomTypeId first (aggregate check for all rooms of this type)
      const availabilityCheck = await this.availabilityRepo.hasEnoughRoomTypeAvailability(
        request.roomTypeId,
        request.checkIn,
        request.checkOut,
        request.rooms
      );

      if (!availabilityCheck.hasEnough) {
        console.log('⚠️ Availability check failed:', {
          roomTypeId: request.roomTypeId,
          checkIn: request.checkIn,
          checkOut: request.checkOut,
          rooms: request.rooms,
          minAvailable: availabilityCheck.minAvailable
        });
        return {
          success: false,
          message: `Không đủ phòng trống. Hiện chỉ còn ${availabilityCheck.minAvailable} phòng, bạn cần ${request.rooms} phòng. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
        };
      }

      // ✅ CRITICAL FIX: When booking rooms, we only need 1 physical room regardless of request.rooms
      // request.rooms is the number of bookings (booking units), not physical rooms
      // For 1 booking, we always select 1 physical room (the first available room)
      // ✅ Get available rooms - only need 1 physical room for ANY number of booking units
      const availableRooms = await this.availabilityRepo.getAvailableRoomsInType(
        request.roomTypeId,
        request.checkIn,
        request.checkOut,
        1 // ✅ Always check for 1 physical room only - request.rooms is booking units, not physical rooms
      );
      
      console.log('🔍 Available rooms found:', {
        roomTypeId: request.roomTypeId,
        checkIn: request.checkIn,
        checkOut: request.checkOut,
        bookingUnits: request.rooms, // ✅ Clarify: this is booking units, not physical rooms
        availableRoomsCount: availableRooms.length,
        availableRooms: availableRooms.map(r => ({ room_id: r.room_id, minAvailable: r.minAvailable }))
      });
      
      if (availableRooms.length === 0) {
        return {
          success: false,
          message: `Không tìm thấy phòng trống cho loại phòng này trong khoảng thời gian ${request.checkIn} đến ${request.checkOut}. Có thể thiếu dữ liệu giá trong hệ thống cho một số ngày. Vui lòng chọn ngày khác.`
        };
      }

      // ✅ CRITICAL: Always select ONLY 1 physical room (the first available room)
      // request.rooms is booking units (like booking 1 room for 2 nights = 1 booking unit)
      // We always lock 1 physical room, regardless of request.rooms value
      const selectedRoomId = availableRooms[0].room_id;
      
      console.log('✅ Selected 1 physical room:', {
        roomId: selectedRoomId,
        bookingUnits: request.rooms,
        note: 'request.rooms is booking units, not physical rooms. We always select 1 physical room.'
      });

      // Calculate price
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

      // ✅ CRITICAL FIX: Always lock ONLY 1 physical room, regardless of request.rooms
      // request.rooms is booking units (not physical rooms), but we always lock 1 physical room
      // Lock 1 physical room (reserve for 20 minutes)
      const lockResult = await this.availabilityRepo.reduceAvailableRooms(
        selectedRoomId,
        request.checkIn,
        request.checkOut,
        1 // ✅ Always lock 1 physical room only
      );

      if (!lockResult.success) {
        return {
          success: false,
          message: "Không thể đặt phòng. Phòng có thể đã được đặt bởi người khác."
        };
      }

      // Create temporary booking (status CREATED)
      const bookingId = this.bookingRepo.generateBookingId();
      const bookingCode = this.bookingRepo.generateBookingCode();
      
      // Expires in 20 minutes
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 20);

      const booking: Omit<Booking, 'created_at' | 'updated_at'> = {
        booking_id: bookingId,
        account_id: accountId,
        hotel_id: request.hotelId,
        status: 'CREATED',
        subtotal: priceCalculation.subtotal,
        tax_amount: priceCalculation.taxAmount,
        discount_amount: priceCalculation.discountAmount,
        total_amount: priceCalculation.totalAmount,
        special_requests: undefined
      };

      const bookingCreated = await this.bookingRepo.createBooking(booking);
      if (!bookingCreated) {
        // Rollback: increase availability
        await this.availabilityRepo.increaseAvailableRooms(
          selectedRoomId,
          request.checkIn,
          request.checkOut,
          request.rooms
        );
        return {
          success: false,
          message: "Không thể tạo booking tạm thời. Vui lòng thử lại."
        };
      }

      // Create booking detail with basic info
      const guestsCount = request.adults + (request.children || 0);
      const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount / request.rooms;

      const bookingDetail: BookingDetail = {
        booking_detail_id: this.bookingRepo.generateBookingDetailId(),
        booking_id: bookingId,
        room_id: selectedRoomId,
        checkin_date: request.checkIn,
        checkout_date: request.checkOut,
        guests_count: guestsCount,
        price_per_night: avgPricePerNight,
        nights_count: priceCalculation.nightsCount,
        total_price: priceCalculation.subtotal
      };

      const detailCreated = await this.bookingRepo.createBookingDetail(bookingDetail);
      if (!detailCreated) {
        // Rollback
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

      return {
        success: true,
        data: {
          bookingId,
          bookingCode,
          expiresAt
        },
        message: "Booking tạm thời đã được tạo. Bạn có 20 phút để hoàn tất đặt phòng."
      };

    } catch (error: any) {
      console.error("[BookingService] createTemporaryBooking error:", error.message || error);
      return {
        success: false,
        message: error.message || "Lỗi khi tạo booking tạm thời"
      };
    }
  }

  // ✅ Tạo hoặc update booking (hoàn tất booking từ CREATED)
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

      // ✅ CRITICAL FIX: Check if this is updating an existing temporary booking
      let existingBooking: any = null;
      let bookingId: string;
      let bookingCode: string;

      console.log('🔍 Checking for existing booking:', {
        bookingId: request.bookingId,
        accountId,
        hasBookingId: !!request.bookingId
      });

      if (request.bookingId) {
        // ✅ Get existing booking
        existingBooking = await this.bookingRepo.getBookingById(request.bookingId);
        
        console.log('🔍 Existing booking lookup result:', {
          bookingId: request.bookingId,
          found: !!existingBooking,
          status: existingBooking?.status,
          account_id: existingBooking?.account_id
        });

        if (!existingBooking) {
          console.error('❌ Booking not found, but bookingId was provided:', request.bookingId);
          return {
            success: false,
            message: "Không tìm thấy booking tạm thời. Vui lòng thử lại."
          };
        }

        // Verify ownership
        if (existingBooking.account_id !== accountId) {
          console.error('❌ Booking ownership mismatch:', {
            bookingAccountId: existingBooking.account_id,
            currentAccountId: accountId
          });
          return {
            success: false,
            message: "Bạn không có quyền cập nhật booking này"
          };
        }

        // ✅ CRITICAL FIX: Only allow updating CREATED bookings
        // If status is not CREATED, reject the update
        if (existingBooking.status !== 'CREATED') {
          console.error('❌ Cannot update booking with non-CREATED status:', {
            bookingId: request.bookingId,
            currentStatus: existingBooking.status
          });
          return {
            success: false,
            message: `Booking này đã được xử lý (status: ${existingBooking.status}). Vui lòng tạo booking mới.`
          };
        }

        // ✅ Use existing booking ID and code
        bookingId = request.bookingId;
        bookingCode = existingBooking.booking_code || this.bookingRepo.generateBookingCode();
        
        console.log('✅ Using existing CREATED booking to update:', {
          bookingId,
          bookingCode,
          status: existingBooking.status
        });
      } else {
        // ⚠️ This should NOT happen in normal flow - we should always have bookingId
        console.warn('⚠️ WARNING: Creating new booking without bookingId - this should not happen in normal flow!');
        console.warn('⚠️ Frontend should always provide temporaryBookingId when submitting booking');
        bookingId = this.bookingRepo.generateBookingId();
        bookingCode = this.bookingRepo.generateBookingCode();
        console.log('⚠️ Created new booking instead of updating:', {
          bookingId,
          bookingCode
        });
      }

      // Step 2: Verify hotel exists and is active
      const hotel = await this.bookingRepo.getHotelById(request.hotelId);
      if (!hotel) {
        return { 
          success: false, 
          message: "Khách sạn không tồn tại hoặc đã ngưng hoạt động" 
        };
      }

      // ✅ Room selection logic
      let selectedRoomId: string | undefined = request.roomId;
      
      if (existingBooking) {
        // ✅ Updating temporary booking - use existing room_id from booking_detail
        if (existingBooking.room_id) {
          selectedRoomId = existingBooking.room_id;
          console.log('✅ Using existing room_id from temporary booking:', selectedRoomId);
        } else if (!selectedRoomId && (request as any).roomTypeId) {
          // Fallback: If no room_id in booking_detail, try to auto-select
          console.warn('⚠️ No room_id in booking_detail, attempting to auto-select...');
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
          
          selectedRoomId = availableRooms[0].roomId;
        }
      } else {
        // ✅ Creating new booking - auto-select room if roomTypeId provided
        if (!selectedRoomId && (request as any).roomTypeId) {
          // ✅ CRITICAL FIX: Always select only 1 physical room, regardless of request.rooms
          // request.rooms is booking units, not physical rooms
          const availableRooms = await this.availabilityRepo.getAvailableRoomsInType(
            (request as any).roomTypeId,
            request.checkIn,
            request.checkOut,
            1 // ✅ Always check for 1 physical room only
          );
          
          if (availableRooms.length === 0) {
            return {
              success: false,
              message: "Không tìm thấy phòng trống cho loại phòng này"
            };
          }
          
          // ✅ Always select only 1 physical room (the first available room)
          selectedRoomId = availableRooms[0].room_id;
          
          console.log('✅ Auto-selected 1 physical room for new booking:', {
            roomId: selectedRoomId,
            bookingUnits: request.rooms,
            note: 'request.rooms is booking units, not physical rooms'
          });
        }
      }

      // Validate selectedRoomId is defined
      if (!selectedRoomId) {
        return {
          success: false,
          message: "Thiếu thông tin phòng. Vui lòng chọn phòng hoặc loại phòng."
        };
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

      // Step 4: Calculate price (always needed)
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

      // ✅ Step 5: Availability check and lock logic
      // Nếu đang update temporary booking → có thể dates thay đổi, cần handle lock/unlock
      // Nếu tạo booking mới → cần check và lock phòng
      if (existingBooking) {
        // ✅ Updating temporary booking
        // Verify room matches existing booking detail
        if (existingBooking.room_id && existingBooking.room_id !== selectedRoomId) {
          return {
            success: false,
            message: "Phòng đã thay đổi. Vui lòng tạo booking mới."
          };
        }

        // ✅ Check if dates changed - if yes, need to update lock
        const datesChanged = existingBooking.checkin_date !== request.checkIn || 
                             existingBooking.checkout_date !== request.checkOut;

        if (datesChanged) {
          console.log('🔄 Dates changed - updating availability lock:', {
            oldCheckIn: existingBooking.checkin_date,
            oldCheckOut: existingBooking.checkout_date,
            newCheckIn: request.checkIn,
            newCheckOut: request.checkOut
          });

          // ✅ CRITICAL FIX: Always lock/unlock ONLY 1 physical room, regardless of request.rooms
          // Step 5.1: Release lock for old dates (1 physical room only)
          await this.availabilityRepo.increaseAvailableRooms(
            selectedRoomId,
            existingBooking.checkin_date,
            existingBooking.checkout_date,
            1 // ✅ Always release 1 physical room only
          );

          // Step 5.2: Check availability for new dates (1 physical room only)
          const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
            selectedRoomId,
            request.checkIn,
            request.checkOut,
            1 // ✅ Always check for 1 physical room only
          );

          if (!hasEnough) {
            // Rollback: re-lock old dates if new dates not available (1 physical room only)
            await this.availabilityRepo.reduceAvailableRooms(
              selectedRoomId,
              existingBooking.checkin_date,
              existingBooking.checkout_date,
              1 // ✅ Always lock 1 physical room only
            );
            return {
              success: false,
              message: `Không đủ phòng trống cho ngày mới. Vui lòng chọn ngày khác.`
            };
          }

          // Step 5.3: Lock new dates (1 physical room only)
          const lockResult = await this.availabilityRepo.reduceAvailableRooms(
            selectedRoomId,
            request.checkIn,
            request.checkOut,
            1 // ✅ Always lock 1 physical room only
          );

          if (!lockResult.success) {
            // Rollback: re-lock old dates if failed to lock new dates (1 physical room only)
            await this.availabilityRepo.reduceAvailableRooms(
              selectedRoomId,
              existingBooking.checkin_date,
              existingBooking.checkout_date,
              1 // ✅ Always lock 1 physical room only
            );
            return {
              success: false,
              message: "Không thể cập nhật ngày đặt phòng. Vui lòng thử lại."
            };
          }

          console.log('✅ Successfully updated dates - released old lock, locked new dates');
        } else {
          console.log('✅ Updating existing temporary booking - dates unchanged, room already locked');
        }
      } else {
        // ✅ Creating new booking - need to check and lock room
        // ✅ CRITICAL FIX: Always check for 1 physical room only, regardless of request.rooms
        // Step 5.1: Re-check availability (CRITICAL - prevent double booking)
        const hasEnough = await this.availabilityRepo.hasEnoughAvailability(
          selectedRoomId,
          request.checkIn,
          request.checkOut,
          1 // ✅ Always check for 1 physical room only
        );

        if (!hasEnough) {
          return {
            success: false,
            message: `Không đủ phòng trống. Vui lòng chọn số phòng ít hơn hoặc thời gian khác.`
          };
        }

          // ✅ CRITICAL FIX: Always lock ONLY 1 physical room, regardless of request.rooms
          // request.rooms is booking units (not physical rooms), but we always lock 1 physical room
          // Step 5.2: Lock rooms - Reduce availability (ATOMIC OPERATION)
          const lockResult = await this.availabilityRepo.reduceAvailableRooms(
            selectedRoomId,
            request.checkIn,
            request.checkOut,
            1 // ✅ Always lock 1 physical room only
          );

        if (!lockResult.success) {
          return {
            success: false,
            message: "Không thể đặt phòng. Phòng có thể đã được đặt bởi người khác."
          };
        }
      }

      // Step 7: Create or update booking record
      // ✅ Determine booking status based on payment method
      // - CASH (pay at hotel): CONFIRMED (trả sau - thanh toán tại khách sạn)
      // - VNPAY/MOMO: PAID (trả ngay - đã thanh toán online)
      const finalStatus: BookingStatus = request.paymentMethod === 'CASH' 
        ? 'CONFIRMED'   // Trả sau → CONFIRMED
        : 'PAID';       // Trả ngay (VNPAY/MOMO) → PAID

      if (existingBooking) {
        // ✅ CRITICAL FIX: Update existing temporary booking (CREATED -> CONFIRMED/PAID)
        console.log('✅ Updating existing CREATED booking:', {
          bookingId,
          oldStatus: existingBooking.status,
          newStatus: finalStatus,
          checkIn: { old: existingBooking.checkin_date, new: request.checkIn },
          checkOut: { old: existingBooking.checkout_date, new: request.checkOut }
        });

        // Check if dates changed - if yes, need to update booking_detail and totals
        const datesChanged = existingBooking.checkin_date !== request.checkIn || 
                             existingBooking.checkout_date !== request.checkOut;

        // Update booking totals if dates or price changed
        const updateBookingData: any = {
          status: finalStatus,
          special_requests: request.specialRequests || null
        };

        if (datesChanged) {
          // Update booking totals with new price calculation
          updateBookingData.subtotal = priceCalculation.subtotal;
          updateBookingData.tax_amount = priceCalculation.taxAmount;
          updateBookingData.discount_amount = priceCalculation.discountAmount;
          updateBookingData.total_amount = priceCalculation.totalAmount;
          
          console.log('📊 Dates changed - updating booking totals:', {
            datesChanged: true,
            newSubtotal: updateBookingData.subtotal,
            newTotalAmount: updateBookingData.total_amount
          });
        }

        console.log('📤 Calling updateBooking with:', {
          bookingId,
          updateData: updateBookingData
        });

        const updated = await this.bookingRepo.updateBooking(bookingId, updateBookingData);
        
        console.log('📥 updateBooking result:', {
          bookingId,
          updated,
          updateData: updateBookingData
        });

        if (!updated) {
          // If dates changed, rollback availability changes
          if (datesChanged) {
            await this.availabilityRepo.increaseAvailableRooms(
              selectedRoomId,
              request.checkIn,
              request.checkOut,
              request.rooms
            );
            await this.availabilityRepo.reduceAvailableRooms(
              selectedRoomId,
              existingBooking.checkin_date,
              existingBooking.checkout_date,
              request.rooms
            );
          }
          return {
            success: false,
            message: "Không thể cập nhật booking. Vui lòng thử lại."
          };
        }

        // ✅ Update booking_detail if dates changed
        if (datesChanged) {
          const guestsCount = request.adults + (request.children || 0);
          const avgPricePerNight = priceCalculation.subtotal / priceCalculation.nightsCount / request.rooms;

          const detailUpdated = await this.bookingRepo.updateBookingDetail(bookingId, {
            checkin_date: request.checkIn,
            checkout_date: request.checkOut,
            guests_count: guestsCount,
            price_per_night: avgPricePerNight,
            nights_count: priceCalculation.nightsCount,
            total_price: priceCalculation.subtotal
          });

          if (!detailUpdated) {
            console.error('⚠️ Failed to update booking_detail, but booking was updated');
            // Don't fail the entire request, as booking was updated successfully
          }
        }
      } else {
        // ⚠️ CRITICAL ERROR: This branch should NOT execute in normal flow
        // We should ALWAYS have existingBooking when bookingId is provided
        console.error('❌ CRITICAL ERROR: Creating new booking instead of updating!');
        console.error('❌ This means bookingId was provided but existingBooking was not found!');
        console.error('❌ Request details:', {
          bookingId: request.bookingId,
          accountId,
          hotelId: request.hotelId
        });
        
        // ✅ Create new booking (shouldn't happen in normal flow, but kept for safety)
        const booking: Omit<Booking, 'created_at' | 'updated_at'> = {
          booking_id: bookingId,
          account_id: accountId,
          hotel_id: request.hotelId,
          status: finalStatus,
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
      }

      // Step 8: Create booking detail (only if new booking, not for existing)
      if (!existingBooking) {
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
        status: finalStatus, // ✅ Use final booking status (CONFIRMED or PAID)
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
        paymentStatus: finalStatus === 'PAID' ? 'paid' : 'pending', // ✅ PAID nếu trả ngay
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

