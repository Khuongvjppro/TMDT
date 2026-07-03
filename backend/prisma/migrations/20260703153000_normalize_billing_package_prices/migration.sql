-- VNPAY/banks reject the tiny legacy demo amounts. Keep database values in
-- sync with prisma/seed.ts and use realistic VND package prices.
UPDATE `BillingPackage`
SET `price` = CASE `name`
    WHEN 'Starter' THEN 190000
    WHEN 'Growth' THEN 450000
    WHEN 'Scale' THEN 890000
    ELSE `price`
END
WHERE `name` IN ('Starter', 'Growth', 'Scale');
