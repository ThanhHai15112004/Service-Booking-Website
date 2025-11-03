-- Migration: Add title column to review table
-- Date: 2025-01-XX

ALTER TABLE `review` 
ADD COLUMN `title` VARCHAR(255) NULL DEFAULT NULL COMMENT 'Tiêu đề đánh giá' AFTER `rating`;

-- Update existing reviews: set title from first sentence of comment
UPDATE `review` 
SET `title` = SUBSTRING_INDEX(`comment`, '.', 1)
WHERE `title` IS NULL AND `comment` IS NOT NULL AND `comment` != '';

