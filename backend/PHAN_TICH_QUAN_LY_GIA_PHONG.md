# 💰 PHÂN TÍCH: QUẢN LÝ GIÁ PHÒNG - TỰ ĐỘNG vs THỦ CÔNG

## 📊 Cấu trúc hiện tại

### Bảng `room_price_schedule`:
```sql
CREATE TABLE `room_price_schedule` (
  `schedule_id` varchar(20) NOT NULL,
  `room_id` varchar(20) NOT NULL,
  `date` date NOT NULL,
  `base_price` decimal(10,2) NOT NULL,
  `discount_percent` decimal(5,2) DEFAULT 0.00,
  `available_rooms` int(11) DEFAULT 0,
  `refundable` tinyint(1) DEFAULT 1,
  `pay_later` tinyint(1) DEFAULT 0,
  UNIQUE KEY `UQ_schedule` (`room_id`,`date`)
)
```

**Đặc điểm:**
- Mỗi `room_id` + `date` có 1 record duy nhất
- Phải có data cho TỪNG NGÀY cụ thể
- Không có data cho ngày X → không thể đặt phòng cho ngày X

---

## 🎯 Phân tích 2 phương án

## 1️⃣ PHƯƠNG ÁN A: SET GIÁ THỦ CÔNG (Manual Pricing)

### Mô tả:
- Admin/Hotel Manager phải **tạo từng record** cho từng ngày trong bảng `room_price_schedule`
- Mỗi lần muốn mở booking cho 1 tháng mới → phải insert 30 records cho mỗi room

### ✅ Ưu điểm:

#### 1. **Linh hoạt tuyệt đối**
- Có thể set giá **khác nhau cho từng ngày** dựa trên:
  - Ngày cuối tuần vs ngày thường
  - Ngày lễ, Tết (VD: 30/4, 1/5, 2/9)
  - Sự kiện đặc biệt (festival, hội nghị lớn)
  - Mùa cao điểm vs mùa thấp điểm

#### 2. **Kiểm soát chặt chẽ inventory**
- Admin có thể set chính xác số phòng available cho từng ngày
- VD: Ngày 20/12 có event lớn → giảm `available_rooms` từ 10 xuống 5 để giữ phòng cho khách VIP

#### 3. **Dynamic pricing dễ dàng**
- Có thể áp dụng chiến lược giá động:
  - Giảm giá vào ngày ít khách (mid-week)
  - Tăng giá vào cuối tuần/ngày lễ
  - Flash sale cho các ngày cụ thể

#### 4. **Phù hợp với thực tế ngành khách sạn**
- Hầu hết các hệ thống PMS (Property Management System) như Opera, Cloudbeds đều dùng phương pháp này
- Giống với Booking.com, Agoda, Airbnb

### ❌ Nhược điểm:

#### 1. **Tốn công sức setup ban đầu**
- Phải insert hàng nghìn records:
  - 1 hotel có 100 rooms
  - Mỗi room cần data cho 365 ngày
  - → 36,500 records/năm/hotel

#### 2. **Khó maintain cho hotel nhỏ không có IT**
- Cần có admin panel để quản lý
- Phải train nhân viên cách sử dụng

#### 3. **Dễ quên update cho tương lai xa**
- VD: Hôm nay là 1/11, admin quên tạo data cho tháng 12 → khách không đặt được phòng tháng 12

#### 4. **Database lớn**
- 100 hotels × 100 rooms × 365 days = 3.65 triệu records/năm
- Cần index tốt để query nhanh

---

## 2️⃣ PHƯƠNG ÁN B: TỰ ĐỘNG (Auto-Generated Pricing)

### Mô tả:
- Tạo bảng **price template/rule** để define giá mặc định
- Hệ thống **tự động generate** giá khi:
  - Admin chọn "Generate prices for next 3 months"
  - Hoặc auto-generate khi khách search (on-the-fly)

### Cách implement:

#### Option B1: Auto-generate vào DB (Pre-populate)
```sql
-- Bảng template
CREATE TABLE `room_price_template` (
  `template_id` varchar(20),
  `room_id` varchar(20),
  `day_of_week` ENUM('MON','TUE','WED','THU','FRI','SAT','SUN','ALL'),
  `season` ENUM('LOW','NORMAL','HIGH','HOLIDAY'),
  `base_price` decimal(10,2),
  `discount_percent` decimal(5,2),
  `available_rooms` int(11)
);

-- Stored procedure tự động generate
DELIMITER $$
CREATE PROCEDURE GeneratePriceSchedule(
  IN p_room_id VARCHAR(20),
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  -- Logic: Loop qua từng ngày, apply template tương ứng
  -- Insert vào room_price_schedule
END$$
```

**Admin chỉ cần:**
1. Set template 1 lần (VD: Thứ 6-7 giá x1.2, Tết giá x1.5)
2. Click "Generate prices từ 1/1/2026 đến 31/12/2026"
3. System tự động insert 365 records

#### Option B2: Calculate on-the-fly (Real-time)
- **KHÔNG insert vào DB trước**
- Khi khách search ngày 15/12:
  1. Check xem có record trong `room_price_schedule` chưa?
  2. Nếu KHÔNG → tính giá real-time dựa trên template
  3. Return về cho khách

### ✅ Ưu điểm:

#### 1. **Tiết kiệm công sức setup**
- Admin chỉ cần config template 1 lần
- Click 1 nút là generate cả năm

#### 2. **Dễ maintain**
- Muốn tăng giá cuối tuần? → Sửa template, re-generate
- Không lo quên update

#### 3. **Mở rộng dễ dàng**
- Add thêm 100 rooms mới? → Apply template, generate xong

#### 4. **Database nhỏ hơn (nếu dùng on-the-fly)**
- Chỉ store template thay vì hàng triệu records

### ❌ Nhược điểm:

#### 1. **Mất tính linh hoạt**
- Không thể set giá đặc biệt cho 1 ngày cụ thể dễ dàng
- VD: Ngày 20/12 có sự kiện đặc biệt → phải override manually

#### 2. **Performance (nếu on-the-fly)**
- Phải tính giá mỗi lần search → chậm hơn query trực tiếp DB
- Cần cache để tối ưu

#### 3. **Khó áp dụng dynamic pricing phức tạp**
- Các thuật toán giá động (based on demand, competitor pricing) khó implement với template

#### 4. **Rủi ro khi có lỗi template**
- Nếu template sai → toàn bộ giá bị sai
- Khó debug nếu khách phàn nàn "giá sai"

---

## 3️⃣ PHƯƠNG ÁN C: KẾT HỢP (HYBRID) ⭐ **ĐỀ XUẤT**

### Chiến lược:

#### **Base:** Tự động generate từ template
1. Admin tạo **price template** theo:
   - Ngày trong tuần (Mon-Sun)
   - Mùa (thấp điểm, cao điểm, lễ Tết)
   - Loại phòng

2. Hệ thống **auto-generate** giá cho 3-6 tháng tới
   - Insert vào `room_price_schedule`
   - Chạy cronjob hàng tháng để generate thêm

#### **Override:** Cho phép chỉnh sửa thủ công
3. Admin có thể **edit** giá của bất kỳ ngày nào:
   - Tăng giá ngày 30/4 do Tết
   - Giảm giá flash sale
   - Tăng available_rooms nếu có phòng mới

4. Đánh dấu record nào đã "override":
```sql
ALTER TABLE `room_price_schedule`
ADD COLUMN `is_manual_override` TINYINT(1) DEFAULT 0;
```

### ✅ Ưu điểm:
- ✅ **Tiết kiệm thời gian:** Auto-generate phần lớn
- ✅ **Vẫn linh hoạt:** Override được khi cần
- ✅ **Không lo quên:** Cronjob tự động generate
- ✅ **Dynamic pricing:** Có thể áp dụng AI/algorithm để adjust giá định kỳ

### ❌ Nhược điểm:
- Hệ thống phức tạp hơn (cần viết logic generate + UI admin panel)

---

## 🏗️ Thiết kế cho phương án HYBRID

### Bảng mới cần thêm:

#### 1. `room_price_template`
```sql
CREATE TABLE `room_price_template` (
  `template_id` VARCHAR(20) PRIMARY KEY,
  `room_id` VARCHAR(20) NOT NULL,
  `rule_type` ENUM('WEEKDAY','WEEKEND','HOLIDAY','SEASON') NOT NULL,
  `rule_value` VARCHAR(50), -- 'MON', 'SAT-SUN', '2025-04-30', 'SUMMER'
  `base_price` DECIMAL(10,2) NOT NULL,
  `discount_percent` DECIMAL(5,2) DEFAULT 0,
  `available_rooms` INT DEFAULT 0,
  `priority` INT DEFAULT 0, -- Rule nào có priority cao hơn sẽ được apply
  `is_active` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`room_id`) REFERENCES `room` (`room_id`) ON DELETE CASCADE
);
```

#### 2. `holiday_calendar` (Quản lý ngày lễ)
```sql
CREATE TABLE `holiday_calendar` (
  `holiday_id` VARCHAR(20) PRIMARY KEY,
  `date` DATE NOT NULL UNIQUE,
  `name` VARCHAR(255), -- 'Tết Nguyên Đán', 'Quốc Khánh'
  `multiplier` DECIMAL(3,2) DEFAULT 1.0, -- Hệ số nhân giá (VD: 1.5 = tăng 50%)
  `country` VARCHAR(10) DEFAULT 'VN'
);

-- Insert sẵn các ngày lễ Việt Nam
INSERT INTO `holiday_calendar` VALUES
('HD001', '2025-01-01', 'Tết Dương Lịch', 1.3, 'VN'),
('HD002', '2025-04-30', 'Giải Phóng Miền Nam', 1.5, 'VN'),
('HD003', '2025-09-02', 'Quốc Khánh', 1.4, 'VN');
```

#### 3. Thêm cột vào `room_price_schedule`
```sql
ALTER TABLE `room_price_schedule`
ADD COLUMN `is_manual_override` TINYINT(1) DEFAULT 0,
ADD COLUMN `generated_from_template_id` VARCHAR(20) NULL,
ADD COLUMN `last_generated_at` DATETIME NULL;
```

### Logic generate:

#### **Stored Procedure:**
```sql
DELIMITER $$
CREATE PROCEDURE GeneratePriceScheduleForRoom(
  IN p_room_id VARCHAR(20),
  IN p_start_date DATE,
  IN p_end_date DATE
)
BEGIN
  DECLARE v_current_date DATE;
  DECLARE v_day_of_week INT;
  DECLARE v_price DECIMAL(10,2);
  
  SET v_current_date = p_start_date;
  
  WHILE v_current_date <= p_end_date DO
    -- Check nếu đã có record (và là manual override) thì skip
    IF NOT EXISTS (
      SELECT 1 FROM room_price_schedule 
      WHERE room_id = p_room_id 
        AND date = v_current_date 
        AND is_manual_override = 1
    ) THEN
      
      SET v_day_of_week = DAYOFWEEK(v_current_date);
      
      -- Step 1: Lấy giá base từ room
      SELECT price_base INTO v_price FROM room WHERE room_id = p_room_id;
      
      -- Step 2: Check holiday
      IF EXISTS (SELECT 1 FROM holiday_calendar WHERE date = v_current_date) THEN
        -- Apply holiday pricing
        SELECT v_price * multiplier INTO v_price 
        FROM holiday_calendar 
        WHERE date = v_current_date;
      
      -- Step 3: Check weekend
      ELSEIF v_day_of_week IN (1, 7) THEN -- Sunday=1, Saturday=7
        -- Tăng 20% cho cuối tuần
        SET v_price = v_price * 1.2;
      END IF;
      
      -- Insert hoặc update
      INSERT INTO room_price_schedule (
        schedule_id, room_id, date, base_price, 
        discount_percent, available_rooms, 
        generated_from_template_id, last_generated_at
      ) VALUES (
        CONCAT('SGEN', p_room_id, DATE_FORMAT(v_current_date, '%Y%m%d')),
        p_room_id, v_current_date, v_price,
        0, 5, -- default available
        NULL, NOW()
      )
      ON DUPLICATE KEY UPDATE
        base_price = v_price,
        last_generated_at = NOW();
        
    END IF;
    
    SET v_current_date = DATE_ADD(v_current_date, INTERVAL 1 DAY);
  END WHILE;
END$$
DELIMITER ;
```

### API endpoints cần có:

```typescript
// Admin Panel APIs
POST   /api/admin/pricing/templates          // Tạo template
GET    /api/admin/pricing/templates          // Lấy danh sách templates
PUT    /api/admin/pricing/templates/:id      // Sửa template
DELETE /api/admin/pricing/templates/:id      // Xóa template

POST   /api/admin/pricing/generate           // Generate giá
// Body: { roomId: 'R001', startDate: '2025-12-01', endDate: '2025-12-31' }

GET    /api/admin/pricing/schedule           // Xem lịch giá đã generate
// Query: ?roomId=R001&startDate=2025-12-01&endDate=2025-12-31

PUT    /api/admin/pricing/schedule/:scheduleId // Override giá 1 ngày cụ thể
// Body: { basePrice: 1000000, discountPercent: 10, isManualOverride: true }

POST   /api/admin/holidays                   // Thêm ngày lễ custom
GET    /api/admin/holidays                   // Danh sách ngày lễ
```

---

## 📋 So sánh tổng quan

| Tiêu chí | Manual (A) | Auto (B) | Hybrid (C) ⭐ |
|----------|------------|----------|--------------|
| **Setup ban đầu** | 😰 Rất tốn thời gian | 😊 Nhanh | 😐 Vừa phải |
| **Linh hoạt** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Maintenance** | 😰 Khó | 😊 Dễ | 😊 Dễ |
| **Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Dynamic Pricing** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mở rộng** | 😰 Khó | 😊 Dễ | 😊 Dễ |
| **Rủi ro lỗi** | Thấp | Cao (nếu template sai) | Thấp |
| **Phù hợp với** | Hotel lớn có IT team | Homestay nhỏ | **Mọi loại** |

---

## 🎯 Kết luận & Đề xuất

### ✅ **ĐỀ XUẤT: Dùng phương án HYBRID (C)**

**Lý do:**
1. ✅ **Best of both worlds:** Vừa tiết kiệm thời gian, vừa linh hoạt
2. ✅ **Phù hợp với thực tế:** Đa số PMS hiện đại đều dùng cách này
3. ✅ **Scalable:** Dễ mở rộng khi có thêm nhiều hotel
4. ✅ **Future-proof:** Có thể tích hợp AI dynamic pricing sau này

### 📝 Roadmap implement:

#### **Phase 1: Giữ nguyên như hiện tại (Manual)**
- Để admin insert thủ công như data mẫu hiện tại
- Focus vào việc hoàn thiện features chính (booking, payment)

#### **Phase 2: Thêm template system**
- Tạo bảng `room_price_template` và `holiday_calendar`
- Viết stored procedure `GeneratePriceSchedule`
- Tạo UI admin panel để manage templates

#### **Phase 3: Auto-generate**
- Add cronjob chạy hàng tuần để generate giá cho 3 tháng tiếp theo
- Ensure không override manual changes

#### **Phase 4: Advanced features** (Optional)
- Tích hợp dynamic pricing dựa trên:
  - Occupancy rate (tỷ lệ lấp đầy)
  - Competitor pricing
  - Demand forecasting
  - Weather data (biển Đà Nẵng mùa mưa → giảm giá)

---

## 🔧 Ví dụ use case thực tế

### Scenario 1: Hotel vừa mới onboard
1. Admin nhập thông tin hotel + rooms
2. Set giá base trong bảng `room` (price_base)
3. Click "Generate prices for next 6 months"
4. System tự tạo 180 records cho mỗi room
5. Admin chỉnh sửa giá cho 1 vài ngày đặc biệt (Tết, event)

### Scenario 2: Flash sale cuối tuần
1. Admin vào admin panel
2. Chọn "Override pricing"
3. Chọn ngày 15-17/12/2025
4. Set discount_percent = 30%
5. Đánh dấu `is_manual_override = 1`
6. Khách thấy giảm 30% khi search

### Scenario 3: Tết 2026
1. Admin add ngày 29/1 - 4/2/2026 vào `holiday_calendar` với multiplier = 1.8
2. Click "Re-generate prices for Feb 2026"
3. System auto-update giá (tăng 80%)
4. Các ngày đã manual override sẽ KHÔNG bị ghi đè

---

## 💡 Gợi ý thêm

### 1. **Bulk update UI**
- Cho phép admin chọn nhiều ngày cùng lúc và update giá hàng loạt
- VD: Chọn tất cả Thứ 6-7 tháng 12 → tăng giá 25%

### 2. **Pricing calendar view**
- Hiển thị calendar với màu sắc:
  - Xanh: Giá thấp (discount)
  - Vàng: Giá bình thường
  - Đỏ: Giá cao (peak season)
- Giúp admin visualize giá dễ dàng

### 3. **Notification & Alerts**
- Cảnh báo khi giá 1 room thấp hơn cost price
- Notify khi inventory sắp hết (available_rooms < 2)
- Alert khi quên generate giá cho tháng tiếp theo

### 4. **Analytics**
- Report: Ngày nào bán chạy nhất?
- Average selling price theo tháng
- Revenue forecast dựa trên giá đã set

---

**Tóm lại:** Bắt đầu với **manual** cho MVP, sau đó nâng cấp dần lên **hybrid** khi có nhiều hotel và cần automation. Đây là best practice trong ngành!

