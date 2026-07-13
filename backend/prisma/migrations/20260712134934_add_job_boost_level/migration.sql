-- AlterTable
ALTER TABLE `job` ADD COLUMN `boostLevel` INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX `Job_boostLevel_idx` ON `Job`(`boostLevel`);
