-- ============================================================================
-- TẠO BẢNG ROOM_IMAGE - Bảng lưu ảnh phòng
-- ============================================================================

-- BƯỚC 1: XÓA BẢNG CŨ (NẾU CÓ)
DROP TABLE IF EXISTS room_image;

-- BƯỚC 2: TẠO BẢNG ROOM_IMAGE
CREATE TABLE IF NOT EXISTS room_image (
    image_id VARCHAR(20) NOT NULL PRIMARY KEY,
    room_type_id VARCHAR(20) NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    image_alt VARCHAR(255) COMMENT 'Mô tả ảnh',
    is_primary BOOLEAN DEFAULT FALSE COMMENT 'Ảnh chính hay không',
    sort_order INT DEFAULT 0 COMMENT 'Thứ tự hiển thị',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (room_type_id) REFERENCES room_type(room_type_id) ON DELETE CASCADE,
    INDEX idx_room_image_type (room_type_id),
    INDEX idx_room_image_primary (room_type_id, is_primary),
    INDEX idx_room_image_order (room_type_id, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BƯỚC 3: THÊM DỮ LIỆU MẪU CHO CÁC PHÒNG

-- RT001 - Standard Double (3 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI001', 'RT001', 'https://images.pexels.com/photos/262048/pexels-photo-262048.jpeg', 'Standard Double - Main View', TRUE, 1),
('RI002', 'RT001', 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg', 'Standard Double - Bathroom', FALSE, 2),
('RI003', 'RT001', 'https://images.pexels.com/photos/164595/pexels-photo-164595.jpeg', 'Standard Double - Side View', FALSE, 3);

-- RT002 - Deluxe King (4 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI004', 'RT002', 'https://images.pexels.com/photos/271743/pexels-photo-271743.jpeg', 'Deluxe King - Main View', TRUE, 1),
('RI005', 'RT002', 'https://images.pexels.com/photos/279746/pexels-photo-279746.jpeg', 'Deluxe King - Bed Close-up', FALSE, 2),
('RI006', 'RT002', 'https://images.pexels.com/photos/1457842/pexels-photo-1457842.jpeg', 'Deluxe King - Bathroom', FALSE, 3),
('RI007', 'RT002', 'https://images.pexels.com/photos/1454806/pexels-photo-1454806.jpeg', 'Deluxe King - Workspace', FALSE, 4);

-- RT003 - 1-Bedroom Apartment (4 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI008', 'RT003', 'https://images.pexels.com/photos/1743229/pexels-photo-1743229.jpeg', '1-Bedroom Apartment - Living Room', TRUE, 1),
('RI009', 'RT003', 'https://images.pexels.com/photos/1428348/pexels-photo-1428348.jpeg', '1-Bedroom Apartment - Bedroom', FALSE, 2),
('RI010', 'RT003', 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg', '1-Bedroom Apartment - Kitchen', FALSE, 3),
('RI011', 'RT003', 'https://images.pexels.com/photos/6585760/pexels-photo-6585760.jpeg', '1-Bedroom Apartment - Balcony', FALSE, 4);

-- RT004 - 2-Bedroom Apartment (5 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI012', 'RT004', 'https://images.pexels.com/photos/1648776/pexels-photo-1648776.jpeg', '2-Bedroom Apartment - Main View', TRUE, 1),
('RI013', 'RT004', 'https://images.pexels.com/photos/1457846/pexels-photo-1457846.jpeg', '2-Bedroom Apartment - Master Bedroom', FALSE, 2),
('RI014', 'RT004', 'https://images.pexels.com/photos/2029722/pexels-photo-2029722.jpeg', '2-Bedroom Apartment - Second Bedroom', FALSE, 3),
('RI015', 'RT004', 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', '2-Bedroom Apartment - Living Room', FALSE, 4),
('RI016', 'RT004', 'https://images.pexels.com/photos/1457845/pexels-photo-1457845.jpeg', '2-Bedroom Apartment - Dining Area', FALSE, 5);

-- RT005 - Premium Suite (5 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI017', 'RT005', 'https://images.pexels.com/photos/2506990/pexels-photo-2506990.jpeg', 'Premium Suite - Main View', TRUE, 1),
('RI018', 'RT005', 'https://images.pexels.com/photos/1743231/pexels-photo-1743231.jpeg', 'Premium Suite - Bedroom', FALSE, 2),
('RI019', 'RT005', 'https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg', 'Premium Suite - Living Room', FALSE, 3),
('RI020', 'RT005', 'https://images.pexels.com/photos/1457847/pexels-photo-1457847.jpeg', 'Premium Suite - Bathroom', FALSE, 4),
('RI021', 'RT005', 'https://images.pexels.com/photos/1145257/pexels-photo-1145257.jpeg', 'Premium Suite - City View', FALSE, 5);

-- RT006 - Standard Twin (3 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI022', 'RT006', 'https://images.pexels.com/photos/271619/pexels-photo-271619.jpeg', 'Standard Twin - Main View', TRUE, 1),
('RI023', 'RT006', 'https://images.pexels.com/photos/262047/pexels-photo-262047.jpeg', 'Standard Twin - Beds', FALSE, 2),
('RI024', 'RT006', 'https://images.pexels.com/photos/271618/pexels-photo-271618.jpeg', 'Standard Twin - Desk Area', FALSE, 3);

-- RT007 - Executive Room (4 ảnh)
INSERT INTO room_image (image_id, room_type_id, image_url, image_alt, is_primary, sort_order) VALUES
('RI025', 'RT007', 'https://images.pexels.com/photos/1838554/pexels-photo-1838554.jpeg', 'Executive Room - Main View', TRUE, 1),
('RI026', 'RT007', 'https://images.pexels.com/photos/1743227/pexels-photo-1743227.jpeg', 'Executive Room - Bed', FALSE, 2),
('RI027', 'RT007', 'https://images.pexels.com/photos/161758/governor-s-mansion-montgomery-alabama-grand-staircase-161758.jpeg', 'Executive Room - Lounge', FALSE, 3),
('RI028', 'RT007', 'https://images.pexels.com/photos/210604/pexels-photo-210604.jpeg', 'Executive Room - Bathroom', FALSE, 4);

-- HOÀN TẤT
SELECT 'Room Image table created successfully!' AS message;

