import { Router } from "express";
import {
  handleVnpayIpn,
  handleVnpayReturn,
} from "../controllers/payment.controller";
import { asyncHandler } from "../middleware/async-handler";

const router = Router();

// Public endpoints called by VNPAY. Authenticity is provided by the HMAC
// signature rather than the application's JWT middleware.
router.get("/vnpay/return", asyncHandler(handleVnpayReturn));
router.get("/vnpay/ipn", asyncHandler(handleVnpayIpn));

export default router;
