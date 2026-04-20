-- CreateTable
CREATE TABLE `JobAlert` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `keyword` VARCHAR(191) NULL,
    `location` VARCHAR(191) NULL,
    `type` ENUM('FULL_TIME', 'PART_TIME', 'INTERN', 'FREELANCE', 'REMOTE') NULL,
    `minSalary` INTEGER NULL,
    `maxExperienceYears` INTEGER NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `lastCheckedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JobAlert_candidateId_idx`(`candidateId`),
    INDEX `JobAlert_candidateId_isActive_idx`(`candidateId`, `isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AlertNotification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `alertId` INTEGER NOT NULL,
    `candidateId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AlertNotification_candidateId_idx`(`candidateId`),
    INDEX `AlertNotification_candidateId_isRead_idx`(`candidateId`, `isRead`),
    INDEX `AlertNotification_jobId_idx`(`jobId`),
    UNIQUE INDEX `AlertNotification_alertId_jobId_key`(`alertId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `JobAlert` ADD CONSTRAINT `JobAlert_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_alertId_fkey` FOREIGN KEY (`alertId`) REFERENCES `JobAlert`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `AlertNotification` ADD CONSTRAINT `AlertNotification_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
