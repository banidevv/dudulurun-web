/*
  Migration: Replace OneSender with wa-multi-session
  
  This migration:
  1. Adds sessionId column with temporary default values based on existing data
  2. Removes apiKey and baseUrl columns (OneSender specific)
  3. Creates unique constraint on sessionId
*/

-- Step 1: Add sessionId column with default values based on existing session names
ALTER TABLE `WhatsAppSession` ADD COLUMN `sessionId` VARCHAR(191);

-- Step 2: Update sessionId for existing records (convert name to sessionId format)
UPDATE `WhatsAppSession` SET `sessionId` = LOWER(REPLACE(REPLACE(`name`, ' ', '_'), '-', '_')) WHERE `sessionId` IS NULL;

-- Step 3: Make sessionId NOT NULL and add unique constraint
ALTER TABLE `WhatsAppSession` MODIFY COLUMN `sessionId` VARCHAR(191) NOT NULL;
CREATE UNIQUE INDEX `WhatsAppSession_sessionId_key` ON `WhatsAppSession`(`sessionId`);

-- Step 4: Remove OneSender specific columns
ALTER TABLE `WhatsAppSession` DROP COLUMN `apiKey`;
ALTER TABLE `WhatsAppSession` DROP COLUMN `baseUrl`;
