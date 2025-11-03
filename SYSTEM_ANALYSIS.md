# 📊 PHÂN TÍCH HỆ THỐNG BOOKING DỊCH VỤ - SERVICE BOOKING WEBSITE

## 🎯 TỔNG QUAN HỆ THỐNG

Hệ thống booking dịch vụ khách sạn là một ứng dụng web fullstack với kiến trúc **MVC + Repository Pattern**, sử dụng:
- **Backend**: Node.js + Express + TypeScript + Sequelize ORM + MySQL
- **Frontend**: React 19 + TypeScript + Vite + TailwindCSS
- **Database**: MySQL/MariaDB với cấu trúc quan hệ phức tạp

---

## 🗄️ PHÂN TÍCH DATABASE SCHEMA

### 1. **CẤU TRÚC TỔNG QUAN**

Database gồm **30+ bảng** được tổ chức theo các module chính:

#### **A. Module Authentication & Account Management**
- `account`: Quản lý tài khoản người dùng
  - Hỗ trợ đa provider (LOCAL, GOOGLE, FACEBOOK)
  - Quản lý trạng thái: PENDING, ACTIVE, BANNED, DELETED
  - Quản lý role: ADMIN, STAFF, USER
  - Xác thực email với token và thời gian hết hạn
  - Reset password với token
  
- `refresh_tokens`: Quản lý refresh tokens cho JWT

#### **B. Module Hotel & Location**
- `hotel_location`: Quản lý vị trí địa lý (country, city, district, ward, area_name)
  - Hỗ trợ latitude/longitude
  - Có flag `is_hot` cho các vị trí hot
  
- `hotel_category`: Phân loại khách sạn (Khách sạn, Resort, Homestay)

- `hotel`: Thông tin khách sạn chính
  - Liên kết với category và location
  - Quản lý rating, review_count
  - Star rating (0-5)
  - Check-in/check-out time
  
- `hotel_image`: Album ảnh khách sạn
- `hotel_facility`: Quan hệ many-to-many giữa hotel và facility
- `hotel_highlight`: Highlight nổi bật của khách sạn
- `hotel_policy`: Chính sách khách sạn (free_cancellation, pay_later, airport_shuttle, etc.)

#### **C. Module Room Management**
- `room_type`: Loại phòng (Standard Double, Deluxe Sea View, etc.)
  - Liên kết với hotel
  - Có bed_type, area, description
  
- `room`: Phòng cụ thể
  - Liên kết với room_type
  - Có capacity, price_base, status (ACTIVE, INACTIVE, MAINTENANCE)
  
- `room_image`: Ảnh phòng theo room_type
- `room_amenity`: Tiện nghi phòng (many-to-many)
- `room_policy`: Chính sách phòng (free_cancellation, pay_later, children_allowed, pets_allowed, etc.)
- `room_price_schedule`: Lịch giá theo ngày
  - Hỗ trợ dynamic pricing theo date
  - Có discount_percent, available_rooms
  - Quản lý refundable, pay_later theo từng ngày

#### **D. Module Booking**
- `booking`: Đơn đặt phòng chính
  - Status: CREATED → CONFIRMED → PAID → CANCELLED
  - Tính toán subtotal, tax_amount, discount_amount, total_amount
  - Lưu special_requests
  
- `booking_detail`: Chi tiết đặt phòng
  - Mỗi booking có thể có nhiều booking_detail (multiple rooms)
  - Lưu checkin_date, checkout_date, guests_count
  - Tính price_per_night, nights_count, total_price
  
- `booking_discount`: Áp dụng mã giảm giá
- `discount_code`: Quản lý mã giảm giá

#### **E. Module Payment**
- `payment`: Giao dịch thanh toán
  - Method: VNPAY, MOMO, CASH, BANK_TRANSFER
  - Status: PENDING → SUCCESS → FAILED → REFUNDED
  - Liên kết với booking

#### **F. Module Metadata & Configuration**
- `facility`: Tiện nghi (HOTEL, ROOM)
- `bed_type_metadata`: Metadata về loại giường (Single, Double, Queen, King, Twin, Bunk)
- `highlight`: Master data cho highlights
- `policy_type`: Master data cho policies với các loại BOOLEAN, INTEGER, DECIMAL, TEXT

### 2. **ĐIỂM MẠNH CỦA DATABASE DESIGN**

✅ **Normalization tốt**: Tách biệt rõ ràng giữa metadata và business data
✅ **Flexible pricing**: Hỗ trợ dynamic pricing theo ngày qua `room_price_schedule`
✅ **Multi-room booking**: Hỗ trợ đặt nhiều phòng trong một booking
✅ **Rich metadata**: Có master data tables cho facilities, bed types, highlights
✅ **Policy flexibility**: Policies có thể là boolean, integer, decimal hoặc text
✅ **Audit trail**: Có created_at, updated_at cho hầu hết các bảng
✅ **Constraints tốt**: Sử dụng CHECK constraints cho status, ratings, etc.

### 3. **QUAN HỆ GIỮA CÁC BẢNG**

```
account (1) ── (N) booking
booking (1) ── (N) booking_detail
booking_detail (N) ── (1) room
room (N) ── (1) room_type
room_type (N) ── (1) hotel

hotel (N) ── (1) hotel_category
hotel (N) ── (1) hotel_location
hotel (1) ── (N) hotel_image
hotel (N) ── (N) facility [via hotel_facility]
hotel (N) ── (N) highlight [via hotel_highlight]
hotel (1) ── (N) hotel_policy

room (N) ── (N) facility [via room_amenity]
room (1) ── (N) room_policy
room (1) ── (N) room_price_schedule

booking (1) ── (1) payment
```

---

## 🖥️ PHÂN TÍCH BACKEND

### 1. **KIẾN TRÚC BACKEND**

Backend sử dụng kiến trúc **Layered Architecture**:

```
src/
├── config/          # Cấu hình (DB, Sequelize, Email)
├── controllers/     # Xử lý HTTP requests/responses
├── services/        # Business logic
├── Repository/      # Data access layer (tương tác với DB)
├── models/          # Sequelize models & DTOs
├── routes/          # Route definitions
├── middleware/      # Auth middleware, validators
├── helpers/         # Utility functions
├── utils/           # Validators, helpers
└── jobs/            # Cron jobs (cleanup expired bookings, unverified accounts)
```

### 2. **TECH STACK BACKEND**

- **Runtime**: Node.js với TypeScript
- **Framework**: Express.js
- **ORM**: Sequelize với sequelize-typescript
- **Database**: MySQL/MariaDB (có cả raw queries qua mysql2 pool)
- **Authentication**: JWT (Access Token + Refresh Token)
- **OAuth**: Google OAuth2 integration
- **Email**: Nodemailer
- **Validation**: Custom validators
- **Scheduling**: node-cron (cleanup jobs)

### 3. **API STRUCTURE**

#### **Authentication APIs** (`/api/auth`)
- POST `/register` - Đăng ký
- POST `/login` - Đăng nhập
- POST `/google-login` - Đăng nhập Google
- POST `/refresh-token` - Refresh access token
- POST `/verify-email` - Xác thực email
- POST `/resend-verification` - Gửi lại email xác thực
- POST `/forgot-password` - Quên mật khẩu
- POST `/reset-password` - Reset mật khẩu

#### **Hotel APIs** (`/api/hotels`)
- GET `/search` - Tìm kiếm khách sạn
  - Query params: q, checkin, checkout, adults, children, rooms, stayType
  - Filters: category_id, star_min, facilities, bed_types, policies, max_distance
  - Sorting: price_asc, price_desc, rating_desc, distance_asc
  
- GET `/:hotelId` - Chi tiết khách sạn
  - Query params: checkIn, checkOut, adults, children, rooms
  - Returns: hotel info + available rooms + search params

#### **Room APIs** (`/api/rooms`)
- GET `/availability` - Kiểm tra availability
- GET `/:roomId` - Chi tiết phòng

#### **Booking APIs** (`/api/bookings`)
- POST `/temporary` - Tạo booking tạm thời (status CREATED)
- POST `/` - Tạo/confirm booking (CREATED → CONFIRMED)
- GET `/:bookingId` - Lấy thông tin booking
- GET `/my-bookings` - Danh sách bookings của user
- PUT `/:bookingId/cancel` - Hủy booking

#### **Payment APIs** (`/api/payments`)
- POST `/` - Tạo payment
- GET `/:paymentId` - Lấy thông tin payment

### 4. **BUSINESS LOGIC CHÍNH**

#### **A. Hotel Search Logic**
1. Parse search params (destination, dates, guests, rooms)
2. Tìm location từ destination (city, area)
3. Filter hotels theo location, category, star rating, facilities
4. Check availability cho từng hotel (dựa vào room_price_schedule)
5. Tính toán best offer (giá tốt nhất) cho mỗi hotel
6. Apply filters và sorting
7. Return paginated results

#### **B. Booking Flow**
```
1. User chọn hotel + room → Tạo temporary booking (status CREATED)
   - Lock rooms trong thời gian booking (20 phút)
   - Tính toán giá tổng (subtotal, tax, discount, total)
   
2. User điền thông tin → Confirm booking (CREATED → CONFIRMED)
   - Validate lại availability
   - Validate guest info
   - Update booking với guest info
   - Giữ status CONFIRMED (chưa thanh toán)
   
3. User thanh toán → Update status (CONFIRMED → PAID)
   - Tạo payment record
   - Update booking status
   - Giảm available_rooms trong room_price_schedule
```

#### **C. Availability Check**
- Dựa vào `room_price_schedule` table
- Check từng ngày trong khoảng checkin → checkout
- Tính available_rooms = scheduled - booked (từ booking_detail)
- Validate capacity (adults + children <= room.capacity × rooms)

### 5. **ĐIỂM MẠNH CỦA BACKEND**

✅ **Separation of Concerns**: Tách biệt rõ Controller → Service → Repository
✅ **Type Safety**: Sử dụng TypeScript cho toàn bộ codebase
✅ **Error Handling**: Có error handling đồng nhất
✅ **Validation**: Có validators riêng cho booking, hotel search, availability
✅ **Cleanup Jobs**: Tự động cleanup expired bookings và unverified accounts
✅ **Flexible Search**: Hỗ trợ nhiều filters và sorting options
✅ **Dynamic Pricing**: Hỗ trợ giá theo ngày qua room_price_schedule

### 6. **CẢI THIỆN CÓ THỂ**

⚠️ **Transaction Management**: Nên sử dụng transactions cho booking operations
⚠️ **Caching**: Có thể cache hotel search results
⚠️ **Rate Limiting**: Nên thêm rate limiting cho APIs
⚠️ **Logging**: Cần logging system tốt hơn (Winston, Pino)
⚠️ **Testing**: Chưa thấy test files (nên có unit tests và integration tests)

---

## 🎨 PHÂN TÍCH FRONTEND

### 1. **KIẾN TRÚC FRONTEND**

Frontend sử dụng kiến trúc **Component-Based + Context API**:

```
src/
├── api/             # Axios client config
├── components/      # Reusable components
│   ├── Admins/     # Admin components
│   ├── BookingPage/ # Booking flow components
│   ├── common/      # Common UI components
│   ├── Header/     # Header navigation
│   ├── Hotel/       # Hotel-related components
│   ├── HotelDetailPage/ # Hotel detail components
│   ├── HotelsListPage/  # Hotel list components
│   ├── HomePage/    # Home page components
│   ├── Search/      # Search components
│   └── Toast/       # Toast notifications
├── contexts/        # React Contexts (Auth, Search)
├── hooks/           # Custom React hooks
├── layouts/         # Layout components
├── pages/           # Page components
│   ├── Admin/       # Admin pages
│   ├── Auth/        # Auth pages
│   └── Clients/      # Client pages
├── routes/          # Route definitions
├── services/        # API service functions
└── types/           # TypeScript type definitions
```

### 2. **TECH STACK FRONTEND**

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: TailwindCSS
- **HTTP Client**: Axios
- **OAuth**: @react-oauth/google
- **Date Handling**: date-fns, react-date-range
- **Icons**: lucide-react

### 3. **ROUTING STRUCTURE**

```
/                    → HomePage
/hotels              → HotelLandingPage
/hotels/search       → HotelsListPage (search results)
/hotel/:id           → HotelDetailPage
/booking/:id         → BookingPage (protected)

/login               → LoginPage
/register            → RegisterPage
/verify-email        → VerifyEmailPage
/forgot-password     → ForgotPasswordPage
/reset-password      → ForgotPasswordPage

/profile             → ProfilePage (protected)
/bookings            → My Bookings (protected, coming soon)
/favorites           → Favorites (protected, coming soon)

/unauthorized        → UnauthorizedPage
/account-suspended   → AccountSuspendedPage
```

### 4. **STATE MANAGEMENT**

#### **A. Auth Context**
- Quản lý: `isLoggedIn`, `user`, `accessToken`
- Lưu trữ: localStorage
- Methods: `login`, `logout`, `googleLoginHandler`, `updateAccessToken`

#### **B. Search Context**
- Quản lý search params: `destination`, `checkIn`, `checkOut`, `guests`, `rooms`
- Lưu trong localStorage hoặc context state

### 5. **COMPONENT STRUCTURE**

#### **Hotel Detail Page Components**
- `HotelHeader.tsx`: Header với breadcrumb, hotel name, rating
- `HotelHeaderSection.tsx`: Section hiển thị hotel images
- `HotelMainContent.tsx`: Main content với tabs (Overview, Rooms, Policies, Reviews)
- `RoomCard.tsx`: Card hiển thị room với availability và pricing
- `SimilarHotelsSection.tsx`: Hiển thị các khách sạn tương tự

#### **Booking Page Components**
- Multi-step booking flow
- Step 1: Review booking details
- Step 2: Guest information
- Step 3: Payment

### 6. **API SERVICE LAYER**

Các service functions wrap API calls:
- `hotelService.ts`: searchHotels, getHotelDetail, getSimilarHotelsInCity
- `bookingService.ts`: createTemporaryBooking, createBooking, getBooking
- `authService.tsx`: login, register, googleLogin, refreshToken
- `locationService.ts`: getLocations, getHotelCounts

### 7. **ĐIỂM MẠNH CỦA FRONTEND**

✅ **Type Safety**: Sử dụng TypeScript cho toàn bộ
✅ **Component Reusability**: Có nhiều reusable components
✅ **Responsive Design**: Sử dụng TailwindCSS cho responsive
✅ **Error Handling**: Có error states và loading states
✅ **User Experience**: Có toast notifications, loading indicators
✅ **Protected Routes**: Có ProtectedRoute component cho auth required pages

### 8. **CẢI THIỆN CÓ THỂ**

⚠️ **State Management**: Có thể sử dụng Redux hoặc Zustand cho complex state
⚠️ **Form Handling**: Nên sử dụng React Hook Form hoặc Formik
⚠️ **Error Boundaries**: Nên có error boundaries để catch errors
⚠️ **Lazy Loading**: Nên lazy load routes và components
⚠️ **SEO**: Cần SEO optimization (meta tags, SSR có thể)
⚠️ **Testing**: Chưa thấy test files (nên có React Testing Library)

---

## 🔄 WORKFLOW CHÍNH CỦA HỆ THỐNG

### 1. **SEARCH → BOOKING FLOW**

```
1. User search hotels
   Frontend: HomePage → HotelsListPage
   API: GET /api/hotels/search?q=Hà Nội&checkin=2025-11-01&checkout=2025-11-02&adults=2&rooms=1
   Backend: HotelService.searchHotels()
   - Parse search params
   - Find location
   - Filter hotels
   - Check availability
   - Calculate best offers
   - Return results

2. User click hotel → Hotel Detail
   Frontend: HotelsListPage → HotelDetailPage
   API: GET /api/hotels/:hotelId?checkIn=...&checkOut=...&adults=2&rooms=1
   Backend: HotelService.getHotelDetail()
   - Get hotel info + images + facilities + highlights
   - Get available rooms (check room_price_schedule)
   - Calculate pricing for each room
   - Return hotel + available rooms

3. User select room → Start booking
   Frontend: HotelDetailPage → BookingPage
   API: POST /api/bookings/temporary
   Backend: BookingService.createTemporaryBooking()
   - Validate availability
   - Lock rooms (reduce available_rooms)
   - Create booking (status CREATED)
   - Calculate prices
   - Return bookingId

4. User fill guest info → Confirm booking
   Frontend: BookingPage (Step 2)
   API: POST /api/bookings (with bookingId)
   Backend: BookingService.createBooking()
   - Validate booking exists
   - Validate guest info
   - Update booking (status CREATED → CONFIRMED)
   - Return confirmation

5. User pay → Payment
   Frontend: BookingPage (Step 3)
   API: POST /api/payments
   Backend: PaymentService.createPayment()
   - Create payment record
   - Update booking (status CONFIRMED → PAID)
   - Finalize booking
```

### 2. **AUTHENTICATION FLOW**

```
1. User login
   Frontend: LoginPage → authService.login()
   API: POST /api/auth/login
   Backend: AuthController.login()
   - Validate credentials
   - Generate JWT tokens (access + refresh)
   - Return tokens + user info
   Frontend: Save to localStorage + AuthContext

2. Protected route access
   Frontend: ProtectedRoute component
   - Check AuthContext.isLoggedIn
   - Redirect to /login if not logged in

3. API call with auth
   Frontend: axios interceptor adds Bearer token
   Backend: authenticateJWT middleware
   - Verify JWT token
   - Set req.user.account_id
```

---

## 🔐 SECURITY FEATURES

1. **JWT Authentication**: Access token + Refresh token
2. **Password Hashing**: bcrypt với salt
3. **Email Verification**: Token-based verification
4. **Password Reset**: Token-based với expiry
5. **CORS**: Configured cho frontend origin
6. **Input Validation**: Validators cho requests
7. **SQL Injection Prevention**: Sequelize ORM (parameterized queries)

---

## 📈 SCALABILITY & PERFORMANCE

### **Current State**
- ✅ Database indexing trên các foreign keys và search columns
- ✅ Connection pooling (Sequelize pool config)
- ✅ Pagination cho search results
- ⚠️ Chưa có caching layer
- ⚠️ Chưa có CDN cho static assets

### **Improvements Needed**
1. **Caching**: Redis cho hotel search results, frequently accessed data
2. **CDN**: Cho images (hotel images, room images)
3. **Database Indexing**: Thêm indexes cho frequently queried columns
4. **Query Optimization**: Optimize complex queries (hotel search với joins)
5. **Load Balancing**: Khi scale, cần load balancer
6. **Monitoring**: Cần monitoring tools (APM, logging)

---

## 🐛 KNOWN ISSUES & TODOS

1. **Cleanup Jobs**: Có jobs cleanup expired bookings (20 phút) và unverified accounts
2. **Room Locking**: Rooms bị lock khi tạo temporary booking, tự unlock sau 20 phút
3. **Payment Integration**: Chưa tích hợp thực tế VNPAY/MOMO (chỉ có structure)
4. **Admin Panel**: Có components nhưng chưa hoàn thiện
5. **Review System**: Database có review_count nhưng chưa có review table
6. **Notification System**: Chưa có notification system

---

## 📝 KẾT LUẬN

Hệ thống được thiết kế khá tốt với:
- ✅ Database schema normalized và flexible
- ✅ Backend architecture rõ ràng (Layered Architecture)
- ✅ Frontend component-based structure
- ✅ Type safety với TypeScript
- ✅ Authentication và authorization
- ✅ Dynamic pricing support

Cần cải thiện:
- ⚠️ Testing (unit tests, integration tests)
- ⚠️ Caching và performance optimization
- ⚠️ Error handling và logging tốt hơn
- ⚠️ Payment gateway integration
- ⚠️ Admin panel completion

**Overall Assessment**: ⭐⭐⭐⭐ (4/5) - Solid foundation, needs polishing

