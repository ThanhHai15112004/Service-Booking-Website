
CREATE TABLE account_package (
  package_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  price_monthly DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  price_yearly DECIMAL(10,2),
  description TEXT,
  features JSON,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  cashback_percent DECIMAL(5,2) DEFAULT 0.00,
  priority_booking BOOLEAN DEFAULT FALSE,
  free_cancellation_hours INT,
  vip_room_upgrade BOOLEAN DEFAULT FALSE,
  welcome_voucher DECIMAL(10,2) DEFAULT 0.00,
  special_offers JSON,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'DISABLED')),
  sort_order INT DEFAULT 0,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE hotel_category (
  category_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(255),
  icon VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE hotel_location (
  location_id VARCHAR(20) PRIMARY KEY,
  country VARCHAR(100) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  ward VARCHAR(100),
  area_name VARCHAR(255),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  distance_center DECIMAL(6,2) DEFAULT 0.00,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_hot BOOLEAN DEFAULT FALSE
);

CREATE TABLE facility (
  facility_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(10) CHECK (category IN ('HOTEL', 'ROOM')),
  icon VARCHAR(100),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE highlight (
  highlight_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  icon_url VARCHAR(500),
  description TEXT,
  category VARCHAR(50) DEFAULT 'GENERAL',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE policy_type (
  policy_key VARCHAR(50) PRIMARY KEY,
  name_vi VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  data_type ENUM('BOOLEAN', 'INTEGER', 'DECIMAL', 'TEXT') DEFAULT 'BOOLEAN',
  applicable_to ENUM('HOTEL', 'ROOM', 'BOTH') DEFAULT 'BOTH',
  icon VARCHAR(255),
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE discount_code (
  discount_id VARCHAR(20) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  percentage_off DECIMAL(5,2) CHECK (percentage_off BETWEEN 0 AND 100),
  max_discount DECIMAL(12,2) CHECK (max_discount >= 0),
  expires_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  conditions VARCHAR(255),
  applicable_hotels JSON CHECK (JSON_VALID(applicable_hotels)),
  applicable_rooms JSON CHECK (JSON_VALID(applicable_rooms)),
  min_nights INT,
  max_nights INT,
  usage_limit INT,
  usage_count INT DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'EXPIRED', 'DISABLED')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE promotion (
  promotion_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL,
  discount_type VARCHAR(20) NOT NULL,
  discount_value DECIMAL(10,2) NOT NULL,
  min_purchase DECIMAL(10,2) DEFAULT 0.00,
  max_discount DECIMAL(10,2),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  applicable_hotels JSON CHECK (JSON_VALID(applicable_hotels)),
  applicable_rooms JSON CHECK (JSON_VALID(applicable_rooms)),
  applicable_dates JSON CHECK (JSON_VALID(applicable_dates)),
  day_of_week JSON CHECK (JSON_VALID(day_of_week)),
  status VARCHAR(20) DEFAULT 'ACTIVE',
  created_by VARCHAR(20),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE bed_type_metadata (
  bed_type_key VARCHAR(50) PRIMARY KEY,
  name_vi VARCHAR(100) NOT NULL,
  name_en VARCHAR(100),
  description TEXT,
  icon VARCHAR(255),
  display_order INT DEFAULT 0
);

-- ============================================
-- USER & AUTH TABLES
-- ============================================

CREATE TABLE account (
  account_id VARCHAR(20) PRIMARY KEY,
  full_name VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'ACTIVE', 'BANNED', 'DELETED')),
  role VARCHAR(20) NOT NULL DEFAULT 'USER'
    CHECK (role IN ('ADMIN', 'STAFF', 'USER')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  provider VARCHAR(50) DEFAULT 'LOCAL',
  provider_id VARCHAR(255),
  avatar_url TEXT,
  verify_token VARCHAR(255),
  verify_expires_at DATETIME,
  reset_token VARCHAR(255),
  reset_expires_at DATETIME,
  resend_count INT DEFAULT 0,
  last_resend_reset_at DATETIME,
  last_verification_email_at DATETIME,
  package_id VARCHAR(20) DEFAULT 'PKG001',
  FOREIGN KEY (package_id) REFERENCES account_package(package_id)
);

CREATE TABLE account_subscription (
  subscription_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  package_id VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'CANCELLED', 'EXPIRED', 'SUSPENDED')),
  start_date DATE NOT NULL,
  end_date DATE,
  payment_method VARCHAR(30),
  auto_renew BOOLEAN DEFAULT TRUE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
  FOREIGN KEY (package_id) REFERENCES account_package(package_id)
);

CREATE TABLE refresh_tokens (
  id INT AUTO_INCREMENT PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  token TEXT NOT NULL,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE payment_card (
  card_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  card_type VARCHAR(20) NOT NULL,
  last_four_digits VARCHAR(4) NOT NULL,
  cardholder_name VARCHAR(255) NOT NULL,
  expiry_month TINYINT NOT NULL,
  expiry_year SMALLINT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE user_address (
  address_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  address VARCHAR(500) NOT NULL,
  city VARCHAR(100) NOT NULL,
  district VARCHAR(100),
  street_name VARCHAR(255),
  house_number VARCHAR(50),
  country VARCHAR(50) NOT NULL DEFAULT 'VN',
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

CREATE TABLE user_settings (
  settings_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  language VARCHAR(10) NOT NULL DEFAULT 'vi',
  timezone VARCHAR(50) NOT NULL DEFAULT 'Asia/Ho_Chi_Minh',
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  two_factor_auth BOOLEAN NOT NULL DEFAULT FALSE,
  email_notifications JSON CHECK (JSON_VALID(email_notifications)),
  sms_notifications JSON CHECK (JSON_VALID(sms_notifications)),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_user_settings (account_id),
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE
);

-- ============================================
-- HOTEL TABLES
-- ============================================

CREATE TABLE hotel (
  hotel_id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category_id VARCHAR(20),
  location_id VARCHAR(20),
  address VARCHAR(255),
  latitude DECIMAL(10,6),
  longitude DECIMAL(10,6),
  star_rating DECIMAL(2,1) CHECK (star_rating BETWEEN 0 AND 5),
  avg_rating DECIMAL(2,1) DEFAULT 0.0,
  review_count INT DEFAULT 0,
  checkin_time TIME DEFAULT '14:00:00',
  checkout_time TIME DEFAULT '12:00:00',
  phone_number VARCHAR(30),
  email VARCHAR(255),
  website VARCHAR(255),
  total_rooms INT DEFAULT 0,
  main_image VARCHAR(500),
  status VARCHAR(20) DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES hotel_category(category_id),
  FOREIGN KEY (location_id) REFERENCES hotel_location(location_id)
);

CREATE TABLE hotel_facility (
  hotel_id VARCHAR(20) NOT NULL,
  facility_id VARCHAR(20) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (hotel_id, facility_id),
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE
);

CREATE TABLE hotel_highlight (
  hotel_id VARCHAR(20) NOT NULL,
  highlight_id VARCHAR(20) NOT NULL,
  custom_text VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (hotel_id, highlight_id),
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (highlight_id) REFERENCES highlight(highlight_id) ON DELETE CASCADE
);

CREATE TABLE hotel_image (
  image_id VARCHAR(20) PRIMARY KEY,
  hotel_id VARCHAR(20) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  caption VARCHAR(255),
  sort_order INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE
);

CREATE TABLE hotel_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  hotel_id VARCHAR(20) NOT NULL,
  policy_key VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_hotel_policy (hotel_id, policy_key),
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE,
  FOREIGN KEY (policy_key) REFERENCES policy_type(policy_key) ON DELETE CASCADE
);

-- ============================================
-- ROOM TABLES
-- ============================================

CREATE TABLE room_type (
  room_type_id VARCHAR(20) PRIMARY KEY,
  hotel_id VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  bed_type VARCHAR(20) CHECK (bed_type IN ('Single', 'Double', 'Queen', 'King', 'Twin', 'Bunk')),
  area DECIMAL(6,2),
  image_url VARCHAR(500),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE
);

CREATE TABLE room (
  room_id VARCHAR(20) PRIMARY KEY,
  room_type_id VARCHAR(20) NOT NULL,
  room_number VARCHAR(20),
  capacity INT NOT NULL CHECK (capacity > 0),
  image_url VARCHAR(500),
  price_base DECIMAL(12,2) CHECK (price_base >= 0),
  status VARCHAR(20) DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'INACTIVE', 'MAINTENANCE')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_type(room_type_id) ON DELETE CASCADE
);

CREATE TABLE room_amenity (
  room_id VARCHAR(20) NOT NULL,
  facility_id VARCHAR(20) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (room_id, facility_id),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (facility_id) REFERENCES facility(facility_id) ON DELETE CASCADE
);

CREATE TABLE room_image (
  image_id VARCHAR(20) PRIMARY KEY,
  room_type_id VARCHAR(20) NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  image_alt VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_type_id) REFERENCES room_type(room_type_id) ON DELETE CASCADE
);

CREATE TABLE room_policy (
  id INT AUTO_INCREMENT PRIMARY KEY,
  room_id VARCHAR(20) NOT NULL,
  policy_key VARCHAR(50) NOT NULL,
  value TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_room_policy (room_id, policy_key),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (policy_key) REFERENCES policy_type(policy_key) ON DELETE CASCADE
);

CREATE TABLE room_price_schedule (
  schedule_id VARCHAR(20) PRIMARY KEY,
  room_id VARCHAR(20) NOT NULL,
  date DATE NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  provider_discount_percent DECIMAL(5,2) DEFAULT 0.00,
  system_discount_percent DECIMAL(5,2) DEFAULT 0.00,
  provider_discount_amount DECIMAL(10,2) DEFAULT 0.00,
  system_discount_amount DECIMAL(10,2) DEFAULT 0.00,
  final_price DECIMAL(10,2) DEFAULT 0.00,
  is_auto_generated BOOLEAN DEFAULT FALSE,
  auto_generated_at DATETIME,
  available_rooms INT DEFAULT 0,
  refundable BOOLEAN DEFAULT TRUE,
  pay_later BOOLEAN DEFAULT FALSE,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY UQ_schedule (room_id, date),
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE
);

CREATE TABLE room_price_schedule_promotion (
  id INT AUTO_INCREMENT PRIMARY KEY,
  schedule_id VARCHAR(20) NOT NULL,
  promotion_id VARCHAR(20) NOT NULL,
  discount_amount DECIMAL(10,2) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_schedule_promotion (schedule_id, promotion_id),
  FOREIGN KEY (schedule_id) REFERENCES room_price_schedule(schedule_id) ON DELETE CASCADE,
  FOREIGN KEY (promotion_id) REFERENCES promotion(promotion_id) ON DELETE CASCADE
);

-- ============================================
-- BOOKING TABLES
-- ============================================

CREATE TABLE booking (
  booking_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  hotel_id VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'CREATED'
    CHECK (status IN ('CREATED', 'PENDING_CONFIRMATION', 'CONFIRMED', 'CHECKED_IN', 'CHECKED_OUT', 'COMPLETED', 'CANCELLED')),
  subtotal DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  tax_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  total_amount DECIMAL(14,2),
  special_requests VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (account_id) REFERENCES account(account_id),
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id)
);

CREATE TABLE booking_detail (
  booking_detail_id VARCHAR(20) PRIMARY KEY,
  booking_id VARCHAR(20) NOT NULL,
  room_id VARCHAR(20) NOT NULL,
  checkin_date DATE NOT NULL,
  checkout_date DATE NOT NULL CHECK (checkout_date >= checkin_date),
  guests_count SMALLINT NOT NULL CHECK (guests_count > 0),
  price_per_night DECIMAL(12,2) NOT NULL CHECK (price_per_night >= 0),
  nights_count INT NOT NULL,
  total_price DECIMAL(18,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
  FOREIGN KEY (room_id) REFERENCES room(room_id)
);

CREATE TABLE booking_discount (
  booking_id VARCHAR(20) NOT NULL,
  discount_id VARCHAR(20) NOT NULL,
  discount_amount DECIMAL(12,2) CHECK (discount_amount >= 0),
  PRIMARY KEY (booking_id, discount_id),
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
  FOREIGN KEY (discount_id) REFERENCES discount_code(discount_id)
);

CREATE TABLE payment (
  payment_id VARCHAR(20) PRIMARY KEY,
  booking_id VARCHAR(20) NOT NULL,
  method VARCHAR(30) DEFAULT 'CASH'
    CHECK (method IN ('VNPAY', 'MOMO', 'CASH', 'BANK_TRANSFER')),
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED')),
  amount_due DECIMAL(14,2) NOT NULL CHECK (amount_due >= 0),
  amount_paid DECIMAL(14,2) NOT NULL DEFAULT 0.00 CHECK (amount_paid >= 0),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);

CREATE TABLE review (
  review_id VARCHAR(20) PRIMARY KEY,
  account_id VARCHAR(20) NOT NULL,
  hotel_id VARCHAR(20) NOT NULL,
  booking_id VARCHAR(20),
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title VARCHAR(255),
  comment TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE'
    CHECK (status IN ('ACTIVE', 'HIDDEN', 'DELETED')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  location_rating TINYINT CHECK (location_rating BETWEEN 1 AND 5),
  facilities_rating TINYINT CHECK (facilities_rating BETWEEN 1 AND 5),
  service_rating TINYINT CHECK (service_rating BETWEEN 1 AND 5),
  cleanliness_rating TINYINT CHECK (cleanliness_rating BETWEEN 1 AND 5),
  value_rating TINYINT CHECK (value_rating BETWEEN 1 AND 5),
  UNIQUE KEY unique_booking_review (booking_id),
  FOREIGN KEY (account_id) REFERENCES account(account_id) ON DELETE CASCADE,
  FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE SET NULL,
  FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE
);

-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$
CREATE TRIGGER review_rating_check_before_insert BEFORE INSERT ON review FOR EACH ROW BEGIN
  IF NEW.location_rating NOT BETWEEN 1 AND 5 THEN SET NEW.location_rating = NULL; END IF;
  IF NEW.facilities_rating NOT BETWEEN 1 AND 5 THEN SET NEW.facilities_rating = NULL; END IF;
  IF NEW.service_rating NOT BETWEEN 1 AND 5 THEN SET NEW.service_rating = NULL; END IF;
  IF NEW.cleanliness_rating NOT BETWEEN 1 AND 5 THEN SET NEW.cleanliness_rating = NULL; END IF;
  IF NEW.value_rating NOT BETWEEN 1 AND 5 THEN SET NEW.value_rating = NULL; END IF;
END$$
DELIMITER ;
