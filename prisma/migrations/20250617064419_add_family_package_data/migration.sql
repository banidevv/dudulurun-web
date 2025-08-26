-- AlterTable
ALTER TABLE `Registration` ADD COLUMN `familyPackageData` JSON NULL,
    MODIFY `shirtSize` VARCHAR(191) NULL,
    MODIFY `packageType` VARCHAR(191) NULL;
