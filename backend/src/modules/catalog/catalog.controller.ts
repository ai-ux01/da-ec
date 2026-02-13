import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { catalogService } from "./catalog.service.js";

export const catalogController = {
  async getPublic(_req: AuthRequest, res: Response) {
    const catalog = await catalogService.getCatalog();
    res.json(catalog);
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const list = await catalogService.listAdmin();
    res.json(list);
  },

  async create(req: AuthRequest, res: Response) {
    const body = req.body as {
      productId: string;
      name: string;
      description: string;
      sizes: Array<{ id: string; label: string; price: number; inr: string }>;
      defaultSizeId: string;
      sortOrder?: number;
    };
    if (!body.productId || !body.name || !body.description || !body.sizes?.length || !body.defaultSizeId) {
      res.status(400).json({ error: "Missing required: productId, name, description, sizes, defaultSizeId" });
      return;
    }
    try {
      const product = await catalogService.create({
        productId: body.productId,
        name: body.name,
        description: body.description,
        sizes: body.sizes,
        defaultSizeId: body.defaultSizeId,
        sortOrder: body.sortOrder,
      });
      res.status(201).json(product);
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2002") {
        res.status(409).json({ error: "productId already exists" });
        return;
      }
      throw e;
    }
  },

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as Record<string, unknown>;
    try {
      const product = await catalogService.update(id, body);
      res.json(product);
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      throw e;
    }
  },

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    try {
      await catalogService.delete(id);
      res.status(204).send();
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Product not found" });
        return;
      }
      throw e;
    }
  },
};
