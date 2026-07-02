-- CreateTable
CREATE TABLE `Review` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `rating` INTEGER NOT NULL,
    `content` TEXT NOT NULL,
    `isHidden` BOOLEAN NOT NULL DEFAULT false,
    `hideReason` TEXT NULL,
    `hiddenAt` DATETIME(3) NULL,
    `hiddenBy` INTEGER NULL,
    `authorId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Review_authorId_jobId_key`(`authorId`, `jobId`),
    INDEX `Review_isHidden_idx`(`isHidden`),
    INDEX `Review_jobId_idx`(`jobId`),
    INDEX `Review_rating_idx`(`rating`),
    INDEX `Review_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `AuditLog` ADD COLUMN `targetReviewId` INTEGER NULL,
    MODIFY `action` ENUM(
        'USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED', 'STATUS_CHANGED',
        'JOB_APPROVED', 'JOB_REJECTED',
        'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
        'PACKAGE_CREATED', 'PACKAGE_UPDATED', 'PACKAGE_DELETED', 'PACKAGE_STATUS_CHANGED',
        'REVIEW_HIDDEN', 'REVIEW_RESTORED'
    ) NOT NULL;

-- CreateIndex
CREATE INDEX `AuditLog_targetReviewId_createdAt_idx` ON `AuditLog`(`targetReviewId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `Review` ADD CONSTRAINT `Review_authorId_fkey` FOREIGN KEY (`authorId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Review` ADD CONSTRAINT `Review_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Review` ADD CONSTRAINT `Review_hiddenBy_fkey` FOREIGN KEY (`hiddenBy`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_targetReviewId_fkey` FOREIGN KEY (`targetReviewId`) REFERENCES `Review`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
