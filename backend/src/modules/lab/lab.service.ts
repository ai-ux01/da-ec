import { prisma } from "../../lib/prisma.js";
import { Prisma } from "@prisma/client";

export type CreateLabReportInput = {
  batchId: string;
  reportUrl: string;
  fatPercent?: number | null;
  moisture?: number | null;
  ffa?: number | null;
  antibioticPass: boolean;
  remarks?: string | null;
};

export const labService = {
  async create(data: CreateLabReportInput) {
    return prisma.labReport.create({
      data: {
        batchId: data.batchId,
        reportUrl: data.reportUrl,
        fatPercent: data.fatPercent != null ? new Prisma.Decimal(data.fatPercent) : null,
        moisture: data.moisture != null ? new Prisma.Decimal(data.moisture) : null,
        ffa: data.ffa != null ? new Prisma.Decimal(data.ffa) : null,
        antibioticPass: data.antibioticPass,
        remarks: data.remarks ?? null,
      },
      include: { batch: true },
    });
  },

  async listByBatch(batchId: string) {
    return prisma.labReport.findMany({
      where: { batchId },
      include: { batch: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async getById(id: string) {
    return prisma.labReport.findUnique({
      where: { id },
      include: { batch: true },
    });
  },

  async listAdmin() {
    return prisma.labReport.findMany({
      include: { batch: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async listByBatchId(batchIdHuman: string) {
    const batch = await prisma.batch.findUnique({
      where: { batchId: batchIdHuman.toUpperCase().trim() },
    });
    if (!batch) return [];
    return prisma.labReport.findMany({
      where: { batchId: batch.id },
      include: { batch: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async delete(id: string) {
    return prisma.labReport.delete({ where: { id } });
  },
};
