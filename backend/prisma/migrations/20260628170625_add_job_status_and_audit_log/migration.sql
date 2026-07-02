-- AlterTable
ALTER TABLE `auditlog` ADD COLUMN `targetJobId` INTEGER NULL,
    MODIFY `action` ENUM('USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED', 'STATUS_CHANGED', 'JOB_APPROVED', 'JOB_REJECTED') NOT NULL;

-- AlterTable
ALTER TABLE `job` ADD COLUMN `publishedAt` DATETIME(3) NULL,
    ADD COLUMN `rejectReason` TEXT NULL,
    ADD COLUMN `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX `AuditLog_targetJobId_createdAt_idx` ON `AuditLog`(`targetJobId`, `createdAt`);

-- CreateIndex
CREATE INDEX `Job_status_idx` ON `Job`(`status`);

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_targetJobId_fkey` FOREIGN KEY (`targetJobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
