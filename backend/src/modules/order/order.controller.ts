import type { Response } from "express";
import type { AuthRequest, CustomerAuthRequest } from "../../lib/middleware.js";
import { orderService, CheckoutError } from "./order.service.js";
import type { PaymentStatus, DeliveryStatus } from "@prisma/client";
import type { JarSize } from "@prisma/client";

export const orderController = {
  async create(req: AuthRequest, res: Response) {
    const body = req.body as {
      orderId: string;
      customerId: string;
      jarId: string;
      batchId: string;
      paymentStatus?: PaymentStatus;
      deliveryStatus?: DeliveryStatus;
      address: string;
    };
    if (!body.orderId || !body.customerId || !body.jarId || !body.batchId || !body.address) {
      res.status(400).json({
        error: "Missing required: orderId, customerId, jarId, batchId, address",
      });
      return;
    }
    try {
      const order = await orderService.create({
        orderId: body.orderId,
        customerId: body.customerId,
        jarId: body.jarId,
        batchId: body.batchId,
        paymentStatus: body.paymentStatus,
        deliveryStatus: body.deliveryStatus,
        address: body.address,
      });
      res.status(201).json(order);
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2002") {
        res.status(409).json({ error: "orderId already exists" });
        return;
      }
      if (err.code === "P2003") {
        res.status(400).json({ error: "Invalid customerId, jarId, or batchId" });
        return;
      }
      throw e;
    }
  },

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as { paymentStatus?: PaymentStatus; deliveryStatus?: DeliveryStatus; address?: string };
    const data: { paymentStatus?: PaymentStatus; deliveryStatus?: DeliveryStatus; address?: string } = {};
    if (body.paymentStatus !== undefined) data.paymentStatus = body.paymentStatus;
    if (body.deliveryStatus !== undefined) data.deliveryStatus = body.deliveryStatus;
    if (body.address !== undefined) data.address = body.address;
    const order = await orderService.update(id, data);
    res.json(order);
  },

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const order = await orderService.getById(id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }
    res.json(order);
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const customerId = req.query.customerId as string | undefined;
    const paymentStatus = req.query.paymentStatus as PaymentStatus | undefined;
    const deliveryStatus = req.query.deliveryStatus as DeliveryStatus | undefined;
    const list = await orderService.listAdmin({ customerId, paymentStatus, deliveryStatus });
    res.json(list);
  },

  async getStats(req: AuthRequest, res: Response) {
    try {
      const stats = await orderService.getAdminStats();
      res.json(stats);
    } catch (e) {
      throw e;
    }
  },

  async createFromCheckout(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const body = req.body as {
      address_id?: string;
      jar_id?: string;
      batch_id?: string;
      size?: JarSize;
    };
    try {
      const order = await orderService.createFromCheckout({
        customerId,
        addressId: body.address_id,
        jarId: body.jar_id,
        batchId: body.batch_id,
        size: body.size,
      });
      res.status(201).json(order);
    } catch (e) {
      if (e instanceof CheckoutError) {
        res.status(400).json({ error: e.message });
        return;
      }
      throw e;
    }
  },

  async myOrders(req: CustomerAuthRequest, res: Response) {
    const customerId = req.customer?.customerId;
    if (!customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const list = await orderService.listByCustomer(customerId);
    res.json(list);
  },
};
