-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 04, 2025 lúc 06:58 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `booking_database`
--

-- --------------------------------------------------------

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
  `last_verification_email_at` datetime DEFAULT NULL,
  `package_id` varchar(20) DEFAULT 'PKG001' COMMENT 'Gói tài khoản hiện tại'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `account`
--

INSERT INTO `account` (`account_id`, `full_name`, `email`, `password_hash`, `phone_number`, `status`, `role`, `created_at`, `updated_at`, `is_verified`, `provider`, `provider_id`, `avatar_url`, `verify_token`, `verify_expires_at`, `reset_token`, `reset_expires_at`, `resend_count`, `last_resend_reset_at`, `last_verification_email_at`, `package_id`) VALUES
('AC202510170002', 'Phan Thanh Hải', 'phanthanhhai151104@gmail.com', '', '0123456789', 'ACTIVE', 'USER', '2025-10-17 22:16:34', '2025-11-01 13:59:09', 1, 'GOOGLE', '112247884444270419636', 'https://lh3.googleusercontent.com/a/ACg8ocJkTdvdmNo1Wo5LF82heAfwQoPdVj6Y5qEs7Zb3cb7-6aNCQ7Y=s96-c', NULL, NULL, NULL, NULL, 0, NULL, NULL, 'PKG001'),
('AC202510170003', 'Thanh Hải Phan', 'thanhhai81004@gmail.com', '$2b$10$YNlgtODlRUF5BHttdtBujudEzeEgFs5h1GbpedurOteQADlMpBTlO', '0123456780', 'ACTIVE', 'USER', '2025-10-17 22:16:41', '2025-11-04 12:16:28', 1, 'GOOGLE', '107882645059152305358', 'http://localhost:3000/uploads/img-1762195267724-460367068.jpg', NULL, NULL, NULL, NULL, 0, NULL, NULL, 'PKG001'),
('AC202510170004', 'Thanh Hải Phan', 'thanhhailop11a6@gmail.com', '', '0123456789', 'ACTIVE', 'USER', '2025-10-17 21:57:17', '2025-11-01 13:59:28', 1, 'GOOGLE', '111644191343221764040', 'https://lh3.googleusercontent.com/a/ACg8ocKNLZ2rEaUk0uB0q8PTMXl5ccsU2xCoD78O2NUMBN4iec6s7LE=s96-c', NULL, NULL, NULL, NULL, 0, NULL, NULL, 'PKG001');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `account_package`
--

CREATE TABLE `account_package` (
  `package_id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  `display_name` varchar(100) NOT NULL,
  `price_monthly` decimal(10,2) NOT NULL DEFAULT 0.00,
  `price_yearly` decimal(10,2) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `features` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `cashback_percent` decimal(5,2) DEFAULT 0.00,
  `priority_booking` tinyint(1) DEFAULT 0,
  `free_cancellation_hours` int(11) DEFAULT NULL,
  `vip_room_upgrade` tinyint(1) DEFAULT 0,
  `welcome_voucher` decimal(10,2) DEFAULT 0.00,
  `special_offers` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','INACTIVE','DISABLED')),
  `sort_order` int(11) DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `account_package`
--

INSERT INTO `account_package` (`package_id`, `name`, `display_name`, `price_monthly`, `price_yearly`, `description`, `features`, `discount_percent`, `cashback_percent`, `priority_booking`, `free_cancellation_hours`, `vip_room_upgrade`, `welcome_voucher`, `special_offers`, `status`, `sort_order`, `created_at`, `updated_at`) VALUES
('PKG001', 'BASIC', 'Basic', 0.00, 0.00, 'Gói cơ bản miễn phí với các tính năng đặt phòng cơ bản', '[\"Đặt phòng nhanh\", \"Tìm kiếm khách sạn\", \"Xem đánh giá\"]', 0.00, 0.00, 0, NULL, 0, 0.00, NULL, 'ACTIVE', 1, '2025-11-04 00:39:24', '2025-11-04 00:39:24'),
('PKG002', 'STANDARD', 'Standard', 199000.00, 1990000.00, 'Gói tiêu chuẩn với nhiều ưu đãi và hỗ trợ tốt hơn', '[\"Đặt phòng nhanh\", \"Ưu đãi 5%\", \"Hỗ trợ 24/7\", \"Hoàn tiền 1%\", \"Hủy miễn phí trước 48h\"]', 5.00, 1.00, 0, 48, 0, 0.00, '[\"Flash sale đặc biệt\"]', 'ACTIVE', 2, '2025-11-04 00:39:24', '2025-11-04 00:39:24'),
('PKG003', 'PREMIUM', 'Premium', 499000.00, 4990000.00, 'Gói cao cấp với nhiều ưu đãi độc quyền và tính năng đặc biệt', '[\"Đặt phòng nhanh\", \"Ưu đãi 15%\", \"Hỗ trợ 24/7\", \"Hoàn tiền 3%\", \"Ưu tiên đặt phòng\", \"Hủy miễn phí trước 24h\", \"Voucher 100k\"]', 15.00, 3.00, 1, 24, 0, 100000.00, '[\"Flash sale\", \"Ưu đãi sớm\"]', 'ACTIVE', 3, '2025-11-04 00:39:24', '2025-11-04 00:39:24'),
('PKG004', 'VIP', 'VIP', 999000.00, 9990000.00, 'Gói VIP với tất cả tính năng cao cấp nhất', '[\"Đặt phòng nhanh\", \"Ưu đãi 30%\", \"Hỗ trợ 24/7 VIP\", \"Hoàn tiền 5%\", \"Ưu tiên đặt phòng\", \"Hủy miễn phí không giới hạn\", \"VIP room upgrade\", \"Voucher 500k\"]', 30.00, 5.00, 1, NULL, 1, 500000.00, '[\"Early bird\", \"Ưu đãi độc quyền\", \"Quà tặng đặc biệt\"]', 'ACTIVE', 4, '2025-11-04 00:39:24', '2025-11-04 00:39:24');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `account_subscription`
--

CREATE TABLE `account_subscription` (
  `subscription_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `package_id` varchar(20) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','CANCELLED','EXPIRED','SUSPENDED')),
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `payment_method` varchar(30) DEFAULT NULL,
  `auto_renew` tinyint(1) DEFAULT 1,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `bed_type_metadata`
--

CREATE TABLE `bed_type_metadata` (
  `bed_type_key` varchar(50) NOT NULL,
  `name_vi` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `icon` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bed_type_metadata`
--

INSERT INTO `bed_type_metadata` (`bed_type_key`, `name_vi`, `name_en`, `description`, `icon`, `display_order`) VALUES
('Bunk', 'Giường tầng', 'Bunk Bed', 'Giường tầng, phù hợp cho gia đình có trẻ em', 'https://cdn-icons-png.freepik.com/256/10813/10813250.png?semt=ais_white_label', 6),
('Double', 'Giường đôi', 'Double Bed', 'Giường đôi tiêu chuẩn (140-150cm)', 'https://cdn-icons-png.freepik.com/256/13885/13885447.png?semt=ais_white_label', 2),
('King', 'Giường King', 'King Bed', 'Giường King (180-200cm)', 'https://cdn-icons-png.freepik.com/256/6404/6404290.png?semt=ais_white_label', 4),
('Queen', 'Giường Queen', 'Queen Bed', 'Giường Queen (152-160cm)', 'https://cdn-icons-png.freepik.com/256/18099/18099564.png?semt=ais_white_label', 3),
('Single', 'Giường đơn', 'Single Bed', 'Giường đơn cho 1 người (90-120cm)', 'https://cdn-icons-png.freepik.com/256/14695/14695104.png?semt=ais_white_label', 1),
('Twin', 'Giường đôi nhỏ (Twin)', 'Twin Beds', 'Hai giường đơn trong cùng phòng', 'https://cdn-icons-png.freepik.com/256/261/261261.png?semt=ais_white_label', 5);

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

--
-- Đang đổ dữ liệu cho bảng `booking`
--

INSERT INTO `booking` (`booking_id`, `account_id`, `hotel_id`, `status`, `subtotal`, `tax_amount`, `discount_amount`, `total_amount`, `special_requests`, `created_at`, `updated_at`) VALUES
('BK171548383705', 'AC202510170003', 'H003', 'CANCELLED', 1550000.00, 155000.00, 0.00, 1705000.00, NULL, '2025-11-03 19:05:48', '2025-11-03 19:07:47'),
('BK172225929859', 'AC202510170003', 'H003', 'CANCELLED', 1550000.00, 155000.00, 0.00, 1705000.00, NULL, '2025-11-03 19:17:05', '2025-11-03 19:19:04'),
('BK172631036379', 'AC202510170003', 'H003', 'CANCELLED', 1550000.00, 155000.00, 0.00, 1705000.00, NULL, '2025-11-03 19:23:51', '2025-11-03 19:25:50'),
('BK172881105808', 'AC202510170003', 'H003', 'CANCELLED', 1395000.00, 139500.00, 0.00, 1534500.00, NULL, '2025-11-03 19:28:01', '2025-11-03 19:30:00'),
('BK173929582505', 'AC202510170003', 'H004', 'CONFIRMED', 4845000.00, 484500.00, 0.00, 5329500.00, NULL, '2025-11-03 19:45:29', '2025-11-03 19:45:34'),
('BK201192199759', 'AC202510170003', 'H003', 'CONFIRMED', 1550000.00, 155000.00, 0.00, 1705000.00, 'Tôi cần phòng có máy lạnh', '2025-11-04 03:19:52', '2025-11-04 03:20:30'),
('BK233417223038', 'AC202510170003', 'H001', 'CANCELLED', 0.00, 0.00, 0.00, 0.00, NULL, '2025-11-04 12:16:57', '2025-11-04 12:38:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `booking_detail`
--

CREATE TABLE `booking_detail` (
  `booking_detail_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `checkin_date` date NOT NULL,
  `checkout_date` date NOT NULL CHECK (`checkout_date` >= `checkin_date`),
  `guests_count` smallint(6) NOT NULL CHECK (`guests_count` > 0),
  `price_per_night` decimal(12,2) NOT NULL CHECK (`price_per_night` >= 0),
  `nights_count` int(11) NOT NULL,
  `total_price` decimal(18,2) NOT NULL DEFAULT 0.00
) ;

--
-- Đang đổ dữ liệu cho bảng `booking_detail`
--

INSERT INTO `booking_detail` (`booking_detail_id`, `booking_id`, `room_id`, `checkin_date`, `checkout_date`, `guests_count`, `price_per_night`, `nights_count`, `total_price`) VALUES
('BD171548386117', 'BK171548383705', 'R005', '2025-11-06', '2025-11-06', 2, 1550000.00, 1, 1550000.00),
('BD172225931771', 'BK172225929859', 'R005', '2025-11-06', '2025-11-06', 2, 1550000.00, 1, 1550000.00),
('BD172631042405', 'BK172631036379', 'R005', '2025-11-04', '2025-11-04', 2, 1550000.00, 1, 1550000.00),
('BD172881111194', 'BK172881105808', 'R005', '2025-11-05', '2025-11-05', 2, 1395000.00, 1, 1395000.00),
('BD173929586418', 'BK173929582505', 'R006', '2025-11-04', '2025-11-06', 2, 2422500.00, 2, 4845000.00),
('BD201192201260', 'BK201192199759', 'R005', '2025-11-06', '2025-11-07', 2, 1550000.00, 1, 1550000.00),
('BD233417226952', 'BK233417223038', 'R001', '2025-12-15', '2025-12-18', 2, 0.00, 3, 0.00);

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
  `applicable_hotels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["H001", "H002"] hoặc NULL = tất cả' CHECK (json_valid(`applicable_hotels`)),
  `applicable_rooms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["R001", "R002"] hoặc NULL = tất cả' CHECK (json_valid(`applicable_rooms`)),
  `min_nights` int(11) DEFAULT NULL COMMENT 'Số đêm tối thiểu',
  `max_nights` int(11) DEFAULT NULL COMMENT 'Số đêm tối đa',
  `usage_limit` int(11) DEFAULT NULL COMMENT 'Số lần sử dụng tối đa (NULL = không giới hạn)',
  `usage_count` int(11) DEFAULT 0 COMMENT 'Số lần đã sử dụng',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','EXPIRED','DISABLED')),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `discount_code`
--

INSERT INTO `discount_code` (`discount_id`, `code`, `percentage_off`, `max_discount`, `expires_at`, `conditions`, `applicable_hotels`, `applicable_rooms`, `min_nights`, `max_nights`, `usage_limit`, `usage_count`, `status`, `created_at`, `updated_at`) VALUES
('DC001', 'SUMMER2025', 10.00, 100000.00, '2025-12-31 23:59:59', NULL, NULL, NULL, NULL, NULL, NULL, 0, 'ACTIVE', '2025-11-04 12:15:38', '2025-11-04 12:15:38'),
('DC002', 'HOTEL2025', 15.00, 200000.00, '2025-12-31 23:59:59', NULL, '[\"H001\", \"H002\"]', NULL, 2, NULL, 100, 0, 'ACTIVE', '2025-11-04 12:15:38', '2025-11-04 12:15:38'),
('DC003', 'FIXED50K', NULL, 50000.00, '2025-12-31 23:59:59', '{\"min_purchase\": 1000000}', NULL, NULL, NULL, NULL, NULL, 0, 'ACTIVE', '2025-11-04 12:15:38', '2025-11-04 12:15:38');

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
('F001', 'Wifi miễn phí', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/12058/12058938.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F002', 'Hồ bơi', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/9796/9796934.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F003', 'Bãi đỗ xe', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/12495/12495643.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F004', 'Nhà hàng', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/18567/18567149.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F005', 'Máy lạnh', 'ROOM', 'https://cdn-icons-png.freepik.com/256/17910/17910591.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F006', 'TV màn hình phẳng', 'ROOM', 'https://cdn-icons-png.freepik.com/256/6470/6470296.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F007', 'Ban công riêng', 'ROOM', 'https://cdn-icons-png.freepik.com/256/2979/2979364.png?semt=ais_white_label', '2025-10-20 15:09:17'),
('F008', 'Lễ tân 24 giờ', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/16941/16941913.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F009', 'Dịch vụ phòng', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/8527/8527150.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F010', 'Dịch vụ giặt là', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/8912/8912913.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F011', 'Dịch vụ đưa đón sân bay', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/7094/7094269.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F012', 'Phòng tập gym', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/12237/12237602.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F013', 'Spa & Massage', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/8937/8937527.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F014', 'Sân tennis', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/11698/11698747.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F015', 'Phòng karaoke', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/15531/15531630.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F016', 'Bar', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/12919/12919870.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F017', 'Quán cafe', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/11224/11224143.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F018', 'Bữa sáng buffet', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/4784/4784523.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F019', 'Camera an ninh', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/13347/13347367.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F020', 'Két an toàn', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/14871/14871773.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F021', 'Bảo vệ 24/7', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/17291/17291812.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F022', 'Thang máy', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/9796/9796213.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F023', 'Vườn', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/8616/8616197.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F024', 'Sân thượng', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/11138/11138493.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F025', 'Phòng họp', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/15992/15992323.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F026', 'Minibar', 'ROOM', 'https://cdn-icons-png.freepik.com/256/15804/15804706.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F027', 'Ấm đun nước', 'ROOM', 'https://cdn-icons-png.freepik.com/256/7079/7079633.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F028', 'Tủ lạnh', 'ROOM', 'https://cdn-icons-png.freepik.com/256/6338/6338477.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F029', 'Máy sấy tóc', 'ROOM', 'https://cdn-icons-png.freepik.com/256/8410/8410752.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F030', 'Bàn làm việc', 'ROOM', 'https://cdn-icons-png.freepik.com/256/14697/14697870.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F031', 'Két an toàn trong phòng', 'ROOM', 'https://cdn-icons-png.freepik.com/256/2237/2237802.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F032', 'Dép đi trong phòng', 'ROOM', 'https://cdn-icons-png.freepik.com/256/13873/13873971.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F033', 'Áo choàng tắm', 'ROOM', 'https://cdn-icons-png.freepik.com/256/14262/14262562.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F034', 'Tầm nhìn ra biển', 'ROOM', 'https://cdn-icons-png.freepik.com/256/9989/9989305.png?semt=ais_white_label', '2025-10-29 11:35:31'),
('F035', 'Tầm nhìn ra thành phố', 'ROOM', 'https://cdn-icons-png.freepik.com/256/732/732877.png?semt=ais_white_label', '2025-10-29 11:35:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `highlight`
--

CREATE TABLE `highlight` (
  `highlight_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên highlight',
  `icon_url` varchar(500) DEFAULT NULL COMMENT 'URL icon (Freepik, Flaticon...)',
  `description` text DEFAULT NULL COMMENT 'Mô tả chi tiết',
  `category` varchar(50) DEFAULT 'GENERAL' COMMENT 'Loại: LOCATION, SERVICE, AMENITY, EXPERIENCE',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data - Tất cả các highlights có thể có';

--
-- Đang đổ dữ liệu cho bảng `highlight`
--

INSERT INTO `highlight` (`highlight_id`, `name`, `icon_url`, `description`, `category`, `created_at`) VALUES
('HL001', 'Wi-Fi miễn phí trong tất cả các phòng!', 'https://cdn-icons-png.freepik.com/256/6511/6511058.png?semt=ais_white_label', 'Tốc độ cao, ổn định 24/7', 'AMENITY', '2025-10-29 06:32:48'),
('HL002', 'Bãi đỗ xe miễn phí', 'https://cdn-icons-png.freepik.com/256/1807/1807853.png?semt=ais_white_label', 'Chỗ đỗ xe rộng rãi, an toàn', 'AMENITY', '2025-10-29 06:32:48'),
('HL003', 'Cách sân bay Nội Bài 28 km', 'https://cdn-icons-png.freepik.com/256/17582/17582969.png?semt=ais_white_label', 'Khoảng 45 phút di chuyển', 'LOCATION', '2025-10-29 06:32:48'),
('HL004', 'Ngay trung tâm Hà Nội', 'https://cdn-icons-png.freepik.com/256/10152/10152246.png?semt=ais_white_label', 'Cách Hồ Hoàn Kiếm chỉ 500m', 'LOCATION', '2025-10-29 06:32:48'),
('HL005', 'Nhận/trả phòng nhanh', 'https://cdn-icons-png.freepik.com/256/5384/5384976.png?semt=ais_white_label', 'Express check-in/check-out', 'SERVICE', '2025-10-29 06:32:48'),
('HL006', 'Bữa sáng buffet hảo hạng', 'https://cdn-icons-png.freepik.com/256/16447/16447950.png?semt=ais_white_label', 'Ẩm thực đa quốc gia cao cấp', 'AMENITY', '2025-10-29 06:32:48'),
('HL007', 'Spa & Wellness đẳng cấp', 'https://cdn-icons-png.freepik.com/256/8937/8937527.png?semt=ais_white_label', 'Thư giãn với liệu trình 5 sao', 'EXPERIENCE', '2025-10-29 06:32:48'),
('HL008', 'Vườn thượng uyển', 'https://cdn-icons-png.freepik.com/256/7933/7933279.png?semt=ais_white_label', 'Không gian xanh giữa lòng thành phố', 'AMENITY', '2025-10-29 06:32:48'),
('HL009', 'Hồ bơi ngoài trời', 'https://cdn-icons-png.freepik.com/256/9968/9968418.png?semt=ais_white_label', 'View đẹp, mở cửa 6h-22h', 'AMENITY', '2025-10-29 06:32:48'),
('HL010', 'Đưa đón sân bay miễn phí', 'https://cdn-icons-png.freepik.com/256/1315/1315171.png?semt=ais_white_label', 'Xe shuttle tiện lợi', 'SERVICE', '2025-10-29 06:32:48'),
('HL011', 'Lễ tân phục vụ 24 giờ', 'https://cdn-icons-png.freepik.com/256/16941/16941913.png?semt=ais_white_label', 'Đội ngũ chuyên nghiệp, thân thiện', 'SERVICE', '2025-10-29 06:32:48'),
('HL012', 'Quán cafe sang trọng', 'https://cdn-icons-png.freepik.com/256/2972/2972908.png?semt=ais_white_label', 'Thức uống đa dạng', 'AMENITY', '2025-10-29 06:32:48'),
('HL013', 'Phòng tập gym hiện đại', 'https://cdn-icons-png.freepik.com/256/17635/17635605.png?semt=ais_white_label', 'Trang thiết bị cao cấp', 'AMENITY', '2025-10-29 06:32:48'),
('HL014', 'Gần chợ Bến Thành', 'https://cdn-icons-png.freepik.com/256/16173/16173023.png?semt=ais_white_label', 'Chỉ 200m đi bộ', 'LOCATION', '2025-10-29 06:32:48'),
('HL015', 'Chỗ đỗ xe máy miễn phí', 'https://cdn-icons-png.freepik.com/256/10875/10875188.png?semt=ais_white_label', 'An toàn, tiện lợi', 'AMENITY', '2025-10-29 06:32:48'),
('HL016', 'Dịch vụ phòng', 'https://cdn-icons-png.freepik.com/256/12931/12931123.png?semt=ais_white_label', 'Nhanh chóng, chu đáo', 'SERVICE', '2025-10-29 06:32:48'),
('HL017', 'Vườn xanh mát rộng rãi', 'https://cdn-icons-png.freepik.com/256/14067/14067752.png?semt=ais_white_label', 'Không gian thư giãn lý tưởng', 'AMENITY', '2025-10-29 06:32:48'),
('HL018', 'Nhà hàng món Á - Âu', 'https://cdn-icons-png.freepik.com/256/1795/1795917.png?semt=ais_white_label', 'Đầu bếp chuyên nghiệp', 'AMENITY', '2025-10-29 06:32:48'),
('HL019', 'Dịch vụ giặt là nhanh', 'https://cdn-icons-png.freepik.com/256/17200/17200223.png?semt=ais_white_label', 'Miễn phí cho khách lưu trú dài hạn', 'SERVICE', '2025-10-29 06:32:48'),
('HL020', 'Gần biển', 'https://cdn-icons-png.freepik.com/256/7732/7732019.png?semt=ais_white_label', 'Chỉ 5 phút đi bộ', 'LOCATION', '2025-10-29 06:32:48'),
('HL021', 'View thành phố tuyệt đẹp', 'https://cdn-icons-png.freepik.com/256/366/366945.png?semt=ais_white_label', 'Ngắm toàn cảnh thành phố', 'EXPERIENCE', '2025-10-29 06:32:48'),
('HL022', 'Gần trung tâm mua sắm', 'https://cdn-icons-png.freepik.com/256/12514/12514926.png?semt=ais_white_label', 'Mua sắm tiện lợi', 'LOCATION', '2025-10-29 06:32:48'),
('HL023', 'Bar rooftop', 'https://cdn-icons-png.freepik.com/256/1243/1243121.png?semt=ais_white_label', 'View 360 độ tuyệt đẹp', 'EXPERIENCE', '2025-10-29 06:32:48'),
('HL024', 'Phòng họp hiện đại', 'https://cdn-icons-png.freepik.com/256/12182/12182835.png?semt=ais_white_label', 'Phù hợp tổ chức sự kiện', 'AMENITY', '2025-10-29 06:32:48'),
('HL025', 'Gần các điểm tham quan', 'https://cdn-icons-png.freepik.com/256/3660/3660588.png?semt=ais_white_label', 'Di chuyển dễ dàng', 'LOCATION', '2025-10-29 06:32:48');

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
('H001', 'Hanoi Old Quarter Hotel', 'Khách Sạn Old Quarter 1961 - Trung tâm Hà Nội\n\nKhách Sạn Old Quarter 1961 là một khách sạn sang trọng nằm ở trung tâm thành phố Hà Nội, Việt Nam. Với vị trí thuận lợi chỉ cách Trung tâm Thành phố 0.5km, du khách có thể dễ dàng tiếp cận với các điểm tham quan, mua sắm và những điểm đến hấp dẫn khác trong khu phố cổ nổi tiếng. Khách sạn đã được tu sửa lại hoàn toàn vào năm 2019, mang đến không gian nghỉ dưỡng hiện đại và tiện nghi cho du khách. Với tổng cộng 8 phòng, Khách Sạn Old Quarter 1961 mang đến sự riêng tư và thoải mái cho khách hàng. Mỗi phòng đều được thiết kế tinh tế với nội thất sang trọng và trang bị đầy đủ các tiện nghi cần thiết. Thời gian nhận phòng bắt đầu từ 02:00 PM và thời gian trả phòng đến 12:00 PM, giúp khách hàng linh hoạt trong việc điều chỉnh lịch trình du lịch của mình. Đối với các gia đình có trẻ nhỏ, Khách Sạn Old Quarter 1961 cho phép trẻ em từ 3 đến 12 tuổi ở miễn phí, tạo điều kiện thuận lợi cho những kỳ nghỉ gia đình vui vẻ và tiết kiệm chi phí.\n\nGiải trí tại Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 tọa lạc tại trung tâm khu phố cổ Hà Nội và nằm gần nhiều điểm tham quan nổi tiếng. Khách sạn này cung cấp nhiều tiện nghi giải trí đa dạng, trong đó có một quầy bar tuyệt vời. Quầy bar của Khách Sạn Old Quarter 1961 là nơi lý tưởng để thư giãn và thưởng thức các loại đồ uống phong phú. Với không gian sang trọng và trang nhã, quầy bar này sẽ mang đến cho bạn trải nghiệm thú vị và thoải mái. Bạn có thể lựa chọn từ danh sách đa dạng các loại cocktail, rượu vang, bia và đồ uống không cồn khác để thưởng thức trong không gian ấm cúng và thân thiện. Ngoài ra, quầy bar cũng cung cấp các món ăn nhẹ và đặc sản địa phương để bạn thưởng thức. Bạn có thể thả mình vào không gian lãng mạn và tận hưởng không khí tươi mát của quầy bar, cùng với âm nhạc nhẹ nhàng và dịch vụ chuyên nghiệp từ đội ngũ nhân viên. Khách Sạn Old Quarter 1961 sẽ là điểm đến lý tưởng cho những ai muốn tận hưởng những khoảnh khắc thư giãn và vui vẻ tại Hà Nội.\n\nTiện nghi tiện lợi tại Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 tọa lạc tại trung tâm Hà Nội và cung cấp nhiều tiện nghi tiện lợi cho khách hàng. Khách sạn có dịch vụ phòng 24 giờ, giúp khách hàng có thể yên tâm gọi phục vụ trong suốt cả ngày và đêm. Ngoài ra, khách sạn còn cung cấp dịch vụ giặt là, giúp khách hàng tiết kiệm thời gian và công sức khi du lịch. Khách sạn cũng có dịch vụ phòng, nơi khách hàng có thể đặt món ăn và thức uống trực tiếp trong phòng. Điều này mang lại sự tiện lợi và thoải mái cho khách hàng. Ngoài ra, khách sạn còn có hộp đựng đồ có chìa khóa an toàn, giúp khách hàng bảo vệ tài sản cá nhân. Khách Sạn Old Quarter 1961 cũng cung cấp Wi-Fi miễn phí trong các khu vực công cộng và trong tất cả các phòng. Điều này giúp khách hàng kết nối với thế giới bên ngoài một cách dễ dàng. Ngoài ra, khách sạn còn có khu vực được chỉ định dành riêng cho hút thuốc, đảm bảo không gian không khói thuốc cho những khách hàng hút thuốc. Khách sạn cũng cung cấp dịch vụ giặt là và làm khô, giúp khách hàng giữ quần áo sạch sẽ và tươi mới trong suốt chuyến đi. Ngoài ra, khách sạn còn có dịch vụ làm thủ tục nhận phòng/nhận phòng nhanh chóng, giúp khách hàng tiết kiệm thời gian. Khách sạn cũng cung cấp dịch vụ để hành lý, giúp khách hàng lưu trữ đồ đạc một cách an toàn. Cuối cùng, khách sạn cung cấp dịch vụ dọn phòng hàng ngày, đảm bảo sự sạch sẽ và gọn gàng cho khách hàng.\n\nTiện nghi vận chuyển tại Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 tọa lạc tại trung tâm Hà Nội, Việt Nam, cung cấp nhiều tiện nghi vận chuyển để đáp ứng nhu cầu của du khách. Khách sạn cung cấp dịch vụ đưa đón sân bay, giúp bạn dễ dàng di chuyển từ sân bay đến khách sạn và ngược lại. Ngoài ra, khách sạn cũng có dịch vụ thuê xe và dịch vụ taxi để bạn có thể tự do khám phá thành phố. Nếu bạn muốn khám phá các điểm tham quan nổi tiếng trong thành phố, Khách Sạn Old Quarter 1961 cũng cung cấp dịch vụ đặt vé và tổ chức tour du lịch. Bạn có thể dễ dàng đặt vé và tham gia các tour thú vị để khám phá vẻ đẹp của Hà Nội. Đối với khách có xe riêng, khách sạn cũng có bãi đỗ xe, tuy nhiên, phí đỗ xe sẽ được áp dụng.\n\nNhà hàng và dịch vụ ăn uống tại Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 tọa lạc tại trung tâm Hà Nội, nơi bạn có thể tìm thấy một loạt các dịch vụ ăn uống đa dạng và hấp dẫn. Khách sạn cung cấp dịch vụ phòng 24 giờ, cho phép bạn đặt món và thưởng thức bữa ăn ngon tại phòng của mình mọi lúc trong ngày. Bên cạnh đó, khách sạn còn có một nhà hàng tuyệt vời, nơi bạn có thể thưởng thức các món ăn đa dạng từ địa phương đến quốc tế. Với dịch vụ phòng hàng ngày, bạn sẽ luôn có một không gian sạch sẽ và thoải mái để thưởng thức bữa sáng buffet tuyệt vời.\n\nCác loại phòng tại Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 tọa lạc tại Hà Nội, Việt Nam, mang đến cho du khách những lựa chọn phòng đa dạng và phong cách. Tại đây, bạn có thể tận hưởng phòng Day Use - Double Room - Max 2 Hours Stay, Deluxe Window, Executive và Family Suite. Đặt phòng tại Khách Sạn Old Quarter 1961 qua Agoda sẽ mang lại cho bạn những giá tốt nhất và trải nghiệm đặt phòng dễ dàng, không cần quá nhiều rắc rối.\n\nKhám phá Quận Hoàn Kiếm - Trung tâm lịch sử và văn hóa của Hà Nội\n\nQuận Hoàn Kiếm là một trong những quận trung tâm của Hà Nội, Việt Nam. Với vị trí đắc địa, Quận Hoàn Kiếm nằm bên bờ hồ Hoàn Kiếm lộng lẫy, nơi được coi là trái tim của thành phố. Khu vực này không chỉ nổi tiếng với cảnh quan thiên nhiên tuyệt đẹp mà còn là trung tâm lịch sử và văn hóa của Hà Nội. Quận Hoàn Kiếm có nhiều điểm tham quan nổi tiếng như Ngọc Sơn Temple, Tháp Rùa, và Cầu Thê Húc. Du khách có thể tham quan các di tích lịch sử, ngắm nhìn kiến trúc cổ kính, và tận hưởng không khí yên bình tại các công viên xung quanh hồ Hoàn Kiếm. Ngoài ra, khu vực này cũng rất phát triển về mặt văn hóa, với nhiều nhà hàng, quán cà phê, và cửa hàng nghệ thuật hiện đại. Quận Hoàn Kiếm là điểm đến lý tưởng cho những ai muốn khám phá lịch sử và văn hóa của Hà Nội, đồng thời tận hưởng không gian xanh và yên bình giữa trung tâm thành phố.\n\nHướng dẫn đi từ sân bay đến Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 là một điểm dừng chân lý tưởng tại Quận Hoàn Kiếm, Hà Nội, Việt Nam. Để đến được khách sạn từ sân bay, bạn có thể lựa chọn một trong hai sân bay gần Hà Nội là Sân bay Quốc tế Nội Bài (HAN) hoặc Sân bay Quốc tế Cát Bi (HPH). Nếu bạn đến từ Sân bay Quốc tế Nội Bài, có một số phương tiện bạn có thể sử dụng để đến Khách Sạn Old Quarter 1961. Một lựa chọn phổ biến là sử dụng dịch vụ taxi hoặc dịch vụ xe đón khách của khách sạn. Thời gian di chuyển từ sân bay này đến khách sạn khoảng 30 phút và bạn có thể tận hưởng cảnh quan đẹp của Hà Nội trong suốt hành trình. Nếu bạn đến từ Sân bay Quốc tế Cát Bi, bạn cũng có thể sử dụng taxi hoặc dịch vụ xe đón khách để đến Khách Sạn Old Quarter 1961. Quãng đường từ sân bay này đến khách sạn khoảng 1 giờ và bạn sẽ đi qua những con đường đẹp và những cảnh quan tuyệt vời của Hà Nội. Dù bạn đến từ Sân bay Quốc tế Nội Bài hay Sân bay Quốc tế Cát Bi, việc đến Khách Sạn Old Quarter 1961 không quá khó khăn. Với các phương tiện di chuyển tiện lợi và thời gian di chuyển không quá xa, bạn sẽ có một trải nghiệm tuyệt vời tại khách sạn này.\n\nKhách Sạn Old Quarter 1961: Khám phá những điểm đến nổi tiếng xung quanh\n\nKhách Sạn Old Quarter 1961 nằm ở vị trí lý tưởng, cho phép du khách khám phá những điểm đến nổi tiếng và độc đáo trong khu vực. Trước khi bắt đầu chuyến phiêu lưu của bạn, hãy dành thời gian để khám phá những điểm đến gần đó. Nằm cách đó chỉ một quãng đi bộ, bạn có thể đến thăm Nha Tù Hoả Lò, một di tích lịch sử quan trọng của Việt Nam. Đây là nơi mà người dân Việt Nam đã trải qua những ngày đen tối trong quá khứ. Bảo tàng của phụ nữ Việt Nam cũng nằm gần đó, nơi bạn có thể khám phá về vai trò và đóng góp của phụ nữ trong lịch sử Việt Nam. Nếu bạn muốn tìm hiểu về văn hóa và kiến trúc của Hà Nội, hãy ghé thăm Nhà Thờ Lớn Hà Nội và Nhà hát Lớn Hà Nội. Hai địa điểm này không chỉ đẹp mắt mà còn mang ý nghĩa lịch sử sâu sắc. Đối diện với Nhà hát Lớn là Den Ngoc Son, một ngôi đền nổi tiếng nằm giữa Hồ Hoàn Kiếm. Bạn cũng có thể dạo bước trên Con Đường Gốm Sứ Hà Nội để khám phá những cửa hàng gốm sứ truyền thống và tìm hiểu về nghề truyền thống nổi tiếng của Hà Nội. Cùng khám phá Tháp Rùa, một công trình kiến trúc độc đáo nằm bên Hồ Hoàn Kiếm. Khách Sạn Old Quarter 1961 cũng nằm gần Phố Hàng Gai, nơi bạn có thể tìm thấy nhiều cửa hàng, quán cà phê và nhà hàng độc đáo. Bảo tàng Lịch sử và Trung tâm Múa rối nước Bông Sen cũng là những điểm đến thú vị trong khu vực này. Với vị trí thuận lợi và những điểm đến nổi tiếng xung quanh, Khách Sạn Old Quarter 1961 là lựa chọn tuyệt vời cho du khách muốn khám phá Hà Nội.\n\nNhững nhà hàng xung quanh Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 nằm gần một số nhà hàng nổi tiếng trong khu vực. Bạn có thể thưởng thức những món ăn ngon tại Maison Sen Buffet, nơi bạn có thể thưởng thức đa dạng các món ăn từ nhiều nền văn hóa khác nhau. Nếu bạn muốn thưởng thức một tách cà phê thơm ngon, hãy ghé qua HQ Bistro - Food & Coffee. The Note Coffee cũng là một lựa chọn tuyệt vời để thưởng thức cà phê và trà. Nếu bạn muốn thưởng thức món phở truyền thống của Hà Nội, hãy đến Phở 10 Lý Quốc Sư. The Hanoi Social Club là một địa điểm tuyệt vời để thưởng thức ẩm thực quốc tế và thưởng thức nhạc sống. Nếu bạn là một tín đồ của bia thủ công, hãy ghé qua Pasteur Street Craft Beer - Hoan Kiem Taproom & Restaurant. Với không gian độc đáo và không gian yên tĩnh, Railway Cafe là nơi lý tưởng để thưởng thức cà phê và thư giãn. Bánh Mỳ Mama và Bún bò Nam Bộ cũng là những lựa chọn tuyệt vời để thưởng thức ẩm thực đường phố. Nếu bạn muốn thưởng thức ẩm thực Pháp, hãy đến L\'essence De Cuisine.\n\nNhững điểm mua sắm nổi tiếng quanh Khách Sạn Old Quarter 1961\n\nKhách Sạn Old Quarter 1961 nằm gần nhiều điểm mua sắm nổi tiếng tại Hà Nội. Du khách có thể tìm thấy những món đồ độc đáo tại Things of Substance và Airashi Silk. Nếu bạn đang tìm kiếm những sản phẩm từ lụa cao cấp, hãy ghé qua Royal Silk và IndochinaSilk. Cửa hàng nội thất Nguyên Frères và Magonn Design cung cấp những món đồ trang trí độc đáo cho ngôi nhà của bạn. Nếu bạn quan tâm đến văn hóa Việt Nam, hãy ghé qua Văn hóa Việt Nam để khám phá những sản phẩm mang tính chất truyền thống. L\'Epicerie du Metropole là một cửa hàng tuyệt vời để mua các loại thực phẩm đặc sản. Bạn cũng có thể ghé qua Intimex và Ipa-Nima để tìm thêm những sản phẩm độc đáo khác.\n\nGiá phòng trung bình tại Khách Sạn Old Quarter 1961 so sánh với giá phòng trung bình tại Hà Nội\n\nVới giá phòng trung bình chỉ $11, Khách Sạn Old Quarter 1961 là một lựa chọn tuyệt vời cho du khách muốn tiết kiệm chi phí khi đến Hà Nội. So với giá phòng trung bình tại thành phố này là $73, Khách Sạn Old Quarter 1961 mang đến một giá cả hợp lý và cạnh tranh cho khách hàng. Với mức giá này, bạn có thể tận hưởng một trải nghiệm nghỉ dưỡng thoải mái và tiết kiệm tiền để khám phá những điểm đến thú vị khác trong thành phố.\n\nKhách Sạn Old Quarter 1961: Đánh giá tích cực từ khách hàng\n\nKhách Sạn Old Quarter 1961 tọa lạc tại vị trí thuận lợi, giúp bạn dễ dàng đi lại trong thành phố. Bữa sáng ngon miệng là một điểm cộng đáng kể. Tôi sẽ quay lại vào tháng sau vì khách sạn rất tốt. Mọi thứ đều tuyệt vời, từ vị trí thuận lợi đến giá cả hợp lý. Phòng ở khá thoải mái và nhân viên rất nhiệt tình. Khách sạn đáp ứng đầy đủ các yêu cầu của tôi. Tôi đã lưu trú tại khách sạn vào tháng Hai, nơi này nằm sâu trong phố cổ, rất yên tĩnh và không bị ồn ào từ giao thông.\n\nKhách Sạn Old Quarter 1961: Đánh giá tích cực từ khách hàng\n\nKhách Sạn Old Quarter 1961 là một nơi lý tưởng để lưu trú khi đến Hà Nội. Với đánh giá tổng thể 6.5, khách sạn này đã nhận được nhiều lời khen ngợi từ khách hàng về sự thoải mái và tiện nghi tại đây. Khách sạn được đánh giá 6.3 cho giá trị và tiện nghi, 6.2 cho sự sạch sẽ, 7.2 cho vị trí và 6.7 cho hiệu suất của nhân viên. Với mức đánh giá cao về giá trị và tiện nghi, Khách Sạn Old Quarter 1961 mang đến cho khách hàng một trải nghiệm lưu trú tuyệt vời. Với các phòng nghỉ thoải mái và tiện nghi hiện đại, khách sạn này đảm bảo mang đến sự thoải mái và hài lòng cho khách hàng. Ngoài ra, với vị trí thuận lợi, khách sạn chỉ cách một số điểm du lịch nổi tiếng của Hà Nội và khu phố cổ chỉ trong khoảng cách đi bộ ngắn. Đội ngũ nhân viên chuyên nghiệp và thân thiện cũng được đánh giá cao với hiệu suất 6.7, luôn sẵn lòng hỗ trợ khách hàng để đảm bảo một kỳ nghỉ tuyệt vời. Với sự sạch sẽ và tiện nghi tốt, Khách Sạn Old Quarter 1961 là một lựa chọn lý tưởng cho du khách muốn khám phá Hà Nội. Với mức đánh giá 6.2 cho sự sạch sẽ, khách sạn này cam kết đảm bảo môi trường sống và nghỉ ngơi thoải mái cho khách hàng. Điều này giúp tạo ra một không gian lưu trú dễ chịu và thú vị, mang lại cho khách hàng trải nghiệm tuyệt vời khi ở lại Khách Sạn Old Quarter 1961.', 'CAT001', 'LOC_HN_01', '12 Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.033000, 105.850000, 3.0, 4.0, 1, '14:00:00', '12:00:00', '024-88888888', 'contact@hoqhotel.vn', 'https://hoqhotel.vn', 30, 'https://pix8.agoda.net/hotelImages/9757717/-1/e20c48164064a127c613ecd69c214500.jpg?ca=10&ce=1&s=1024x768', 'ACTIVE', '2025-10-20 15:09:17', '2025-11-04 12:11:58'),
('H002', 'My Khe Beach Resort', '🏖️ My Khe Beach Resort – Thiên đường nghỉ dưỡng bên bờ biển Đà Nẵng\n\n📍 Địa chỉ: 300 Võ Nguyên Giáp, bãi biển Mỹ Khê, Quận Ngũ Hành Sơn, Đà Nẵng\n☎️ Hotline: +84 (0)236 395 1555\n🌐 Website: www.mykhebeachresort.vn\n (tham khảo thông tin chính thống)\n\n🌅 Tổng quan\n\nTọa lạc ngay trên bãi biển Mỹ Khê – được tạp chí Forbes vinh danh là “một trong những bãi biển quyến rũ nhất hành tinh”, My Khe Beach Resort là điểm đến lý tưởng cho những ai muốn hòa mình vào vẻ đẹp thiên nhiên tuyệt vời của biển Đà Nẵng, nơi cát trắng mịn trải dài, sóng vỗ rì rào và ánh hoàng hôn nhuộm vàng chân trời.\n\nResort mang phong cách kiến trúc nhiệt đới hiện đại, kết hợp giữa vật liệu tự nhiên như gỗ, đá và cây xanh, tạo nên không gian gần gũi nhưng vẫn đậm chất sang trọng. Với khuôn viên rộng rãi, cây xanh phủ khắp và hướng nhìn trực diện ra biển, My Khe Beach Resort là lựa chọn hoàn hảo cho cả kỳ nghỉ lãng mạn, chuyến đi gia đình, hay chuyến công tác kết hợp nghỉ dưỡng (bleisure).\n\n🛏️ Phòng nghỉ & Tiện nghi\n\nResort có hơn 100 phòng và villa hướng biển hoặc hướng vườn, được thiết kế tinh tế để mang lại sự thoải mái tối đa.\n\n🛎️ Các hạng phòng tiêu biểu:\n\n🌿 Superior Garden View: Phòng hướng vườn, yên tĩnh, thích hợp cho cặp đôi muốn tận hưởng không gian riêng tư.\n\n🌊 Deluxe Sea View: Ban công rộng mở ra hướng biển, nơi bạn có thể đón bình minh rực rỡ mỗi sáng.\n\n🏡 Family Suite: Rộng rãi, có phòng khách riêng, phù hợp cho gia đình có trẻ nhỏ.\n\n💎 Beachfront Villa: Biệt thự cao cấp nằm sát bờ biển, có hồ bơi riêng, sân vườn riêng – mang lại trải nghiệm nghỉ dưỡng đẳng cấp.\n\n🧺 Tiện nghi trong phòng:\n\nĐiều hòa không khí, két an toàn, minibar và TV màn hình phẳng\n\nBồn tắm hoặc vòi sen cao cấp, áo choàng tắm và dép đi trong nhà\n\nMáy pha cà phê/ấm đun nước, đồ dùng vệ sinh cá nhân miễn phí\n\nBan công riêng với ghế tắm nắng hoặc bàn trà hướng biển\n\nDịch vụ dọn phòng hàng ngày, giặt là và phục vụ tại phòng (room service)\n\n🌴 Dịch vụ & Trải nghiệm\n\nMy Khe Beach Resort không chỉ là nơi lưu trú – mà còn là một hành trình tận hưởng trọn vẹn cuộc sống biển.\n\n🌊 Tiện ích & Hoạt động nổi bật:\n\n🏖️ Bãi biển riêng với ghế tắm nắng, dù che và nhân viên cứu hộ túc trực\n\n🏊 Hồ bơi ngoài trời rộng lớn hướng biển, kết hợp quầy bar phục vụ cocktail và nước ép trái cây tươi\n\n💆 Trung tâm Spa & Massage – liệu trình trị liệu bằng thảo dược Việt Nam, giúp tái tạo năng lượng\n\n💪 Phòng gym & yoga hướng biển, mở cửa từ sáng sớm\n\n🚴 Thuê xe đạp và tổ chức tour địa phương: Ngũ Hành Sơn, Bà Nà Hills, Hội An cổ kính…\n\n👩‍🍳 Lớp học nấu ăn Việt, hoạt động câu cá và tour khám phá văn hóa bản địa\n\n🍽️ Ẩm thực & Nhà hàng\n\nResort sở hữu hệ thống nhà hàng – quầy bar – café nằm rải rác quanh khuôn viên:\n\n🍜 Nhà hàng Ocean Breeze: Phục vụ buffet sáng, món Việt Nam truyền thống và hải sản tươi sống Đà Nẵng.\n\n🍷 Sunset Bar: Nằm bên hồ bơi, lý tưởng để thưởng thức cocktail hoặc rượu vang trong ánh chiều tà.\n\n☕ Café SeaWind: Nơi lý tưởng để ngắm biển buổi sáng, nhâm nhi cà phê hoặc sinh tố mát lạnh.\n\n🦞 Hải sản Mỹ Khê Corner: Thực đơn phong phú, nguyên liệu được đánh bắt và chế biến trong ngày.\n\n🌇 Vị trí & Liên kết du lịch\n\nTừ My Khe Beach Resort, bạn dễ dàng di chuyển tới các điểm nổi tiếng:\n\n🚶 0 phút – Bước chân ra là tới bãi biển Mỹ Khê\n\n🚗 10 phút – Trung tâm thành phố Đà Nẵng, Cầu Rồng, Cầu Tình Yêu\n\n🏯 15 phút – Ngũ Hành Sơn\n\n🏖️ 25 phút – Biển Non Nước và làng đá mỹ nghệ\n\n🏙️ 30 phút – Sân bay quốc tế Đà Nẵng\n\n🏮 40 phút – Phố cổ Hội An (di sản văn hóa thế giới UNESCO)\n\n🌿 Không gian & Thiết kế\n\nKhu nghỉ dưỡng được bao quanh bởi hàng dừa cao vút, hồ sen, và lối đi lát đá xen giữa thảm cỏ xanh. Mỗi góc trong resort đều mang lại cảm giác yên bình, thư giãn.\nBuổi sáng, bạn có thể đi dạo barefoot trên cát, nghe tiếng sóng vỗ rì rào; buổi tối, ánh đèn vàng từ hồ bơi phản chiếu mặt biển tạo nên khung cảnh lãng mạn khó quên.\n\n🧘 Trải nghiệm gợi ý tại Resort\n\n🌞 Buổi sáng: Tập yoga bên bãi biển, ngắm bình minh, thưởng thức bữa sáng buffet với cà phê Việt Nam và bánh mì bơ trứng.\n🌅 Buổi chiều: Ngâm mình trong hồ bơi, tham gia lớp nấu ăn hoặc tour chợ hải sản.\n🌙 Buổi tối: Dùng bữa tối ngoài trời, nghe sóng vỗ và thưởng thức hải sản nướng, kết thúc ngày bằng một ly vang trắng tại Sunset Bar.\n\n🎯 Lý tưởng cho bạn nếu\n\n❤️ Bạn muốn tận hưởng kỳ nghỉ thư giãn bên biển trong không gian sang trọng.\n\n👨‍👩‍👧 Bạn đi cùng gia đình hoặc nhóm bạn, cần phòng rộng, hồ bơi và khu vui chơi.\n\n💑 Bạn tìm kiếm nơi lãng mạn để tận hưởng trăng mật hoặc kỷ niệm đặc biệt.\n\n💼 Bạn cần resort yên tĩnh, có Wi-Fi, phòng họp nhỏ cho công việc nhẹ nhàng kết hợp nghỉ ngơi.\n\n🏄 Bạn yêu thích thể thao biển – lướt sóng, đi mô tô nước, kayak, hoặc chỉ đơn giản là tắm biển và tắm nắng.\n\n🏅 Điểm nổi bật được du khách đánh giá cao (Booking & TripAdvisor)\n\n⭐ Vị trí tuyệt vời – sát biển Mỹ Khê, cách trung tâm chỉ 10 phút\n⭐ Bãi biển riêng sạch đẹp, an ninh tốt\n⭐ Hồ bơi lớn và khuôn viên rợp bóng cây xanh\n⭐ Nhân viên thân thiện, phục vụ chuyên nghiệp\n⭐ Bữa sáng ngon, đa dạng với nhiều món Việt – Âu\n⭐ Giá trị tuyệt vời so với chất lượng dịch vụ\n\n🌺 Kết luận\n\nMy Khe Beach Resort là nơi mà bạn có thể ngắt kết nối khỏi nhịp sống vội vã, để hòa mình vào thiên nhiên, tận hưởng làn gió biển mặn mà và những khoảnh khắc bình yên hiếm có.\nTừ cặp đôi muốn tìm nơi lãng mạn, gia đình cần kỳ nghỉ thoải mái, đến những người chỉ đơn giản muốn nghỉ ngơi và hít thở gió biển – My Khe Beach Resort luôn mang đến trải nghiệm ấm áp, tinh tế và đáng nhớ.', 'CAT002', 'LOC_DN_04', '99 Võ Nguyên Giáp, Đà Nẵng', 16.070000, 108.250000, 5.0, 2.6, 1, '14:00:00', '12:00:00', '0236-7777777', 'info@mykheresort.vn', 'https://mykhebeachhotel.com/', 80, 'https://pix8.agoda.net/hotelImages/47287298/0/d754af9787e9f59a12824c5b7e0a8fb2.jpg?ce=0&s=1024x768', 'ACTIVE', '2025-10-20 15:09:17', '2025-11-04 10:38:12'),
('H003', 'Saigon Riverside Hotel', 'Nhìn ra sông Sài Gòn, Riverside Hotel có kiến ​​trúc có từ thời Pháp thuộc. Khách sạn có nhà hàng, bar và spa ngay trong khuôn viên. Quý khách có thể sử dụng Wi-Fi miễn phí ở tất cả các khu vực.\n\nRiverside Hotel cách Nhà hát Lớn 400 m, còn trung tâm mua sắm Takashimaya Việt Nam cách đó 700 m. Sân bay gần nhất là sân bay quốc tế Tân Sơn Nhất, cách chỗ nghỉ 8 km.\n\nĐược trang trí với các tông màu trắng và nâu, tất cả các phòng rộng rãi đều có máy điều hoà, gỗ cứng cùng tủ quần áo. Một số phòng chọn lọc có cửa sổ lớn và/hoặc ban công riêng. TV truyền hình cáp màn hình phẳng, tủ lạnh mini và ấm đun nước điện cũng được trang bị trong phòng. Phòng tắm riêng có tiện nghi vòi sen, dép và đồ vệ sinh cá nhân miễn phí.\n\nQuý khách có thể tận hưởng dịch vụ mát-xa nhẹ nhàng hoặc thư giãn ở phòng xông hơi khô của Riverside Hotel. Dịch vụ thu đổi ngoại tệ và đặt vé được cung cấp tại bàn đặt tour. Nhân viên tại quầy lễ tân 24 giờ có thể hỗ trợ quý khách giữ hành lý.\n\nCafé De Saigon phục vụ tuyển chọn các món ăn địa phương và châu Âu. Dịch vụ phòng cũng được cung cấp để tạo thuận tiện cho quý khách.\n\nCác cặp đôi đặc biệt thích địa điểm này — họ cho điểm 9,2 khi đánh giá chuyến đi hai người.', 'CAT001', 'LOC_HCM_06', '45 Nguyễn Huệ, Quận 1, HCM', 10.776000, 106.700000, 5.0, 2.8, 1, '14:00:00', '12:00:00', '028-88889999', 'info@saigonriverside.vn', 'https://saigonriverside.vn', 60, 'https://pix8.agoda.net/hotelImages/10990/-1/00a3fc8c563e203989620286acbcb950.jpg?ce=0&s=1024x768', 'ACTIVE', '2025-10-20 15:09:17', '2025-11-04 03:18:30'),
('H004', 'Sofitel Legend Metropole Hanoi', 'Khách sạn Sofitel Legend Metropole Hà Nội - Kỳ quan đích thực của Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội là một kỳ quan đích thực của thành phố Hà Nội, Việt Nam. Với 5.0 sao, khách sạn này nằm trong vị trí đắc địa, chỉ cách trung tâm thành phố 0.05 km. Với tổng số 364 phòng, khách sạn này đáp ứng mọi nhu cầu của du khách từ khắp nơi trên thế giới. Khách sạn Sofitel Legend Metropole Hà Nội đã được xây dựng từ năm 1901 và trải qua việc cải tạo vào năm 2022. Đây là một điểm đến lịch sử và đồng thời cũng mang đậm chất hiện đại. Với thời gian di chuyển chỉ 45 phút từ sân bay, việc đến và rời khách sạn trở nên thuận tiện. Thời gian nhận phòng là từ 02:00 PM và thời gian trả phòng là đến 12:00 PM. Khách sạn này cũng có chính sách đặc biệt cho trẻ em. Trẻ em từ 3 đến 11 tuổi được ở miễn phí tại khách sạn. Đây là một điểm đến lý tưởng cho gia đình và những ai muốn có một kỳ nghỉ đáng nhớ tại Hà Nội. Khách sạn Sofitel Legend Metropole Hà Nội sẽ mang đến cho bạn trải nghiệm lưu trú tuyệt vời và không thể quên.\n\nTiện nghi giải trí tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội không chỉ mang đến cho du khách một trải nghiệm lưu trú tuyệt vời mà còn cung cấp nhiều tiện nghi giải trí đa dạng. Tại đây, du khách có thể thỏa sức mua sắm tại các cửa hàng đa dạng với những sản phẩm độc đáo. Ngoài ra, khách sạn còn có một quầy bar sang trọng, nơi du khách có thể thưởng thức các loại đồ uống đặc biệt và thư giãn sau một ngày dạo chơi. Nếu bạn muốn tận hưởng những phút giây thư giãn và làm mới cơ thể, khách sạn cung cấp các dịch vụ làm đẹp như salon, massage, sauna và phòng xông hơi. Bạn có thể tận hưởng những liệu pháp thư giãn chuyên nghiệp và tận hưởng không gian yên bình. Ngoài ra, khách sạn còn có một khu vườn tuyệt đẹp, nơi bạn có thể dạo chơi và thư giãn giữa không gian xanh mát. Cuối cùng, bạn cũng có thể tìm mua những món quà độc đáo tại cửa hàng quà lưu niệm của khách sạn.\n\nCác tiện nghi thể thao tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội tọa lạc tại trung tâm thành phố Hà Nội, là một điểm đến lý tưởng cho những ai yêu thích thể thao và tìm kiếm sự thư giãn. Khách sạn này cung cấp nhiều tiện nghi thể thao đa dạng như phòng tập thể dục, hồ bơi ngoài trời, quầy bar bên hồ bơi, phòng yoga và phòng tập thể dục miễn phí. Phòng tập thể dục của khách sạn được trang bị đầy đủ các thiết bị hiện đại, giúp du khách có thể duy trì lối sống lành mạnh và rèn luyện cơ bắp. Hồ bơi ngoài trời là nơi lý tưởng để tắm nắng và thư giãn sau một ngày dài khám phá thành phố. Quầy bar bên hồ bơi cung cấp các loại đồ uống mát lạnh và cocktail tuyệt vời để khách hàng thưởng thức trong không gian thoáng đãng và tươi mát. Khách sạn cũng có phòng yoga và phòng tập thể dục miễn phí, giúp du khách có thể tập luyện và thư giãn mà không tốn thêm phí. Ngoài ra, khách sạn còn có phòng tập thể dục 24/7, phục vụ cho những khách hàng có thể tập luyện vào bất kỳ thời điểm nào trong ngày. Với các tiện nghi thể thao đa dạng và chất lượng, Khách sạn Sofitel Legend Metropole Hà Nội là một lựa chọn tuyệt vời cho những ai muốn duy trì sức khỏe và thư giãn trong chuyến du lịch của mình.\n\nTiện nghi tiện lợi tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội cung cấp nhiều tiện nghi tiện lợi để đáp ứng nhu cầu của du khách. Khách sạn có dịch vụ phòng 24 giờ, giúp bạn có thể yên tâm gọi đồ ăn và đồ uống ngay tại phòng. Dịch vụ giặt là cũng được cung cấp, giúp bạn giữ quần áo sạch sẽ trong suốt chuyến đi. Ngoài ra, khách sạn còn có dịch vụ giữ đồ an toàn, concierge, và Wi-Fi miễn phí tại các khu vực công cộng. Đối với những khách hàng hút thuốc, khách sạn cung cấp khu vực được chỉ định để hút thuốc. Bạn cũng có thể truy cập Wi-Fi miễn phí trong tất cả các phòng. Nếu bạn cần giặt ủi, khách sạn cung cấp dịch vụ giặt là khô. Ngoài ra, khách sạn còn có dịch vụ làm thủ tục nhận phòng/nhận phòng nhanh chóng, két đựng hành lý, và dịch vụ dọn phòng hàng ngày. Cuối cùng, khách sạn còn có lò sưởi để bạn có thể thoải mái trong những ngày lạnh giá.\n\nTiện ích vận chuyển tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội cung cấp nhiều tiện ích vận chuyển để đáp ứng nhu cầu của du khách. Dịch vụ chuyển đến sân bay là một trong những tiện ích đáng chú ý. Khách sạn có đội ngũ lái xe chuyên nghiệp sẵn sàng đưa đón bạn từ sân bay đến khách sạn một cách tiện lợi và an toàn. Nếu bạn muốn khám phá thành phố Hà Nội, khách sạn cũng cung cấp dịch vụ đặt tour. Bạn có thể tham gia các tour tham quan nổi tiếng để khám phá những điểm đến đẹp và lịch sử của thành phố. Ngoài ra, khách sạn cũng cung cấp dịch vụ thuê xe, giúp bạn di chuyển linh hoạt và thoải mái trong suốt chuyến du lịch của mình. Đối với khách có xe cá nhân, khách sạn có bãi đậu xe tự phục vụ và tính phí đậu xe. Ngoài ra, khách sạn còn cung cấp dịch vụ đặt xe taxi và vé, giúp bạn tiết kiệm thời gian và năng lượng trong việc di chuyển và tham quan thành phố Hà Nội.\n\nTiện nghi phòng tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội cung cấp cho du khách những tiện nghi phòng đẳng cấp và hiện đại. Mỗi phòng đều được trang bị máy điều hòa không khí để đảm bảo không gian trong lành và thoải mái. Du khách có thể tận hưởng cảm giác thoải mái với áo choàng tắm mềm mại và những tờ báo hàng ngày được cung cấp miễn phí. Bên cạnh đó, khách sạn còn cung cấp dịch vụ xem phim trong phòng để du khách có thể thư giãn và giải trí. Để giúp du khách có một mái tóc đẹp và gọn gàng, khách sạn cung cấp máy sấy tóc tiện dụng. Du khách cũng có thể thưởng thức các chương trình giải trí trên truyền hình và tận hưởng đồ uống mát lạnh từ minibar trong phòng. Ngoài ra, một số phòng còn có ban công hoặc sân hiên riêng, nơi du khách có thể thư giãn và ngắm nhìn khung cảnh xung quanh. Để đáp ứng nhu cầu giải trí của du khách, khách sạn còn cung cấp truyền hình vệ tinh/cáp và tivi. Điều hòa không khí, tủ lạnh và lò sưởi cũng được trang bị trong phòng để đảm bảo sự thoải mái và tiện nghi cho du khách.\n\nTrải nghiệm những tiện nghi ẩm thực tuyệt vời tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội không chỉ là một điểm đến nổi tiếng với kiến trúc độc đáo và dịch vụ chuyên nghiệp, mà còn sở hữu những tiện nghi ẩm thực đẳng cấp. Khách sạn này cung cấp dịch vụ phòng 24 giờ, quán cà phê, nhà hàng và dịch vụ phòng. Bạn có thể thỏa sức thưởng thức các món ăn ngon trong không gian sang trọng và ấm cúng của nhà hàng, hoặc tận hưởng một buổi sáng thư giãn với bữa sáng kiểu buffet hoặc bữa sáng kiểu châu Âu. Ngoài ra, bạn cũng có thể tận hưởng các món ăn nướng tại khu vực BBQ của khách sạn. Với dịch vụ dọn phòng hàng ngày, bạn sẽ luôn được đảm bảo một không gian sạch sẽ và thoải mái để thưởng thức ẩm thực tại Khách sạn Sofitel Legend Metropole Hà Nội.\n\nTrải nghiệm phòng đẳng cấp tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội tọa lạc tại Hà Nội, Việt Nam, mang đến cho du khách những trải nghiệm đẳng cấp với các loại phòng đa dạng. Trong khu phố cổ, Khách sạn Sofitel Legend Metropole Hà Nội có các loại phòng sang trọng như: Phòng Grand Luxury với các ưu đãi và tiện ích đặc biệt, phòng Luxury với không gian thoải mái và ấm cúng, phòng Metropole Suite với diện tích rộng rãi. Ngoài ra, khu phòng Opera Wing cũng có các loại phòng Premium và Suite với các ưu đãi tuyệt vời. Đặt phòng tại Khách sạn Sofitel Legend Metropole Hà Nội thông qua Agoda, du khách sẽ nhận được những giá tốt nhất và trải nghiệm đặt phòng dễ dàng và không gặp rắc rối.\n\nQuận Hoàn Kiếm - Trái tim lịch sử của Hà Nội\n\nQuận Hoàn Kiếm, nằm ở trung tâm Hà Nội, là nơi tập trung nhiều di sản lịch sử và văn hóa của thành phố. Với vị trí đắc địa, quận Hoàn Kiếm là điểm đến hấp dẫn cho du khách muốn khám phá và tìm hiểu về lịch sử, văn hóa và đời sống đô thị của Hà Nội. Quận Hoàn Kiếm nổi tiếng với hồ Hoàn Kiếm, một trong những hồ nổi tiếng nhất và đẹp nhất của Hà Nội. Hồ Hoàn Kiếm được bao quanh bởi cảnh quan thiên nhiên tươi đẹp và kiến trúc cổ kính. Du khách có thể tham gia vào các hoạt động thể thao như đi bộ, chạy bộ hoặc đạp xe quanh hồ để tận hưởng không gian yên bình và tĩnh lặng. Ngoài ra, quận Hoàn Kiếm còn có nhiều điểm tham quan và di tích lịch sử khác như Ngọc Sơn Temple, Tháp Rùa, Nhà hát Lớn Hà Nội và khu phố cổ Hàng Gai. Khu vực này cũng tập trung nhiều nhà hàng, quán cà phê và cửa hàng mua sắm, mang đến cho du khách những trải nghiệm ẩm thực và mua sắm đặc trưng của Hà Nội. Quận Hoàn Kiếm là điểm đến lý tưởng cho những ai yêu thích lịch sử, văn hóa và muốn khám phá đời sống đô thị sôi động của Hà Nội.\n\nCách di chuyển từ sân bay đến Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội là một trong những khách sạn danh tiếng và xa hoa nhất tại Việt Nam. Để đến được khách sạn này từ sân bay, bạn có một số phương pháp di chuyển tiện lợi. Phương pháp đầu tiên là sử dụng taxi hoặc dịch vụ đón tiễn của khách sạn. Từ sân bay Nội Bài, bạn có thể dễ dàng tìm thấy các dịch vụ taxi có mặt tại sảnh đến. Hãy chắc chắn rằng bạn sử dụng các dịch vụ taxi có giá cố định hoặc sử dụng một ứng dụng đặt xe trực tuyến đáng tin cậy. Điều này sẽ giúp bạn tránh những cuộc đàm phán về giá cước không cần thiết. Nếu bạn muốn trải nghiệm dịch vụ đón tiễn của khách sạn, hãy liên hệ với nhân viên đặt phòng trước để sắp xếp trước. Phương pháp thứ hai là sử dụng dịch vụ xe buýt công cộng. Tại sân bay Nội Bài, bạn có thể tìm thấy các điểm dừng xe buýt công cộng gần sảnh đến. Các tuyến xe buýt số 07 và số 17 sẽ đưa bạn đến Quận Hoàn Kiếm, nơi Khách sạn Sofitel Legend Metropole Hà Nội đặt tại. Tuyến số 07 sẽ đưa bạn đến ga Hà Nội, từ đó bạn có thể đi bộ hoặc sử dụng dịch vụ taxi để đến khách sạn. Tuyến số 17 sẽ đưa bạn trực tiếp đến Quận Hoàn Kiếm, chỉ cách khách sạn vài bước chân.\n\nKhám phá những điểm đến xung quanh Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội nằm trong bán kính gần của nhiều điểm tham quan nổi tiếng tại Hà Nội. Nếu bạn muốn tìm hiểu về lịch sử Việt Nam, bạn có thể ghé thăm Nha Tù Hoả Lò và Bảo tàng của phụ nữ Việt Nam, hai điểm đến nằm gần khách sạn. Nha Tù Hoả Lò từng là nơi giam giữ các tù nhân chính trị trong thời kỳ chiến tranh, còn Bảo tàng của phụ nữ Việt Nam giới thiệu về vai trò và đóng góp của phụ nữ trong lịch sử Việt Nam. Nếu bạn quan tâm đến kiến trúc và tôn giáo, Nhà Thờ Lớn Hà Nội và Nhà hát lớn Hà Nội là hai điểm đến không thể bỏ qua. Nhà Thờ Lớn Hà Nội là một trong những công trình kiến trúc đẹp nhất của thành phố, mang đậm nét kiến trúc Pháp. Nhà hát lớn Hà Nội, với kiến trúc cổ điển và vẻ đẹp lộng lẫy, là nơi diễn ra các buổi biểu diễn nghệ thuật và sự kiện văn hóa. Đối với những ai muốn tham quan các điểm đẹp tự nhiên, Den Ngoc Son và Tháp Rùa là hai điểm đến lý tưởng. Den Ngoc Son nằm trên hòn đảo nhỏ giữa Hồ Hoàn Kiếm, tạo nên một không gian yên bình và thư giãn. Tháp Rùa, còn được gọi là Tháp Quân Đội, nằm ở phía Nam Hồ Hoàn Kiếm và mang ý nghĩa lịch sử quan trọng. Ngoài ra, khách sạn cũng gần với Con Đường Gốm Sứ Hà Nội, Phố Hàng Gai, Bảo tàng Lịch sử và Trung tâm Múa rối nước Bông Sen. Con Đường Gốm Sứ Hà Nội là nơi bạn có thể tìm hiểu về nghề gốm sứ truyền thống của Việt Nam, trong khi Phố Hàng Gai là một điểm mua sắm nổi tiếng với nhiều cửa hàng và chợ độc đáo. Bảo tàng Lịch sử là nơi lưu giữ và trưng bày các hiện vật lịch sử quan trọng của Việt Nam. Trung tâm Múa rối nước Bông Sen là nơi bạn có thể thưởng thức một trong những nghệ thuật truyền thống của Việt Nam.\n\nNhà hàng xung quanh Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội nằm trong khu vực có nhiều nhà hàng hấp dẫn. Bạn có thể thưởng thức hương vị đa dạng tại Maison Sen Buffet, Hang Qua (HQ Bistro - Food & Coffee), The Note Coffee, Pho 10 Ly Quoc Su, The Hanoi Social Club, Pasteur Street Craft Beer - Hoan Kiem Taproom & Restaurant, Railway Cafe ( Tuan\'s owner - Whatsapp +84917301111 ), Banh My Mama, Bún bò Nam Bộ và L\'essence De Cuisine. Từ món ăn đường phố truyền thống đến ẩm thực quốc tế, bạn sẽ tìm thấy một loạt các lựa chọn ngon miệng ngay trong khu vực này. Hãy thỏa mãn vị giác của bạn và khám phá những hương vị tuyệt vời tại các nhà hàng xung quanh khách sạn.\n\nMua sắm tại những điểm đến nổi tiếng gần Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội nằm gần nhiều điểm mua sắm nổi tiếng, mang đến cho khách hàng trải nghiệm mua sắm tuyệt vời. Các cửa hàng như Mosaique, Curve, Pheva Chocolate Hà Nội, Ipa-Nima, Airashi Silk, L\'Epicerie du Metropole, Infostones, Intimex, Royal Silk và Thanh Bình Gallery đều nằm trong khoảng cách đi bộ từ khách sạn. Tại đây, bạn có thể tìm thấy những sản phẩm độc đáo, từ quần áo, túi xách, đồ trang sức, đến các sản phẩm thủ công và sách. Hãy dành thời gian tham quan và mua sắm tại những điểm đến này để có trải nghiệm mua sắm đáng nhớ trong chuyến du lịch của bạn.\n\nGiá trung bình phòng tại Khách sạn Sofitel Legend Metropole Hà Nội\n\nVới giá trung bình phòng là $428, Khách sạn Sofitel Legend Metropole Hà Nội là một lựa chọn sang trọng và đẳng cấp cho du khách muốn trải nghiệm không gian sống đẳng cấp tại Hà Nội. So với giá trung bình phòng tại các khách sạn khác trong thành phố, giá của Khách sạn Sofitel Legend Metropole Hà Nội có vẻ cao hơn nhiều, nhưng đáng đồng tiền bát gạo. Với sự kết hợp hoàn hảo giữa kiến trúc cổ điển và tiện nghi hiện đại, khách sạn này mang đến không gian sống tuyệt vời và dịch vụ chất lượng cao, đáng giá mọi khoản đầu tư.\n\nNhận xét tích cực về Khách sạn Sofitel Legend Metropole Hà Nội\n\nKhách sạn Sofitel Legend Metropole Hà Nội đã nhận được những đánh giá tích cực từ khách hàng với những lời khen ngợi về đội ngũ nhân viên, sự sạch sẽ của phòng và bữa sáng ngon lành. Khách sạn có cơ sở vật chất rất đẹp, nhân viên thân thiện và nổi tiếng với lịch sử của mình. Mọi người đều rất thân thiện, chuyên nghiệp và sẵn lòng giúp đỡ. Khách sạn nằm ở vị trí hoàn hảo, phòng ở yên tĩnh, sạch sẽ và được dịch vụ tốt. Đây là một khách sạn tuyệt vời với phòng đẹp và phòng tắm rộng rãi. Khách sạn sạch sẽ, nằm ở vị trí trung tâm, với các tiện nghi tốt, nhân viên thân thiện và dịch vụ tuyệt vời.\n\nKhách sạn Sofitel Legend Metropole Hà Nội: Một trải nghiệm đáng nhớ với đánh giá tích cực từ khách hàng\n\nKhách sạn Sofitel Legend Metropole Hà Nội là một điểm đến tuyệt vời cho du khách mong muốn trải nghiệm một kỳ nghỉ tuyệt vời tại Hà Nội, Việt Nam. Với điểm đánh giá tổng thể là 9.2, khách sạn này đã nhận được sự khen ngợi từ khách hàng về nhiều khía cạnh khác nhau. Khách sạn này được đánh giá cao về giá trị, với điểm số 8.6. Khách hàng đã thấy rằng giá cả phải chăng và xứng đáng với chất lượng dịch vụ mà khách sạn cung cấp. Điều này cho thấy Khách sạn Sofitel Legend Metropole Hà Nội cam kết mang đến cho khách hàng trải nghiệm tuyệt vời mà không cần phải trả giá quá cao. Khách sạn cũng được đánh giá cao về cơ sở vật chất, với điểm số 9.2. Với các tiện nghi hiện đại và tiện ích đẳng cấp, khách sạn này đáp ứng được mọi nhu cầu của khách hàng. Từ hồ bơi ngoài trời đến trung tâm thể dục và spa, Khách sạn Sofitel Legend Metropole Hà Nội đảm bảo rằng khách hàng sẽ có những trải nghiệm thú vị và thư giãn tuyệt đối.', 'CAT001', 'LOC_HN_02', '15 Ngô Quyền, Hoàn Kiếm, Hà Nội', 21.023000, 105.855000, 5.0, 9.3, 450, '14:00:00', '12:00:00', '024-38266919', 'reservations@sofitel.com', 'https://sofitel-legend-metropole-hanoi.com', 50, 'https://pix8.agoda.net/hotelImages/21649227/0/4d8ebc6ddd59d6cdaf263f694a0df0de.jpeg?ce=2&s=1024x768', 'ACTIVE', '2025-10-27 15:52:19', '2025-11-01 13:08:56');

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
('H001', 'F002', '2025-10-29 11:35:31'),
('H001', 'F003', '2025-10-20 15:09:17'),
('H001', 'F004', '2025-10-20 15:09:17'),
('H001', 'F008', '2025-10-29 11:35:31'),
('H001', 'F009', '2025-10-29 11:35:31'),
('H001', 'F010', '2025-10-29 11:35:31'),
('H001', 'F011', '2025-10-29 11:35:31'),
('H001', 'F012', '2025-10-29 11:35:31'),
('H001', 'F013', '2025-10-29 11:35:31'),
('H001', 'F016', '2025-10-29 11:35:31'),
('H001', 'F017', '2025-10-29 11:35:31'),
('H001', 'F018', '2025-10-29 11:35:31'),
('H001', 'F019', '2025-10-29 11:35:31'),
('H001', 'F020', '2025-10-29 11:35:31'),
('H001', 'F022', '2025-10-29 11:35:31'),
('H001', 'F025', '2025-10-29 11:35:31'),
('H002', 'F001', '2025-10-20 15:09:17'),
('H002', 'F002', '2025-10-20 15:09:17'),
('H002', 'F003', '2025-10-20 15:09:17'),
('H002', 'F004', '2025-10-20 15:09:17'),
('H002', 'F008', '2025-10-29 11:35:31'),
('H002', 'F009', '2025-10-29 11:35:31'),
('H002', 'F010', '2025-10-29 11:35:31'),
('H002', 'F011', '2025-10-29 11:35:31'),
('H002', 'F012', '2025-10-29 11:35:31'),
('H002', 'F017', '2025-10-29 11:35:31'),
('H002', 'F018', '2025-10-29 11:35:31'),
('H002', 'F019', '2025-10-29 11:35:31'),
('H002', 'F022', '2025-10-29 11:35:31'),
('H003', 'F001', '2025-10-20 15:09:17'),
('H003', 'F002', '2025-10-20 15:09:17'),
('H003', 'F004', '2025-10-20 15:09:17'),
('H003', 'F008', '2025-10-29 11:35:31'),
('H003', 'F009', '2025-10-29 11:35:31'),
('H003', 'F010', '2025-10-29 11:35:31'),
('H003', 'F017', '2025-10-29 11:35:31'),
('H003', 'F022', '2025-10-29 11:35:31'),
('H004', 'F001', '2025-10-27 15:52:19'),
('H004', 'F002', '2025-10-27 15:52:19'),
('H004', 'F003', '2025-10-27 15:52:19'),
('H004', 'F004', '2025-10-27 15:52:19'),
('H004', 'F008', '2025-10-29 11:35:31'),
('H004', 'F009', '2025-10-29 11:35:31'),
('H004', 'F010', '2025-10-29 11:35:31'),
('H004', 'F012', '2025-10-29 11:35:31'),
('H004', 'F017', '2025-10-29 11:35:31'),
('H004', 'F018', '2025-10-29 11:35:31'),
('H004', 'F019', '2025-10-29 11:35:31'),
('H004', 'F022', '2025-10-29 11:35:31'),
('H004', 'F023', '2025-10-29 11:35:31');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `hotel_highlight`
--

CREATE TABLE `hotel_highlight` (
  `hotel_id` varchar(20) NOT NULL,
  `highlight_id` varchar(20) NOT NULL,
  `custom_text` varchar(255) DEFAULT NULL COMMENT 'Text tùy chỉnh cho hotel này (nếu khác với master)',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel_highlight`
--

INSERT INTO `hotel_highlight` (`hotel_id`, `highlight_id`, `custom_text`, `sort_order`, `created_at`) VALUES
('H001', 'HL001', NULL, 1, '2025-10-29 06:32:48'),
('H001', 'HL002', NULL, 2, '2025-10-29 06:32:48'),
('H001', 'HL003', NULL, 3, '2025-10-29 06:32:48'),
('H001', 'HL004', NULL, 4, '2025-10-29 06:32:48'),
('H001', 'HL005', NULL, 5, '2025-10-29 06:32:48'),
('H001', 'HL006', NULL, 6, '2025-10-29 06:32:48'),
('H001', 'HL007', NULL, 7, '2025-10-29 06:32:48'),
('H001', 'HL008', NULL, 8, '2025-10-29 06:32:48'),
('H002', 'HL001', NULL, 1, '2025-10-29 06:32:48'),
('H002', 'HL002', NULL, 2, '2025-10-29 06:32:48'),
('H002', 'HL009', NULL, 5, '2025-10-29 06:32:48'),
('H002', 'HL010', NULL, 3, '2025-10-29 06:32:48'),
('H002', 'HL011', NULL, 4, '2025-10-29 06:32:48'),
('H002', 'HL012', NULL, 6, '2025-10-29 06:32:48'),
('H002', 'HL013', NULL, 7, '2025-10-29 06:32:48'),
('H003', 'HL001', NULL, 1, '2025-10-29 06:32:48'),
('H003', 'HL011', NULL, 3, '2025-10-29 06:32:48'),
('H003', 'HL012', NULL, 6, '2025-10-29 06:32:48'),
('H003', 'HL014', NULL, 2, '2025-10-29 06:32:48'),
('H003', 'HL015', NULL, 4, '2025-10-29 06:32:48'),
('H003', 'HL016', NULL, 5, '2025-10-29 06:32:48'),
('H004', 'HL001', NULL, 6, '2025-10-29 06:32:48'),
('H004', 'HL009', NULL, 1, '2025-10-29 06:32:48'),
('H004', 'HL013', NULL, 2, '2025-10-29 06:32:48'),
('H004', 'HL017', NULL, 3, '2025-10-29 06:32:48'),
('H004', 'HL018', NULL, 4, '2025-10-29 06:32:48'),
('H004', 'HL019', NULL, 5, '2025-10-29 06:32:48'),
('H004', 'HL020', NULL, 7, '2025-10-29 06:32:48');

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

--
-- Đang đổ dữ liệu cho bảng `hotel_image`
--

INSERT INTO `hotel_image` (`image_id`, `hotel_id`, `image_url`, `is_primary`, `caption`, `sort_order`, `created_at`) VALUES
('IMG001', 'H001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/577971876.jpg?k=cf3747b58c0876d5c782c99f32c5e5f8a0f6949adf255868ae5fe02730893fdd&o=', 1, 'Mặt tiền khách sạn Hanoi Old Quarter', 1, '2025-10-27 18:50:37'),
('IMG002', 'H001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550366605.jpg?k=1cb7aa8a6e8fe5e63c83b2357c6d44bb1e01d3462091e67f283f29ae15352590&o=', 0, 'Phòng Deluxe giường đôi', 2, '2025-10-27 18:50:37'),
('IMG003', 'H001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/577971871.jpg?k=aaa6e2a10f7afe222d492d7629bd6a25e120680fed51f47a845ff5b228dcf3a4&o=', 0, 'Sảnh tiếp tân', 3, '2025-10-27 18:50:37'),
('IMG004', 'H001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/577971870.jpg?k=7e783a27edc84a1890c3e97ae8a17b3d0538816f6e4d5ac2a97eabec75930ae2&o=', 0, 'Nhà hàng trong khách sạn', 4, '2025-10-27 18:50:37'),
('IMG005', 'H001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/550366627.jpg?k=1728b4c91b3d3b16a517cced46def54fb51e8ca1908675be93fc095461b55244&o=', 0, 'Phòng tắm tiện nghi', 5, '2025-10-27 18:50:37'),
('IMG006', 'H002', 'https://cf.bstatic.com/xdata/images/hotel/max300/391190389.jpg?k=f80d35f4b0a96d838bc8737df824783c8133db415ba90f1fe375eebd84d0bfd6&o=', 1, 'Resort ven biển Mỹ Khê', 1, '2025-10-27 18:50:37'),
('IMG007', 'H002', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/366406995.jpg?k=7bb6b450fa4265cf6d173e34e9eb09df4e967c17e6ea9d81cdaf643e7c8fa875&o=', 0, 'Hồ bơi ngoài trời', 2, '2025-10-27 18:50:37'),
('IMG008', 'H002', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/380813487.jpg?k=ef003049a2f94ce5f99c8375bbecf64dee32300a8e199ad7e3aee58769984597&o=', 0, 'Phòng view biển', 3, '2025-10-27 18:50:37'),
('IMG009', 'H002', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349627163.jpg?k=3f4e1079cc5346d3fcc332e449998ad2e011f42be83d651fa4e0242ecf30f31f&o=', 0, 'Nhà hàng hải sản', 4, '2025-10-27 18:50:37'),
('IMG010', 'H002', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/389122399.jpg?k=18665e0d4b69d37198670d6b3cfb947e257335e21fc818d8e43aab2027d27507&o=', 0, 'Khuôn viên resort', 5, '2025-10-27 18:50:37'),
('IMG011', 'H003', 'https://www.riversidehotelsg.com/wp-content/uploads/2024/06/2023-06-11-e1718358552453.jpg', 1, 'Khách sạn bên sông Sài Gòn', 1, '2025-10-27 18:50:37'),
('IMG012', 'H003', 'https://www.riversidehotelsg.com/wp-content/uploads/2018/08/services.png', 0, 'Phòng hạng sang', 2, '2025-10-27 18:50:37'),
('IMG013', 'H003', 'https://www.riversidehotelsg.com/wp-content/uploads/2024/06/z5448403378925_bf842340cae818400724a1a89f7f64a9.jpg', 0, 'Hồ bơi trên cao', 3, '2025-10-27 18:50:37'),
('IMG014', 'H003', 'https://www.riversidehotelsg.com/wp-content/uploads/2024/07/Nha-hang-an-sang.jpg', 0, 'Khu ẩm thực', 4, '2025-10-27 18:50:37'),
('IMG015', 'H003', 'https://www.riversidehotelsg.com/wp-content/uploads/2024/07/Rooftop1.jpg', 0, 'Quầy bar sang trọng', 5, '2025-10-27 18:50:37'),
('IMG016', 'H004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490227.jpg?k=a34dd4c8439eaa5193340168cf685103eaed89067edcbeff635d14a190f74da9&o=', 1, 'Sofitel Legend Metropole Hanoi cổ điển', 1, '2025-10-27 18:50:37'),
('IMG017', 'H004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490423.jpg?k=8d56e3fca44f3ac145856784192e897050c9a200b1b644a3c164367644cec7cc&o=', 0, 'Phòng ngủ sang trọng', 2, '2025-10-27 18:50:37'),
('IMG018', 'H004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490303.jpg?k=bf9248e75205795ba4542d8e501a0565f72de6a143b27037d174100ed3e2026e&o=', 0, 'Nhà hàng Le Beaulieu', 3, '2025-10-27 18:50:37'),
('IMG019', 'H004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/649684407.jpg?k=245678761e66d0154b39456851080cfbc51068ecd17119fb74dcc89525cbbc36&o=', 0, 'Hồ bơi Metropole', 4, '2025-10-27 18:50:37'),
('IMG020', 'H004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490235.jpg?k=f1796ef8a0f4312362f1dce3224c7c9cd6f94345c92971765ce04add1dd69f9a&o=', 0, 'Khu spa thư giãn', 5, '2025-10-27 18:50:37');

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
('LOC_DN_04', 'Vietnam', 'Đà Nẵng', NULL, 'Võ Nguyên Giáp', '99', 16.067800, 108.230000, 3.20, 'Thành phố du lịch ven biển', '2025-10-20 15:09:17', 1),
('LOC_HCM_01', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 'Nhà Thờ Đức Bà', 10.779783, 106.699018, 0.50, 'Trung tâm du lịch và tài chính của thành phố', '2025-10-17 11:51:05', 1),
('LOC_HCM_02', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 'Chợ Bến Thành', 10.772105, 106.698423, 0.40, 'Khu chợ và khách sạn du lịch nổi tiếng', '2025-10-17 11:51:05', 1),
('LOC_HCM_03', 'Vietnam', 'Hồ Chí Minh', 'Quận 3', 'Phường Võ Thị Sáu', 'Công viên Lê Văn Tám', 10.787211, 106.696539, 2.00, 'Khu vực dân cư và văn phòng', '2025-10-17 11:51:05', 1),
('LOC_HCM_04', 'Vietnam', 'Hồ Chí Minh', 'Quận 5', 'Phường 11', 'Chợ Lớn', 10.756547, 106.663778, 5.50, 'Khu vực người Hoa, nhiều nhà hàng và khách sạn', '2025-10-17 11:51:05', 1),
('LOC_HCM_05', 'Vietnam', 'Hồ Chí Minh', 'Quận 7', 'Phường Tân Phong', 'Phú Mỹ Hưng', 10.734253, 106.721085, 7.50, 'Khu đô thị cao cấp', '2025-10-17 11:51:05', 1),
('LOC_HCM_06', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Nguyễn Huệ', '45', 10.776000, 106.700000, 0.50, 'Trung tâm kinh tế lớn nhất Việt Nam', '2025-10-20 15:09:17', 1),
('LOC_HN_01', 'Vietnam', 'Hà Nội', 'Hoàn Kiếm', 'Hàng Bạc', '12', 21.028511, 105.854088, 0.30, 'Trung tâm du lịch nổi tiếng của Hà Nội', '2025-10-17 11:51:05', 1),
('LOC_HN_02', 'Vietnam', 'Hà Nội', 'Hoàn Kiếm', ' Ngô Quyền', '15', 21.037268, 105.834438, 1.50, 'Khu vực hành chính và di tích lịch sử', '2025-10-17 11:51:05', 1),
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
-- Cấu trúc bảng cho bảng `hotel_policy`
--

CREATE TABLE `hotel_policy` (
  `id` int(11) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `policy_key` varchar(50) NOT NULL,
  `value` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `hotel_policy`
--

INSERT INTO `hotel_policy` (`id`, `hotel_id`, `policy_key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'H001', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(2, 'H001', 'pay_later', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(3, 'H001', 'airport_shuttle', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(4, 'H001', 'parking_available', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(5, 'H001', 'parking_fee', '50000', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(6, 'H001', 'breakfast_included', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(7, 'H002', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(8, 'H002', 'pay_later', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(9, 'H002', 'airport_shuttle', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(10, 'H002', 'parking_available', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(11, 'H002', 'parking_fee', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(12, 'H002', 'breakfast_included', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment`
--

CREATE TABLE `payment` (
  `payment_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) NOT NULL,
  `method` varchar(30) DEFAULT 'CASH' CHECK (`method` in ('VNPAY','MOMO','CASH','BANK_TRANSFER')),
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (`status` in ('PENDING','SUCCESS','FAILED','REFUNDED')),
  `amount_due` decimal(14,2) NOT NULL CHECK (`amount_due` >= 0),
  `amount_paid` decimal(14,2) NOT NULL DEFAULT 0.00 CHECK (`amount_paid` >= 0),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment`
--

INSERT INTO `payment` (`payment_id`, `booking_id`, `method`, `status`, `amount_due`, `amount_paid`, `created_at`, `updated_at`) VALUES
('PM171557088989', 'BK171548383705', 'CASH', 'FAILED', 1705000.00, 0.00, '2025-11-03 19:05:57', '2025-11-03 19:07:47'),
('PM172229750675', 'BK172225929859', 'CASH', 'FAILED', 1705000.00, 0.00, '2025-11-03 19:17:09', '2025-11-03 19:19:04'),
('PM172883625870', 'BK172881105808', 'CASH', 'FAILED', 1534500.00, 0.00, '2025-11-03 19:28:03', '2025-11-03 19:30:00'),
('PM173932289521', 'BK173929582505', 'CASH', 'SUCCESS', 5329500.00, 5329500.00, '2025-11-03 19:45:32', '2025-11-03 19:45:34'),
('PM201226056082', 'BK201192199759', 'CASH', 'SUCCESS', 1705000.00, 1705000.00, '2025-11-04 03:20:26', '2025-11-04 03:20:30');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `payment_card`
--

CREATE TABLE `payment_card` (
  `card_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `card_type` varchar(20) NOT NULL COMMENT 'VISA, MASTERCARD, AMEX, JCB, etc.',
  `last_four_digits` varchar(4) NOT NULL COMMENT '4 số cuối của thẻ',
  `cardholder_name` varchar(255) NOT NULL COMMENT 'Tên chủ thẻ',
  `expiry_month` tinyint(2) NOT NULL COMMENT 'Tháng hết hạn (1-12)',
  `expiry_year` smallint(4) NOT NULL COMMENT 'Năm hết hạn (YYYY)',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Thẻ mặc định',
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' COMMENT 'ACTIVE, EXPIRED, DELETED',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `payment_card`
--

INSERT INTO `payment_card` (`card_id`, `account_id`, `card_type`, `last_four_digits`, `cardholder_name`, `expiry_month`, `expiry_year`, `is_default`, `status`, `created_at`, `updated_at`) VALUES
('CD193786985904', 'AC202510170003', 'VISA', '3456', 'THANH HAI', 11, 2030, 1, 'ACTIVE', '2025-11-04 01:16:26', '2025-11-04 01:30:07');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `policy_type`
--

CREATE TABLE `policy_type` (
  `policy_key` varchar(50) NOT NULL,
  `name_vi` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `data_type` enum('BOOLEAN','INTEGER','DECIMAL','TEXT') DEFAULT 'BOOLEAN',
  `applicable_to` enum('HOTEL','ROOM','BOTH') DEFAULT 'BOTH',
  `icon` varchar(255) DEFAULT NULL,
  `display_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `policy_type`
--

INSERT INTO `policy_type` (`policy_key`, `name_vi`, `name_en`, `description`, `data_type`, `applicable_to`, `icon`, `display_order`, `is_active`, `created_at`, `updated_at`) VALUES
('adult_age_threshold', 'Ngưỡng tuổi người lớn', 'Adult Age Threshold', 'Độ tuổi tính là người lớn', 'INTEGER', 'ROOM', 'https://cdn-icons-png.freepik.com/256/17983/17983486.png?semt=ais_white_label', 15, 1, '2025-10-30 15:11:41', '2025-10-31 13:51:15'),
('airport_shuttle', 'Đưa đón sân bay', 'Airport Shuttle', 'Khách sạn có dịch vụ đưa đón sân bay', 'BOOLEAN', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/18698/18698712.png?semt=ais_white_label', 9, 1, '2025-10-30 15:11:41', '2025-10-31 13:52:12'),
('breakfast_included', 'Bao gồm bữa sáng', 'Breakfast Included', 'Giá phòng đã bao gồm bữa sáng', 'BOOLEAN', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/7820/7820118.png?semt=ais_white_label', 12, 1, '2025-10-30 15:11:41', '2025-10-31 13:52:35'),
('checkin_age_limit', 'Độ tuổi tối thiểu nhận phòng', 'Check-in Age Limit', 'Độ tuổi tối thiểu để check-in', 'INTEGER', 'ROOM', 'https://cdn-icons-png.freepik.com/256/16582/16582931.png?semt=ais_white_label', 13, 1, '2025-10-30 15:11:41', '2025-10-31 13:53:01'),
('children_allowed', 'Cho phép trẻ em', 'Children Allowed', 'Phòng chấp nhận khách mang theo trẻ em', 'BOOLEAN', 'ROOM', 'https://cdn-icons-png.freepik.com/256/4016/4016496.png?semt=ais_white_label', 4, 1, '2025-10-30 15:11:41', '2025-10-31 13:53:28'),
('extra_bed_allowed', 'Cho phép giường phụ', 'Extra Bed Allowed', 'Phòng có thể thêm giường phụ', 'BOOLEAN', 'ROOM', 'https://cdn-icons-png.freepik.com/256/4226/4226141.png?semt=ais_white_label', 6, 1, '2025-10-30 15:11:41', '2025-10-31 13:53:55'),
('extra_bed_fee', 'Phí giường phụ', 'Extra Bed Fee', 'Chi phí thêm giường phụ (VND)', 'DECIMAL', 'ROOM', 'https://cdn-icons-png.freepik.com/256/15740/15740478.png?semt=ais_white_label', 7, 1, '2025-10-30 15:11:41', '2025-10-31 13:54:16'),
('free_cancellation', 'Miễn phí hủy', 'Free Cancellation', 'Có thể hủy đặt phòng mà không mất phí', 'BOOLEAN', 'BOTH', 'https://cdn-icons-png.freepik.com/256/6914/6914947.png?semt=ais_white_label', 1, 1, '2025-10-30 15:11:41', '2025-10-31 13:56:21'),
('free_child_age_limit', 'Độ tuổi trẻ em miễn phí', 'Free Child Age Limit', 'Trẻ em dưới độ tuổi này được ở miễn phí', 'INTEGER', 'ROOM', 'https://cdn-icons-png.freepik.com/256/10490/10490397.png?semt=ais_white_label', 14, 1, '2025-10-30 15:11:41', '2025-10-31 13:56:50'),
('no_credit_card', 'Không cần thẻ tín dụng', 'No Credit Card Required', 'Đặt phòng không yêu cầu thẻ tín dụng', 'BOOLEAN', 'BOTH', 'https://cdn-icons-png.freepik.com/256/17460/17460304.png?semt=ais_white_label', 3, 1, '2025-10-30 15:11:41', '2025-10-31 13:57:16'),
('parking_available', 'Có bãi đỗ xe', 'Parking Available', 'Khách sạn có bãi đỗ xe', 'BOOLEAN', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/4972/4972143.png?semt=ais_white_label', 10, 1, '2025-10-30 15:11:41', '2025-10-31 13:57:38'),
('parking_fee', 'Phí đỗ xe', 'Parking Fee', 'Chi phí đỗ xe mỗi ngày (VND)', 'DECIMAL', 'HOTEL', 'https://cdn-icons-png.freepik.com/256/13320/13320107.png?semt=ais_white_label', 11, 1, '2025-10-30 15:11:41', '2025-10-31 13:57:58'),
('pay_later', 'Thanh toán sau', 'Pay Later', 'Không cần thanh toán ngay, trả tiền khi nhận phòng', 'BOOLEAN', 'BOTH', 'https://cdn-icons-png.freepik.com/256/9359/9359487.png?semt=ais_white_label', 2, 1, '2025-10-30 15:11:41', '2025-10-31 13:58:13'),
('pets_allowed', 'Cho phép thú cưng', 'Pets Allowed', 'Phòng cho phép mang theo thú cưng', 'BOOLEAN', 'ROOM', 'https://cdn-icons-png.freepik.com/256/16566/16566553.png?semt=ais_white_label', 5, 1, '2025-10-30 15:11:41', '2025-10-31 13:58:40'),
('smoking_allowed', 'Cho phép hút thuốc', 'Smoking Allowed', 'Phòng cho phép hút thuốc', 'BOOLEAN', 'ROOM', 'https://cdn-icons-png.freepik.com/256/5148/5148195.png?semt=ais_white_label', 8, 1, '2025-10-30 15:11:41', '2025-10-31 13:58:59');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `promotion`
--

CREATE TABLE `promotion` (
  `promotion_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên khuyến mãi',
  `description` text DEFAULT NULL COMMENT 'Mô tả chi tiết',
  `type` varchar(20) NOT NULL COMMENT 'PROVIDER = từ nhà cung cấp, SYSTEM = từ hệ thống, BOTH = cả hai',
  `discount_type` varchar(20) NOT NULL COMMENT 'PERCENTAGE = giảm %, FIXED_AMOUNT = giảm số tiền cố định',
  `discount_value` decimal(10,2) NOT NULL COMMENT 'Giá trị giảm: % hoặc VND',
  `min_purchase` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá trị đơn hàng tối thiểu để áp dụng',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT 'Giảm tối đa (VND), NULL = không giới hạn',
  `start_date` date NOT NULL COMMENT 'Ngày bắt đầu',
  `end_date` date NOT NULL COMMENT 'Ngày kết thúc',
  `applicable_hotels` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["H001", "H002"] hoặc NULL = tất cả hotels' CHECK (json_valid(`applicable_hotels`)),
  `applicable_rooms` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["R001", "R002"] hoặc NULL = tất cả rooms' CHECK (json_valid(`applicable_rooms`)),
  `applicable_dates` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '["2025-12-25", "2026-01-01"] hoặc NULL = tất cả ngày trong khoảng' CHECK (json_valid(`applicable_dates`)),
  `day_of_week` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT '[1,2,3,4,5] = thứ 2-6, NULL = tất cả' CHECK (json_valid(`day_of_week`)),
  `status` varchar(20) DEFAULT 'ACTIVE' COMMENT 'ACTIVE, INACTIVE, EXPIRED',
  `created_by` varchar(20) DEFAULT NULL COMMENT 'account_id của admin/provider tạo',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu các khuyến mãi đặc biệt từ provider hoặc system';

--
-- Đang đổ dữ liệu cho bảng `promotion`
--

INSERT INTO `promotion` (`promotion_id`, `name`, `description`, `type`, `discount_type`, `discount_value`, `min_purchase`, `max_discount`, `start_date`, `end_date`, `applicable_hotels`, `applicable_rooms`, `applicable_dates`, `day_of_week`, `status`, `created_by`, `created_at`, `updated_at`) VALUES
('PRO20251104552', 'Giảm giá cuối tuần - Updated', NULL, 'PROVIDER', 'FIXED_AMOUNT', 15.00, 0.00, NULL, '2025-11-01', '2025-11-30', '[\"H001\"]', NULL, NULL, NULL, 'ACTIVE', 'AC202510170003', '2025-11-04 12:01:06', '2025-11-04 12:10:46'),
('PRO20251104899', 'Test Promotion', NULL, 'SYSTEM', 'PERCENTAGE', 10.00, 0.00, NULL, '2025-12-01', '2025-12-31', '[\"H001\"]', NULL, NULL, NULL, 'ACTIVE', 'AC202510170003', '2025-11-04 11:57:41', '2025-11-04 11:57:41');

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
(58, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjExMDc3MzcsImV4cCI6MTc2MTM2NjkzN30.OXHWBH-IjXQj88DSvXs1aofZtVGfwwa8SSWkXiUfPQg', '2025-10-22 14:35:37', '2025-10-22 11:35:37'),
(59, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjE2MjIxMTksImV4cCI6MTc2MTg4MTMxOX0.yWE7RlEUnRrMoCRUNg6d0aObXF5vyHZwd2_lwMM7kXA', '2025-10-28 13:28:39', '2025-10-28 10:28:39'),
(60, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjE5MTI2NjgsImV4cCI6MTc2MjE3MTg2OH0.2Wuit06DDyQIWFp27akY_vEBQ6CF1IJUOjtAX0KyD1I', '2025-10-31 22:11:09', '2025-10-31 19:11:09'),
(61, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjE5ODA2NzAsImV4cCI6MTc2MjIzOTg3MH0.i_maIO6kSEpWs0E7dB7yiS1Bq4_-eu8jlF4R46b7d-E', '2025-11-01 17:04:30', '2025-11-01 14:04:30'),
(62, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjE5OTQwODQsImV4cCI6MTc2MjI1MzI4NH0.SnB1OY1PFwJ49M6DWt9TtdWbpQStkMHS_R86MVLoh-k', '2025-11-04 17:48:04', '2025-11-01 17:48:04');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `review`
--

CREATE TABLE `review` (
  `review_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `hotel_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) DEFAULT NULL,
  `rating` tinyint(1) NOT NULL CHECK (`rating` between 1 and 5),
  `title` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'ACTIVE' CHECK (`status` in ('ACTIVE','HIDDEN','DELETED')),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `location_rating` tinyint(1) DEFAULT NULL,
  `facilities_rating` tinyint(1) DEFAULT NULL,
  `service_rating` tinyint(1) DEFAULT NULL,
  `cleanliness_rating` tinyint(1) DEFAULT NULL,
  `value_rating` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `review`
--

INSERT INTO `review` (`review_id`, `account_id`, `hotel_id`, `booking_id`, `rating`, `title`, `comment`, `status`, `created_at`, `updated_at`, `location_rating`, `facilities_rating`, `service_rating`, `cleanliness_rating`, `value_rating`) VALUES
('RV198251326245', 'AC202510170003', 'H003', NULL, 3, 'Khách sạn tuyệt vời', 'Tôi đã tận hưởng<b> không khí và chất lượng tuyệt vời</b> của khách sạn. ', 'ACTIVE', '2025-11-04 02:30:51', '2025-11-04 03:18:30', 4, 2, 3, 2, 3),
('RV227492128408', 'AC202510170003', 'H002', NULL, 3, 'Khách sạn tạm ổn', 'Trải nghiệm cũng ổn', 'ACTIVE', '2025-11-04 10:38:12', '2025-11-04 11:53:30', 4, 2, 2, 3, 2),
('RV233118062873', 'AC202510170003', 'H001', NULL, 4, 'Khách sạn tuyệt vời', 'Tôi thích khách sạn này', 'ACTIVE', '2025-11-04 12:11:58', '2025-11-04 12:11:58', 4, 4, 4, 3, 5);

--
-- Bẫy `review`
--
DELIMITER $$
CREATE TRIGGER `review_rating_check_before_insert` BEFORE INSERT ON `review` FOR EACH ROW BEGIN
  IF NEW.location_rating NOT BETWEEN 1 AND 5 THEN SET NEW.location_rating = NULL; END IF;
  IF NEW.facilities_rating NOT BETWEEN 1 AND 5 THEN SET NEW.facilities_rating = NULL; END IF;
  IF NEW.service_rating NOT BETWEEN 1 AND 5 THEN SET NEW.service_rating = NULL; END IF;
  IF NEW.cleanliness_rating NOT BETWEEN 1 AND 5 THEN SET NEW.cleanliness_rating = NULL; END IF;
  IF NEW.value_rating NOT BETWEEN 1 AND 5 THEN SET NEW.value_rating = NULL; END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room`
--

CREATE TABLE `room` (
  `room_id` varchar(20) NOT NULL,
  `room_type_id` varchar(20) NOT NULL,
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

INSERT INTO `room` (`room_id`, `room_type_id`, `room_number`, `capacity`, `image_url`, `price_base`, `status`, `created_at`, `updated_at`) VALUES
('R001', 'RT001', '101', 3, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576703459.jpg?k=4bc75a8ddab0204e5dd9a57069afcf31e29e5e38f622b67f916878ed555169be&o=', 800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-31 16:37:45'),
('R002', 'RT001', '102', 3, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576526483.jpg?k=e7352d5c0cc2f34b0a19b5ad760cc2c8a8ac0fc59a398b3047c26b15fa338f6b&o=', 950000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R003', 'RT002', '201', 4, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614965.jpg?k=8c9c9ea468ed7ae098f853df79536f99a77f7bfdfed84ac352fd7b96365446fc&o=', 1800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-31 16:37:49'),
('R004', 'RT002', '202', 4, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614817.jpg?k=a14fa8850eab7dfac8b1cb64e8c5ae60d23be8bd01b30f194ac9b74aa57efec4&o=', 1800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-11-03 19:24:44'),
('R005', 'RT003', '301', 3, 'https://lh3.googleusercontent.com/p/AF1QipORkI-MSORzrexdvvlSEUv93xE-cd83W2zDTpc=s1360-w1360-h1020-rw', 1500000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R006', 'RT004', '501', 3, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456791.jpg', 2500000.00, 'ACTIVE', '2025-10-27 15:52:19', '2025-10-31 16:37:53');

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
('R005', 'F007', '2025-10-20 15:09:17'),
('R006', 'F005', '2025-10-27 15:52:19'),
('R006', 'F006', '2025-10-27 15:52:19'),
('R006', 'F007', '2025-10-27 15:52:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_base_price`
--

CREATE TABLE `room_base_price` (
  `base_price_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `base_price` decimal(10,2) NOT NULL COMMENT 'Giá gốc mặc định (VND)',
  `day_of_week` tinyint(1) DEFAULT NULL COMMENT '0=CN, 1=T2, 2=T3, 3=T4, 4=T5, 5=T6, 6=T7. NULL = áp dụng tất cả',
  `start_date` date DEFAULT NULL COMMENT 'Ngày bắt đầu áp dụng (NULL = không giới hạn)',
  `end_date` date DEFAULT NULL COMMENT 'Ngày kết thúc áp dụng (NULL = không giới hạn)',
  `priority` int(11) DEFAULT 0 COMMENT 'Độ ưu tiên (số lớn hơn = ưu tiên cao hơn)',
  `is_active` tinyint(1) DEFAULT 1 COMMENT '1 = active, 0 = inactive',
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng lưu giá gốc mặc định cho mỗi phòng, hỗ trợ giá khác nhau theo ngày trong tuần và mùa';

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_image`
--

CREATE TABLE `room_image` (
  `image_id` varchar(20) NOT NULL,
  `room_type_id` varchar(20) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `image_alt` varchar(255) DEFAULT NULL COMMENT 'Mô tả ảnh',
  `is_primary` tinyint(1) DEFAULT 0 COMMENT 'Ảnh chính hay không',
  `sort_order` int(11) DEFAULT 0 COMMENT 'Thứ tự hiển thị',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_image`
--

INSERT INTO `room_image` (`image_id`, `room_type_id`, `image_url`, `image_alt`, `is_primary`, `sort_order`, `created_at`, `updated_at`) VALUES
('RI001', 'RT001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576530147.jpg?k=181f9e376f27e03414f17c64816359ada3637e3a891731103b0280800588d12c&o=', 'Standard Double - Main View', 1, 1, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI002', 'RT001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576680594.jpg?k=25fbf6e93c9ad18327716016bfddcef9222ee90345a5e8d579bf4e7268686e64&o=', 'Standard Double - Bathroom', 0, 2, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI003', 'RT001', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576680592.jpg?k=263844c55c6d42b2190b9dd330d818365f7a9508ebc303e26c961128f4b8c840&o=', 'Standard Double - Side View', 0, 3, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI004', 'RT002', 'https://pix8.agoda.net/hotelImages/30753194/740340907/1e0d54903b88f43f2a34f2a38780e382.jpg?ce=0&s=1024x', 'Deluxe King - Main View', 1, 1, '2025-10-29 08:42:26', '2025-10-31 10:05:53'),
('RI005', 'RT002', 'https://pix8.agoda.net/hotelImages/30753194/740340907/1f91fd055a49234d847999cbecd55138.jpg?ce=0&s=1024x', 'Deluxe King - Bed Close-up', 0, 2, '2025-10-29 08:42:26', '2025-10-31 10:06:00'),
('RI006', 'RT002', 'https://pix8.agoda.net/hotelImages/30753194/740340907/dda8e5c44493377ab1684dd5396ed1a1.jpg?ce=0&s=1024x', 'Deluxe King - Bathroom', 0, 3, '2025-10-29 08:42:26', '2025-10-31 10:06:06'),
('RI007', 'RT002', 'https://pix8.agoda.net/hotelImages/30753194/740340907/869a67cea48a6bb0fb8041768847e166.jpg?ce=0&s=1024x', 'Deluxe King - Workspace', 0, 4, '2025-10-29 08:42:26', '2025-10-31 10:06:13'),
('RI008', 'RT003', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/a5/51/73/oyo-129-riverside-hotel.jpg?w=1000&h=-1&s=1', '1-Bedroom Apartment - Living Room', 1, 1, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI009', 'RT003', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/a5/51/5c/oyo-129-riverside-hotel.jpg?w=1000&h=-1&s=1', '1-Bedroom Apartment - Bedroom', 0, 2, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI010', 'RT003', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/a5/51/4f/oyo-129-riverside-hotel.jpg?w=1000&h=-1&s=1', '1-Bedroom Apartment - Kitchen', 0, 3, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI011', 'RT003', 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/a5/51/46/oyo-129-riverside-hotel.jpg?w=1000&h=-1&s=1', '1-Bedroom Apartment - Balcony', 0, 4, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI012', 'RT004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490323.jpg?k=796ddbdccb265032e1cb0a87b45782c583ad9eef8fecfdea8581615cafb4a1b6&o=', '2-Bedroom Apartment - Main View', 1, 1, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI013', 'RT004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490256.jpg?k=f5c531f49ab1d104cbf14ae7ff5a3d550ba118f2c49ad04bc313a3257ed356f0&o=', '2-Bedroom Apartment - Master Bedroom', 0, 2, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI014', 'RT004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490268.jpg?k=d3e0c2977518681975b66e0df063a9d3ef958a23e891ff6d1d49db3e4b3eb77f&o=', '2-Bedroom Apartment - Second Bedroom', 0, 3, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI015', 'RT004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490277.jpg?k=511a702ae306e21facb4e903cbde037066aa3809d3e8c43f798e21b4633d465d&o=', '2-Bedroom Apartment - Living Room', 0, 4, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI016', 'RT004', 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490297.jpg?k=370b6b32b1a4951cad89ccd83bbebd63f04973ed4d0bb0d0502dda6775bc00fa&o=', '2-Bedroom Apartment - Dining Area', 0, 5, '2025-10-29 08:42:26', '2025-10-29 08:42:26');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_policy`
--

CREATE TABLE `room_policy` (
  `id` int(11) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `policy_key` varchar(50) NOT NULL,
  `value` text NOT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `updated_at` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_policy`
--

INSERT INTO `room_policy` (`id`, `room_id`, `policy_key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'R001', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(2, 'R001', 'pay_later', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(3, 'R001', 'no_credit_card', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(4, 'R001', 'children_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(5, 'R001', 'pets_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(6, 'R001', 'extra_bed_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(7, 'R001', 'extra_bed_fee', '150000', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(8, 'R001', 'smoking_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(9, 'R001', 'checkin_age_limit', '18', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(10, 'R001', 'free_child_age_limit', '6', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(11, 'R001', 'adult_age_threshold', '12', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(12, 'R002', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(13, 'R002', 'pay_later', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(14, 'R002', 'no_credit_card', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(15, 'R002', 'children_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(16, 'R002', 'pets_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(17, 'R002', 'extra_bed_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(18, 'R002', 'extra_bed_fee', '200000', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(19, 'R002', 'smoking_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(20, 'R002', 'checkin_age_limit', '18', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(21, 'R002', 'free_child_age_limit', '6', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(22, 'R002', 'adult_age_threshold', '12', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(23, 'R003', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(24, 'R003', 'pay_later', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(25, 'R003', 'no_credit_card', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(26, 'R003', 'children_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(27, 'R003', 'pets_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(28, 'R003', 'extra_bed_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(29, 'R003', 'extra_bed_fee', '250000', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(30, 'R003', 'smoking_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(31, 'R003', 'checkin_age_limit', '18', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(32, 'R003', 'free_child_age_limit', '6', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(33, 'R003', 'adult_age_threshold', '12', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(34, 'R004', 'free_cancellation', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(35, 'R004', 'pay_later', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(36, 'R004', 'no_credit_card', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(37, 'R004', 'children_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(38, 'R004', 'pets_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(39, 'R004', 'extra_bed_allowed', '1', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(40, 'R004', 'extra_bed_fee', '300000', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(41, 'R004', 'smoking_allowed', '0', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(42, 'R004', 'checkin_age_limit', '18', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(43, 'R004', 'free_child_age_limit', '6', '2025-10-30 15:11:41', '2025-10-30 15:11:41'),
(44, 'R004', 'adult_age_threshold', '12', '2025-10-30 15:11:41', '2025-10-30 15:11:41');

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
  `provider_discount_percent` decimal(5,2) DEFAULT 0.00 COMMENT 'Giảm giá từ nhà cung cấp (%)',
  `system_discount_percent` decimal(5,2) DEFAULT 0.00 COMMENT 'Giảm giá từ hệ thống (%)',
  `provider_discount_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Giảm giá từ nhà cung cấp (VND)',
  `system_discount_amount` decimal(10,2) DEFAULT 0.00 COMMENT 'Giảm giá từ hệ thống (VND)',
  `final_price` decimal(10,2) DEFAULT 0.00 COMMENT 'Giá cuối = base_price - provider_discount - system_discount (tính trong code)',
  `is_auto_generated` tinyint(1) DEFAULT 0 COMMENT '1 = tự động tạo, 0 = set thủ công',
  `auto_generated_at` datetime DEFAULT NULL COMMENT 'Thời gian tự động tạo',
  `available_rooms` int(11) DEFAULT 0,
  `refundable` tinyint(1) DEFAULT 1,
  `pay_later` tinyint(1) DEFAULT 0,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `room_price_schedule`
--

INSERT INTO `room_price_schedule` (`schedule_id`, `room_id`, `date`, `base_price`, `discount_percent`, `provider_discount_percent`, `system_discount_percent`, `provider_discount_amount`, `system_discount_amount`, `final_price`, `is_auto_generated`, `auto_generated_at`, `available_rooms`, `refundable`, `pay_later`, `created_at`) VALUES
('S001', 'R001', '2025-10-20', 800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S002', 'R001', '2025-10-21', 800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S003', 'R002', '2025-10-20', 950000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S004', 'R003', '2025-10-20', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S005', 'R004', '2025-10-20', 2000000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S006', 'R005', '2025-10-20', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S007', 'R003', '2025-10-21', 1850000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S008', 'R004', '2025-10-21', 2100000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S009', 'R005', '2025-10-21', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-20 15:09:17'),
('S010', 'R001', '2025-10-25', 800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S011', 'R001', '2025-10-26', 800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S012', 'R002', '2025-10-25', 950000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S013', 'R003', '2025-10-25', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S014', 'R004', '2025-10-25', 2000000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S015', 'R005', '2025-10-25', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-22 10:09:16'),
('S018', 'R001', '2025-10-27', 800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S019', 'R001', '2025-10-28', 800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S020', 'R001', '2025-10-29', 800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S021', 'R001', '2025-10-30', 800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S022', 'R001', '2025-10-31', 800000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 799985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S023', 'R001', '2025-11-01', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S024', 'R001', '2025-11-02', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S025', 'R001', '2025-11-03', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S026', 'R001', '2025-11-04', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S027', 'R001', '2025-11-05', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S028', 'R001', '2025-11-06', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S029', 'R001', '2025-11-07', 820000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S030', 'R001', '2025-11-08', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S031', 'R001', '2025-11-09', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S032', 'R001', '2025-11-10', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S033', 'R001', '2025-11-11', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S034', 'R001', '2025-11-12', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S035', 'R001', '2025-11-13', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S036', 'R001', '2025-11-14', 820000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S037', 'R001', '2025-11-15', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S038', 'R001', '2025-11-16', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S039', 'R001', '2025-11-17', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S040', 'R001', '2025-11-18', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S041', 'R001', '2025-11-19', 820000.00, 10.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S042', 'R001', '2025-11-20', 820000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 819985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:33:13'),
('S044', 'R002', '2025-10-26', 950000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S045', 'R002', '2025-10-27', 950000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S046', 'R002', '2025-10-28', 950000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S047', 'R002', '2025-10-29', 950000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S048', 'R002', '2025-10-30', 950000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S049', 'R002', '2025-10-31', 950000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 949985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S050', 'R002', '2025-11-01', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S051', 'R002', '2025-11-02', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S052', 'R002', '2025-11-03', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S053', 'R002', '2025-11-04', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S054', 'R002', '2025-11-05', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S055', 'R002', '2025-11-06', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S056', 'R002', '2025-11-07', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S057', 'R002', '2025-11-08', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S058', 'R002', '2025-11-09', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S059', 'R002', '2025-11-10', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S060', 'R002', '2025-11-11', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S061', 'R002', '2025-11-12', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S062', 'R002', '2025-11-13', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S063', 'R002', '2025-11-14', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S064', 'R002', '2025-11-15', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S065', 'R002', '2025-11-16', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S066', 'R002', '2025-11-17', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S067', 'R002', '2025-11-18', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S068', 'R002', '2025-11-19', 970000.00, 5.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S069', 'R002', '2025-11-20', 970000.00, 0.00, 0.00, 0.00, 15.00, 0.00, 969985.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:05'),
('S071', 'R003', '2025-10-26', 1800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S072', 'R003', '2025-10-27', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S073', 'R003', '2025-10-28', 1800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S074', 'R003', '2025-10-29', 1800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S075', 'R003', '2025-10-30', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S076', 'R003', '2025-10-31', 1800000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S077', 'R003', '2025-11-01', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S078', 'R003', '2025-11-02', 1820000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S079', 'R003', '2025-11-03', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S080', 'R003', '2025-11-04', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S081', 'R003', '2025-11-05', 1800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:13', 1, 1, 1, '2025-10-24 11:34:15'),
('S082', 'R003', '2025-11-06', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:32', 1, 1, 1, '2025-10-24 11:34:15'),
('S083', 'R003', '2025-11-07', 1820000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S084', 'R003', '2025-11-08', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-24 11:34:15'),
('S085', 'R003', '2025-11-09', 1800000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-24 11:34:15'),
('S086', 'R003', '2025-11-10', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-24 11:34:15'),
('S087', 'R003', '2025-11-11', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S088', 'R003', '2025-11-12', 1820000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S089', 'R003', '2025-11-13', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:37', 1, 1, 1, '2025-10-24 11:34:15'),
('S090', 'R003', '2025-11-14', 1820000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S091', 'R003', '2025-11-15', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S092', 'R003', '2025-11-16', 1820000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S093', 'R003', '2025-11-17', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S094', 'R003', '2025-11-18', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S095', 'R003', '2025-11-19', 1820000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S096', 'R003', '2025-11-20', 1820000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-24 11:34:15'),
('S100', 'R006', '2025-10-27', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S101', 'R006', '2025-10-28', 2500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S102', 'R006', '2025-10-29', 2500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S103', 'R006', '2025-10-30', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S104', 'R006', '2025-10-31', 2500000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S105', 'R006', '2025-11-01', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S106', 'R006', '2025-11-02', 2550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S107', 'R006', '2025-11-03', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S108', 'R006', '2025-11-04', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 0, 1, 1, '2025-10-27 15:52:19'),
('S109', 'R006', '2025-11-05', 2500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:13', 0, 1, 1, '2025-10-27 15:52:19'),
('S110', 'R006', '2025-11-06', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:32', 1, 1, 1, '2025-10-27 15:52:19'),
('S111', 'R006', '2025-11-07', 2550000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S112', 'R006', '2025-11-08', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 15:52:19'),
('S113', 'R006', '2025-11-09', 2500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 15:52:19'),
('S114', 'R006', '2025-11-10', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 15:52:19'),
('S115', 'R006', '2025-11-11', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S116', 'R006', '2025-11-12', 2550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S117', 'R006', '2025-11-13', 2500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 2500000.00, 1, '2025-11-04 12:55:37', 1, 1, 1, '2025-10-27 15:52:19'),
('S118', 'R006', '2025-11-14', 2550000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S119', 'R006', '2025-11-15', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S120', 'R006', '2025-11-16', 2550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S121', 'R006', '2025-11-17', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S122', 'R006', '2025-11-18', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S123', 'R006', '2025-11-19', 2550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S124', 'R006', '2025-11-20', 2550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 15:52:19'),
('S200', 'R005', '2025-10-26', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S201', 'R005', '2025-10-27', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S202', 'R005', '2025-10-28', 1500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S203', 'R005', '2025-10-29', 1500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S204', 'R005', '2025-10-30', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S205', 'R005', '2025-10-31', 1500000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S206', 'R005', '2025-11-01', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S207', 'R005', '2025-11-02', 1550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S208', 'R005', '2025-11-03', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S209', 'R005', '2025-11-04', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S210', 'R005', '2025-11-05', 1500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:13', 1, 1, 1, '2025-10-27 16:04:25'),
('S211', 'R005', '2025-11-06', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:32', 0, 1, 1, '2025-10-27 16:04:25'),
('S212', 'R005', '2025-11-07', 1550000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S213', 'R005', '2025-11-08', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 16:04:25'),
('S214', 'R005', '2025-11-09', 1500000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 16:04:25'),
('S215', 'R005', '2025-11-10', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:41', 1, 1, 1, '2025-10-27 16:04:25'),
('S216', 'R005', '2025-11-11', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S217', 'R005', '2025-11-12', 1550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S218', 'R005', '2025-11-13', 1500000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1500000.00, 1, '2025-11-04 12:55:37', 1, 1, 1, '2025-10-27 16:04:25'),
('S219', 'R005', '2025-11-14', 1550000.00, 5.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S220', 'R005', '2025-11-15', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S221', 'R005', '2025-11-16', 1550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S222', 'R005', '2025-11-17', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S223', 'R005', '2025-11-18', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S224', 'R005', '2025-11-19', 1550000.00, 10.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('S225', 'R005', '2025-11-20', 1550000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0, NULL, 1, 1, 1, '2025-10-27 16:04:25'),
('SCH232307630873', 'R001', '2025-11-30', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 11:58:27', 1, 1, 1, '2025-11-04 11:58:27'),
('SCH232910298431', 'R001', '2025-12-01', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910327564', 'R001', '2025-12-02', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910332663', 'R001', '2025-12-03', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910337069', 'R001', '2025-12-04', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910341061', 'R001', '2025-12-05', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910346021', 'R001', '2025-12-06', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910350854', 'R001', '2025-12-07', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910355672', 'R001', '2025-12-08', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910360690', 'R001', '2025-12-09', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910366059', 'R001', '2025-12-10', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910372812', 'R001', '2025-12-11', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910379444', 'R001', '2025-12-12', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910387262', 'R001', '2025-12-13', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910392568', 'R001', '2025-12-14', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910396771', 'R001', '2025-12-15', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910401301', 'R001', '2025-12-16', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910407296', 'R001', '2025-12-17', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910412671', 'R001', '2025-12-18', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910418174', 'R001', '2025-12-19', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910421038', 'R001', '2025-12-20', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910426383', 'R001', '2025-12-21', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910432909', 'R001', '2025-12-22', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910439431', 'R001', '2025-12-23', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910446072', 'R001', '2025-12-24', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910453664', 'R001', '2025-12-25', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910458501', 'R001', '2025-12-26', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910462509', 'R001', '2025-12-27', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910468299', 'R001', '2025-12-28', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910478708', 'R001', '2025-12-29', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910485734', 'R001', '2025-12-30', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910493748', 'R002', '2025-11-30', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910498667', 'R002', '2025-12-01', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910503491', 'R002', '2025-12-02', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910506213', 'R002', '2025-12-03', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910512477', 'R002', '2025-12-04', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910518729', 'R002', '2025-12-05', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910524695', 'R002', '2025-12-06', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910527084', 'R002', '2025-12-07', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910532464', 'R002', '2025-12-08', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910537858', 'R002', '2025-12-09', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910544813', 'R002', '2025-12-10', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910551337', 'R002', '2025-12-11', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910557274', 'R002', '2025-12-12', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910564902', 'R002', '2025-12-13', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910568201', 'R002', '2025-12-14', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910573638', 'R002', '2025-12-15', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910578769', 'R002', '2025-12-16', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910582580', 'R002', '2025-12-17', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910588325', 'R002', '2025-12-18', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910594066', 'R002', '2025-12-19', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910601556', 'R002', '2025-12-20', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910607930', 'R002', '2025-12-21', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910612417', 'R002', '2025-12-22', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910617746', 'R002', '2025-12-23', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910622830', 'R002', '2025-12-24', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910626971', 'R002', '2025-12-25', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910630366', 'R002', '2025-12-26', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910634499', 'R002', '2025-12-27', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910638738', 'R002', '2025-12-28', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910645449', 'R002', '2025-12-29', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH232910651259', 'R002', '2025-12-30', 0.00, 0.00, 0.00, 10.00, 0.00, 0.00, 0.00, 1, '2025-11-04 12:08:30', 1, 1, 1, '2025-11-04 12:08:30'),
('SCH233057993440', 'R001', '2025-11-21', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:57', 1, 1, 1, '2025-11-04 12:10:57'),
('SCH233057999751', 'R001', '2025-11-22', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:57', 1, 1, 1, '2025-11-04 12:10:57'),
('SCH233058006880', 'R001', '2025-11-23', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058012449', 'R001', '2025-11-24', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058018725', 'R001', '2025-11-25', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058023350', 'R001', '2025-11-26', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058027239', 'R001', '2025-11-27', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058033390', 'R001', '2025-11-28', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058039062', 'R001', '2025-11-29', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058105753', 'R002', '2025-11-21', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058110261', 'R002', '2025-11-22', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058115416', 'R002', '2025-11-23', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058120602', 'R002', '2025-11-24', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058124794', 'R002', '2025-11-25', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058128151', 'R002', '2025-11-26', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058131785', 'R002', '2025-11-27', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058136972', 'R002', '2025-11-28', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH233058143868', 'R002', '2025-11-29', 0.00, 0.00, 0.00, 0.00, 15.00, 0.00, -15.00, 1, '2025-11-04 12:10:58', 1, 1, 1, '2025-11-04 12:10:58'),
('SCH235338381368', 'R004', '2025-11-05', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, '2025-11-04 12:55:13', 1, 1, 0, '2025-11-04 12:48:58'),
('SCH235732147204', 'R004', '2025-11-06', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, NULL, 1, 1, 0, '2025-11-04 12:55:32'),
('SCH235737704327', 'R004', '2025-11-13', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, NULL, 1, 1, 0, '2025-11-04 12:55:37'),
('SCH235741947296', 'R004', '2025-11-08', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, NULL, 1, 1, 0, '2025-11-04 12:55:41'),
('SCH235741949078', 'R004', '2025-11-09', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, NULL, 1, 1, 0, '2025-11-04 12:55:41'),
('SCH235741951986', 'R004', '2025-11-10', 1800000.00, 0.00, 0.00, 0.00, 0.00, 0.00, 1800000.00, 1, NULL, 1, 1, 0, '2025-11-04 12:55:41');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `room_price_schedule_promotion`
--

CREATE TABLE `room_price_schedule_promotion` (
  `id` int(11) NOT NULL,
  `schedule_id` varchar(20) NOT NULL COMMENT 'FK to room_price_schedule',
  `promotion_id` varchar(20) NOT NULL COMMENT 'FK to promotion',
  `discount_amount` decimal(10,2) NOT NULL COMMENT 'Số tiền giảm thực tế đã áp dụng',
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Bảng liên kết promotion với schedule, track promotion nào đã áp dụng';

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
('RT003', 'H003', 'Executive Suite', 'Phòng suite sang trọng có view sông Sài Gòn.', 'King', 45.00, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0c/0f/b8/d6/premier-riverview-room.jpg?w=1000&h=-1&s=1', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('RT004', 'H004', 'Deluxe King Room', 'Phòng Deluxe với giường King size', 'King', 32.00, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456790.jpg', '2025-10-27 15:52:19', '2025-10-27 15:52:19');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_address`
--

CREATE TABLE `user_address` (
  `address_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `name` varchar(255) NOT NULL COMMENT 'Tên người nhận',
  `phone` varchar(20) NOT NULL,
  `address` varchar(500) NOT NULL COMMENT 'Địa chỉ chi tiết',
  `city` varchar(100) NOT NULL,
  `district` varchar(100) DEFAULT NULL COMMENT 'Quận/Huyện',
  `street_name` varchar(255) DEFAULT NULL COMMENT 'Tên đường',
  `house_number` varchar(50) DEFAULT NULL COMMENT 'Số nhà',
  `country` varchar(50) NOT NULL DEFAULT 'VN',
  `is_default` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Địa chỉ mặc định',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `user_address`
--

INSERT INTO `user_address` (`address_id`, `account_id`, `name`, `phone`, `address`, `city`, `district`, `street_name`, `house_number`, `country`, `is_default`, `created_at`, `updated_at`) VALUES
('AD193856373448', 'AC202510170003', 'Thanh Hai', '0123456789', '12, Hồng Lạc, Tân Bình, Hồ Chí Minh, VN', 'Hồ Chí Minh', 'Tân Bình', 'Hồng Lạc', '12', 'VN', 1, '2025-11-04 01:17:36', '2025-11-04 01:25:00'),
('AD193912407694', 'AC202510170003', 'Hai Phan', '0123456789', '12, Thoại Ngọc Hầu, Tân Phú, Hồ Chí Minh, VN', 'Hồ Chí Minh', 'Tân Phú', 'Thoại Ngọc Hầu', '12', 'VN', 0, '2025-11-04 01:18:32', '2025-11-04 01:25:00');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `user_settings`
--

CREATE TABLE `user_settings` (
  `settings_id` varchar(20) NOT NULL,
  `account_id` varchar(20) NOT NULL,
  `language` varchar(10) NOT NULL DEFAULT 'vi' COMMENT 'Ngôn ngữ: vi, en',
  `timezone` varchar(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  `currency` varchar(10) NOT NULL DEFAULT 'VND' COMMENT 'Đơn vị tiền tệ',
  `two_factor_auth` tinyint(1) NOT NULL DEFAULT 0 COMMENT 'Bật xác thực 2 bước',
  `email_notifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON: {promotions: bool, bookingConfirmations: bool, postTripReviews: bool}' CHECK (json_valid(`email_notifications`)),
  `sms_notifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL COMMENT 'JSON: {promotions: bool, bookingConfirmations: bool, postTripReviews: bool}' CHECK (json_valid(`sms_notifications`)),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`),
  ADD KEY `idx_account_package` (`package_id`);

--
-- Chỉ mục cho bảng `account_package`
--
ALTER TABLE `account_package`
  ADD PRIMARY KEY (`package_id`),
  ADD UNIQUE KEY `unique_package_name` (`name`),
  ADD KEY `idx_package_status` (`status`),
  ADD KEY `idx_package_sort` (`sort_order`);

--
-- Chỉ mục cho bảng `account_subscription`
--
ALTER TABLE `account_subscription`
  ADD PRIMARY KEY (`subscription_id`),
  ADD KEY `idx_subscription_account` (`account_id`),
  ADD KEY `idx_subscription_package` (`package_id`),
  ADD KEY `idx_subscription_status` (`status`),
  ADD KEY `idx_subscription_dates` (`start_date`,`end_date`);

--
-- Chỉ mục cho bảng `bed_type_metadata`
--
ALTER TABLE `bed_type_metadata`
  ADD PRIMARY KEY (`bed_type_key`);

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
  ADD PRIMARY KEY (`discount_id`),
  ADD KEY `idx_discount_code_status` (`status`,`expires_at`);

--
-- Chỉ mục cho bảng `facility`
--
ALTER TABLE `facility`
  ADD PRIMARY KEY (`facility_id`);

--
-- Chỉ mục cho bảng `highlight`
--
ALTER TABLE `highlight`
  ADD PRIMARY KEY (`highlight_id`),
  ADD KEY `idx_highlight_category` (`category`);

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
  ADD KEY `idx_hf_fac` (`facility_id`),
  ADD KEY `idx_hotel_facility_highlight` (`hotel_id`);

--
-- Chỉ mục cho bảng `hotel_highlight`
--
ALTER TABLE `hotel_highlight`
  ADD PRIMARY KEY (`hotel_id`,`highlight_id`),
  ADD KEY `highlight_id` (`highlight_id`),
  ADD KEY `idx_hotel_highlight_hotel` (`hotel_id`),
  ADD KEY `idx_hotel_highlight_order` (`hotel_id`,`sort_order`),
  ADD KEY `idx_hotel_highlight_lookup` (`hotel_id`,`sort_order`);

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
-- Chỉ mục cho bảng `hotel_policy`
--
ALTER TABLE `hotel_policy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_hotel_policy` (`hotel_id`,`policy_key`),
  ADD KEY `policy_key` (`policy_key`),
  ADD KEY `idx_hotel_policy` (`hotel_id`,`policy_key`);

--
-- Chỉ mục cho bảng `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `idx_booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `payment_card`
--
ALTER TABLE `payment_card`
  ADD PRIMARY KEY (`card_id`),
  ADD KEY `idx_payment_card_account` (`account_id`),
  ADD KEY `idx_payment_card_default` (`account_id`,`is_default`),
  ADD KEY `idx_payment_card_status` (`status`);

--
-- Chỉ mục cho bảng `policy_type`
--
ALTER TABLE `policy_type`
  ADD PRIMARY KEY (`policy_key`);

--
-- Chỉ mục cho bảng `promotion`
--
ALTER TABLE `promotion`
  ADD PRIMARY KEY (`promotion_id`),
  ADD KEY `idx_promotion_dates` (`start_date`,`end_date`,`status`),
  ADD KEY `idx_promotion_type` (`type`,`status`),
  ADD KEY `idx_promotion_status` (`status`,`start_date`);

--
-- Chỉ mục cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD PRIMARY KEY (`id`),
  ADD KEY `account_id` (`account_id`);

--
-- Chỉ mục cho bảng `review`
--
ALTER TABLE `review`
  ADD PRIMARY KEY (`review_id`),
  ADD UNIQUE KEY `unique_booking_review` (`booking_id`) COMMENT 'Mỗi booking chỉ có 1 review',
  ADD KEY `idx_review_account` (`account_id`),
  ADD KEY `idx_review_hotel` (`hotel_id`),
  ADD KEY `idx_review_booking` (`booking_id`),
  ADD KEY `idx_review_status` (`status`);

--
-- Chỉ mục cho bảng `room`
--
ALTER TABLE `room`
  ADD PRIMARY KEY (`room_id`),
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
-- Chỉ mục cho bảng `room_base_price`
--
ALTER TABLE `room_base_price`
  ADD PRIMARY KEY (`base_price_id`),
  ADD KEY `idx_room_base_price` (`room_id`,`is_active`,`priority`),
  ADD KEY `idx_room_date_range` (`room_id`,`start_date`,`end_date`);

--
-- Chỉ mục cho bảng `room_image`
--
ALTER TABLE `room_image`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `idx_room_image_type` (`room_type_id`),
  ADD KEY `idx_room_image_primary` (`room_type_id`,`is_primary`),
  ADD KEY `idx_room_image_order` (`room_type_id`,`sort_order`);

--
-- Chỉ mục cho bảng `room_policy`
--
ALTER TABLE `room_policy`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_room_policy` (`room_id`,`policy_key`),
  ADD KEY `idx_room_policy` (`room_id`,`policy_key`),
  ADD KEY `idx_policy_search` (`policy_key`,`value`(50));

--
-- Chỉ mục cho bảng `room_price_schedule`
--
ALTER TABLE `room_price_schedule`
  ADD PRIMARY KEY (`schedule_id`),
  ADD UNIQUE KEY `UQ_schedule` (`room_id`,`date`),
  ADD KEY `idx_rps_room_date` (`room_id`,`date`),
  ADD KEY `idx_rps_date` (`date`),
  ADD KEY `idx_room_date` (`room_id`,`date`),
  ADD KEY `idx_auto_generated` (`is_auto_generated`,`date`);

--
-- Chỉ mục cho bảng `room_price_schedule_promotion`
--
ALTER TABLE `room_price_schedule_promotion`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_schedule_promotion` (`schedule_id`,`promotion_id`),
  ADD KEY `idx_schedule` (`schedule_id`),
  ADD KEY `idx_promotion` (`promotion_id`);

--
-- Chỉ mục cho bảng `room_type`
--
ALTER TABLE `room_type`
  ADD PRIMARY KEY (`room_type_id`),
  ADD KEY `FK_roomtype_hotel` (`hotel_id`);

--
-- Chỉ mục cho bảng `user_address`
--
ALTER TABLE `user_address`
  ADD PRIMARY KEY (`address_id`),
  ADD KEY `idx_user_address_account` (`account_id`),
  ADD KEY `idx_user_address_default` (`account_id`,`is_default`);

--
-- Chỉ mục cho bảng `user_settings`
--
ALTER TABLE `user_settings`
  ADD PRIMARY KEY (`settings_id`),
  ADD UNIQUE KEY `unique_user_settings` (`account_id`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `hotel_policy`
--
ALTER TABLE `hotel_policy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=63;

--
-- AUTO_INCREMENT cho bảng `room_policy`
--
ALTER TABLE `room_policy`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=67;

--
-- AUTO_INCREMENT cho bảng `room_price_schedule_promotion`
--
ALTER TABLE `room_price_schedule_promotion`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=123;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `account`
--
ALTER TABLE `account`
  ADD CONSTRAINT `FK_account_package` FOREIGN KEY (`package_id`) REFERENCES `account_package` (`package_id`);

--
-- Các ràng buộc cho bảng `account_subscription`
--
ALTER TABLE `account_subscription`
  ADD CONSTRAINT `FK_subscription_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_subscription_package` FOREIGN KEY (`package_id`) REFERENCES `account_package` (`package_id`);

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
-- Các ràng buộc cho bảng `hotel_highlight`
--
ALTER TABLE `hotel_highlight`
  ADD CONSTRAINT `hotel_highlight_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_highlight_ibfk_2` FOREIGN KEY (`highlight_id`) REFERENCES `highlight` (`highlight_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hotel_image`
--
ALTER TABLE `hotel_image`
  ADD CONSTRAINT `FK_hotel_image` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `hotel_policy`
--
ALTER TABLE `hotel_policy`
  ADD CONSTRAINT `hotel_policy_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `hotel_policy_ibfk_2` FOREIGN KEY (`policy_key`) REFERENCES `policy_type` (`policy_key`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `payment`
--
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

--
-- Các ràng buộc cho bảng `payment_card`
--
ALTER TABLE `payment_card`
  ADD CONSTRAINT `FK_payment_card_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `refresh_tokens`
--
ALTER TABLE `refresh_tokens`
  ADD CONSTRAINT `refresh_tokens_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `review`
--
ALTER TABLE `review`
  ADD CONSTRAINT `FK_review_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_review_booking` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `FK_review_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room`
--
ALTER TABLE `room`
  ADD CONSTRAINT `FK_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_amenity`
--
ALTER TABLE `room_amenity`
  ADD CONSTRAINT `FK_ra_fac` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`facility_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_ra_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_base_price`
--
ALTER TABLE `room_base_price`
  ADD CONSTRAINT `FK_room_base_price_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_image`
--
ALTER TABLE `room_image`
  ADD CONSTRAINT `room_image_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_policy`
--
ALTER TABLE `room_policy`
  ADD CONSTRAINT `room_policy_ibfk_1` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `room_policy_ibfk_2` FOREIGN KEY (`policy_key`) REFERENCES `policy_type` (`policy_key`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_price_schedule`
--
ALTER TABLE `room_price_schedule`
  ADD CONSTRAINT `FK_schedule_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_price_schedule_promotion`
--
ALTER TABLE `room_price_schedule_promotion`
  ADD CONSTRAINT `FK_schedule_promotion_promotion` FOREIGN KEY (`promotion_id`) REFERENCES `promotion` (`promotion_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_schedule_promotion_schedule` FOREIGN KEY (`schedule_id`) REFERENCES `room_price_schedule` (`schedule_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_type`
--
ALTER TABLE `room_type`
  ADD CONSTRAINT `FK_roomtype_hotel` FOREIGN KEY (`hotel_id`) REFERENCES `hotel` (`hotel_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_address`
--
ALTER TABLE `user_address`
  ADD CONSTRAINT `FK_user_address_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `FK_user_settings_account` FOREIGN KEY (`account_id`) REFERENCES `account` (`account_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
