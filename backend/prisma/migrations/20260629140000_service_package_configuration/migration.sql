-- AlterTable: evolve BillingPackage to service package fields
ALTER TABLE `BillingPackage`
    CHANGE COLUMN `priceCents` `price` INTEGER NOT NULL,
    CHANGE COLUMN `credits` `maxJobPosts` INTEGER NOT NULL,
    ADD COLUMN `durationDays` INTEGER NOT NULL DEFAULT 30;

-- AlterTable: audit log for package actions
ALTER TABLE `AuditLog` ADD COLUMN `targetPackageId` INTEGER NULL,
    MODIFY `action` ENUM(
        'USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED', 'STATUS_CHANGED',
        'JOB_APPROVED', 'JOB_REJECTED',
        'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
        'PACKAGE_CREATED', 'PACKAGE_UPDATED', 'PACKAGE_DELETED', 'PACKAGE_STATUS_CHANGED'
    ) NOT NULL;

-- CreateIndex
CREATE INDEX `BillingPackage_isActive_idx` ON `BillingPackage`(`isActive`);
CREATE INDEX `AuditLog_targetPackageId_createdAt_idx` ON `AuditLog`(`targetPackageId`, `createdAt`);

-- AddForeignKey
ALTER TABLE `AuditLog` ADD CONSTRAINT `AuditLog_targetPackageId_fkey` FOREIGN KEY (`targetPackageId`) REFERENCES `BillingPackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
