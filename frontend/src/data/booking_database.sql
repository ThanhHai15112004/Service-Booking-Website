
--  booking_database

--
-- Cấu trúc bảng cho bảng `account`
--

CREATE TABLE `account` (
  `account_id` varchar(20) NOT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `phone_number` varchar(20) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (`status` in ('PENDING','ACTIVE','BANNED','DELETED')),
  `role` varchar(20) NOT NULL DEFAULT 'USER' CHECK (`role` in ('ADMIN','STAFF','USER')),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `is_verified` tinyint(1) NOT NULL DEFAULT 0,
  `provider` varchar(50) DEFAULT 'LOCAL',
  `provider_id` varchar(255) DEFAULT NULL,
  `avatar_url` text DEFAULT NULL,
  `verify_token` varchar(255) DEFAULT NULL,
  `verify_expires_at` datetime DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_expires_at` datetime DEFAULT NULL,
  `resend_count` int(11) DEFAULT 0,
  `last_resend_reset_at` datetime DEFAULT NULL,
  `last_verification_email_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `account`
--

INSERT INTO `account` (`account_id`, `full_name`, `email`, `password_hash`, `phone_number`, `status`, `role`, `created_at`, `updated_at`, `is_verified`, `provider`, `provider_id`, `avatar_url`, `verify_token`, `verify_expires_at`, `reset_token`, `reset_expires_at`, `resend_count`, `last_resend_reset_at`, `last_verification_email_at`) VALUES
('AC202510170002', 'Phan Thanh Hải', 'phanthanhhai151104@gmail.com', '', NULL, 'ACTIVE', 'USER', '2025-10-17 22:16:34', '2025-10-17 22:16:34', 1, 'GOOGLE', '112247884444270419636', 'https://lh3.googleusercontent.com/a/ACg8ocJkTdvdmNo1Wo5LF82heAfwQoPdVj6Y5qEs7Zb3cb7-6aNCQ7Y=s96-c', NULL, NULL, NULL, NULL, 0, NULL, NULL),
('AC202510170003', 'Thanh Hải Phan', 'thanhhai81004@gmail.com', '$2b$10$YNlgtODlRUF5BHttdtBujudEzeEgFs5h1GbpedurOteQADlMpBTlO', NULL, 'ACTIVE', 'USER', '2025-10-17 22:16:41', '2025-10-21 10:52:32', 1, 'GOOGLE', '107882645059152305358', 'https://lh3.googleusercontent.com/a/ACg8ocLOfe8iVmQVpBs9tBlgMhuT_VjCJoyvp9iIf5LWnwZ8NHievHU=s96-c', NULL, NULL, NULL, NULL, 0, NULL, NULL),
('AC202510170004', 'Thanh Hải Phan', 'thanhhailop11a6@gmail.com', '', NULL, 'ACTIVE', 'USER', '2025-10-17 21:57:17', '2025-10-17 21:57:17', 1, 'GOOGLE', '111644191343221764040', 'https://lh3.googleusercontent.com/a/ACg8ocKNLZ2rEaUk0uB0q8PTMXl5ccsU2xCoD78O2NUMBN4iec6s7LE=s96-c', NULL, NULL, NULL, NULL, 0, NULL, NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking`
--

CREATE TABLE `booking` (
  `booking_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'CREATED' CHECK (`status` in ('CREATED','CONFIRMED','CANCELLED','PAID')),
  `subtotal` decimal(14,2) NOT NULL DEFAULT 0.00,
  `tax_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_amount` decimal(14,2) DEFAULT NULL,
  `special_requests` varchar(255) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_detail`
--

CREATE TABLE `booking_detail` (
  `booking_detail_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL CHECK (`checkout_date` > `checkin_date`),
  `guests_count` smallint(6) NOT NULL CHECK (`guests_count` > 0),
  `price_per_night` decimal(12,2) NOT NULL CHECK (`price_per_night` >= 0),
  `nights_count` int(11) NOT NULL,
  `total_price` decimal(18,2) NOT NULL DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_discount`
--

CREATE TABLE `booking_discount` (
  `booking_id` varchar(20) NOT NULL,
  `discount_id` varchar(20) NOT NULL,
  `discount_amount` decimal(12,2) DEFAULT NULL CHECK (`discount_amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `discount_code`
--

CREATE TABLE `discount_code` (
  `discount_id` varchar(20) NOT NULL,
  `code` varchar(50) NOT NULL,
  `percentage_off` decimal(5,2) DEFAULT NULL CHECK (`percentage_off` between 0 and 100),
  `max_discount` decimal(12,2) DEFAULT NULL CHECK (`max_discount` >= 0),
  `expires_at` datetime NOT NULL DEFAULT current_timestamp(),
  `conditions` varchar(255) DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','EXPIRED','DISABLED')),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `facility`
--

CREATE TABLE `facility` (
  `facility_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `category` varchar(10) DEFAULT NULL CHECK (`category` in ('HOTEL','ROOM')),
  `icon` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `facility`
--

INSERT INTO `facility` (`facility_id`, `name`, `category`, `icon`, `created_at`) VALUES
('F001', 'Wifi miễn phí', 'HOTEL', 'https://static.thenounproject.com/png/2146910-200.png', '2025-10-20 15:09:17'),
('F002', 'Hồ bơi', 'HOTEL', 'https://static.thenounproject.com/png/8009576-200.png', '2025-10-20 15:09:17'),
('F003', 'Bãi đỗ xe', 'HOTEL', 'https://static.thenounproject.com/png/4312534-200.png', '2025-10-20 15:09:17'),
('F004', 'Nhà hàng', 'HOTEL', 'https://static.thenounproject.com/png/8088592-200.png', '2025-10-20 15:09:17'),
('F005', 'Máy lạnh', 'ROOM', 'https://static.thenounproject.com/png/5007106-200.png', '2025-10-20 15:09:17'),
('F006', 'TV màn hình phẳng', 'ROOM', 'https://static.thenounproject.com/png/8021371-200.png', '2025-10-20 15:09:17'),
('F007', 'Ban công riêng', 'ROOM', 'https://static.thenounproject.com/png/7706555-200.png', '2025-10-20 15:09:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel`
--

CREATE TABLE `hotel` (
  `hotel_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` varchar(20) DEFAULT NULL,
  `location_id` varchar(20) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `star_rating` decimal(2,1) DEFAULT NULL CHECK (`star_rating` between 0 and 5),
  `avg_rating` decimal(2,1) DEFAULT 0.0,
  `review_count` int(11) DEFAULT 0,
  `checkin_time` time DEFAULT '14:00:00',
  `checkout_time` time DEFAULT '12:00:00',
  `phone_number` varchar(30) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `total_rooms` int(11) DEFAULT 0,
  `main_image` varchar(500) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','INACTIVE','PENDING')),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel`
--

INSERT INTO `hotel` (`hotel_id`, `name`, `description`, `category_id`, `location_id`, `address`, `latitude`, `longitude`, `star_rating`, `avg_rating`, `review_count`, `checkin_time`, `checkout_time`, `phone_number`, `email`, `website`, `total_rooms`, `main_image`, `status`, `created_at`, `updated_at`) VALUES
('H001', 'Hanoi Old Quarter Hotel', 'Khách sạn 3 sao giữa lòng phố cổ Hà Nội.', 'CAT001', 'LOC_HN_05', '12 Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.033000, 105.850000, 3.0, 8.5, 245, '14:00:00', '12:00:00', '024-88888888', 'contact@hoqhotel.vn', 'https://hoqhotel.vn', 30, 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nquZO-cO1woQvrkFfrWaRZ0CMK8t6pL-IBcPwZ9dmojDrqngeCEC8GC50oxeizk4gsLeDMtxYFZ2rytPcrA5VF45WDIX__jp73xW3VgzhLIdYJ0S1KoLr1yJrgLxUD3roOk2COT=w252-h189-k-no', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:10:49'),
('H002', 'My Khe Beach Resort', 'Resort ven biển với hồ bơi và nhà hàng.', 'CAT002', 'LOC_DN_04', '99 Võ Nguyên Giáp, Đà Nẵng', 16.070000, 108.250000, 5.0, 9.2, 530, '14:00:00', '12:00:00', '0236-7777777', 'info@mykheresort.vn', 'https://mykheresort.vn', 80, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/456591942.jpg?k=edd1274281b31d340a1626d37a1a7799a54f1f9a1b6e249a2a2cb61781797e57&o=', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('H003', 'Saigon Riverside Hotel', 'Khách sạn 4 sao tại trung tâm TP.HCM.', 'CAT001', 'LOC_HCM_06', '45 Nguyễn Huệ, Quận 1, HCM', 10.776000, 106.700000, 4.0, 8.8, 340, '14:00:00', '12:00:00', '028-88889999', 'info@saigonriverside.vn', 'https://saigonriverside.vn', 60, 'https://lh3.googleusercontent.com/p/AF1QipORkI-MSORzrexdvvlSEUv93xE-cd83W2zDTpc=s1360-w1360-h1020-rw', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel_category`
--

CREATE TABLE `hotel_category` (
  `category_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel_category`
--

INSERT INTO `hotel_category` (`category_id`, `name`, `description`, `icon`, `created_at`) VALUES
('CAT001', 'Khách sạn', 'Khách sạn nghỉ dưỡng, du lịch', 'https://static.thenounproject.com/png/8126037-200.png', '2025-10-20 15:07:56'),
('CAT002', 'Resort', 'Khu nghỉ dưỡng cao cấp ven biển', 'https://static.thenounproject.com/png/2889697-200.png', '2025-10-20 15:07:56'),
('CAT003', 'Homestay', 'Nhà dân, căn hộ mini', 'https://static.thenounproject.com/png/1910541-200.png', '2025-10-20 15:07:56');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel_facility`
--

CREATE TABLE `hotel_facility` (
  `hotel_id` varchar(20) NOT NULL,
  `facility_id` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel_facility`
--

INSERT INTO `hotel_facility` (`hotel_id`, `facility_id`, `created_at`) VALUES
('H001', 'F001', '2025-10-20 15:09:17'),
('H001', 'F003', '2025-10-20 15:09:17'),
('H001', 'F004', '2025-10-20 15:09:17'),
('H002', 'F001', '2025-10-20 15:09:17'),
('H002', 'F002', '2025-10-20 15:09:17'),
('H002', 'F003', '2025-10-20 15:09:17'),
('H002', 'F004', '2025-10-20 15:09:17'),
('H003', 'F001', '2025-10-20 15:09:17'),
('H003', 'F002', '2025-10-20 15:09:17'),
('H003', 'F004', '2025-10-20 15:09:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel_image`
--

CREATE TABLE `hotel_image` (
  `image_id` varchar(20) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `is_primary` tinyint(1) DEFAULT 0,
  `caption` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel_location`
--

CREATE TABLE `hotel_location` (
  `location_id` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `city` varchar(100) NOT NULL,
  `district` varchar(100) DEFAULT NULL,
  `ward` varchar(100) DEFAULT NULL,
  `area_name` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,6) DEFAULT NULL,
  `longitude` decimal(10,6) DEFAULT NULL,
  `distance_center` decimal(6,2) DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `is_hot` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel_location`
--

INSERT INTO `hotel_location` (`location_id`, `country`, `city`, `district`, `ward`, `area_name`, `latitude`, `longitude`, `distance_center`, `description`, `created_at`, `is_hot`) VALUES
('LOC_DN_01', 'Vietnam', 'Đà Nẵng', 'Sơn Trà', 'Phường An Hải Bắc', 'Cầu Rồng', 16.061393, 108.225670, 0.80, 'Biểu tượng du lịch Đà Nẵng', '2025-10-17 11:51:05', 1),
('LOC_DN_02', 'Vietnam', 'Đà Nẵng', 'Ngũ Hành Sơn', 'Phường Mỹ An', 'Bãi biển Mỹ Khê', 16.049274, 108.249744, 4.00, 'Khu nghỉ dưỡng ven biển cao cấp', '2025-10-17 11:51:05', 1),
('LOC_DN_03', 'Vietnam', 'Đà Nẵng', 'Hải Châu', 'Phường Thạch Thang', 'Cầu Sông Hàn', 16.073827, 108.223419, 1.20, 'Trung tâm thành phố Đà Nẵng', '2025-10-17 11:51:05', 1),
('LOC_DN_04', 'Vietnam', 'Đà Nẵng', NULL, NULL, NULL, 16.067800, 108.230000, 3.20, 'Thành phố du lịch ven biển', '2025-10-20 15:09:17', 1),
('LOC_HCM_01', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 'Nhà Thờ Đức Bà', 10.779783, 106.699018, 0.50, 'Trung tâm du lịch và tài chính của thành phố', '2025-10-17 11:51:05', 1),
('LOC_HCM_02', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 'Chợ Bến Thành', 10.772105, 106.698423, 0.40, 'Khu chợ và khách sạn du lịch nổi tiếng', '2025-10-17 11:51:05', 1),
('LOC_HCM_03', 'Vietnam', 'Hồ Chí Minh', 'Quận 3', 'Phường Võ Thị Sáu', 'Công viên Lê Văn Tám', 10.787211, 106.696539, 2.00, 'Khu vực dân cư và văn phòng', '2025-10-17 11:51:05', 1),
('LOC_HCM_04', 'Vietnam', 'Hồ Chí Minh', 'Quận 5', 'Phường 11', 'Chợ Lớn', 10.756547, 106.663778, 5.50, 'Khu vực người Hoa, nhiều nhà hàng và khách sạn', '2025-10-17 11:51:05', 1),
('LOC_HCM_05', 'Vietnam', 'Hồ Chí Minh', 'Quận 7', 'Phường Tân Phong', 'Phú Mỹ Hưng', 10.734253, 106.721085, 7.50, 'Khu đô thị cao cấp', '2025-10-17 11:51:05', 1),
('LOC_HCM_06', 'Vietnam', 'Hồ Chí Minh', NULL, NULL, NULL, 10.776000, 106.700000, 0.50, 'Trung tâm kinh tế lớn nhất Việt Nam', '2025-10-20 15:09:17', 1),
('LOC_HN_01', 'Vietnam', 'Hà Nội', 'Hoàn Kiếm', 'Phường Hàng Trống', 'Hồ Hoàn Kiếm', 21.028511, 105.854088, 0.30, 'Trung tâm du lịch nổi tiếng của Hà Nội', '2025-10-17 11:51:05', 1),
('LOC_HN_02', 'Vietnam', 'Hà Nội', 'Ba Đình', 'Phường Điện Biên', 'Lăng Chủ tịch Hồ Chí Minh', 21.037268, 105.834438, 1.50, 'Khu vực hành chính và di tích lịch sử', '2025-10-17 11:51:05', 1),
('LOC_HN_03', 'Vietnam', 'Hà Nội', 'Cầu Giấy', 'Phường Dịch Vọng', 'Công viên Cầu Giấy', 21.033781, 105.789489, 6.00, 'Khu vực nhiều khách sạn và trung tâm thương mại', '2025-10-17 11:51:05', 1),
('LOC_HN_04', 'Vietnam', 'Hà Nội', 'Tây Hồ', 'Phường Quảng An', 'Hồ Tây', 21.068217, 105.818871, 5.00, 'Khu du lịch và nghỉ dưỡng ven hồ', '2025-10-17 11:51:05', 1),
('LOC_HN_05', 'Vietnam', 'Hà Nội', NULL, NULL, NULL, 21.009802, 105.822830, 4.00, 'Khu trung tâm mua sắm và giao thông lớn', '2025-10-17 11:51:05', 1),
('LOC_VT_01', 'Vietnam', 'Vũng Tàu', NULL, 'Phường 1', 'Bãi Trước', 10.345850, 107.084259, 0.50, 'Khu du lịch trung tâm thành phố', '2025-10-17 11:51:05', 1),
('LOC_VT_02', 'Vietnam', 'Vũng Tàu', NULL, 'Phường 2', 'Bãi Sau', 10.333971, 107.099846, 2.00, 'Khu bãi biển đông du khách', '2025-10-17 11:51:05', 1),
('LOC_VT_03', 'Vietnam', 'Vũng Tàu', NULL, 'Phường 10', 'Khu vực Đồi Con Heo', 10.347570, 107.091751, 1.80, 'Khu ngắm cảnh đẹp', '2025-10-17 11:51:05', 1),
('LOC_VT_04', 'Vietnam', 'Vũng Tàu', NULL, 'Phường 9', 'Đường Lê Hồng Phong', 10.352000, 107.090000, 3.50, 'Khu dân cư và khách sạn nhỏ', '2025-10-17 11:51:05', 1),
('LOC_VT_05', 'Vietnam', 'Vũng Tàu', NULL, NULL, NULL, 21.033000, 105.850000, 0.80, 'Thành phố biển nổi tiếng', '2025-10-20 15:09:17', 1);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

CREATE TABLE `payment` (
  `payment_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) NOT NULL,
  `method` varchar(30) DEFAULT 'CASH' CHECK (`status` in ('VNPAY','MOMO','CASH')),
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (`status` in ('PENDING','SUCCESS','FAILED','REFUNDED')),
  `amount_due` decimal(14,2) NOT NULL CHECK (`amount_due` >= 0),
  `amount_paid` decimal(14,2) NOT NULL DEFAULT 0.00 CHECK (`amount_paid` >= 0),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `refresh_tokens`
--

CREATE TABLE `refresh_tokens` (
  `id` int(11) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `token` text NOT NULL,
  `expires_at` datetime NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `refresh_tokens`
--

INSERT INTO `refresh_tokens` (`id`, `account_id`, `token`, `expires_at`, `created_at`) VALUES
(57, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjEwNzMwNjYsImV4cCI6MTc2MTMzMjI2Nn0.JogqGUgMaQ9csFaEJH9afrBJkwR_NdAVBkbzUXUC2mw', '2025-10-22 04:57:46', '2025-10-22 01:57:46'),
(58, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjExMDc3MzcsImV4cCI6MTc2MTM2NjkzN30.OXHWBH-IjXQj88DSvXs1aofZtVGfwwa8SSWkXiUfPQg', '2025-10-22 14:35:37', '2025-10-22 11:35:37');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room`
--

CREATE TABLE `room` (
  `room_id` varchar(20) NOT NULL,
  `room_type_id` varchar(20) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `room_number` varchar(20) DEFAULT NULL,
  `capacity` int(11) NOT NULL CHECK (`capacity` > 0),
  `image_url` varchar(500) DEFAULT NULL,
  `price_base` decimal(12,2) DEFAULT NULL CHECK (`price_base` >= 0),
  `status` varchar(20) DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','INACTIVE','MAINTENANCE')),
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room`
--

INSERT INTO `room` (`room_id`, `room_type_id`, `hotel_id`, `room_number`, `capacity`, `image_url`, `price_base`, `status`, `created_at`, `updated_at`) VALUES
('R001', 'RT001', 'H001', '101', 2, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576703459.jpg?k=4bc75a8ddab0204e5dd9a57069afcf31e29e5e38f622b67f916878ed555169be&o=', 800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R002', 'RT001', 'H001', '102', 3, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576526483.jpg?k=e7352d5c0cc2f34b0a19b5ad760cc2c8a8ac0fc59a398b3047c26b15fa338f6b&o=', 950000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R003', 'RT002', 'H002', '201', 2, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614965.jpg?k=8c9c9ea468ed7ae098f853df79536f99a77f7bfdfed84ac352fd7b96365446fc&o=', 1800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R004', 'RT002', 'H002', '202', 4, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614817.jpg?k=a14fa8850eab7dfac8b1cb64e8c5ae60d23be8bd01b30f194ac9b74aa57efec4&o=', 2000000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R005', 'RT003', 'H003', '301', 3, 'https://lh3.googleusercontent.com/p/AF1QipORkI-MSORzrexdvvlSEUv93xE-cd83W2zDTpc=s1360-w1360-h1020-rw', 1500000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_amenity`
--

CREATE TABLE `room_amenity` (
  `room_id` varchar(20) NOT NULL,
  `facility_id` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_amenity`
--

INSERT INTO `room_amenity` (`room_id`, `facility_id`, `created_at`) VALUES
('R001', 'F005', '2025-10-20 15:09:17'),
('R001', 'F006', '2025-10-20 15:09:17'),
('R002', 'F005', '2025-10-20 15:09:17'),
('R002', 'F006', '2025-10-20 15:09:17'),
('R003', 'F005', '2025-10-20 15:09:17'),
('R003', 'F006', '2025-10-20 15:09:17'),
('R003', 'F007', '2025-10-20 15:09:17'),
('R004', 'F005', '2025-10-20 15:09:17'),
('R004', 'F006', '2025-10-20 15:09:17'),
('R004', 'F007', '2025-10-20 15:09:17'),
('R005', 'F005', '2025-10-20 15:09:17'),
('R005', 'F006', '2025-10-20 15:09:17'),
('R005', 'F007', '2025-10-20 15:09:17');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_policy`
--

CREATE TABLE `room_policy` (
  `policy_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `free_cancellation` tinyint(1) DEFAULT 0,
  `pay_later` tinyint(1) DEFAULT 0,
  `no_credit_card` tinyint(1) DEFAULT 0,
  `checkin_age_limit` int(11) DEFAULT 18,
  `children_allowed` tinyint(1) DEFAULT 1,
  `pets_allowed` tinyint(1) DEFAULT 0,
  `extra_bed_fee` decimal(12,2) DEFAULT 0.00,
  `free_child_age_limit` int(11) DEFAULT 6,
  `adult_age_threshold` int(11) DEFAULT 12
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_policy`
--

INSERT INTO `room_policy` (`policy_id`, `room_id`, `free_cancellation`, `pay_later`, `no_credit_card`, `checkin_age_limit`, `children_allowed`, `pets_allowed`, `extra_bed_fee`, `free_child_age_limit`, `adult_age_threshold`) VALUES
('P001', 'R001', 1, 1, 0, 18, 1, 0, 150000.00, 6, 12),
('P002', 'R002', 1, 1, 0, 18, 1, 0, 200000.00, 6, 12),
('P003', 'R003', 1, 1, 0, 18, 1, 0, 250000.00, 6, 12),
('P004', 'R004', 1, 1, 0, 18, 1, 0, 300000.00, 6, 12),
('P005', 'R005', 1, 1, 0, 18, 1, 0, 200000.00, 6, 12);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_price_schedule`
--

CREATE TABLE `room_price_schedule` (
  `schedule_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `available_rooms` int(11) DEFAULT 0,
  `refundable` tinyint(1) DEFAULT 1,
  `pay_later` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_price_schedule`
--

INSERT INTO `room_price_schedule` (`schedule_id`, `room_id`, `date`, `base_price`, `discount_percent`, `available_rooms`, `refundable`, `pay_later`, `created_at`) VALUES
('S001', 'R001', '2025-10-20', 800000.00, 0.00, 5, 1, 0, '2025-10-20 15:09:17'),
('S002', 'R001', '2025-10-21', 800000.00, 10.00, 5, 1, 1, '2025-10-20 15:09:17'),
('S003', 'R002', '2025-10-20', 950000.00, 5.00, 3, 1, 1, '2025-10-20 15:09:17'),
('S004', 'R003', '2025-10-20', 1800000.00, 0.00, 6, 1, 0, '2025-10-20 15:09:17'),
('S005', 'R004', '2025-10-20', 2000000.00, 5.00, 2, 1, 1, '2025-10-20 15:09:17'),
('S006', 'R005', '2025-10-20', 1500000.00, 0.00, 4, 1, 1, '2025-10-20 15:09:17'),
('S007', 'R003', '2025-10-21', 1850000.00, 0.00, 6, 1, 0, '2025-10-20 15:09:17'),
('S008', 'R004', '2025-10-21', 2100000.00, 10.00, 2, 1, 1, '2025-10-20 15:09:17'),
('S009', 'R005', '2025-10-21', 1550000.00, 0.00, 4, 1, 1, '2025-10-20 15:09:17'),
('S010', 'R001', '2025-10-25', 800000.00, 0.00, 5, 1, 0, '2025-10-22 10:09:16'),
('S011', 'R001', '2025-10-26', 800000.00, 10.00, 5, 1, 1, '2025-10-22 10:09:16'),
('S012', 'R002', '2025-10-25', 950000.00, 5.00, 3, 1, 1, '2025-10-22 10:09:16'),
('S013', 'R003', '2025-10-25', 1800000.00, 0.00, 6, 1, 0, '2025-10-22 10:09:16'),
('S014', 'R004', '2025-10-25', 2000000.00, 5.00, 2, 1, 1, '2025-10-22 10:09:16'),
('S015', 'R005', '2025-10-25', 1500000.00, 0.00, 4, 1, 1, '2025-10-22 10:09:16'),
('S018', 'R001', '2025-10-27', 800000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S019', 'R001', '2025-10-28', 800000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S020', 'R001', '2025-10-29', 800000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S021', 'R001', '2025-10-30', 800000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S022', 'R001', '2025-10-31', 800000.00, 5.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S023', 'R001', '2025-11-01', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S024', 'R001', '2025-11-02', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S025', 'R001', '2025-11-03', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S026', 'R001', '2025-11-04', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S027', 'R001', '2025-11-05', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S028', 'R001', '2025-11-06', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S029', 'R001', '2025-11-07', 820000.00, 5.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S030', 'R001', '2025-11-08', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S031', 'R001', '2025-11-09', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S032', 'R001', '2025-11-10', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S033', 'R001', '2025-11-11', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S034', 'R001', '2025-11-12', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S035', 'R001', '2025-11-13', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S036', 'R001', '2025-11-14', 820000.00, 5.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S037', 'R001', '2025-11-15', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S038', 'R001', '2025-11-16', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S039', 'R001', '2025-11-17', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S040', 'R001', '2025-11-18', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S041', 'R001', '2025-11-19', 820000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S042', 'R001', '2025-11-20', 820000.00, 0.00, 5, 1, 1, '2025-10-24 11:33:13'),
('S044', 'R002', '2025-10-26', 950000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S045', 'R002', '2025-10-27', 950000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S046', 'R002', '2025-10-28', 950000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S047', 'R002', '2025-10-29', 950000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S048', 'R002', '2025-10-30', 950000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S049', 'R002', '2025-10-31', 950000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S050', 'R002', '2025-11-01', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S051', 'R002', '2025-11-02', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S052', 'R002', '2025-11-03', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S053', 'R002', '2025-11-04', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S054', 'R002', '2025-11-05', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S055', 'R002', '2025-11-06', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S056', 'R002', '2025-11-07', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S057', 'R002', '2025-11-08', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S058', 'R002', '2025-11-09', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S059', 'R002', '2025-11-10', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S060', 'R002', '2025-11-11', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S061', 'R002', '2025-11-12', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S062', 'R002', '2025-11-13', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S063', 'R002', '2025-11-14', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S064', 'R002', '2025-11-15', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S065', 'R002', '2025-11-16', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S066', 'R002', '2025-11-17', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S067', 'R002', '2025-11-18', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S068', 'R002', '2025-11-19', 970000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S069', 'R002', '2025-11-20', 970000.00, 0.00, 3, 1, 1, '2025-10-24 11:34:05'),
('S071', 'R003', '2025-10-26', 1800000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S072', 'R003', '2025-10-27', 1800000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S073', 'R003', '2025-10-28', 1800000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S074', 'R003', '2025-10-29', 1800000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S075', 'R003', '2025-10-30', 1800000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S076', 'R003', '2025-10-31', 1800000.00, 5.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S077', 'R003', '2025-11-01', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S078', 'R003', '2025-11-02', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S079', 'R003', '2025-11-03', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S080', 'R003', '2025-11-04', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S081', 'R003', '2025-11-05', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S082', 'R003', '2025-11-06', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S083', 'R003', '2025-11-07', 1820000.00, 5.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S084', 'R003', '2025-11-08', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S085', 'R003', '2025-11-09', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S086', 'R003', '2025-11-10', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S087', 'R003', '2025-11-11', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S088', 'R003', '2025-11-12', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S089', 'R003', '2025-11-13', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S090', 'R003', '2025-11-14', 1820000.00, 5.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S091', 'R003', '2025-11-15', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S092', 'R003', '2025-11-16', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S093', 'R003', '2025-11-17', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S094', 'R003', '2025-11-18', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S095', 'R003', '2025-11-19', 1820000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S096', 'R003', '2025-11-20', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_type`
--

CREATE TABLE `room_type` (
  `room_type_id` varchar(20) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `bed_type` varchar(20) DEFAULT NULL CHECK (`bed_type` in ('Single','Double','Queen','King','Twin','Bunk')),
  `area` decimal(6,2) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_type`
--

INSERT INTO `room_type` (`room_type_id`, `hotel_id`, `name`, `description`, `bed_type`, `area`, `image_url`, `created_at`, `updated_at`) VALUES
('RT001', 'H001', 'Standard Double', 'Phòng đôi tiêu chuẩn, 1 giường Queen.', 'Queen', 22.50, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576680595.jpg?k=3cf1a5ea238d537128f06f17e554fcc3d5ad5dfcf61546474640b56c014154e6&o=', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('RT002', 'H002', 'Deluxe Sea View', 'Phòng nhìn ra biển, 1 giường King, ban công.', 'King', 35.00, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614841.jpg?k=80b34dd65d9ea096f63c7b63d468c4ea287075e2849dd816a02ce3d8664a1cbd&o=', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('RT003', 'H003', 'Executive Suite', 'Phòng suite sang trọng có view sông Sài Gòn.', 'King', 45.00, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/0f/b8/d6/premier-riverview-room.jpg?w=1000&h=-1&s=1', '2025-10-20 15:09:17', '2025-10-20 15:09:17');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`);

--
-- Chỉ mục cho bảng `booking`
--
ALTER TABLE `booking`
  ADD PRIMARY KEY (`booking_id`),
  ADD KEY `account_id` (`account_id`),
  ADD KEY `hotel_id` (`hotel_id`);

--
-- Chỉ mục cho bảng `booking_detail`
--
ALTER TABLE `booking_detail`
  ADD PRIMARY KEY (`booking_detail_id`),
  ADD KEY `booking_id` (`booking_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Chỉ mục cho bảng `booking_discount`
--
ALTER TABLE `booking_discount`
  ADD PRIMARY KEY (`booking_id`,`discount_id`),
  ADD KEY `discount_id` (`discount_id`);

--
-- Chỉ mục cho bảng `discount_code`
--
ALTER TABLE `discount_code`
  ADD PRIMARY KEY (`discount_id`);

--
-- Chỉ mục cho bảng `facility`
--
ALTER TABLE `facility`
  ADD PRIMARY KEY (`facility_id`);

--
-- Chỉ mục cho bảng `hotel`
--
ALTER TABLE `hotel`
  ADD PRIMARY KEY (`hotel_id`),
  ADD KEY `FK_hotel_category` (`category_id`),
  ADD KEY `FK_hotel_location` (`location_id`),
  ADD KEY `idx_hotel_star` (`star_rating`),
  ADD KEY `idx_hotel_status` (`status`);

--
-- Chỉ mục cho bảng `hotel_category`
--
ALTER TABLE `hotel_category`
  ADD PRIMARY KEY (`category_id`);

--
-- Chỉ mục cho bảng `hotel_facility`
--
ALTER TABLE `hotel_facility`
  ADD PRIMARY KEY (`hotel_id`,`facility_id`),
  ADD KEY `idx_hf_hotel` (`hotel_id`),
  ADD KEY `idx_hf_fac` (`facility_id`);

--
-- Chỉ mục cho bảng `hotel_image`
--
ALTER TABLE `hotel_image`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `FK_hotel_image` (`hotel_id`);

--
-- Chỉ mục cho bảng `hotel_location`
--
ALTER TABLE `hotel_location`
  ADD PRIMARY KEY (`location_id`),
  ADD KEY `idx_hotel_location_city` (`city`),
  ADD KEY `idx_hotel_location_distance` (`distance_center`);

--
-- Chỉ mục cho bảng `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Chỉ mục cho bảng `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`room_id`),
  ADD KEY `FK_room_hotel` (`hotel_id`),
  ADD KEY `idx_room_status` (`status`),
  ADD KEY `idx_room_capacity` (`capacity`),
  ADD KEY `idx_room_roomtype` (`room_type_id`);

--
-- Chỉ mục cho bảng `room_amenity`
--
ALTER TABLE `room_amenity`
  ADD PRIMARY KEY (`room_id`,`facility_id`),
  ADD KEY `FK_ra_fac` (`facility_id`);

--
-- Chỉ mục cho bảng `room_policy`
--
ALTER TABLE `room_policy`
  ADD PRIMARY KEY (`policy_id`),
  ADD KEY `idx_rp_room` (`room_id`);

--
-- Chỉ mục cho bảng `room_price_schedule`
--
ALTER TABLE `room_price_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `UQ_schedule` (`room_id`,`date`),
  ADD KEY `idx_rps_room_date` (`room_id`,`date`),
  ADD KEY `idx_rps_date` (`date`);

--
-- Chỉ mục cho bảng `room_type`
--
ALTER TABLE `room_type`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `FK_roomtype_hotel` (`hotel_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `booking`
--
ALTER TABLE `booking`
  ADD CONSTRAINT `booking_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`),
  ADD CONSTRAINT `booking_ibfk_2` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`);

--
-- Các ràng buộc cho bảng `booking_detail`
--
ALTER TABLE `booking_detail`
  ADD CONSTRAINT `booking_detail_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  ADD CONSTRAINT `booking_detail_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`);

--
-- Các ràng buộc cho bảng `booking_discount`
--
ALTER TABLE `booking_discount`
  ADD CONSTRAINT `booking_discount_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`),
  ADD CONSTRAINT `booking_discount_ibfk_2` FOREIGN KEY (`discount_id`) REFERENCES `discount_code` (`discount_id`);

--
-- Các ràng buộc cho bảng `hotel`
--
ALTER TABLE `hotel`
  ADD CONSTRAINT `FK_hotel_category` FOREIGN KEY (`category_id`) REFERENCES `hotel_category` (`category_id`),
  ADD CONSTRAINT `FK_hotel_location` FOREIGN KEY (`location_id`) REFERENCES `hotel_location` (`location_id`);

--
-- Các ràng buộc cho bảng `hotel_facility`
--
ALTER TABLE `hotel_facility`
  ADD CONSTRAINT `FK_hf_fac` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`facility_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_hf_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hotel_image`
--
ALTER TABLE `hotel_image`
  ADD CONSTRAINT `FK_hotel_image` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

--
-- Các ràng buộc cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `FK_room_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_amenity`
--
ALTER TABLE `room_amenity`
  ADD CONSTRAINT `FK_ra_fac` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`facility_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_ra_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_policy`
--
ALTER TABLE `room_policy`
  ADD CONSTRAINT `FK_policy_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_price_schedule`
--
ALTER TABLE `room_price_schedule`
  ADD CONSTRAINT `FK_schedule_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_type`
--
ALTER TABLE `room_type`
  ADD CONSTRAINT `FK_roomtype_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;
COMMIT;