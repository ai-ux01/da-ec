import { describe, it, expect } from "vitest";
import crypto from "crypto";
import { paymentService } from "./payment.service.js";

describe("paymentService.verifySignature", () => {
  it("returns true when signature is valid", () => {
    const secret = "test_razorpay_secret";
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const body = `${orderId}|${paymentId}`;
    const signature = crypto.createHmac("sha256", secret).update(body).digest("hex");
    expect(paymentService.verifySignature(orderId, paymentId, signature, secret)).toBe(true);
  });

  it("returns false when signature is tampered", () => {
    const secret = "test_razorpay_secret";
    const orderId = "order_abc123";
    const paymentId = "pay_xyz789";
    const signature = "invalid_signature";
    expect(paymentService.verifySignature(orderId, paymentId, signature, secret)).toBe(false);
  });

  it("returns false when secret is empty", () => {
    expect(paymentService.verifySignature("order_1", "pay_1", "sig", "")).toBe(false);
  });
});
