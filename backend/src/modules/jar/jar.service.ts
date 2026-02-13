import { prisma } from "../../lib/prisma.js";
import type { JarSize, JarStatus } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Resolve batchId (human e.g. AMR-001 or UUID) to Batch.id (UUID) for Jar FK */
async function resolveBatchIdToUuid(batchId: string): Promise<string> {
  const trimmed = batchId.trim();
  if (UUID_REGEX.test(trimmed)) {
    const batch = await prisma.batch.findUnique({ where: { id: trimmed } });
    if (!batch) throw new Error("Batch not found.");
    return batch.id;
  }
  const batch = await prisma.batch.findUnique({
    where: { batchId: trimmed.toUpperCase() },
  });
  if (!batch) throw new Error(`Batch not found: ${trimmed}`);
  return batch.id;
}

export type CreateJarInput = {
  batchId: string;
  size: JarSize;
  jarId?: string; // optional; if not provided we generate UUID
};

export type UpdateJarInput = {
  status?: JarStatus;
  customerId?: string | null;
};

export const jarService = {
  async create(data: CreateJarInput) {
    const batchUuid = await resolveBatchIdToUuid(data.batchId);
    const jarId = data.jarId ?? uuidv4();
    return prisma.jar.create({
      data: {
        jarId,
        batchId: batchUuid,
        size: data.size,
        status: "AVAILABLE",
      },
      include: { batch: true },
    });
  },

  async createMany(batchIdInput: string, size: JarSize, count: number) {
    const batchUuid = await resolveBatchIdToUuid(batchIdInput);
    const jars = await prisma.$transaction(
      Array.from({ length: count }, () =>
        prisma.jar.create({
          data: {
            jarId: uuidv4(),
            batchId: batchUuid,
            size,
            status: "AVAILABLE",
          },
          include: { batch: true },
        })
      )
    );
    return jars;
  },

  async update(id: string, data: UpdateJarInput) {
    return prisma.jar.update({
      where: { id },
      data,
      include: { batch: true, customer: true },
    });
  },

  async getById(id: string) {
    return prisma.jar.findUnique({
      where: { id },
      include: { batch: true, customer: true },
    });
  },

  async getByJarId(jarId: string) {
    return prisma.jar.findUnique({
      where: { jarId },
      include: { batch: true, customer: true },
    });
  },

  /** Count AVAILABLE jars per size for a batch (batch.id UUID). Used for buy page stock. */
  async getAvailableCountsBySize(batchIdUuid: string): Promise<Record<JarSize, number>> {
    const rows = await prisma.jar.groupBy({
      by: ["size"],
      where: { batchId: batchIdUuid, status: "AVAILABLE" },
      _count: { id: true },
    });
    const out: Record<JarSize, number> = {
      SIZE_250ML: 0,
      SIZE_500ML: 0,
      SIZE_1L: 0,
    };
    for (const r of rows) {
      out[r.size] = r._count.id;
    }
    return out;
  },

  async listAdmin(filters?: { batchId?: string; status?: JarStatus; size?: JarSize }) {
    let batchIdFilter: string | undefined;
    if (filters?.batchId?.trim()) {
      batchIdFilter = await resolveBatchIdToUuid(filters.batchId.trim());
    }
    return prisma.jar.findMany({
      where: {
        ...(batchIdFilter && { batchId: batchIdFilter }),
        ...(filters?.status && { status: filters.status }),
        ...(filters?.size && { size: filters.size }),
      },
      include: { batch: true, customer: true },
      orderBy: { createdAt: "desc" },
    });
  },
};
