import crypto from "crypto";
import Razorpay from "razorpay";
import { prisma } from "../../lib/prisma.js";
import { config } from "../../lib/config.js";
import { orderService, CheckoutError } from "../order/order.service.js";
import type { JarSize } from "@prisma/client";

export type PaymentSessionItem = { size: JarSize; quantity: number };

export type CreatePaymentOrderInput = {
  customerId: string;
  addressId: string;
  batchId: string;
  amountPaise: number;
  items: PaymentSessionItem[];
};

export class PaymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PaymentError";
  }
}

const PAYMENT_SESSION_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

function getRazorpay(): Razorpay {
  if (!config.razorpay.keyId || !config.razorpay.keySecret) {
    throw new PaymentError("Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }
  return new Razorpay({ key_id: config.razorpay.keyId, key_secret: config.razorpay.keySecret });
}

export const paymentService = {
  async createPaymentOrder(data: CreatePaymentOrderInput) {
    if (data.amountPaise < 100) {
      throw new PaymentError("Amount must be at least ₹1 (100 paise).");
    }
    const address = await prisma.address.findFirst({
      where: { id: data.addressId, customerId: data.customerId },
    });
    if (!address) {
      throw new PaymentError("Address not found.");
    }
    const expiredAt = new Date(Date.now() - PAYMENT_SESSION_EXPIRY_MS);
    await prisma.paymentSession.updateMany({
      where: { status: "PENDING", createdAt: { lt: expiredAt } },
      data: { status: "EXPIRED" },
    });
    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: data.amountPaise,
      currency: "INR",
      receipt: `amrytum-${Date.now()}`,
    });
    await prisma.paymentSession.create({
      data: {
        razorpayOrderId: order.id,
        customerId: data.customerId,
        addressId: data.addressId,
        batchId: data.batchId,
        amountPaise: data.amountPaise,
        items: data.items as object,
        status: "PENDING",
      },
    });
    return {
      razorpayOrderId: order.id,
      keyId: config.razorpay.keyId,
      amount: order.amount,
      currency: order.currency,
    };
  },

  /** Exported for unit tests. Verifies Razorpay payment signature. */
  verifySignature(orderId: string, paymentId: string, signature: string, secret?: string): boolean {
    const key = secret ?? config.razorpay.keySecret;
    if (!key) return false;
    const body = `${orderId}|${paymentId}`;
    const expected = crypto.createHmac("sha256", key).update(body).digest("hex");
    return expected === signature;
  },

  async verifyAndFulfill(orderId: string, paymentId: string, signature: string) {
    if (!this.verifySignature(orderId, paymentId, signature)) {
      throw new PaymentError("Invalid payment signature.");
    }
    const session = await prisma.paymentSession.findUnique({
      where: { razorpayOrderId: orderId, status: "PENDING" },
      include: { address: true },
    });
    if (!session) {
      throw new PaymentError("Payment session not found or already completed.");
    }
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(paymentId);
    if (payment.status !== "captured") {
      throw new PaymentError("Payment not captured.");
    }
    const items = session.items as PaymentSessionItem[];
    const orders: Awaited<ReturnType<typeof orderService.createFromCheckout>>[] = [];
    for (const item of items) {
      for (let q = 0; q < item.quantity; q++) {
        const order = await orderService.createFromCheckout({
          customerId: session.customerId,
          addressId: session.addressId,
          batchId: session.batchId,
          size: item.size,
          paymentStatus: "PAID",
        });
        orders.push(order);
      }
    }
    await prisma.paymentSession.update({
      where: { id: session.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    return { orders };
  },

  /** Fulfill session (used by webhook after signature verified). Does not verify signature. */
  async fulfillSession(razorpayOrderId: string, razorpayPaymentId: string): Promise<void> {
    const session = await prisma.paymentSession.findUnique({
      where: { razorpayOrderId, status: "PENDING" },
    });
    if (!session) return;
    const razorpay = getRazorpay();
    const payment = await razorpay.payments.fetch(razorpayPaymentId);
    if (payment.status !== "captured") return;
    const items = session.items as PaymentSessionItem[];
    for (const item of items) {
      for (let q = 0; q < item.quantity; q++) {
        await orderService.createFromCheckout({
          customerId: session.customerId,
          addressId: session.addressId,
          batchId: session.batchId,
          size: item.size,
          paymentStatus: "PAID",
        });
      }
    }
    await prisma.paymentSession.update({
      where: { id: session.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
  },

  async handleWebhook(payload: string, signature: string): Promise<boolean> {
    const secret = config.razorpay.webhookSecret;
    if (!secret) return false;
    const expected = crypto.createHmac("sha256", secret).update(payload).digest("hex");
    if (expected !== signature) return false;
    const body = JSON.parse(payload) as { event: string; payload?: { payment?: { entity?: { id: string; order_id: string } } } };
    if (body.event !== "payment.captured") return true;
    const paymentId = body.payload?.payment?.entity?.id;
    const orderId = body.payload?.payment?.entity?.order_id;
    if (!paymentId || !orderId) return true;
    try {
      await this.fulfillSession(orderId, paymentId);
    } catch (err) {
      console.error("Payment webhook fulfillSession error:", err);
    }
    return true;
  },
};
