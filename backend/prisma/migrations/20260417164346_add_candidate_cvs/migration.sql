-- CreateTable
CREATE TABLE `CandidateCv` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `candidateId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `cvUrl` VARCHAR(191) NOT NULL,
    `summary` TEXT NULL,
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `CandidateCv_candidateId_idx`(`candidateId`),
    INDEX `CandidateCv_candidateId_isDefault_idx`(`candidateId`, `isDefault`),
    UNIQUE INDEX `CandidateCv_candidateId_title_key`(`candidateId`, `title`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CandidateCv` ADD CONSTRAINT `CandidateCv_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
