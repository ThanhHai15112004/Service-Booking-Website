-- Migration: Add category rating columns to review table
-- Date: 2025-01-XX

ALTER TABLE `review` 
ADD COLUMN `location_rating` TINYINT(1) NULL DEFAULT NULL CHECK (`location_rating` between 1 and 5) COMMENT 'Đánh giá vị trí' AFTER `rating`,
ADD COLUMN `facilities_rating` TINYINT(1) NULL DEFAULT NULL CHECK (`facilities_rating` between 1 and 5) COMMENT 'Đánh giá cơ sở vật chất' AFTER `location_rating`,
ADD COLUMN `service_rating` TINYINT(1) NULL DEFAULT NULL CHECK (`service_rating` between 1 and 5) COMMENT 'Đánh giá dịch vụ' AFTER `facilities_rating`,
ADD COLUMN `cleanliness_rating` TINYINT(1) NULL DEFAULT NULL CHECK (`cleanliness_rating` between 1 and 5) COMMENT 'Đánh giá độ sạch sẽ' AFTER `service_rating`,
ADD COLUMN `value_rating` TINYINT(1) NULL DEFAULT NULL CHECK (`value_rating` between 1 and 5) COMMENT 'Đánh giá đáng giá tiền' AFTER `cleanliness_rating`;

-- Update existing reviews: set category ratings = main rating (backward compatibility)
UPDATE `review` 
SET 
  `location_rating` = `rating`,
  `facilities_rating` = `rating`,
  `service_rating` = `rating`,
  `cleanliness_rating` = `rating`,
  `value_rating` = `rating`
WHERE `location_rating` IS NULL;

