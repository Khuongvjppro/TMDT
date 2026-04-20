-- AlterTable
ALTER TABLE `CompanyReview` ADD COLUMN `jobId` INTEGER NULL;

-- Backfill jobId from employer's earliest job for existing rows
UPDATE `CompanyReview` cr
JOIN (
    SELECT `employerId`, MIN(`id`) AS `jobId`
    FROM `Job`
    GROUP BY `employerId`
) j ON j.`employerId` = cr.`employerId`
SET cr.`jobId` = j.`jobId`
WHERE cr.`jobId` IS NULL;

-- Remove rows that cannot be mapped to a job
DELETE FROM `CompanyReview` WHERE `jobId` IS NULL;

-- Make jobId required and update constraints
ALTER TABLE `CompanyReview` MODIFY COLUMN `jobId` INTEGER NOT NULL;

DROP INDEX `CompanyReview_candidateId_employerId_key` ON `CompanyReview`;

CREATE UNIQUE INDEX `CompanyReview_candidateId_jobId_key` ON `CompanyReview`(`candidateId`, `jobId`);
CREATE INDEX `CompanyReview_jobId_idx` ON `CompanyReview`(`jobId`);

-- AddForeignKey
ALTER TABLE `CompanyReview` ADD CONSTRAINT `CompanyReview_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
