import crypto from "crypto";
import { Request } from "express";

export type VnpayParams = Record<string, string>;

export interface VnpayConfig {
  tmnCode: string;
  hashSecret: string;
  paymentUrl: string;
  returnUrl: string;
  frontendOrigin: string;
}

function requireEnvironment(name: string) {
  const value = process.env[name]?.trim();
  if (!value || /^(your_|replace_)/i.test(value)) {
    throw new Error(`${name} is required for VNPAY payments`);
  }
  return value;
}

export function getVnpayConfig(): VnpayConfig {
  const port = process.env.PORT || "4000";
  const frontendOrigin = (process.env.FRONTEND_ORIGIN || "http://localhost:3001")
    .split(",")[0]
    .trim();

  return {
    tmnCode: requireEnvironment("VNPAY_TMN_CODE"),
    hashSecret: requireEnvironment("VNPAY_HASH_SECRET"),
    paymentUrl:
      process.env.VNPAY_PAYMENT_URL?.trim() ||
      "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    returnUrl:
      process.env.VNPAY_RETURN_URL?.trim() ||
      `http://localhost:${port}/api/payments/vnpay/return`,
    frontendOrigin,
  };
}

function encodeVnpayValue(value: string) {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

export function canonicalizeVnpayParams(params: VnpayParams) {
  return Object.keys(params)
    .filter((key) => params[key] !== "")
    .sort()
    .map(
      (key) =>
        `${encodeVnpayValue(key)}=${encodeVnpayValue(params[key])}`,
    )
    .join("&");
}

export function signVnpayParams(params: VnpayParams, hashSecret: string) {
  return crypto
    .createHmac("sha512", hashSecret)
    .update(canonicalizeVnpayParams(params), "utf8")
    .digest("hex");
}

export function createVnpayUrl(
  paymentUrl: string,
  params: VnpayParams,
  hashSecret: string,
) {
  const query = canonicalizeVnpayParams(params);
  const secureHash = signVnpayParams(params, hashSecret);
  return `${paymentUrl}?${query}&vnp_SecureHash=${secureHash}`;
}

export function normalizeVnpayQuery(query: Request["query"]): VnpayParams {
  const result: VnpayParams = {};

  for (const [key, rawValue] of Object.entries(query)) {
    if (!key.startsWith("vnp_") || rawValue === undefined) continue;
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    if (typeof value === "string") result[key] = value;
  }

  return result;
}

export function verifyVnpayQuery(params: VnpayParams, hashSecret: string) {
  const receivedHash = params.vnp_SecureHash?.toLowerCase();
  if (!receivedHash) return false;

  const signedParams = { ...params };
  delete signedParams.vnp_SecureHash;
  delete signedParams.vnp_SecureHashType;
  const expectedHash = signVnpayParams(signedParams, hashSecret);

  const received = Buffer.from(receivedHash, "utf8");
  const expected = Buffer.from(expectedHash, "utf8");
  return received.length === expected.length && crypto.timingSafeEqual(received, expected);
}

export function formatVnpayDate(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Ho_Chi_Minh",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}${value.month}${value.day}${value.hour}${value.minute}${value.second}`;
}

export function parseVnpayDate(value?: string) {
  if (!value || !/^\d{14}$/.test(value)) return null;
  const iso = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}T${value.slice(8, 10)}:${value.slice(10, 12)}:${value.slice(12, 14)}+07:00`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded)
    ? forwarded[0]
    : forwarded?.split(",")[0] || req.socket.remoteAddress || "127.0.0.1";
  const ip = raw.trim().replace(/^::ffff:/, "");
  return ip === "::1" ? "127.0.0.1" : ip;
}
