import { prisma } from "../../lib/prisma.js";
import type { BatchStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

export type CreateBatchInput = {
  batchId: string;
  farmId: string;
  date: Date;
  cowsCount: number;
  milkLiters: number;
  gheeOutputLiters: number;
  processingNotes?: string | null;
};

export type UpdateBatchInput = Partial<
  Omit<CreateBatchInput, "batchId"> & { status?: BatchStatus }
>;

export const batchService = {
  async create(data: CreateBatchInput) {
    return prisma.batch.create({
      data: {
        batchId: data.batchId.toUpperCase().trim(),
        farmId: data.farmId,
        date: data.date,
        cowsCount: data.cowsCount,
        milkLiters: new Prisma.Decimal(data.milkLiters),
        gheeOutputLiters: new Prisma.Decimal(data.gheeOutputLiters),
        processingNotes: data.processingNotes ?? null,
        status: "PENDING",
      },
      include: { farm: true },
    });
  },

  async update(id: string, data: UpdateBatchInput) {
    const payload: Prisma.BatchUpdateInput = { ...data };
    if (data.milkLiters != null) payload.milkLiters = new Prisma.Decimal(data.milkLiters);
    if (data.gheeOutputLiters != null) payload.gheeOutputLiters = new Prisma.Decimal(data.gheeOutputLiters);
    return prisma.batch.update({
      where: { id },
      data: payload,
      include: { farm: true },
    });
  },

  async approve(id: string) {
    return prisma.batch.update({
      where: { id },
      data: { status: "APPROVED" },
      include: { farm: true },
    });
  },

  async reject(id: string) {
    return prisma.batch.update({
      where: { id },
      data: { status: "REJECTED" },
      include: { farm: true },
    });
  },

  async listAdmin(filters?: { status?: BatchStatus; farmId?: string }) {
    return prisma.batch.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.farmId && { farmId: filters.farmId }),
      },
      include: { farm: true },
      orderBy: { date: "desc" },
    });
  },

  async getByBatchId(batchId: string) {
    return prisma.batch.findUnique({
      where: { batchId: batchId.toUpperCase().trim() },
      include: { farm: true, labReports: true },
    });
  },

  async getById(id: string) {
    return prisma.batch.findUnique({
      where: { id },
      include: { farm: true, labReports: true, jars: true },
    });
  },

  async listPublic() {
    return prisma.batch.findMany({
      where: { status: "APPROVED" },
      include: { farm: true, labReports: true },
      orderBy: { date: "desc" },
    });
  },
};
