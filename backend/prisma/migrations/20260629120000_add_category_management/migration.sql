-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_name_idx`(`name`),
    INDEX `Category_isDeleted_idx`(`isDeleted`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `targetCategoryId` INTEGER NULL,
    MODIFY `action` ENUM('USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED', 'STATUS_CHANGED', 'JOB_APPROVED', 'JOB_REJECTED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED') NOT NULL;

-- CreateIndex
CREATE INDEX `AuditLog_targetCategoryId_createdAt_idx` ON `AuditLog`(`targetCategoryId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_targetCategoryId_fkey` FOREIGN KEY (`targetCategoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
