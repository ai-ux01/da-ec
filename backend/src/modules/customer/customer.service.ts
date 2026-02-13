import { prisma } from "../../lib/prisma.js";

export type CreateCustomerInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
};

export type UpdateCustomerInput = {
  name?: string;
  phone?: string | null;
  email?: string | null;
  firstOrderBatchId?: string | null;
  repeatCount?: number;
  complaints?: string | null;
  notes?: string | null;
};

export const customerService = {
  async create(data: CreateCustomerInput) {
    return prisma.customer.create({
      data: {
        name: data.name,
        phone: data.phone ?? null,
        email: data.email ?? null,
        notes: data.notes ?? null,
      },
    });
  },

  async update(id: string, data: UpdateCustomerInput) {
    return prisma.customer.update({
      where: { id },
      data,
    });
  },

  async getById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: { jars: true, orders: true },
    });
  },

  async listAdmin(filters?: { search?: string }) {
    const where = filters?.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" as const } },
            { email: { contains: filters.search, mode: "insensitive" as const } },
            { phone: { contains: filters.search, mode: "insensitive" as const } },
          ],
        }
      : {};
    return prisma.customer.findMany({
      where,
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
    });
  },
};
