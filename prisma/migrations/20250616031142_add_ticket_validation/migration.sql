-- AlterTable
ALTER TABLE `Registration` ADD COLUMN `ticketUsed` BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE `ScannerAccess` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `secretCode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `lastUsedAt` DATETIME(3) NULL,

    UNIQUE INDEX `ScannerAccess_secretCode_key`(`secretCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
