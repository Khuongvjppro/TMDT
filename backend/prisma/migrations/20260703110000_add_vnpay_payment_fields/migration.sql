-- Store VNPAY Sandbox references and keep new purchases pending until a
-- signed Return/IPN callback confirms the payment.
ALTER TABLE `EmployerTransaction`
    MODIFY COLUMN `status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
    ADD COLUMN `paymentGateway` VARCHAR(20) NULL,
    ADD COLUMN `gatewayTransactionNo` VARCHAR(100) NULL,
    ADD COLUMN `gatewayResponseCode` VARCHAR(10) NULL,
    ADD COLUMN `bankCode` VARCHAR(30) NULL,
    ADD COLUMN `expiresAt` DATETIME(3) NULL,
    ADD COLUMN `paidAt` DATETIME(3) NULL;

CREATE INDEX `EmployerTransaction_status_idx`
    ON `EmployerTransaction`(`status`);

CREATE INDEX `EmployerTransaction_gatewayTransactionNo_idx`
    ON `EmployerTransaction`(`gatewayTransactionNo`);
