-- AlterTable
ALTER TABLE `Registration` ADD COLUMN `referralCodeId` INTEGER NULL;

-- CreateTable
CREATE TABLE `ReferralCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `maxClaims` INTEGER NOT NULL,
    `usedClaims` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NULL,
    `validUntil` DATETIME(3) NULL,
    `discount` INTEGER NULL,
    `discountPercent` DOUBLE NULL,
    `applicableCategories` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ReferralCode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ReferralUsage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `referralCodeId` INTEGER NOT NULL,
    `registrationId` INTEGER NOT NULL,
    `usedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `ReferralUsage_referralCodeId_registrationId_key`(`referralCodeId`, `registrationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Registration` ADD CONSTRAINT `Registration_referralCodeId_fkey` FOREIGN KEY (`referralCodeId`) REFERENCES `ReferralCode`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferralUsage` ADD CONSTRAINT `ReferralUsage_referralCodeId_fkey` FOREIGN KEY (`referralCodeId`) REFERENCES `ReferralCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ReferralUsage` ADD CONSTRAINT `ReferralUsage_registrationId_fkey` FOREIGN KEY (`registrationId`) REFERENCES `Registration`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
