import type { Request, Response } from "express";
import type { CustomerAuthRequest } from "../../lib/middleware.js";
import { paymentService, PaymentError } from "./payment.service.js";

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
      throw e;
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
      throw e;
    }
  },

  async webhook(req: Request, res: Response) {
    const rawBody = (req as Request & { rawBody?: string }).rawBody;
    const signature = req.headers["x-razorpay-signature"] as string | undefined;
    if (!rawBody || !signature) {
      res.status(400).json({ error: "Missing body or signature" });
      return;
    }
    const ok = await paymentService.handleWebhook(rawBody, signature);
    if (!ok) {
      res.status(400).json({ error: "Invalid webhook signature" });
      return;
    }
    res.json({ received: true });
  },
};
