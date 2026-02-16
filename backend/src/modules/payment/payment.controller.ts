import type { Request, Response } from "express";
import type { CustomerAuthRequest } from "../../lib/middleware.js";
import { paymentService, PaymentError } from "./payment.service.js";
import { CheckoutError } from "../order/order.service.js";

export const paymentController = {
  async createOrder(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const body = req.body as {
      address_id: string;
      batch_id: string;
      amount_paise: number;
      items: Array<{ size: "SIZE_250ML" | "SIZE_500ML" | "SIZE_1L"; quantity: number }>;
    };
    if (!body.address_id || !body.batch_id || body.amount_paise == null || !Array.isArray(body.items)) {
      res.status(400).json({ error: "Missing required: address_id, batch_id, amount_paise, items" });
      return;
    }
    try {
      const result = await paymentService.createPaymentOrder({
        customerId,
        addressId: body.address_id,
        batchId: body.batch_id,
        amountPaise: body.amount_paise,
        items: body.items,
      });
      res.status(201).json(result);
    } catch (e) {
      if (e instanceof PaymentError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("create-order error:", e);
      res.status(500).json({ error: "Failed to create order. Please try again." });
      return;
    }
  },

  async createOrderCod(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const body = req.body as {
      address_id: string;
      batch_id: string;
      amount_paise: number;
      items: Array<{ size: "SIZE_250ML" | "SIZE_500ML" | "SIZE_1L"; quantity: number }>;
    };
    if (!body.address_id || !body.batch_id || !Array.isArray(body.items)) {
      res.status(400).json({ error: "Missing required: address_id, batch_id, items" });
      return;
    }
    const amountPaise = body.amount_paise != null ? Number(body.amount_paise) : 0;
    try {
      const result = await paymentService.createOrderCod({
        customerId,
        addressId: body.address_id,
        batchId: body.batch_id,
        amountPaise,
        items: body.items,
      });
      res.status(201).json(result);
    } catch (e) {
      if (e instanceof PaymentError || e instanceof CheckoutError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("create-order-cod error:", e);
      res.status(500).json({ error: "Failed to place order. Please try again." });
      return;
    }
  },

  async verify(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const body = req.body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    };
    if (!body.razorpay_order_id || !body.razorpay_payment_id || !body.razorpay_signature) {
      res.status(400).json({ error: "Missing required: razorpay_order_id, razorpay_payment_id, razorpay_signature" });
      return;
    }
    try {
      const result = await paymentService.verifyAndFulfill(
        body.razorpay_order_id,
        body.razorpay_payment_id,
        body.razorpay_signature
      );
      res.json(result);
    } catch (e) {
      if (e instanceof PaymentError) {
        res.status(400).json({ error: e.message });
        return;
      }
      console.error("payment verify error:", e);
      res.status(500).json({ error: "Payment verification failed. Please try again." });
      return;
    }
  },

  async webhook(req: Request, res: Response) {
    const rawBody = (req as Request & { rawBody?: string }).rawBody;
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    if (!rawBody || !signature) {
      res.status(400).json({ error: "Missing body or signature" });
      return;
    }
    try {
      const ok = await paymentService.handleWebhook(rawBody, signature);
      if (!ok) {
        res.status(400).json({ error: "Invalid webhook signature" });
        return;
      }
      res.json({ received: true });
    } catch (e) {
      console.error("payment webhook error:", e);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  },
};
