import { prisma } from "../../lib/prisma.js";

export type CreateFarmInput = {
  name: string;
  location?: string | null;
  notes?: string | null;
};

export const farmService = {
  async create(data: CreateFarmInput) {
    return prisma.farm.create({
      data: {
        name: data.name,
        location: data.location ?? null,
        notes: data.notes ?? null,
      },
    });
  },

  async list() {
    return prisma.farm.findMany({
      orderBy: { name: "asc" },
    });
  },

  async getById(id: string) {
    return prisma.farm.findUnique({
      where: { id },
      include: { batches: true },
    });
  },
};
