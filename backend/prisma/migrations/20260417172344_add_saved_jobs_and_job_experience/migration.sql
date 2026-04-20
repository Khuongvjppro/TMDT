-- AlterTable
ALTER TABLE `job` ADD COLUMN `minExperienceYears` INTEGER NULL;

-- CreateTable
CREATE TABLE `SavedJob` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `jobId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `SavedJob_candidateId_idx`(`candidateId`),
    INDEX `SavedJob_jobId_idx`(`jobId`),
    UNIQUE INDEX `SavedJob_candidateId_jobId_key`(`candidateId`, `jobId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
