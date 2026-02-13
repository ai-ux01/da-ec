import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { customerService } from "./customer.service.js";

export const customerController = {
  async create(req: AuthRequest, res: Response) {
    const body = req.body as { name: string; phone?: string; email?: string; notes?: string };
    if (!body.name?.trim()) {
      res.status(400).json({ error: "Missing required: name" });
      return;
    }
    const customer = await customerService.create({
      name: body.name.trim(),
      phone: body.phone ?? null,
      email: body.email ?? null,
      notes: body.notes ?? null,
    });
    res.status(201).json(customer);
  },

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as Record<string, unknown>;
    const allowed = ["name", "phone", "email", "firstOrderBatchId", "repeatCount", "complaints", "notes"];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    const customer = await customerService.update(id, data as Parameters<typeof customerService.update>[1]);
    res.json(customer);
  },

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const customer = await customerService.getById(id);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const search = req.query.search as string | undefined;
    const list = await customerService.listAdmin({ search });
    res.json(list);
  },
};
