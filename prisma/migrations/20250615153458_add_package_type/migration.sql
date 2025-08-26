/*
  Warnings:

  - Added the required column `packageType` to the `Registration` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column as nullable
ALTER TABLE `Registration` ADD COLUMN `packageType` VARCHAR(191) NULL;

-- Set a default value for existing records
UPDATE `Registration` SET `packageType` = 'full' WHERE `packageType` IS NULL;

-- Make the column required
ALTER TABLE `Registration` MODIFY COLUMN `packageType` VARCHAR(191) NOT NULL;
