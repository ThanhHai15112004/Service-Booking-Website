# TASK BREAKDOWN - HỆ THỐNG SEARCH & BOOKING KHÁCH SẠN

## 📋 TỔNG QUAN

Document này phân tích và chia nhỏ các task cần thiết để xây dựng hệ thống search và booking khách sạn hoàn chỉnh, với trọng tâm là **duy trì trạng thái search (ngày, số người, số phòng) xuyên suốt luồng từ tìm kiếm → chi tiết khách sạn → đặt phòng**.

---

## 🎯 PHÂN TÍCH LUỒNG NGHIỆP VỤ (Theo mô hình Agoda)

### Luồng người dùng:
```
[Search Page] 
   ↓ (Input: destination, checkin, checkout, rooms, adults, children)
[Search Results List] 
   ↓ (Click vào hotel, GIỮ LẠI tất cả params)
[Hotel Detail Page]
   ↓ (Click "Đặt phòng", GIỮ LẠI tất cả params + roomId)
[Booking Page]
   ↓ (Confirm booking với đầy đủ thông tin)
[Payment & Confirmation]
```

### Dữ liệu cần duy trì xuyên suốt:
- `checkIn`: Ngày check-in (YYYY-MM-DD)
- `checkOut`: Ngày check-out (YYYY-MM-DD)
- `rooms`: Số phòng cần đặt
- `adults`: Số người lớn
- `children`: Số trẻ em (optional)
- `childAges`: Độ tuổi của từng trẻ em (optional)
- `los`: Length of Stay (số đêm) - tính tự động

---

## 📊 PHÂN TÍCH AGODA URLs

### 1. **Search URL** (Danh sách khách sạn)
```
https://www.agoda.com/vi-vn/search?
  checkIn=2025-10-29
  &checkOut=2025-10-31
  &rooms=1
  &adults=1
  &children=0
  &los=2
  &city=17190
  &textToSearch=Vũng Tàu
  &sort=priceLowToHigh
```

**Params quan trọng:**
- `checkIn`, `checkOut`: Ngày ở
- `rooms`, `adults`, `children`: Số lượng
- `los`: Length of Stay (2 đêm)
- `city`: ID địa điểm
- `sort`: Sắp xếp kết quả

### 2. **Hotel Detail URL** (Chi tiết khách sạn)
```
https://www.agoda.com/vi-vn/hd-home-apartment-h17217510/hotel/vung-tau-vn.html?
  checkIn=2025-10-29
  &checkOut=2025-10-31
  &rooms=1
  &adults=1
  &children=0
  &los=2
```

**Nhận xét:** 
- ✅ **GIỮ NGUYÊN** tất cả params từ search
- Thêm hotel slug/ID vào URL path
- Frontend sẽ gọi API lấy chi tiết hotel + available rooms với params này

### 3. **Booking URL** (Trang đặt phòng)
```
https://www.agoda.com/vi-vn/book/?
  (encrypted params)
```

**Nhận xét:**
- Params được mã hóa (security)
- Server-side sẽ validate lại tất cả thông tin
- Giữ session hoặc pass qua API với đầy đủ params

---

## 🏗️ CÁC TASK CẦN LÀM

---

## ✅ PHASE 1: BACKEND - API ENDPOINTS

### Task 1.1: API Search Hotels với Availability Check
**File:** `backend/src/controllers/HotelModules/hotel.controller.ts`

**Endpoint:** `GET /api/hotels/search`

**Query Params:**
```typescript
{
  destination?: string,      // Tên thành phố/quận/khu vực
  checkIn: string,           // YYYY-MM-DD (required)
  checkOut: string,          // YYYY-MM-DD (required)
  rooms: number,             // default: 1
  adults: number,            // default: 2
  children?: number,         // default: 0
  childAges?: string,        // VD: "5,7,10"
  category?: string,
  minPrice?: number,
  maxPrice?: number,
  facilities?: string,       // comma-separated IDs
  bedTypes?: string,
  policies?: string,
  starRating?: number,
  sortBy?: string,           // "price_asc", "price_desc", "rating"
  page?: number,
  limit?: number
}
```

**Logic:**
1. ✅ **Validate** checkIn, checkOut (dùng `availability.validator.ts`)
2. ✅ **Tính số đêm** (dùng `date.helper.ts`)
3. ✅ **Query hotels** có phòng trống trong khoảng thời gian
4. ✅ **JOIN với `room_price_schedule`** để lọc available rooms
5. ✅ **Trả về danh sách hotels** với thông tin phòng trống và giá

**Output Example:**
```typescript
{
  success: true,
  data: {
    hotels: [
      {
        hotelId: "H001",
        hotelName: "Grand Hotel",
        starRating: 5,
        avgRating: 4.8,
        reviewCount: 1250,
        mainImage: "https://...",
        location: {
          city: "Vũng Tàu",
          district: "...",
          areaName: "...",
          distanceCenter: 2.5
        },
        availableRooms: [
          {
            roomId: "R001",
            roomName: "Deluxe Double",
            capacity: 2,
            minPrice: 1500000,      // Giá thấp nhất trong khoảng thời gian
            avgPrice: 1650000,      // Giá trung bình
            totalNights: 2,
            minAvailable: 3         // Số phòng trống ít nhất trong kỳ
          }
        ],
        searchParams: {             // GIỮ LẠI để pass sang chi tiết
          checkIn: "2025-10-29",
          checkOut: "2025-10-31",
          rooms: 1,
          adults: 2,
          children: 0
        }
      }
    ],
    pagination: { page: 1, limit: 20, total: 150 }
  }
}
```

---

### Task 1.2: API Get Hotel Detail với Available Rooms
**File:** `backend/src/controllers/HotelModules/hotel.controller.ts`

**Endpoint:** `GET /api/hotels/:hotelId`

**Query Params:**
```typescript
{
  checkIn: string,           // YYYY-MM-DD (required)
  checkOut: string,          // YYYY-MM-DD (required)
  rooms: number,             // default: 1
  adults: number,            // default: 2
  children?: number
}
```

**Logic:**
1. ✅ Lấy thông tin chi tiết hotel
2. ✅ Lấy tất cả facilities, policies
3. ✅ **GỌI availability.service** để lấy danh sách phòng trống theo ngày
4. ✅ Tính tổng giá cho từng loại phòng
5. ✅ Check capacity phòng có đủ cho số người không

**Output Example:**
```typescript
{
  success: true,
  data: {
    hotel: {
      hotelId: "H001",
      name: "Grand Hotel",
      description: "...",
      address: "...",
      starRating: 5,
      avgRating: 4.8,
      reviewCount: 1250,
      images: [...],
      facilities: [...],
      policies: [...]
    },
    availableRooms: [
      {
        roomId: "R001",
        roomName: "Deluxe Double",
        roomType: "Double",
        capacity: 2,
        area: 35,
        bedType: "King Bed",
        facilities: [...],
        dailyAvailability: [
          {
            date: "2025-10-29",
            basePrice: 1500000,
            discountPercent: 10,
            finalPrice: 1350000,
            availableRooms: 5,
            refundable: true,
            payLater: true
          },
          {
            date: "2025-10-30",
            basePrice: 1800000,
            discountPercent: 0,
            finalPrice: 1800000,
            availableRooms: 3,
            refundable: true,
            payLater: false
          }
        ],
        totalPrice: 3150000,      // Tổng 2 đêm
        avgPricePerNight: 1575000,
        minAvailable: 3,          // Số phòng có thể đặt tối đa
        hasFullAvailability: true // Có phòng trống cả kỳ
      }
    ],
    searchParams: {               // GIỮ LẠI để pass sang booking
      checkIn: "2025-10-29",
      checkOut: "2025-10-31",
      rooms: 1,
      adults: 2,
      children: 0,
      los: 2
    }
  }
}
```

---

### Task 1.3: API Check Specific Room Availability
**File:** `backend/src/controllers/HotelModules/availability.controller.ts`

**Endpoint:** `GET /api/availability/room/:roomId`

**Status:** ✅ ĐÃ CÓ (đã implement)

**Cần bổ sung:**
- Thêm query param `roomsCount` để check xem có đủ N phòng không

---

### Task 1.4: API Create Booking (Đặt phòng)
**File:** `backend/src/controllers/Booking/booking.controller.ts` (CHƯA CÓ - CẦN TẠO MỚI)

**Endpoint:** `POST /api/bookings`

**Request Body:**
```typescript
{
  hotelId: string,
  roomId: string,
  checkIn: string,           // YYYY-MM-DD
  checkOut: string,          // YYYY-MM-DD
  rooms: number,             // Số phòng đặt
  adults: number,
  children?: number,
  childAges?: number[],
  
  // Thông tin khách hàng
  guestInfo: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    country?: string
  },
  
  // Yêu cầu đặc biệt
  specialRequests?: string,
  
  // Phương thức thanh toán
  paymentMethod: "credit_card" | "bank_transfer" | "pay_later"
}
```

**Logic:**
1. ✅ **Validate** tất cả input
2. ✅ **Re-check availability** (quan trọng! Tránh double booking)
3. ✅ **Calculate total price** từ `room_price_schedule`
4. ✅ **Lock phòng** (giảm `available_rooms` trong DB) - GỌI `availability.repository.reduceAvailableRooms()`
5. ✅ **Tạo booking record** trong DB
6. ✅ **Send confirmation email**
7. ✅ **Return booking confirmation**

**Output:**
```typescript
{
  success: true,
  data: {
    bookingId: "BK001",
    bookingCode: "AGD-123456",
    status: "confirmed",
    hotel: {...},
    room: {...},
    checkIn: "2025-10-29",
    checkOut: "2025-10-31",
    nights: 2,
    rooms: 1,
    adults: 2,
    totalPrice: 3150000,
    paymentStatus: "pending",
    paymentDeadline: "2025-10-27T23:59:59Z"
  }
}
```

---

## ✅ PHASE 2: DATABASE SCHEMA

### Task 2.1: Tạo bảng `bookings`
**File:** `backend/database/booking_database.sql`

```sql
CREATE TABLE bookings (
  booking_id VARCHAR(50) PRIMARY KEY,
  booking_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Foreign keys
  account_id VARCHAR(50),
  hotel_id VARCHAR(50) NOT NULL,
  room_id VARCHAR(50) NOT NULL,
  
  -- Booking details
  check_in_date DATE NOT NULL,
  check_out_date DATE NOT NULL,
  nights INT NOT NULL,
  rooms_count INT DEFAULT 1,
  adults_count INT NOT NULL,
  children_count INT DEFAULT 0,
  
  -- Pricing
  total_price DECIMAL(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'VND',
  
  -- Guest info
  guest_first_name VARCHAR(100) NOT NULL,
  guest_last_name VARCHAR(100) NOT NULL,
  guest_email VARCHAR(100) NOT NULL,
  guest_phone VARCHAR(20) NOT NULL,
  guest_country VARCHAR(100),
  
  -- Additional
  special_requests TEXT,
  
  -- Status
  status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',
  payment_status ENUM('pending', 'paid', 'refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_deadline DATETIME,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (account_id) REFERENCES accounts(account_id),
  FOREIGN KEY (hotel_id) REFERENCES hotels(hotel_id),
  FOREIGN KEY (room_id) REFERENCES rooms(room_id),
  
  INDEX idx_check_in (check_in_date),
  INDEX idx_check_out (check_out_date),
  INDEX idx_status (status),
  INDEX idx_guest_email (guest_email)
);
```

---

### Task 2.2: Tạo bảng `booking_room_details`
Lưu chi tiết giá theo từng ngày của booking.

```sql
CREATE TABLE booking_room_details (
  id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  discount_percent INT DEFAULT 0,
  final_price DECIMAL(10,2) NOT NULL,
  
  FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
  INDEX idx_booking_date (booking_id, date)
);
```

---

## ✅ PHASE 3: FRONTEND - STATE MANAGEMENT

### Task 3.1: Tạo Search Context/Store
**File:** `frontend/src/contexts/SearchContext.tsx` (MỚI)

**Mục đích:** Lưu trữ và chia sẻ search params xuyên suốt app

```typescript
interface SearchParams {
  destination: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  childAges: number[];
  los: number; // Length of stay
}

interface SearchContextType {
  searchParams: SearchParams;
  updateSearchParams: (params: Partial<SearchParams>) => void;
  clearSearchParams: () => void;
}
```

**Functions:**
- `updateSearchParams()`: Cập nhật một phần params
- `calculateLOS()`: Tính số đêm từ checkIn/checkOut
- `validateDates()`: Validate ngày hợp lệ
- Lưu vào `localStorage` để persist khi refresh

---

### Task 3.2: Update Search Component
**File:** `frontend/src/components/Search/SearchForm.tsx`

**Changes:**
1. ✅ Sử dụng `SearchContext` để lưu params
2. ✅ Khi submit search → update context → navigate to `/hotels/search`
3. ✅ Validate dates (checkOut > checkIn, checkIn >= today)
4. ✅ Tính `los` tự động

**URL Example:**
```
/hotels/search?checkIn=2025-10-29&checkOut=2025-10-31&rooms=1&adults=2&children=0
```

---

### Task 3.3: Hotels List Page
**File:** `frontend/src/pages/Clients/HotelsListPage.tsx`

**Changes:**
1. ✅ Đọc params từ URL query
2. ✅ Sync với `SearchContext`
3. ✅ Call API `GET /api/hotels/search` với params
4. ✅ Hiển thị search bar cho phép **THAY ĐỔI** ngày/số người
5. ✅ Khi thay đổi → update URL & re-fetch

**Component Structure:**
```tsx
<HotelsListPage>
  <SearchBar 
    initialParams={searchParams} 
    onChange={handleSearchChange}
  />
  
  <FilterSidebar />
  
  <HotelsList>
    {hotels.map(hotel => (
      <HotelCard 
        hotel={hotel}
        searchParams={searchParams}  // PASS PARAMS
        onClick={() => navigateToDetail(hotel.hotelId, searchParams)}
      />
    ))}
  </HotelsList>
</HotelsListPage>
```

---

### Task 3.4: Hotel Detail Page
**File:** `frontend/src/pages/Clients/HotelDetailPage.tsx`

**Changes:**
1. ✅ Đọc `hotelId` từ URL params
2. ✅ Đọc `checkIn`, `checkOut`, `rooms`, `adults`, `children` từ URL query
3. ✅ Sync với `SearchContext`
4. ✅ Call API `GET /api/hotels/:hotelId?checkIn=...&checkOut=...`
5. ✅ Hiển thị available rooms với giá theo ngày
6. ✅ Button "Đặt phòng" → navigate với params

**URL Example:**
```
/hotels/H001?checkIn=2025-10-29&checkOut=2025-10-31&rooms=1&adults=2&children=0
```

**Component Structure:**
```tsx
<HotelDetailPage>
  <HotelHeader hotel={hotel} />
  <HotelImageGallery images={hotel.images} />
  
  {/* STICKY SEARCH BAR - Cho phép đổi ngày */}
  <SearchBar 
    initialParams={searchParams}
    onChange={handleSearchChange}
    compact={true}
  />
  
  <HotelInfo hotel={hotel} />
  <HotelAmenities facilities={hotel.facilities} />
  
  {/* DANH SÁCH PHÒNG TRỐNG */}
  <AvailableRooms>
    {availableRooms.map(room => (
      <RoomCard 
        room={room}
        searchParams={searchParams}
        onBook={() => navigateToBooking(room.roomId, searchParams)}
      />
    ))}
  </AvailableRooms>
  
  <HotelPolicies policies={hotel.policies} />
</HotelDetailPage>
```

---

### Task 3.5: Booking Page
**File:** `frontend/src/pages/Clients/BookingPage.tsx`

**Changes:**
1. ✅ Đọc `roomId` từ URL params
2. ✅ Đọc search params từ URL query hoặc `SearchContext`
3. ✅ Call API để lấy lại room details (re-check availability)
4. ✅ Hiển thị booking summary (readonly - không cho đổi ngày nữa)
5. ✅ Form nhập thông tin khách hàng
6. ✅ Submit → Call API `POST /api/bookings`

**URL Example:**
```
/booking/R001?checkIn=2025-10-29&checkOut=2025-10-31&rooms=1&adults=2
```

**Component Structure:**
```tsx
<BookingPage>
  {/* SUMMARY - READONLY */}
  <BookingSummary 
    hotel={hotel}
    room={room}
    checkIn={searchParams.checkIn}
    checkOut={searchParams.checkOut}
    nights={searchParams.los}
    rooms={searchParams.rooms}
    adults={searchParams.adults}
    children={searchParams.children}
    totalPrice={totalPrice}
  />
  
  {/* GUEST INFO FORM */}
  <GuestInfoForm onSubmit={handleSubmit} />
  
  {/* PAYMENT METHOD */}
  <PaymentForm />
  
  {/* SPECIAL REQUESTS */}
  <SpecialRequestsForm />
  
  <ConfirmButton onClick={handleBooking} />
</BookingPage>
```

---

## ✅ PHASE 4: REPOSITORY & SERVICE LAYERS

### Task 4.1: Hotel Repository - Add Search Method
**File:** `backend/src/Repository/Hotel/hotel.repository.ts`

**Status:** ✅ ĐÃ CÓ `searchHotels()` nhưng cần CHECK LẠI

**Cần đảm bảo:**
- Join với `room_price_schedule`
- Filter `available_rooms > 0`
- Group by hotel và tính giá min/avg
- Return đầy đủ thông tin room available

---

### Task 4.2: Booking Repository (MỚI)
**File:** `backend/src/Repository/Booking/booking.repository.ts` (TẠO MỚI)

**Methods:**
```typescript
class BookingRepository {
  // Tạo booking mới
  async createBooking(data: BookingData): Promise<Booking>
  
  // Lấy booking theo ID
  async getBookingById(bookingId: string): Promise<Booking | null>
  
  // Lấy bookings của user
  async getBookingsByUser(accountId: string): Promise<Booking[]>
  
  // Update booking status
  async updateBookingStatus(bookingId: string, status: string): Promise<void>
  
  // Cancel booking
  async cancelBooking(bookingId: string): Promise<void>
  
  // Lưu chi tiết giá theo ngày
  async saveBookingRoomDetails(bookingId: string, details: DailyPrice[]): Promise<void>
}
```

---

### Task 4.3: Booking Service (MỚI)
**File:** `backend/src/services/Booking/booking.service.ts` (TẠO MỚI)

**Methods:**
```typescript
class BookingService {
  // Xử lý logic đặt phòng
  async createBooking(data: BookingRequest): Promise<BookingResponse>
  
  // Re-check availability trước khi book
  async validateBookingAvailability(params): Promise<boolean>
  
  // Tính tổng giá từ room_price_schedule
  async calculateTotalPrice(roomId, checkIn, checkOut, rooms): Promise<number>
  
  // Generate booking code
  private generateBookingCode(): string
  
  // Hủy booking và release phòng
  async cancelBooking(bookingId: string): Promise<void>
}
```

---

## ✅ PHASE 5: MODELS & TYPES

### Task 5.1: Booking Model (MỚI)
**File:** `backend/src/models/Booking/booking.model.ts` (TẠO MỚI)

```typescript
export interface Booking {
  bookingId: string;
  bookingCode: string;
  accountId?: string;
  hotelId: string;
  roomId: string;
  checkInDate: string;
  checkOutDate: string;
  nights: number;
  roomsCount: number;
  adultsCount: number;
  childrenCount: number;
  totalPrice: number;
  currency: string;
  guestFirstName: string;
  guestLastName: string;
  guestEmail: string;
  guestPhone: string;
  guestCountry?: string;
  specialRequests?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  paymentDeadline?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingRequest {
  hotelId: string;
  roomId: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children?: number;
  childAges?: number[];
  guestInfo: GuestInfo;
  specialRequests?: string;
  paymentMethod: string;
}

export interface GuestInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country?: string;
}
```

---

### Task 5.2: Frontend Types (UPDATE)
**File:** `frontend/src/types/index.ts`

**Add:**
```typescript
export interface SearchParams {
  destination?: string;
  checkIn: string;
  checkOut: string;
  rooms: number;
  adults: number;
  children: number;
  childAges?: number[];
  los?: number;
}

export interface Booking {
  bookingId: string;
  bookingCode: string;
  hotel: Hotel;
  room: Room;
  checkIn: string;
  checkOut: string;
  nights: number;
  rooms: number;
  adults: number;
  children: number;
  totalPrice: number;
  status: string;
  paymentStatus: string;
}
```

---

## ✅ PHASE 6: VALIDATORS & HELPERS

### Task 6.1: Booking Validator (MỚI)
**File:** `backend/src/utils/booking.validator.ts` (TẠO MỚI)

```typescript
export class BookingValidator {
  // Validate booking request
  static validateBookingRequest(data: any): ValidationResult<BookingRequest>
  
  // Validate guest info
  static validateGuestInfo(info: any): ValidationResult<GuestInfo>
  
  // Validate số lượng phòng/người
  static validateOccupancy(rooms: number, adults: number, children: number): ValidationResult<boolean>
  
  // Validate payment method
  static validatePaymentMethod(method: string): ValidationResult<string>
}
```

---

### Task 6.2: URL Helper (MỚI)
**File:** `frontend/src/utils/url.helper.ts` (TẠO MỚI)

```typescript
// Build URL with search params
export const buildHotelDetailUrl = (
  hotelId: string, 
  searchParams: SearchParams
): string => {
  const params = new URLSearchParams({
    checkIn: searchParams.checkIn,
    checkOut: searchParams.checkOut,
    rooms: searchParams.rooms.toString(),
    adults: searchParams.adults.toString(),
    children: searchParams.children.toString()
  });
  return `/hotels/${hotelId}?${params.toString()}`;
}

// Parse search params from URL
export const parseSearchParams = (searchParams: URLSearchParams): SearchParams => {
  return {
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    rooms: parseInt(searchParams.get('rooms') || '1'),
    adults: parseInt(searchParams.get('adults') || '2'),
    children: parseInt(searchParams.get('children') || '0')
  };
}
```

---

## ✅ PHASE 7: INTEGRATION & TESTING

### Task 7.1: Test Availability Flow
1. ✅ Test search hotels với ngày cụ thể
2. ✅ Verify available rooms trả về đúng
3. ✅ Test thay đổi ngày → kết quả thay đổi
4. ✅ Test edge cases (không có phòng trống, ngày quá khứ, v.v.)

### Task 7.2: Test Booking Flow
1. ✅ Test tạo booking thành công
2. ✅ Test double-booking (2 người book cùng lúc)
3. ✅ Test cancel booking → phòng được release
4. ✅ Test booking với số phòng > available

### Task 7.3: Test State Persistence
1. ✅ Search → Detail → Refresh → params vẫn giữ nguyên
2. ✅ Detail → Booking → Back → params vẫn đúng
3. ✅ LocalStorage sync đúng

---

## 📝 CHECKLIST TỔNG QUAN

### Backend:
- [x] **Task 1.1:** API Search Hotels với availability ✅ DONE
- [ ] **Task 1.2:** API Get Hotel Detail với available rooms
- [ ] **Task 1.3:** Bổ sung `roomsCount` cho availability check
- [ ] **Task 1.4:** API Create Booking
- [ ] **Task 2.1:** Tạo bảng `bookings`
- [ ] **Task 2.2:** Tạo bảng `booking_room_details`
- [ ] **Task 4.1:** Check lại Hotel Repository
- [ ] **Task 4.2:** Tạo Booking Repository
- [ ] **Task 4.3:** Tạo Booking Service
- [ ] **Task 5.1:** Tạo Booking Model
- [ ] **Task 6.1:** Tạo Booking Validator

### Frontend:
- [ ] **Task 3.1:** Tạo SearchContext
- [ ] **Task 3.2:** Update SearchForm component
- [ ] **Task 3.3:** Update HotelsListPage (sync params)
- [ ] **Task 3.4:** Update HotelDetailPage (sync params)
- [ ] **Task 3.5:** Update BookingPage (readonly params)
- [ ] **Task 5.2:** Update Frontend Types
- [ ] **Task 6.2:** Tạo URL Helper

### Testing:
- [ ] **Task 7.1:** Test Availability Flow
- [ ] **Task 7.2:** Test Booking Flow
- [ ] **Task 7.3:** Test State Persistence

---

## 🎯 ƯU TIÊN THỰC HIỆN

### 🔴 HIGH PRIORITY (Làm trước):
1. **SearchContext** (Frontend) - Core state management
2. **API Search Hotels** (Backend) - Endpoint chính
3. **API Hotel Detail** (Backend) - Lấy phòng trống
4. **URL Helper** (Frontend) - Maintain params across pages
5. **Update HotelsListPage** (Frontend) - Hiển thị kết quả search

### 🟡 MEDIUM PRIORITY:
6. **Update HotelDetailPage** (Frontend) - Chi tiết + phòng trống
7. **Database Schema** (Backend) - Bảng bookings
8. **Booking Repository & Service** (Backend)
9. **API Create Booking** (Backend)
10. **Booking Validator** (Backend)

### 🟢 LOW PRIORITY (Làm sau):
11. **BookingPage** (Frontend) - Trang đặt phòng
12. **Testing** - Test toàn bộ flow
13. **Email Service** - Gửi confirmation email
14. **Payment Integration** - Tích hợp thanh toán

---

## 💡 LƯU Ý QUAN TRỌNG

### 1. **Params PHẢI được maintain xuyên suốt:**
```
Search → SearchContext → URL Query Params → API Calls → Next Page → Repeat
```

### 2. **Mỗi trang PHẢI:**
- ✅ Đọc params từ URL
- ✅ Sync với SearchContext
- ✅ Pass params sang API
- ✅ Pass params sang trang kế tiếp

### 3. **Security:**
- ✅ Re-validate tất cả params ở backend
- ✅ Re-check availability trước khi tạo booking
- ✅ Use transaction khi giảm `available_rooms`

### 4. **UX:**
- ✅ Cho phép thay đổi ngày ở mọi trang (trừ Booking)
- ✅ Hiển thị rõ số đêm, tổng giá
- ✅ Loading states khi fetch data
- ✅ Error handling khi không có phòng trống

---

## 🚀 KẾT LUẬN

Document này cung cấp **roadmap đầy đủ** để implement hệ thống search và booking khách sạn theo mô hình của Agoda, với trọng tâm là **duy trì trạng thái search params** xuyên suốt luồng người dùng.

**Bắt đầu từ:** SearchContext (Frontend) + API Search Hotels (Backend)

**Kết thúc tại:** Booking Success + Email Confirmation

---

📅 **Created:** 2025-10-28  
👤 **Author:** AI Assistant  
📌 **Project:** Service Booking Website

