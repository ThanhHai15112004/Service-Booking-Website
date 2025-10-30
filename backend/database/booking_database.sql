-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th10 30, 2025 lúc 06:08 AM
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
-- Cấu trúc bảng cho bảng `bed_type_metadata`
--

CREATE TABLE `bed_type_metadata` (
  `bed_type_key` varchar(50) NOT NULL,
  `name_vi` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `bed_type_metadata`
--

INSERT INTO `bed_type_metadata` (`bed_type_key`, `name_vi`, `name_en`, `description`, `display_order`) VALUES
('Bunk', 'Giường tầng', 'Bunk Bed', 'Giường tầng, phù hợp cho gia đình có trẻ em', 6),
('Double', 'Giường đôi', 'Double Bed', 'Giường đôi tiêu chuẩn (140-150cm)', 2),
('King', 'Giường King', 'King Bed', 'Giường King (180-200cm)', 4),
('Queen', 'Giường Queen', 'Queen Bed', 'Giường Queen (152-160cm)', 3),
('Single', 'Giường đơn', 'Single Bed', 'Giường đơn cho 1 người (90-120cm)', 1),
('Twin', 'Giường đôi nhỏ (Twin)', 'Twin Beds', 'Hai giường đơn trong cùng phòng', 5);

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
('H001', 'Hanoi Old Quarter Hotel', '🏨 Hanoi Old Quarter Hotel – Trải nghiệm trái tim của Hà Nội cổ kính\n\n📍 Địa chỉ: 23 Hàng Hành, Quận Hoàn Kiếm, Hà Nội\n☎️ Hotline: +84 (0)24 3828 8630\n🌐 Website: www.hanoihotelgroup.com/hanoi-old-quarter-hotel\n\n🌟 Tổng quan\n\nNằm ngay giữa trung tâm phố cổ Hà Nội, Hanoi Old Quarter Hotel là điểm dừng chân lý tưởng dành cho du khách muốn hòa mình vào nhịp sống sôi động và đậm đà bản sắc của thủ đô ngàn năm văn hiến. Từ khách sạn, bạn chỉ cần đi bộ vài phút là tới Hồ Hoàn Kiếm, chợ Đồng Xuân, phố Hàng Gai, Nhà Thờ Lớn hay phố đi bộ – những biểu tượng văn hóa không thể bỏ lỡ khi đến Hà Nội.\n\nKhách sạn mang phong cách kiến trúc cổ điển pha lẫn hiện đại, với gam màu ấm, nội thất gỗ tự nhiên và ánh sáng nhẹ nhàng, tạo cảm giác ấm cúng, thân thiện nhưng vẫn sang trọng. Đây là lựa chọn yêu thích của du khách trong và ngoài nước nhờ vị trí tuyệt vời, chất lượng dịch vụ tận tâm, và mức giá hợp lý.\n\n🛏️ Phòng nghỉ & Tiện nghi\n\nKhách sạn có nhiều hạng phòng khác nhau để đáp ứng mọi nhu cầu:\n\n🌿 Standard Room: Phòng nhỏ gọn, tiện nghi đầy đủ, phù hợp cho khách đi công tác hoặc du lịch ngắn ngày.\n\n🌆 Superior Room: Có cửa sổ hướng phố hoặc hướng vườn, mang đến không gian thoáng mát và yên tĩnh.\n\n🌇 Deluxe Room: Rộng rãi hơn, được trang bị thêm ghế sofa, bàn làm việc, và minibar.\n\n👨‍👩‍👧 Family Room: Phù hợp cho nhóm hoặc gia đình nhỏ, có thể ở từ 3–4 người.\n\n💎 Suite Room / City View Suite: View nhìn toàn cảnh phố cổ hoặc Hồ Hoàn Kiếm, phòng có ban công riêng, thiết kế sang trọng – lựa chọn hoàn hảo cho cặp đôi hoặc kỳ nghỉ trăng mật.\n\n🧺 Tiện nghi trong phòng gồm có:\n\nĐiều hòa không khí hai chiều\n\nTV màn hình phẳng truyền hình cáp\n\nMinibar, ấm đun nước điện, tủ lạnh mini\n\nKét an toàn, tủ quần áo, bàn làm việc\n\nPhòng tắm riêng với bồn tắm hoặc vòi sen, máy sấy tóc, đồ vệ sinh cá nhân miễn phí\n\nDịch vụ dọn phòng hàng ngày\n\nWi-Fi tốc độ cao miễn phí\n\n🛎️ Dịch vụ & Trải nghiệm\n\nHanoi Old Quarter Hotel luôn hướng tới mang lại trải nghiệm trọn vẹn cho khách hàng bằng đội ngũ nhân viên chuyên nghiệp, thân thiện và chu đáo.\n\n✨ Dịch vụ nổi bật:\n\n🕓 Lễ tân 24/7 – hỗ trợ nhận phòng, trả phòng linh hoạt và giải đáp mọi thắc mắc.\n\n🧳 Giữ hành lý miễn phí cho khách trước và sau khi check-in/out.\n\n🚗 Dịch vụ đưa đón sân bay – nhanh chóng, an toàn, giá hợp lý.\n\n🧭 Đặt tour tham quan Hà Nội và các điểm lân cận như Tràng An, Ninh Bình, Vịnh Hạ Long.\n\n☕ Nhà hàng & quán café trong khách sạn – phục vụ bữa sáng tự chọn với thực đơn phong phú gồm món Việt và Âu.\n\n🧼 Giặt ủi & vệ sinh phòng hằng ngày, luôn đảm bảo sự sạch sẽ tuyệt đối.\n\n🖥️ Khu vực làm việc & truy cập internet miễn phí tại sảnh – thuận tiện cho khách đi công tác.\n\n🏙️ Vị trí & Liên kết du lịch\n\nTừ khách sạn, bạn có thể dễ dàng:\n\n🚶‍♀️ 2 phút đi bộ tới Hồ Hoàn Kiếm và Phố đi bộ\n\n🛍️ 3 phút tới Chợ Đồng Xuân, Phố Hàng Ngang – Hàng Đào\n\n☕ 1 phút tới các quán cà phê nổi tiếng như Cộng Cà Phê, The Note Coffee, Highlands\n\n🎭 10 phút lái xe tới Nhà hát lớn Hà Nội và Lăng Chủ tịch Hồ Chí Minh\n\n🚄 15 phút tới Ga Hà Nội hoặc Trung tâm thương mại Vincom Center\n\nVị trí trung tâm giúp bạn vừa dễ dàng khám phá nét đẹp cổ kính của Hà Nội, vừa thuận tiện di chuyển tới các điểm du lịch, nhà hàng và khu vui chơi về đêm.\n\n💆 Trải nghiệm & Ẩm thực\n\nBuổi sáng, du khách có thể bắt đầu ngày mới với bữa sáng buffet nhẹ nhàng, gồm các món ăn Việt Nam đặc trưng như phở bò, bánh mì trứng ốp la, cà phê đen đá Hà Nội – được phục vụ ngay tại khu nhà hàng tầng trệt.\n\nBuổi tối, du khách có thể tản bộ quanh Hồ Hoàn Kiếm, ghé các quán ăn vỉa hè nổi tiếng như Bún chả Hàng Mành, Bánh cuốn Thanh Vân, Chả cá Lã Vọng, hoặc thưởng thức bia tươi tại phố Tạ Hiện – chỉ cách khách sạn vài phút đi bộ.\n\n🌿 Không gian & Thiết kế\n\nKhông gian khách sạn được thiết kế theo phong cách Hà Nội xưa pha hiện đại, tông màu nâu gỗ và ánh vàng dịu nhẹ tạo cảm giác ấm cúng. Sảnh khách sạn rộng rãi, trang trí bằng những bức ảnh cổ về phố Hà Nội – mang lại cảm giác hoài niệm và gần gũi.\n\nBan công của một số phòng nhìn ra đường phố nhộn nhịp, nơi bạn có thể ngắm dòng người qua lại, hoặc thưởng thức ly cà phê sáng giữa không khí phố cổ.\n\n🎯 Lý tưởng cho bạn nếu\n\n❤️ Bạn yêu thích sự cổ kính, ấm áp và văn hóa đặc trưng Hà Nội.\n\n🚶 Bạn muốn ở ngay trung tâm, thuận tiện đi bộ khám phá.\n\n👨‍👩‍👧 Bạn đi cùng gia đình hoặc nhóm bạn, cần phòng rộng và tiện nghi.\n\n💼 Bạn đi công tác ngắn ngày và cần nơi nghỉ tiện lợi, có Wi-Fi và dịch vụ nhanh chóng.\n\n💑 Bạn tìm kiếm nơi nghỉ dưỡng lãng mạn giữa lòng thủ đô, yên tĩnh và riêng tư.\n\n🏅 Điểm nổi bật được khách hàng yêu thích (từ Booking & TripAdvisor)\n\n⭐ Vị trí tuyệt vời (9.7/10) – ngay trung tâm phố cổ\n⭐ Nhân viên thân thiện, chuyên nghiệp, sẵn sàng hỗ trợ mọi lúc\n⭐ Phòng sạch sẽ, tiện nghi và yên tĩnh dù nằm trong khu vực nhộn nhịp\n⭐ Bữa sáng ngon, đa dạng, đặc biệt là món phở và bánh mì trứng\n⭐ Dịch vụ đón sân bay nhanh chóng và giá hợp lý\n\n🌺 Kết luận\n\nHanoi Old Quarter Hotel không chỉ là một nơi lưu trú – mà còn là một phần trải nghiệm Hà Nội. Tại đây, bạn sẽ cảm nhận rõ nét nhịp sống của phố cổ, sự hiếu khách của người Hà Nội, và không gian ấm cúng như ở nhà. Dù là chuyến đi ngắn hay dài, nghỉ dưỡng hay công tác, khách sạn đều mang lại cảm giác thoải mái, tiện nghi và đáng nhớ.', 'CAT001', 'LOC_HN_01', '12 Hàng Bạc, Hoàn Kiếm, Hà Nội', 21.033000, 105.850000, 3.0, 8.5, 245, '14:00:00', '12:00:00', '024-88888888', 'contact@hoqhotel.vn', 'https://hoqhotel.vn', 30, 'https://lh3.googleusercontent.com/gps-cs-s/AC9h4nquZO-cO1woQvrkFfrWaRZ0CMK8t6pL-IBcPwZ9dmojDrqngeCEC8GC50oxeizk4gsLeDMtxYFZ2rytPcrA5VF45WDIX__jp73xW3VgzhLIdYJ0S1KoLr1yJrgLxUD3roOk2COT=w252-h189-k-no', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-29 14:44:36'),
('H002', 'My Khe Beach Resort', '🏖️ My Khe Beach Resort – Thiên đường nghỉ dưỡng bên bờ biển Đà Nẵng\n\n📍 Địa chỉ: 300 Võ Nguyên Giáp, bãi biển Mỹ Khê, Quận Ngũ Hành Sơn, Đà Nẵng\n☎️ Hotline: +84 (0)236 395 1555\n🌐 Website: www.mykhebeachresort.vn\n (tham khảo thông tin chính thống)\n\n🌅 Tổng quan\n\nTọa lạc ngay trên bãi biển Mỹ Khê – được tạp chí Forbes vinh danh là “một trong những bãi biển quyến rũ nhất hành tinh”, My Khe Beach Resort là điểm đến lý tưởng cho những ai muốn hòa mình vào vẻ đẹp thiên nhiên tuyệt vời của biển Đà Nẵng, nơi cát trắng mịn trải dài, sóng vỗ rì rào và ánh hoàng hôn nhuộm vàng chân trời.\n\nResort mang phong cách kiến trúc nhiệt đới hiện đại, kết hợp giữa vật liệu tự nhiên như gỗ, đá và cây xanh, tạo nên không gian gần gũi nhưng vẫn đậm chất sang trọng. Với khuôn viên rộng rãi, cây xanh phủ khắp và hướng nhìn trực diện ra biển, My Khe Beach Resort là lựa chọn hoàn hảo cho cả kỳ nghỉ lãng mạn, chuyến đi gia đình, hay chuyến công tác kết hợp nghỉ dưỡng (bleisure).\n\n🛏️ Phòng nghỉ & Tiện nghi\n\nResort có hơn 100 phòng và villa hướng biển hoặc hướng vườn, được thiết kế tinh tế để mang lại sự thoải mái tối đa.\n\n🛎️ Các hạng phòng tiêu biểu:\n\n🌿 Superior Garden View: Phòng hướng vườn, yên tĩnh, thích hợp cho cặp đôi muốn tận hưởng không gian riêng tư.\n\n🌊 Deluxe Sea View: Ban công rộng mở ra hướng biển, nơi bạn có thể đón bình minh rực rỡ mỗi sáng.\n\n🏡 Family Suite: Rộng rãi, có phòng khách riêng, phù hợp cho gia đình có trẻ nhỏ.\n\n💎 Beachfront Villa: Biệt thự cao cấp nằm sát bờ biển, có hồ bơi riêng, sân vườn riêng – mang lại trải nghiệm nghỉ dưỡng đẳng cấp.\n\n🧺 Tiện nghi trong phòng:\n\nĐiều hòa không khí, két an toàn, minibar và TV màn hình phẳng\n\nBồn tắm hoặc vòi sen cao cấp, áo choàng tắm và dép đi trong nhà\n\nMáy pha cà phê/ấm đun nước, đồ dùng vệ sinh cá nhân miễn phí\n\nBan công riêng với ghế tắm nắng hoặc bàn trà hướng biển\n\nDịch vụ dọn phòng hàng ngày, giặt là và phục vụ tại phòng (room service)\n\n🌴 Dịch vụ & Trải nghiệm\n\nMy Khe Beach Resort không chỉ là nơi lưu trú – mà còn là một hành trình tận hưởng trọn vẹn cuộc sống biển.\n\n🌊 Tiện ích & Hoạt động nổi bật:\n\n🏖️ Bãi biển riêng với ghế tắm nắng, dù che và nhân viên cứu hộ túc trực\n\n🏊 Hồ bơi ngoài trời rộng lớn hướng biển, kết hợp quầy bar phục vụ cocktail và nước ép trái cây tươi\n\n💆 Trung tâm Spa & Massage – liệu trình trị liệu bằng thảo dược Việt Nam, giúp tái tạo năng lượng\n\n💪 Phòng gym & yoga hướng biển, mở cửa từ sáng sớm\n\n🚴 Thuê xe đạp và tổ chức tour địa phương: Ngũ Hành Sơn, Bà Nà Hills, Hội An cổ kính…\n\n👩‍🍳 Lớp học nấu ăn Việt, hoạt động câu cá và tour khám phá văn hóa bản địa\n\n🍽️ Ẩm thực & Nhà hàng\n\nResort sở hữu hệ thống nhà hàng – quầy bar – café nằm rải rác quanh khuôn viên:\n\n🍜 Nhà hàng Ocean Breeze: Phục vụ buffet sáng, món Việt Nam truyền thống và hải sản tươi sống Đà Nẵng.\n\n🍷 Sunset Bar: Nằm bên hồ bơi, lý tưởng để thưởng thức cocktail hoặc rượu vang trong ánh chiều tà.\n\n☕ Café SeaWind: Nơi lý tưởng để ngắm biển buổi sáng, nhâm nhi cà phê hoặc sinh tố mát lạnh.\n\n🦞 Hải sản Mỹ Khê Corner: Thực đơn phong phú, nguyên liệu được đánh bắt và chế biến trong ngày.\n\n🌇 Vị trí & Liên kết du lịch\n\nTừ My Khe Beach Resort, bạn dễ dàng di chuyển tới các điểm nổi tiếng:\n\n🚶 0 phút – Bước chân ra là tới bãi biển Mỹ Khê\n\n🚗 10 phút – Trung tâm thành phố Đà Nẵng, Cầu Rồng, Cầu Tình Yêu\n\n🏯 15 phút – Ngũ Hành Sơn\n\n🏖️ 25 phút – Biển Non Nước và làng đá mỹ nghệ\n\n🏙️ 30 phút – Sân bay quốc tế Đà Nẵng\n\n🏮 40 phút – Phố cổ Hội An (di sản văn hóa thế giới UNESCO)\n\n🌿 Không gian & Thiết kế\n\nKhu nghỉ dưỡng được bao quanh bởi hàng dừa cao vút, hồ sen, và lối đi lát đá xen giữa thảm cỏ xanh. Mỗi góc trong resort đều mang lại cảm giác yên bình, thư giãn.\nBuổi sáng, bạn có thể đi dạo barefoot trên cát, nghe tiếng sóng vỗ rì rào; buổi tối, ánh đèn vàng từ hồ bơi phản chiếu mặt biển tạo nên khung cảnh lãng mạn khó quên.\n\n🧘 Trải nghiệm gợi ý tại Resort\n\n🌞 Buổi sáng: Tập yoga bên bãi biển, ngắm bình minh, thưởng thức bữa sáng buffet với cà phê Việt Nam và bánh mì bơ trứng.\n🌅 Buổi chiều: Ngâm mình trong hồ bơi, tham gia lớp nấu ăn hoặc tour chợ hải sản.\n🌙 Buổi tối: Dùng bữa tối ngoài trời, nghe sóng vỗ và thưởng thức hải sản nướng, kết thúc ngày bằng một ly vang trắng tại Sunset Bar.\n\n🎯 Lý tưởng cho bạn nếu\n\n❤️ Bạn muốn tận hưởng kỳ nghỉ thư giãn bên biển trong không gian sang trọng.\n\n👨‍👩‍👧 Bạn đi cùng gia đình hoặc nhóm bạn, cần phòng rộng, hồ bơi và khu vui chơi.\n\n💑 Bạn tìm kiếm nơi lãng mạn để tận hưởng trăng mật hoặc kỷ niệm đặc biệt.\n\n💼 Bạn cần resort yên tĩnh, có Wi-Fi, phòng họp nhỏ cho công việc nhẹ nhàng kết hợp nghỉ ngơi.\n\n🏄 Bạn yêu thích thể thao biển – lướt sóng, đi mô tô nước, kayak, hoặc chỉ đơn giản là tắm biển và tắm nắng.\n\n🏅 Điểm nổi bật được du khách đánh giá cao (Booking & TripAdvisor)\n\n⭐ Vị trí tuyệt vời – sát biển Mỹ Khê, cách trung tâm chỉ 10 phút\n⭐ Bãi biển riêng sạch đẹp, an ninh tốt\n⭐ Hồ bơi lớn và khuôn viên rợp bóng cây xanh\n⭐ Nhân viên thân thiện, phục vụ chuyên nghiệp\n⭐ Bữa sáng ngon, đa dạng với nhiều món Việt – Âu\n⭐ Giá trị tuyệt vời so với chất lượng dịch vụ\n\n🌺 Kết luận\n\nMy Khe Beach Resort là nơi mà bạn có thể ngắt kết nối khỏi nhịp sống vội vã, để hòa mình vào thiên nhiên, tận hưởng làn gió biển mặn mà và những khoảnh khắc bình yên hiếm có.\nTừ cặp đôi muốn tìm nơi lãng mạn, gia đình cần kỳ nghỉ thoải mái, đến những người chỉ đơn giản muốn nghỉ ngơi và hít thở gió biển – My Khe Beach Resort luôn mang đến trải nghiệm ấm áp, tinh tế và đáng nhớ.', 'CAT002', 'LOC_DN_04', '99 Võ Nguyên Giáp, Đà Nẵng', 16.070000, 108.250000, 5.0, 9.2, 530, '14:00:00', '12:00:00', '0236-7777777', 'info@mykheresort.vn', 'https://mykheresort.vn', 80, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/456591942.jpg?k=edd1274281b31d340a1626d37a1a7799a54f1f9a1b6e249a2a2cb61781797e57&o=', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-29 14:46:01'),
('H003', 'Saigon Riverside Hotel', '🏨 Saigon Riverside Hotel – Không gian yên bình giữa lòng thành phố sôi động\n\n📍 Địa chỉ: 18 – 19 – 20 Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh\n☎️ Hotline: +84 (0)28 3822 5841\n🌐 Website: www.saigonriversidehotel.vn\n (tham khảo thông tin chính thống)\n\n🌟 Tổng quan\n\nNằm dọc theo dòng sông Sài Gòn thơ mộng, Saigon Riverside Hotel mang đến một không gian nghỉ dưỡng thanh bình ngay giữa trung tâm Quận 1 – nơi giao thoa giữa nét đẹp hiện đại và văn hóa đặc trưng của thành phố mang tên Bác.\n\nTừ khách sạn, bạn có thể chiêm ngưỡng cảnh bờ sông lung linh ánh đèn, lắng nghe tiếng thành phố chuyển mình về đêm và tận hưởng không khí mát mẻ hiếm có giữa đô thị năng động. Với vị trí vàng chỉ vài phút di chuyển đến Phố đi bộ Nguyễn Huệ, Nhà thờ Đức Bà, Chợ Bến Thành và Bitexco Tower, khách sạn là lựa chọn lý tưởng cho cả khách công tác lẫn du lịch.\n\n🛏️ Phòng nghỉ & Tiện nghi\n\nVới phong cách thiết kế thanh lịch, mỗi phòng tại Saigon Riverside Hotel đều được bài trí tinh tế, sử dụng tông màu ấm và nội thất gỗ tạo cảm giác sang trọng nhưng ấm cúng.\n\n🛎️ Các hạng phòng phổ biến:\n\n🌿 Superior Room: Không gian ấm áp, tiện nghi đầy đủ, phù hợp cho khách đi công tác ngắn ngày.\n\n🌆 Deluxe River View: Ban công nhìn thẳng ra sông Sài Gòn, tận hưởng khung cảnh lãng mạn buổi sáng và hoàng hôn.\n\n💎 Executive Suite: Phòng rộng, có khu tiếp khách riêng, thiết kế hiện đại, mang lại sự riêng tư và đẳng cấp.\n\n👨‍👩‍👧 Family Room: Diện tích lớn, có thể ở 3–4 người, thích hợp cho gia đình nhỏ hoặc nhóm bạn.\n\n🧺 Tiện nghi trong phòng:\n\nĐiều hòa, TV màn hình phẳng, minibar, két an toàn\n\nẤm đun nước, máy sấy tóc, điện thoại quốc tế\n\nPhòng tắm riêng với bồn tắm hoặc vòi sen đứng, đồ dùng cá nhân miễn phí\n\nWi-Fi miễn phí toàn khách sạn\n\nDịch vụ dọn phòng hằng ngày và giặt ủi theo yêu cầu\n\n🍽️ Ẩm thực & Giải trí\n\nSaigon Riverside Hotel không chỉ là nơi lưu trú mà còn là điểm đến ẩm thực và thư giãn hoàn hảo giữa lòng thành phố.\n\n🍜 Nhà hàng & Quán bar:\n\nRiver View Restaurant: Nằm trên tầng thượng, nhà hàng mang đến tầm nhìn bao quát sông Sài Gòn – nơi du khách có thể thưởng thức bữa sáng buffet, bữa tối hải sản và ẩm thực Việt – Âu trong không khí lãng mạn.\n\nLobby Café: Phục vụ cà phê rang xay, nước ép trái cây, bánh ngọt và cocktail, là không gian thư giãn lý tưởng sau một ngày dài khám phá.\n\nSky Lounge (tùy chi nhánh): Nơi bạn có thể ngắm hoàng hôn hoặc đêm Sài Gòn rực rỡ ánh đèn, cùng ly rượu vang hoặc bia mát lạnh.\n\n🧘 Dịch vụ & Tiện ích\n\n✨ Các tiện ích nổi bật:\n\n🕓 Lễ tân 24/7, nhận & trả phòng linh hoạt, đội ngũ nhân viên thành thạo tiếng Anh\n\n🧳 Giữ hành lý miễn phí cho khách trước/ sau khi nhận phòng\n\n🚗 Dịch vụ đưa đón sân bay & thuê xe riêng\n\n💼 Phòng họp nhỏ & business center – trang bị máy chiếu, wifi và dịch vụ văn phòng\n\n💆 Dịch vụ massage & spa – giúp thư giãn sau ngày làm việc hoặc tham quan\n\n🧺 Giặt ủi, dọn phòng & chăm sóc khách hàng 24/7\n\n🕯️ Tổ chức sự kiện, tiệc nhỏ, kỷ niệm hoặc đám cưới ven sông (theo yêu cầu)\n\n🌇 Vị trí & Liên kết du lịch\n\nVới vị trí đắc địa trên đường Tôn Đức Thắng – mặt tiền sông Sài Gòn, du khách có thể dễ dàng di chuyển đến các địa điểm nổi tiếng chỉ trong vài phút:\n\n🚶 5 phút – Phố đi bộ Nguyễn Huệ, Bitexco Tower\n\n🚗 7 phút – Nhà thờ Đức Bà, Bưu điện trung tâm Sài Gòn\n\n🏙️ 10 phút – Chợ Bến Thành, Nhà hát Thành phố\n\n🛥️ 2 phút – Bến du thuyền và tàu du lịch sông Sài Gòn\n\n✈️ 25 phút – Sân bay Tân Sơn Nhất\n\nResort nằm gần khu trung tâm tài chính, thương mại và giải trí của thành phố, giúp du khách thuận tiện kết hợp làm việc – hội họp – nghỉ ngơi – khám phá.\n\n🌿 Không gian & Phong cách thiết kế\n\nTừ sảnh chính với nội thất gỗ, ánh sáng vàng ấm đến ban công phòng nhìn ra sông, mọi chi tiết đều được chăm chút để mang lại cảm giác thư giãn và gần gũi. Khi màn đêm buông xuống, ánh đèn từ cầu Thủ Thiêm và Landmark 81 phản chiếu trên mặt nước, tạo nên khung cảnh lung linh khó quên – nét đặc trưng chỉ có ở Saigon Riverside Hotel.\n\n🎯 Lý tưởng cho bạn nếu\n\n💑 Bạn muốn tìm không gian lãng mạn, tầm nhìn sông đẹp để nghỉ dưỡng cùng người thương.\n\n💼 Bạn đi công tác hoặc hội họp, cần nơi ở tiện nghi, yên tĩnh nhưng ngay trung tâm.\n\n👨‍👩‍👧 Bạn đi cùng gia đình, muốn trải nghiệm Sài Gòn về đêm từ góc nhìn yên bình.\n\n🌃 Bạn yêu thích ngắm cảnh, chụp ảnh, hoặc đơn giản là ngồi nhâm nhi cà phê bên dòng sông.\n\n🏅 Điểm nổi bật được du khách yêu thích (Booking & TripAdvisor)\n\n⭐ Vị trí tuyệt vời – ngay trung tâm Quận 1, cạnh sông Sài Gòn\n⭐ View sông đẹp, không khí mát mẻ và yên bình\n⭐ Nhân viên thân thiện, phục vụ chuyên nghiệp\n⭐ Bữa sáng ngon, nhiều lựa chọn món Việt và Âu\n⭐ Giá cả hợp lý so với vị trí và chất lượng dịch vụ\n\n🌺 Kết luận\n\nSaigon Riverside Hotel là sự kết hợp hoàn hảo giữa vị trí đắc địa – tầm nhìn sông tuyệt đẹp – dịch vụ chu đáo. Dù bạn đến để công tác, nghỉ dưỡng hay chỉ muốn tận hưởng một đêm yên bình giữa lòng Sài Gòn náo nhiệt, nơi đây luôn mang đến cho bạn trải nghiệm nhẹ nhàng, tinh tế và đáng nhớ.', 'CAT001', 'LOC_HCM_06', '45 Nguyễn Huệ, Quận 1, HCM', 10.776000, 106.700000, 5.0, 9.1, 340, '14:00:00', '12:00:00', '028-88889999', 'info@saigonriverside.vn', 'https://saigonriverside.vn', 60, 'https://lh3.googleusercontent.com/p/AF1QipORkI-MSORzrexdvvlSEUv93xE-cd83W2zDTpc=s1360-w1360-h1020-rw', 'ACTIVE', '2025-10-20 15:09:17', '2025-10-29 14:48:08'),
('H004', 'Sofitel Legend Metropole Hanoi', '🏛️ Sofitel Legend Metropole Hanoi – Biểu tượng lịch sử và tinh hoa Pháp giữa lòng Hà Nội\n\n📍 Địa chỉ: 15 Ngô Quyền, Quận Hoàn Kiếm, Hà Nội\n☎️ Hotline: +84 (0)24 3826 6919\n🌐 Website: www.sofitel-legend-metropole-hanoi.com\n\n🏗️ Thành lập: Năm 1901 – hơn 120 năm lịch sử\n\n🌟 Tổng quan\n\nSofitel Legend Metropole Hanoi không chỉ là một khách sạn – mà là một phần linh hồn của Hà Nội. Được xây dựng từ năm 1901 bởi hai nhà đầu tư người Pháp, khách sạn mang phong cách kiến trúc tân cổ điển Pháp (French Colonial), nơi từng đón tiếp các nguyên thủ quốc gia, nghệ sĩ nổi tiếng và các nhà văn huyền thoại như Charlie Chaplin, Graham Greene, Catherine Deneuve, hay Tổng thống Jacques Chirac.\n\nTọa lạc tại trung tâm khu phố cổ Hoàn Kiếm, chỉ cách Hồ Hoàn Kiếm, Nhà hát Lớn và Phố Tràng Tiền vài phút đi bộ, Sofitel Legend Metropole là biểu tượng của sự xa hoa, thanh lịch và lịch sử sống động – một nơi mà mỗi viên gạch đều kể lại câu chuyện về Hà Nội xưa.\n\n🛏️ Phòng nghỉ & Tiện nghi\n\nKhách sạn có hơn 364 phòng và suite, chia thành hai khu vực mang hai phong cách riêng biệt:\n\n🕰️ Khu Historical Wing (Cánh cổ điển): Giữ nguyên nét kiến trúc Pháp đầu thế kỷ 20, với sàn gỗ, trần cao, và ban công nhìn ra vườn hoặc phố cổ.\n\n🌿 Khu Opera Wing (Cánh hiện đại): Phong cách sang trọng, tiện nghi cao cấp, phòng tắm lát đá cẩm thạch, nội thất tinh tế và hiện đại.\n\n🧺 Tiện nghi phòng đẳng cấp:\n\nGiường Sofitel MyBed™ độc quyền\n\nPhòng tắm cẩm thạch với bồn tắm riêng và vòi sen\n\nTV màn hình phẳng, minibar, máy pha Nespresso\n\nBan công hoặc cửa sổ lớn nhìn ra vườn, hồ bơi hoặc phố cổ\n\nDịch vụ quản gia (butler service) cho hạng phòng cao cấp\n\nWi-Fi tốc độ cao miễn phí\n\n💎 Hạng phòng tiêu biểu:\n\nPremium Room Garden View\n\nGrand Luxury Room Opera Wing\n\nMetropole Suite / Graham Greene Suite / Charlie Chaplin Suite\n\nLegendary Suite (Phòng Tổng Thống) – biểu tượng của đẳng cấp và lịch sử\n\n🍽️ Ẩm thực – Hành trình vị giác tinh tế\n\nẨm thực tại Sofitel Legend Metropole Hanoi là một hành trình nghệ thuật – nơi tinh hoa Pháp hòa quyện cùng hương vị Á Đông.\n\n🍴 Nhà hàng & Quán bar nổi bật:\n\n🥖 Le Beaulieu – Nhà hàng Pháp lâu đời nhất Hà Nội, nổi tiếng với món foie gras, bò bít tết, rượu vang hảo hạng, và phong cách phục vụ chuẩn mực.\n\n🍜 Spices Garden – Mang đậm hương vị Việt Nam truyền thống với nguyên liệu tươi và công thức cổ truyền, phục vụ phở, nem cuốn, cá kho, và các món miền Bắc.\n\n☕ La Terrasse du Metropole – Quán cà phê ngoài trời mô phỏng không khí Paris, lý tưởng cho buổi chiều thong thả ngắm dòng người Hà Nội.\n\n🍸 Bamboo Bar – Quầy bar bên hồ bơi với phong cách cổ điển, nơi du khách có thể thưởng thức cocktail “Metropole Martini” trứ danh.\n\n🥂 Angelina Lounge & Bar – Không gian hiện đại, âm nhạc nhẹ, phù hợp cho buổi tối sang trọng và lãng mạn.\n\n🏊‍♀️ Tiện ích & Trải nghiệm nghỉ dưỡng\n\nSofitel Legend Metropole Hanoi mang đến dịch vụ đạt chuẩn 5 sao quốc tế, kết hợp giữa di sản lịch sử và sự tinh tế Pháp.\n\n✨ Tiện ích nổi bật:\n\n💆 Le Spa du Metropole – Không gian spa đạt nhiều giải thưởng quốc tế, sử dụng tinh dầu thiên nhiên và kỹ thuật trị liệu truyền thống Việt – Pháp.\n\n🏊 Hồ bơi ngoài trời 24°C quanh năm, nằm giữa khu vườn xanh mát.\n\n🧘 Phòng gym & yoga hiện đại với huấn luyện viên riêng.\n\n💼 Business Center – Phòng họp và sự kiện với trang thiết bị hiện đại, phục vụ hội nghị, đám cưới và tiệc sang trọng.\n\n🕰️ Hầm rượu & Tour lịch sử “Metropole Heritage Path” – nơi du khách có thể khám phá hầm trú ẩn thời chiến, từng được sử dụng trong giai đoạn chiến tranh Việt Nam – một phần lịch sử sống động hiếm có giữa khách sạn 5 sao.\n\n🌇 Vị trí & Kết nối hoàn hảo\n\nTừ khách sạn, bạn chỉ mất:\n\n🚶 2 phút đến Nhà hát Lớn Hà Nội\n\n🚶 5 phút đến Hồ Hoàn Kiếm và Phố Tràng Tiền\n\n🏛️ 10 phút đến Phố cổ Hà Nội và Chợ Đồng Xuân\n\n🚗 35 phút đến Sân bay Quốc tế Nội Bài\n\nVị trí trung tâm giúp du khách dễ dàng tiếp cận các điểm văn hóa, nhà hàng, trung tâm thương mại và các khu hành chính của thủ đô.\n\n🌿 Không gian & Thiết kế\n\nKhách sạn là sự kết hợp hoàn hảo giữa kiến trúc cổ điển Pháp và nét duyên dáng Á Đông.\nHành lang lát gạch đỏ, tường trắng tinh khôi, cửa sổ chớp gỗ xanh lam – tất cả gợi nhớ về Hà Nội thập niên 1900.\nVào buổi tối, ánh đèn vàng phản chiếu trên mặt gạch và hồ bơi, tạo nên bầu không khí lãng mạn và thanh lịch bậc nhất Việt Nam.\n\n🎯 Lý tưởng cho bạn nếu\n\n💑 Bạn đang tìm kỳ nghỉ lãng mạn, sang trọng giữa lòng Hà Nội cổ kính.\n\n💼 Bạn là doanh nhân hoặc khách VIP cần không gian đẳng cấp, riêng tư và lịch sử.\n\n👨‍👩‍👧 Bạn muốn kết hợp du lịch và trải nghiệm văn hóa Hà Nội từ góc nhìn Pháp cổ.\n\n📸 Bạn yêu thích kiến trúc, nghệ thuật, lịch sử và ẩm thực haute cuisine.\n\n🏅 Thành tựu & Giải thưởng danh giá\n\n🏆 World Luxury Hotel Awards – “Legendary Hotel of Asia”\n🏆 Travel + Leisure – Top 100 Hotels in the World\n🏆 Condé Nast Traveler – Readers’ Choice Award\n🏆 Forbes Travel Guide – 5-Star Award (nhiều năm liên tiếp)\n🏆 TripAdvisor Travelers’ Choice – “Best of the Best”\n\n🌺 Kết luận\n\nSofitel Legend Metropole Hanoi là biểu tượng của sự thanh lịch, lịch sử và phong cách Pháp giữa trái tim thủ đô. Mỗi góc nhỏ trong khách sạn – từ hành lang, quán cà phê, đến hầm rượu cổ – đều lưu giữ hơi thở của thời gian và tinh thần của “Hà Nội xưa”.\n\nDù bạn đến để nghỉ dưỡng, công tác hay chỉ đơn giản là tìm lại cảm giác thanh tao giữa phố cổ, Metropole Hanoi luôn mang đến cho bạn một trải nghiệm vượt thời gian – nơi quá khứ và hiện tại giao hòa trong sự hoàn mỹ.', 'CAT001', 'LOC_HN_02', '15 Ngô Quyền, Hoàn Kiếm, Hà Nội', 21.023000, 105.855000, 5.0, 9.3, 450, '14:00:00', '12:00:00', '024-38266919', 'reservations@sofitel.com', 'https://sofitel-legend-metropole-hanoi.com', 50, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/764490234.jpg?k=9ca2d7802e06a240856cc628d2fee2496888874845b72c0654c0a89966f03d5d&o=', 'ACTIVE', '2025-10-27 15:52:19', '2025-10-29 14:48:54');

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
('LOC_DN_04', 'Vietnam', 'Đà Nẵng', NULL, NULL, NULL, 16.067800, 108.230000, 3.20, 'Thành phố du lịch ven biển', '2025-10-20 15:09:17', 1),
('LOC_HCM_01', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', 'Nhà Thờ Đức Bà', 10.779783, 106.699018, 0.50, 'Trung tâm du lịch và tài chính của thành phố', '2025-10-17 11:51:05', 1),
('LOC_HCM_02', 'Vietnam', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Thành', 'Chợ Bến Thành', 10.772105, 106.698423, 0.40, 'Khu chợ và khách sạn du lịch nổi tiếng', '2025-10-17 11:51:05', 1),
('LOC_HCM_03', 'Vietnam', 'Hồ Chí Minh', 'Quận 3', 'Phường Võ Thị Sáu', 'Công viên Lê Văn Tám', 10.787211, 106.696539, 2.00, 'Khu vực dân cư và văn phòng', '2025-10-17 11:51:05', 1),
('LOC_HCM_04', 'Vietnam', 'Hồ Chí Minh', 'Quận 5', 'Phường 11', 'Chợ Lớn', 10.756547, 106.663778, 5.50, 'Khu vực người Hoa, nhiều nhà hàng và khách sạn', '2025-10-17 11:51:05', 1),
('LOC_HCM_05', 'Vietnam', 'Hồ Chí Minh', 'Quận 7', 'Phường Tân Phong', 'Phú Mỹ Hưng', 10.734253, 106.721085, 7.50, 'Khu đô thị cao cấp', '2025-10-17 11:51:05', 1),
('LOC_HCM_06', 'Vietnam', 'Hồ Chí Minh', NULL, NULL, NULL, 10.776000, 106.700000, 0.50, 'Trung tâm kinh tế lớn nhất Việt Nam', '2025-10-20 15:09:17', 1),
('LOC_HN_01', 'Vietnam', 'Hà Nội', 'Hoàn Kiếm', 'Phường Hàng Trống', 'Hồ Hoàn Kiếm', 21.028511, 105.854088, 0.30, 'Trung tâm du lịch nổi tiếng của Hà Nội', '2025-10-17 11:51:05', 1),
('LOC_HN_02', 'Vietnam', 'Hà Nội', 'Hoàn Kiếm', 'Phường Tràng Tiền', '15 Ngô Quyền', 21.037268, 105.834438, 1.50, 'Khu vực hành chính và di tích lịch sử', '2025-10-17 11:51:05', 1),
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
-- Cấu trúc bảng cho bảng `policy_type`
--

CREATE TABLE `policy_type` (
  `policy_key` varchar(50) NOT NULL,
  `name_vi` varchar(100) NOT NULL,
  `name_en` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `display_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Đang đổ dữ liệu cho bảng `policy_type`
--

INSERT INTO `policy_type` (`policy_key`, `name_vi`, `name_en`, `description`, `display_order`) VALUES
('children_allowed', 'Cho phép trẻ em', 'Children Allowed', 'Khách sạn chấp nhận khách mang theo trẻ em', 4),
('free_cancellation', 'Miễn phí hủy', 'Free Cancellation', 'Có thể hủy đặt phòng mà không mất phí', 1),
('no_credit_card', 'Không cần thẻ tín dụng', 'No Credit Card Required', 'Đặt phòng không yêu cầu thẻ tín dụng', 3),
('pay_later', 'Thanh toán sau', 'Pay Later', 'Không cần thanh toán ngay, trả tiền khi nhận phòng', 2),
('pets_allowed', 'Cho phép thú cưng', 'Pets Allowed', 'Khách sạn cho phép mang theo thú cưng', 5);

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
(59, 'AC202510170003', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2NvdW50X2lkIjoiQUMyMDI1MTAxNzAwMDMiLCJlbWFpbCI6InRoYW5oaGFpODEwMDRAZ21haWwuY29tIiwicm9sZSI6IlVTRVIiLCJpYXQiOjE3NjE2MjIxMTksImV4cCI6MTc2MTg4MTMxOX0.yWE7RlEUnRrMoCRUNg6d0aObXF5vyHZwd2_lwMM7kXA', '2025-10-28 13:28:39', '2025-10-28 10:28:39');

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
('R001', 'RT001', '101', 2, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576703459.jpg?k=4bc75a8ddab0204e5dd9a57069afcf31e29e5e38f622b67f916878ed555169be&o=', 800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R002', 'RT001', '102', 3, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/576526483.jpg?k=e7352d5c0cc2f34b0a19b5ad760cc2c8a8ac0fc59a398b3047c26b15fa338f6b&o=', 950000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R003', 'RT002', '201', 2, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614965.jpg?k=8c9c9ea468ed7ae098f853df79536f99a77f7bfdfed84ac352fd7b96365446fc&o=', 1800000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R004', 'RT002', '202', 4, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/349614817.jpg?k=a14fa8850eab7dfac8b1cb64e8c5ae60d23be8bd01b30f194ac9b74aa57efec4&o=', 2000000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R005', 'RT003', '301', 3, 'https://lh3.googleusercontent.com/p/AF1QipORkI-MSORzrexdvvlSEUv93xE-cd83W2zDTpc=s1360-w1360-h1020-rw', 1500000.00, 'ACTIVE', '2025-10-20 15:09:17', '2025-10-20 15:09:17'),
('R006', 'RT004', '501', 2, 'https://cf.bstatic.com/xdata/images/hotel/max1024x768/123456791.jpg', 2500000.00, 'ACTIVE', '2025-10-27 15:52:19', '2025-10-27 15:52:19');

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
('RI004', 'RT002', 'https://grandviewpalacehalong.com/img/DCV1.jpg', 'Deluxe King - Main View', 1, 1, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI005', 'RT002', 'https://grandviewpalacehalong.com/img/DCV2.jpg', 'Deluxe King - Bed Close-up', 0, 2, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI006', 'RT002', 'https://grandviewpalacehalong.com/img/DCV3.jpg', 'Deluxe King - Bathroom', 0, 3, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
('RI007', 'RT002', 'https://grandviewpalacehalong.com/img/DCV5.jpg', 'Deluxe King - Workspace', 0, 4, '2025-10-29 08:42:26', '2025-10-29 08:42:26'),
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
('P005', 'R005', 1, 1, 0, 18, 1, 0, 200000.00, 6, 12),
('P006', 'R006', 1, 1, 0, 18, 1, 0, 300000.00, 6, 12);

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
('S019', 'R001', '2025-10-28', 800000.00, 10.00, 5, 1, 1, '2025-10-24 11:33:13'),
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
('S046', 'R002', '2025-10-28', 950000.00, 5.00, 3, 1, 1, '2025-10-24 11:34:05'),
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
('S073', 'R003', '2025-10-28', 1800000.00, 10.00, 6, 1, 0, '2025-10-24 11:34:15'),
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
('S096', 'R003', '2025-11-20', 1820000.00, 0.00, 6, 1, 0, '2025-10-24 11:34:15'),
('S100', 'R006', '2025-10-27', 2500000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S101', 'R006', '2025-10-28', 2500000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S102', 'R006', '2025-10-29', 2500000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S103', 'R006', '2025-10-30', 2500000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S104', 'R006', '2025-10-31', 2500000.00, 5.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S105', 'R006', '2025-11-01', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S106', 'R006', '2025-11-02', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S107', 'R006', '2025-11-03', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S108', 'R006', '2025-11-04', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S109', 'R006', '2025-11-05', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S110', 'R006', '2025-11-06', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S111', 'R006', '2025-11-07', 2550000.00, 5.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S112', 'R006', '2025-11-08', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S113', 'R006', '2025-11-09', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S114', 'R006', '2025-11-10', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S115', 'R006', '2025-11-11', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S116', 'R006', '2025-11-12', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S117', 'R006', '2025-11-13', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S118', 'R006', '2025-11-14', 2550000.00, 5.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S119', 'R006', '2025-11-15', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S120', 'R006', '2025-11-16', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S121', 'R006', '2025-11-17', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S122', 'R006', '2025-11-18', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S123', 'R006', '2025-11-19', 2550000.00, 10.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S124', 'R006', '2025-11-20', 2550000.00, 0.00, 5, 1, 1, '2025-10-27 15:52:19'),
('S200', 'R005', '2025-10-26', 1500000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S201', 'R005', '2025-10-27', 1500000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S202', 'R005', '2025-10-28', 1500000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S203', 'R005', '2025-10-29', 1500000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S204', 'R005', '2025-10-30', 1500000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S205', 'R005', '2025-10-31', 1500000.00, 5.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S206', 'R005', '2025-11-01', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S207', 'R005', '2025-11-02', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S208', 'R005', '2025-11-03', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S209', 'R005', '2025-11-04', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S210', 'R005', '2025-11-05', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S211', 'R005', '2025-11-06', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S212', 'R005', '2025-11-07', 1550000.00, 5.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S213', 'R005', '2025-11-08', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S214', 'R005', '2025-11-09', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S215', 'R005', '2025-11-10', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S216', 'R005', '2025-11-11', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S217', 'R005', '2025-11-12', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S218', 'R005', '2025-11-13', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S219', 'R005', '2025-11-14', 1550000.00, 5.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S220', 'R005', '2025-11-15', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S221', 'R005', '2025-11-16', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S222', 'R005', '2025-11-17', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S223', 'R005', '2025-11-18', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S224', 'R005', '2025-11-19', 1550000.00, 10.00, 4, 1, 1, '2025-10-27 16:04:25'),
('S225', 'R005', '2025-11-20', 1550000.00, 0.00, 4, 1, 1, '2025-10-27 16:04:25');

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

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `account`
--
ALTER TABLE `account`
  ADD PRIMARY KEY (`account_id`);

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
  ADD PRIMARY KEY (`discount_id`);

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
-- Chỉ mục cho bảng `payment`
--
ALTER TABLE `payment`
  ADD PRIMARY KEY (`payment_id`),
  ADD KEY `booking_id` (`booking_id`);

--
-- Chỉ mục cho bảng `policy_type`
--
ALTER TABLE `policy_type`
  ADD PRIMARY KEY (`policy_key`);

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

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
  ADD CONSTRAINT `FK_room_type` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_amenity`
--
ALTER TABLE `room_amenity`
  ADD CONSTRAINT `FK_ra_fac` FOREIGN KEY (`facility_id`) REFERENCES `facility` (`facility_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `FK_ra_room` FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `room_image`
--
ALTER TABLE `room_image`
  ADD CONSTRAINT `room_image_ibfk_1` FOREIGN KEY (`room_type_id`) REFERENCES `room_type` (`room_type_id`) ON DELETE CASCADE;

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

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
