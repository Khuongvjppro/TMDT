-- Candidate UC05-UC15: profile, CVs, saved jobs, alerts, reviews and chat.
ALTER TABLE `CandidateProfile`
  ADD COLUMN `jobTitle` VARCHAR(191) NULL,
  ADD COLUMN `address` VARCHAR(191) NULL,
  ADD COLUMN `skills` TEXT NULL,
  ADD COLUMN `experienceYears` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `Job`
  ADD COLUMN `experienceYears` INTEGER NOT NULL DEFAULT 0;

ALTER TABLE `Application`
  MODIFY `status` ENUM('PENDING', 'REVIEWING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN') NOT NULL DEFAULT 'PENDING',
  ADD COLUMN `withdrawnAt` DATETIME(3) NULL;

CREATE TABLE `CandidateCv` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `candidateId` INTEGER NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `cvUrl` VARCHAR(191) NOT NULL,
  `summary` TEXT NULL,
  `isDefault` BOOLEAN NOT NULL DEFAULT false,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `CandidateCv_candidateId_createdAt_idx`(`candidateId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `SavedJob` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `candidateId` INTEGER NOT NULL,
  `jobId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `SavedJob_candidateId_jobId_key`(`candidateId`, `jobId`),
  INDEX `SavedJob_jobId_idx`(`jobId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `JobAlert` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `candidateId` INTEGER NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `keyword` VARCHAR(191) NULL,
  `location` VARCHAR(191) NULL,
  `type` ENUM('FULL_TIME', 'PART_TIME', 'INTERN', 'FREELANCE', 'REMOTE') NULL,
  `minSalary` INTEGER NULL,
  `salaryMax` INTEGER NULL,
  `maxExperienceYears` INTEGER NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `lastCheckedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `JobAlert_candidateId_isActive_idx`(`candidateId`, `isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `CompanyReview` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `candidateId` INTEGER NOT NULL,
  `employerId` INTEGER NOT NULL,
  `rating` INTEGER NOT NULL,
  `title` VARCHAR(191) NULL,
  `comment` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `CompanyReview_candidateId_employerId_key`(`candidateId`, `employerId`),
  INDEX `CompanyReview_employerId_createdAt_idx`(`employerId`, `createdAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Conversation` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `candidateId` INTEGER NOT NULL,
  `employerId` INTEGER NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  UNIQUE INDEX `Conversation_candidateId_employerId_key`(`candidateId`, `employerId`),
  INDEX `Conversation_employerId_updatedAt_idx`(`employerId`, `updatedAt`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `ChatMessage` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `conversationId` INTEGER NOT NULL,
  `senderId` INTEGER NOT NULL,
  `content` TEXT NOT NULL,
  `readAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `ChatMessage_conversationId_createdAt_idx`(`conversationId`, `createdAt`),
  INDEX `ChatMessage_senderId_idx`(`senderId`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `CandidateCv` ADD CONSTRAINT `CandidateCv_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SavedJob` ADD CONSTRAINT `SavedJob_jobId_fkey` FOREIGN KEY (`jobId`) REFERENCES `Job`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `JobAlert` ADD CONSTRAINT `JobAlert_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CompanyReview` ADD CONSTRAINT `CompanyReview_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `CompanyReview` ADD CONSTRAINT `CompanyReview_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_candidateId_fkey` FOREIGN KEY (`candidateId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Conversation` ADD CONSTRAINT `Conversation_employerId_fkey` FOREIGN KEY (`employerId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `Conversation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `ChatMessage` ADD CONSTRAINT `ChatMessage_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
