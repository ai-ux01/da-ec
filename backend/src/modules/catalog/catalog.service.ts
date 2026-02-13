import { prisma } from "../../lib/prisma.js";

export type ProductSize = { id: string; label: string; price: number; inr: string };

export type CatalogProductPayload = {
  id: string;
  name: string;
  description: string;
  sizes: ProductSize[];
  defaultSizeId: string;
};

export const catalogService = {
  async getCatalog(): Promise<{ products: CatalogProductPayload[] }> {
    const rows = await prisma.catalogProduct.findMany({
      orderBy: { sortOrder: "asc" },
    });
    const products: CatalogProductPayload[] = rows.map((r) => ({
      id: r.productId,
      name: r.name,
      description: r.description,
      sizes: r.sizes as ProductSize[],
      defaultSizeId: r.defaultSizeId,
    }));
    return { products };
  },

  async listAdmin() {
    return prisma.catalogProduct.findMany({
      orderBy: { sortOrder: "asc" },
    });
  },

  async create(data: {
    productId: string;
    name: string;
    description: string;
    sizes: ProductSize[];
    defaultSizeId: string;
    sortOrder?: number;
  }) {
    return prisma.catalogProduct.create({
      data: {
        productId: data.productId,
        name: data.name,
        description: data.description,
        sizes: data.sizes,
        defaultSizeId: data.defaultSizeId,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  },

  async update(
    id: string,
    data: Partial<{
      productId: string;
      name: string;
      description: string;
      sizes: ProductSize[];
      defaultSizeId: string;
      sortOrder: number;
    }>
  ) {
    return prisma.catalogProduct.update({
      where: { id },
      data,
    });
  },

  async delete(id: string) {
    return prisma.catalogProduct.delete({ where: { id } });
  },

  async getById(id: string) {
    return prisma.catalogProduct.findUnique({ where: { id } });
  },
};
