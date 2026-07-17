import { Request, Response } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import {
  createVnpayUrl,
  formatVnpayDate,
  getClientIp,
  getVnpayConfig,
  normalizeVnpayQuery,
  parseVnpayDate,
  verifyVnpayQuery,
  VnpayParams,
} from "../lib/vnpay";

const createPaymentSchema = z.object({
  packageId: z.coerce.number().int().positive(),
  bankCode: z.string().trim().max(30).optional(),
  locale: z.enum(["vn", "en"]).default("vn"),
});

type PaymentResult =
  | { kind: "invalid_signature" }
  | { kind: "not_found" }
  | { kind: "invalid_amount"; transactionCode: string }
  | {
      kind: "processed";
      transactionCode: string;
      successful: boolean;
      responseCode: string;
    };

function createTransactionCode(userId: number) {
  return `VNP${Date.now()}U${userId}`;
}

function callbackSucceeded(params: VnpayParams) {
  return (
    params.vnp_ResponseCode === "00" &&
    (!params.vnp_TransactionStatus || params.vnp_TransactionStatus === "00")
  );
}

async function processVnpayCallback(params: VnpayParams): Promise<PaymentResult> {
  const config = getVnpayConfig();
  if (!verifyVnpayQuery(params, config.hashSecret)) {
    return { kind: "invalid_signature" };
  }

  const transactionCode = params.vnp_TxnRef || "";
  const transaction = await prisma.employerTransaction.findUnique({
    where: { transactionCode },
  });
  if (!transaction) return { kind: "not_found" };

  const callbackAmount = Number(params.vnp_Amount);
  if (
    !Number.isSafeInteger(callbackAmount) ||
    callbackAmount !== transaction.amountCents * 100
  ) {
    return { kind: "invalid_amount", transactionCode };
  }

  const successful = callbackSucceeded(params);
  const responseCode = params.vnp_ResponseCode || "99";
  const commonData = {
    gatewayTransactionNo: params.vnp_TransactionNo || null,
    gatewayResponseCode: responseCode,
    bankCode: params.vnp_BankCode || null,
  };

  if (successful) {
    await prisma.$transaction(async (tx) => {
      const claimed = await tx.employerTransaction.updateMany({
        where: { id: transaction.id, status: { not: "SUCCESS" } },
        data: {
          ...commonData,
          status: "SUCCESS",
          paidAt: parseVnpayDate(params.vnp_PayDate) || new Date(),
        },
      });

      if (claimed.count === 1) {
        const employer = await tx.user.findUnique({
          where: { id: transaction.employerId },
          select: { email: true },
        });
        const pkg = await tx.billingPackage.findUnique({
          where: { id: transaction.packageId },
        });
        let reputationPoints = 0;
        if (pkg?.name === "Starter") reputationPoints = 10;
        else if (pkg?.name === "Growth") reputationPoints = 30;
        else if (pkg?.name === "Scale") reputationPoints = 100;

        await tx.employerProfile.upsert({
          where: { userId: transaction.employerId },
          update: {
            credits: { increment: transaction.credits },
            reputation: { increment: reputationPoints },
          },
          create: {
            userId: transaction.employerId,
            companyName: `${employer?.email.split("@")[0] || "Employer"} Company`,
            credits: transaction.credits,
            reputation: reputationPoints,
          },
        });
      }
    });
  } else {
    await prisma.employerTransaction.updateMany({
      where: { id: transaction.id, status: "PENDING" },
      data: { ...commonData, status: "FAILED" },
    });
  }

  return { kind: "processed", transactionCode, successful, responseCode };
}

export async function createVnpayPayment(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ message: "Unauthorized" });

  const parsed = createPaymentSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      message: "Invalid payment payload",
      errors: parsed.error.flatten(),
    });
  }

  let config: ReturnType<typeof getVnpayConfig>;
  try {
    config = getVnpayConfig();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "VNPAY is not configured";
    return res.status(503).json({ message });
  }
  const selectedPackage = await prisma.billingPackage.findFirst({
    where: { id: parsed.data.packageId, isActive: true },
  });
  if (!selectedPackage) {
    return res.status(404).json({ message: "Billing package not found" });
  }

  const now = new Date();
  const expiresAt = new Date(now.getTime() + 15 * 60 * 1000);
  const transactionCode = createTransactionCode(req.user.userId);
  const item = await prisma.employerTransaction.create({
    data: {
      transactionCode,
      employerId: req.user.userId,
      packageId: selectedPackage.id,
      amountCents: selectedPackage.price,
      credits: selectedPackage.maxJobPosts,
      status: "PENDING",
      paymentGateway: "VNPAY",
      expiresAt,
    },
    include: {
      package: {
        select: {
          id: true,
          name: true,
          price: true,
          durationDays: true,
          maxJobPosts: true,
        },
      },
    },
  });

  const params: VnpayParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: config.tmnCode,
    vnp_Amount: String(selectedPackage.price * 100),
    vnp_CreateDate: formatVnpayDate(now),
    vnp_CurrCode: "VND",
    vnp_IpAddr: getClientIp(req),
    vnp_Locale: parsed.data.locale,
    vnp_OrderInfo: `Thanh toan goi ${selectedPackage.name} - ${transactionCode}`,
    vnp_OrderType: "other",
    vnp_ReturnUrl: config.returnUrl,
    vnp_TxnRef: transactionCode,
    vnp_ExpireDate: formatVnpayDate(expiresAt),
  };
  if (parsed.data.bankCode) params.vnp_BankCode = parsed.data.bankCode;

  return res.status(201).json({
    paymentUrl: createVnpayUrl(config.paymentUrl, params, config.hashSecret),
    item,
  });
}

export async function handleVnpayReturn(req: Request, res: Response) {
  const config = getVnpayConfig();
  const result = await processVnpayCallback(normalizeVnpayQuery(req.query));
  const redirectUrl = new URL("/employer/billing/result", config.frontendOrigin);

  if (result.kind === "processed") {
    redirectUrl.searchParams.set("status", result.successful ? "success" : "failed");
    redirectUrl.searchParams.set("transactionCode", result.transactionCode);
    redirectUrl.searchParams.set("responseCode", result.responseCode);
  } else {
    redirectUrl.searchParams.set("status", result.kind);
    if ("transactionCode" in result) {
      redirectUrl.searchParams.set("transactionCode", result.transactionCode);
    }
  }

  return res.redirect(redirectUrl.toString());
}

export async function handleVnpayIpn(req: Request, res: Response) {
  const result = await processVnpayCallback(normalizeVnpayQuery(req.query));

  if (result.kind === "invalid_signature") {
    return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });
  }
  if (result.kind === "not_found") {
    return res.status(200).json({ RspCode: "01", Message: "Order not found" });
  }
  if (result.kind === "invalid_amount") {
    return res.status(200).json({ RspCode: "04", Message: "Invalid amount" });
  }

  return res.status(200).json({ RspCode: "00", Message: "Confirm Success" });
}
