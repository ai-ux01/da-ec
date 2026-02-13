import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { farmService } from "./farm.service.js";

export const farmController = {
  async create(req: AuthRequest, res: Response) {
    const body = req.body as { name: string; location?: string; notes?: string };
    if (!body.name?.trim()) {
      res.status(400).json({ error: "Missing required: name" });
      return;
    }
    const farm = await farmService.create({
      name: body.name.trim(),
      location: body.location ?? null,
      notes: body.notes ?? null,
    });
    res.status(201).json(farm);
  },

  async list(req: AuthRequest, res: Response) {
    const list = await farmService.list();
    res.json(list);
  },

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const farm = await farmService.getById(id);
    if (!farm) {
      res.status(404).json({ error: "Farm not found" });
      return;
    }
    res.json(farm);
  },
};
