-- AlterTable
ALTER TABLE `Registration` ADD COLUMN `fbclid` VARCHAR(191) NULL,
    ADD COLUMN `referralSource` VARCHAR(191) NULL,
    ADD COLUMN `utmCampaign` VARCHAR(191) NULL,
    ADD COLUMN `utmMedium` VARCHAR(191) NULL,
    ADD COLUMN `utmSource` VARCHAR(191) NULL;
