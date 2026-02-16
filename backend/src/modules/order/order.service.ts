import { randomBytes } from "crypto";
import { prisma } from "../../lib/prisma.js";
import type { PaymentStatus, DeliveryStatus, JarSize } from "@prisma/client";

export type CreateOrderInput = {
  orderId: string;
  customerId: string;
  jarId: string;
  batchId: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  address: string;
  addressId?: string | null;
};

export type CheckoutOrderInput = {
  customerId: string;
  addressId?: string;
  jarId?: string;
  batchId?: string;
  size?: JarSize;
  /** When creating order after Razorpay success, pass PAID. Default PENDING. */
  paymentStatus?: PaymentStatus;
  /** Order value in paise (for revenue). Set from payment session or COD cart total split. */
  amountPaise?: number;
};

export type UpdateOrderInput = {
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  address?: string;
};

function formatAddressLine(addr: {
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
}): string {
  const parts = [
    `${addr.name}, ${addr.phone}`,
    addr.addressLine1,
    addr.addressLine2 || null,
    `${addr.city}, ${addr.state} - ${addr.pincode}`,
  ].filter(Boolean);
  return parts.join("\n");
}

function generateOrderId(): string {
  return `ORD-${Date.now()}-${randomBytes(3).toString("hex")}`;
}

export class CheckoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CheckoutError";
  }
}

export const orderService = {
  async create(data: CreateOrderInput) {
    return prisma.order.create({
      data: {
        orderId: data.orderId,
        customerId: data.customerId,
        jarId: data.jarId,
        batchId: data.batchId,
        paymentStatus: data.paymentStatus ?? "PENDING",
        deliveryStatus: data.deliveryStatus ?? "PENDING",
        address: data.address,
        addressId: data.addressId ?? null,
      },
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
    });
  },

  async createFromCheckout(data: CheckoutOrderInput) {
    const customerId = data.customerId;

    const address = data.addressId
      ? await prisma.address.findFirst({ where: { id: data.addressId, customerId } })
      : await prisma.address.findFirst({ where: { customerId, isDefault: true } });

    if (!address) {
      throw new CheckoutError("No shipping address. Add an address first.");
    }

    let jar: { id: string; batchId: string; batch: { id: string } };
    if (data.jarId) {
      const found = await prisma.jar.findFirst({
        where: { jarId: data.jarId, status: "AVAILABLE" },
        include: { batch: true },
      });
      if (!found) throw new CheckoutError("Jar not available.");
      jar = found;
    } else if (data.batchId && data.size) {
      // Resolve human batchId (e.g. AMR-001) to Batch.id (UUID) for Jar lookup
      const batch = await prisma.batch.findUnique({
        where: { batchId: data.batchId.toUpperCase().trim() },
      });
      if (!batch) throw new CheckoutError("Batch not found.");
      const found = await prisma.jar.findFirst({
        where: { batchId: batch.id, size: data.size, status: "AVAILABLE" },
        include: { batch: true },
      });
      if (!found) {
        throw new CheckoutError(
          `No jar available for this batch and size. Batch: ${data.batchId}, size: ${data.size}. Run \`npx prisma db seed\` in the backend folder to create stock, or in Admin > Jars add jars for this batch and size.`
        );
      }
      jar = found;
    } else {
      throw new CheckoutError("Provide jarId or batchId and size.");
    }

    const orderId = generateOrderId();
    const addressText = formatAddressLine(address);

    return prisma.$transaction(async (tx) => {
      const paymentStatus = data.paymentStatus ?? "PENDING";
      const createData = {
        orderId,
        customerId,
        jarId: jar.id,
        batchId: jar.batchId,
        paymentStatus,
        deliveryStatus: "PENDING",
        address: addressText,
        addressId: address.id,
        amountPaise: data.amountPaise ?? null,
      };
      const order = await tx.order.create({
        data: createData as Parameters<typeof tx.order.create>[0]["data"],
        include: { customer: true, jar: true, batch: true, shippingAddress: true },
      });

      await tx.jar.update({
        where: { id: jar.id },
        data: { status: "SOLD", customerId },
      });

      return order;
    });
  },

  async listByCustomer(customerId: string) {
    return prisma.order.findMany({
      where: { customerId },
      include: { jar: true, batch: true, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getByIdForCustomer(id: string, customerId: string) {
    return prisma.order.findFirst({
      where: { id, customerId },
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
    });
  },

  async update(id: string, data: UpdateOrderInput) {
    return prisma.order.update({
      where: { id },
      data,
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
    });
  },

  async getById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
    });
  },

  async getByOrderId(orderId: string) {
    return prisma.order.findUnique({
      where: { orderId },
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
    });
  },

  async listAdmin(filters?: { customerId?: string; paymentStatus?: PaymentStatus; deliveryStatus?: DeliveryStatus }) {
    return prisma.order.findMany({
      where: {
        ...(filters?.customerId && { customerId: filters.customerId }),
        ...(filters?.paymentStatus && { paymentStatus: filters.paymentStatus }),
        ...(filters?.deliveryStatus && { deliveryStatus: filters.deliveryStatus }),
      },
      include: { customer: true, jar: true, batch: true, shippingAddress: true },
      orderBy: { createdAt: "desc" },
    });
  },

  /** Admin dashboard: aggregate counts and revenue from orders. */
  async getAdminStats() {
    const [total, paid, pending, refunded, pendingDelivery, shipped, delivered, revenueResult] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { paymentStatus: "PAID" } }),
      prisma.order.count({ where: { paymentStatus: "PENDING" } }),
      prisma.order.count({ where: { paymentStatus: "REFUNDED" } }),
      prisma.order.count({ where: { paymentStatus: "PAID", deliveryStatus: "PENDING" } }),
      prisma.order.count({ where: { deliveryStatus: "SHIPPED" } }),
      prisma.order.count({ where: { deliveryStatus: "DELIVERED" } }),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { amountPaise: true },
      } as Parameters<typeof prisma.order.aggregate>[0]),
    ]);
    const totalRevenuePaise = (revenueResult as unknown as { _sum: { amountPaise: number | null } })._sum.amountPaise ?? 0;
    return {
      totalOrders: total,
      paidOrders: paid,
      pendingPaymentOrders: pending,
      refundedOrders: refunded,
      pendingDelivery,
      shipped,
      delivered,
      totalRevenuePaise,
    };
  },
};
