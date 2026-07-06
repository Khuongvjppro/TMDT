-- Existing jobs predate moderation and were already publicly visible.
UPDATE `Job`
SET `status` = 'APPROVED',
    `publishedAt` = COALESCE(`publishedAt`, `createdAt`)
WHERE `isActive` = true
  AND `status` = 'PENDING';

-- Admin user management emits these actions when creating or inviting users.
ALTER TABLE `AuditLog`
MODIFY `action` ENUM(
  'USER_LOCKED', 'USER_UNLOCKED', 'USER_DELETED', 'ROLE_CHANGED',
  'STATUS_CHANGED', 'USER_CREATED', 'USER_INVITED',
  'JOB_APPROVED', 'JOB_REJECTED',
  'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
  'PACKAGE_CREATED', 'PACKAGE_UPDATED', 'PACKAGE_DELETED',
  'PACKAGE_STATUS_CHANGED', 'REVIEW_HIDDEN', 'REVIEW_RESTORED'
) NOT NULL;
