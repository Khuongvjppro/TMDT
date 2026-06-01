-- CreateTable
CREATE TABLE `BillingPackage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `credits` INTEGER NOT NULL,
    `priceCents` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `BillingPackage_name_key`(`name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EmployerTransaction` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transactionCode` VARCHAR(191) NOT NULL,
    `employerId` INTEGER NOT NULL,
    `packageId` INTEGER NOT NULL,
    `amountCents` INTEGER NOT NULL,
    `credits` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `EmployerTransaction_transactionCode_key`(`transactionCode`),
    INDEX `EmployerTransaction_employerId_createdAt_idx`(`employerId`, `createdAt`),
    INDEX `EmployerTransaction_packageId_idx`(`packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EmployerTransaction` ADD CONSTRAINT `EmployerTransaction_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EmployerTransaction` ADD CONSTRAINT `EmployerTransaction_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `BillingPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
