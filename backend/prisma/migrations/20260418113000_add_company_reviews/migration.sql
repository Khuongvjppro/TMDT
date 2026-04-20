-- CreateTable
CREATE TABLE `CompanyReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `employerId` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `comment` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CompanyReview_candidateId_idx`(`candidateId`),
    INDEX `CompanyReview_employerId_idx`(`employerId`),
    UNIQUE INDEX `CompanyReview_candidateId_employerId_key`(`candidateId`, `employerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CompanyReview` ADD CONSTRAINT `CompanyReview_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CompanyReview` ADD CONSTRAINT `CompanyReview_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
