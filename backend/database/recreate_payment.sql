-- Recreate payment table with correct constraint
-- This script drops and recreates the payment table

USE booking_database;

-- Step 1: Drop foreign key constraint
ALTER TABLE `payment` DROP FOREIGN KEY `payment_ibfk_1`;

-- Step 2: Drop the payment table
DROP TABLE IF EXISTS `payment`;

-- Step 3: Recreate payment table with CORRECT constraint on method column
CREATE TABLE `payment` (
  `payment_id` varchar(20) NOT NULL,
  `booking_id` varchar(20) NOT NULL,
  `method` varchar(30) DEFAULT 'CASH' CHECK (`method` IN ('VNPAY','MOMO','CASH','BANK_TRANSFER')),
  `status` varchar(20) NOT NULL DEFAULT 'PENDING' CHECK (`status` IN ('PENDING','SUCCESS','FAILED','REFUNDED')),
  `amount_due` decimal(14,2) NOT NULL CHECK (`amount_due` >= 0),
  `amount_paid` decimal(14,2) NOT NULL DEFAULT 0.00 CHECK (`amount_paid` >= 0),
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`payment_id`),
  KEY `idx_booking_id` (`booking_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 4: Add foreign key constraint
ALTER TABLE `payment`
  ADD CONSTRAINT `payment_ibfk_1` FOREIGN KEY (`booking_id`) REFERENCES `booking` (`booking_id`);

-- Step 5: Verify the constraint
SELECT 
  CONSTRAINT_NAME,
  CHECK_CLAUSE
FROM 
  INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE 
  TABLE_SCHEMA = 'booking_database'
  AND TABLE_NAME = 'payment'
  AND COLUMN_NAME = 'method';

