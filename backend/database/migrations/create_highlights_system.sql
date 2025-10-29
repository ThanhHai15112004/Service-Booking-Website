-- ============================================================================
-- XÓA CÁC BẢNG CŨ (NẾU TỒN TẠI)
-- ============================================================================
-- Phải xóa bảng con trước (hotel_highlight) vì có foreign key
DROP TABLE IF EXISTS hotel_highlight;
DROP TABLE IF EXISTS highlight;

-- ============================================================================
-- BƯỚC 1: TẠO BẢNG HIGHLIGHT (MASTER DATA)
-- ============================================================================

    CREATE TABLE IF NOT EXISTS highlight (
    highlight_id VARCHAR(20) NOT NULL PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT 'Tên highlight',
    icon_url VARCHAR(500) COMMENT 'URL icon (Freepik, Flaticon...)',
    description TEXT COMMENT 'Mô tả chi tiết',
    category VARCHAR(50) DEFAULT 'GENERAL' COMMENT 'Loại: LOCATION, SERVICE, AMENITY, EXPERIENCE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_highlight_category (category)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Master data - Tất cả các highlights có thể có';

    -- ============================================================================
    -- BƯỚC 2: INSERT DỮ LIỆU VÀO BẢNG HIGHLIGHT (MASTER DATA)
    -- ============================================================================

    INSERT INTO highlight (highlight_id, name, icon_url, description, category) VALUES
    ('HL001', 'Wi-Fi miễn phí trong tất cả các phòng!', 'https://cdn-icons-png.freepik.com/256/6511/6511058.png?semt=ais_white_label', 'Tốc độ cao, ổn định 24/7', 'AMENITY'),
    ('HL002', 'Bãi đỗ xe miễn phí', 'https://cdn-icons-png.freepik.com/256/1807/1807853.png?semt=ais_white_label', 'Chỗ đỗ xe rộng rãi, an toàn', 'AMENITY'),
    ('HL003', 'Cách sân bay Nội Bài 28 km', 'https://cdn-icons-png.freepik.com/256/17582/17582969.png?semt=ais_white_label', 'Khoảng 45 phút di chuyển', 'LOCATION'),
    ('HL004', 'Ngay trung tâm Hà Nội', 'https://cdn-icons-png.freepik.com/256/10152/10152246.png?semt=ais_white_label', 'Cách Hồ Hoàn Kiếm chỉ 500m', 'LOCATION'),
    ('HL005', 'Nhận/trả phòng nhanh', 'https://cdn-icons-png.freepik.com/256/5384/5384976.png?semt=ais_white_label', 'Express check-in/check-out', 'SERVICE'),
    ('HL006', 'Bữa sáng buffet hảo hạng', 'https://cdn-icons-png.freepik.com/256/6384/6384281.png?semt=ais_white_label', 'Ẩm thực đa quốc gia cao cấp', 'AMENITY'),
    ('HL007', 'Spa & Wellness đẳng cấp', 'https://cdn-icons-png.freepik.com/256/8937/8937527.png?semt=ais_white_label', 'Thư giãn với liệu trình 5 sao', 'EXPERIENCE'),
    ('HL008', 'Vườn thượng uyển', 'https://cdn-icons-png.freepik.com/256/7933/7933279.png?semt=ais_white_label', 'Không gian xanh giữa lòng thành phố', 'AMENITY'),
    ('HL009', 'Hồ bơi ngoài trời', 'https://cdn-icons-png.freepik.com/256/9968/9968418.png?semt=ais_white_label', 'View đẹp, mở cửa 6h-22h', 'AMENITY'),
    ('HL010', 'Đưa đón sân bay miễn phí', 'https://cdn-icons-png.freepik.com/256/1315/1315171.png?semt=ais_white_label', 'Xe shuttle tiện lợi', 'SERVICE'),
    ('HL011', 'Lễ tân phục vụ 24 giờ', 'https://cdn-icons-png.freepik.com/256/16941/16941913.png?semt=ais_white_label', 'Đội ngũ chuyên nghiệp, thân thiện', 'SERVICE'),
    ('HL012', 'Quán cafe sang trọng', 'https://cdn-icons-png.freepik.com/256/2972/2972908.png?semt=ais_white_label', 'Thức uống đa dạng', 'AMENITY'),
    ('HL013', 'Phòng tập gym hiện đại', 'https://cdn-icons-png.freepik.com/256/4725/4725702.png?semt=ais_white_label', 'Trang thiết bị cao cấp', 'AMENITY'),
    ('HL014', 'Gần chợ Bến Thành', 'https://cdn-icons-png.freepik.com/256/16173/16173023.png?semt=ais_white_label', 'Chỉ 200m đi bộ', 'LOCATION'),
    ('HL015', 'Chỗ đỗ xe máy miễn phí', 'https://cdn-icons-png.freepik.com/256/10875/10875188.png?semt=ais_white_label', 'An toàn, tiện lợi', 'AMENITY'),
    ('HL016', 'Dịch vụ phòng', 'https://cdn-icons-png.freepik.com/256/12931/12931123.png?semt=ais_white_label', 'Nhanh chóng, chu đáo', 'SERVICE'),
    ('HL017', 'Vườn xanh mát rộng rãi', 'https://cdn-icons-png.freepik.com/256/18298/18298365.png?semt=ais_white_label', 'Không gian thư giãn lý tưởng', 'AMENITY'),
    ('HL018', 'Nhà hàng món Á - Âu', 'https://cdn-icons-png.freepik.com/256/1139/1139688.png?semt=ais_white_label', 'Đầu bếp chuyên nghiệp', 'AMENITY'),
    ('HL019', 'Dịch vụ giặt là nhanh', 'https://cdn-icons-png.freepik.com/256/17200/17200223.png?semt=ais_white_label', 'Miễn phí cho khách lưu trú dài hạn', 'SERVICE'),
    ('HL020', 'Gần biển', 'https://cdn-icons-png.freepik.com/256/11426/11426441.png?semt=ais_white_label', 'Chỉ 5 phút đi bộ', 'LOCATION'),
    ('HL021', 'View thành phố tuyệt đẹp', 'https://cdn-icons-png.freepik.com/256/366/366945.png?semt=ais_white_label', 'Ngắm toàn cảnh thành phố', 'EXPERIENCE'),
    ('HL022', 'Gần trung tâm mua sắm', 'https://cdn-icons-png.freepik.com/256/12514/12514926.png?semt=ais_white_label', 'Mua sắm tiện lợi', 'LOCATION'),
    ('HL023', 'Bar rooftop', 'https://cdn-icons-png.freepik.com/256/1243/1243121.png?semt=ais_white_label', 'View 360 độ tuyệt đẹp', 'EXPERIENCE'),
    ('HL024', 'Phòng họp hiện đại', 'https://cdn-icons-png.freepik.com/256/12182/12182835.png?semt=ais_white_label', 'Phù hợp tổ chức sự kiện', 'AMENITY'),
    ('HL025', 'Gần các điểm tham quan', 'https://cdn-icons-png.freepik.com/256/3660/3660588.png?semt=ais_white_label', 'Di chuyển dễ dàng', 'LOCATION');

-- ============================================================================
-- BƯỚC 3: TẠO BẢNG HOTEL_HIGHLIGHT (N-M RELATIONSHIP)
-- ============================================================================

    CREATE TABLE IF NOT EXISTS hotel_highlight (
    hotel_id VARCHAR(20) NOT NULL,
    highlight_id VARCHAR(20) NOT NULL,
    custom_text VARCHAR(255) COMMENT 'Text tùy chỉnh cho hotel này (nếu khác với master)',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    PRIMARY KEY (hotel_id, highlight_id),
    FOREIGN KEY (hotel_id) REFERENCES hotel(hotel_id) ON DELETE CASCADE,
    FOREIGN KEY (highlight_id) REFERENCES highlight(highlight_id) ON DELETE CASCADE,
    INDEX idx_hotel_highlight_hotel (hotel_id),
    INDEX idx_hotel_highlight_order (hotel_id, sort_order)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- BƯỚC 4: GẮN HIGHLIGHTS CHO CÁC HOTEL (HOTEL_HIGHLIGHT)
-- ============================================================================

    -- Hotel H001 - Sofitel Legend Metropole Hanoi (5 sao)
    INSERT INTO hotel_highlight (hotel_id, highlight_id, custom_text, sort_order) VALUES
    ('H001', 'HL001', NULL, 1),  -- Wi-Fi
    ('H001', 'HL002', NULL, 2),  -- Bãi đỗ xe
    ('H001', 'HL003', NULL, 3),  -- Cách sân bay
    ('H001', 'HL004', NULL, 4),  -- Trung tâm HN
    ('H001', 'HL005', NULL, 5),  -- Check-in nhanh
    ('H001', 'HL006', NULL, 6),  -- Bữa sáng
    ('H001', 'HL007', NULL, 7),  -- Spa
    ('H001', 'HL008', NULL, 8);  -- Vườn

    -- Hotel H002 (4 sao)
    INSERT INTO hotel_highlight (hotel_id, highlight_id, custom_text, sort_order) VALUES
    ('H002', 'HL001', NULL, 1),  -- Wi-Fi
    ('H002', 'HL002', NULL, 2),  -- Bãi đỗ xe
    ('H002', 'HL010', NULL, 3),  -- Đưa đón sân bay
    ('H002', 'HL011', NULL, 4),  -- Lễ tân 24h
    ('H002', 'HL009', NULL, 5),  -- Hồ bơi
    ('H002', 'HL012', NULL, 6),  -- Quán cafe
    ('H002', 'HL013', NULL, 7);  -- Gym

    -- Hotel H003 (3 sao)
    INSERT INTO hotel_highlight (hotel_id, highlight_id, custom_text, sort_order) VALUES
    ('H003', 'HL001', NULL, 1),  -- Wi-Fi
    ('H003', 'HL014', NULL, 2),  -- Gần chợ Bến Thành
    ('H003', 'HL011', NULL, 3),  -- Lễ tân 24h
    ('H003', 'HL015', NULL, 4),  -- Đỗ xe máy
    ('H003', 'HL016', NULL, 5),  -- Dịch vụ phòng
    ('H003', 'HL012', NULL, 6);  -- Quán cafe

    -- Hotel H004 (Resort)
    INSERT INTO hotel_highlight (hotel_id, highlight_id, custom_text, sort_order) VALUES
    ('H004', 'HL009', NULL, 1),  -- Hồ bơi
    ('H004', 'HL013', NULL, 2),  -- Gym
    ('H004', 'HL017', NULL, 3),  -- Vườn xanh
    ('H004', 'HL018', NULL, 4),  -- Nhà hàng
    ('H004', 'HL019', NULL, 5),  -- Giặt là
    ('H004', 'HL001', NULL, 6),  -- Wi-Fi
    ('H004', 'HL020', NULL, 7);  -- Gần biển

    CREATE INDEX IF NOT EXISTS idx_hotel_highlight_lookup 
    ON hotel_highlight(hotel_id, sort_order);