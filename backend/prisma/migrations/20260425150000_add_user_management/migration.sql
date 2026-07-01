-- MySQL Note: ENUMs are inline, not separate types
-- UserRole already has GUEST from schema, UserStatus and AuditActionType are inline below

-- AlterTable `User`
ALTER TABLE `User` 
ADD COLUMN `status` ENUM('ACTIVE', 'LOCKED', 'DELETED') NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN `violationCount` INTEGER NOT NULL DEFAULT 0,
ADD COLUMN `lockedAt` DATETIME(3),
ADD COLUMN `lockedBy` INTEGER,
ADD COLUMN `deletedAt` DATETIME(3),
ADD INDEX `User_status_idx`(`status`),
ADD INDEX `User_email_idx`(`email`);

-- CreateTable `AuditLog`
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `action` ENUM('USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED', 'STATUS_CHANGED') NOT NULL,
    `userId` INTEGER NOT NULL,
    `targetUserId` INTEGER,
    `details` LONGTEXT,
    `ipAddress` VARCHAR(191),
    `userAgent` VARCHAR(191),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`),
    INDEX `AuditLog_userId_createdAt_idx`(`userId`, `createdAt`),
    INDEX `AuditLog_targetUserId_createdAt_idx`(`targetUserId`, `createdAt`),
    INDEX `AuditLog_action_idx`(`action`),

    CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
