import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { siteService } from "./site.service.js";

export const siteController = {
  async getPublic(_req: AuthRequest, res: Response) {
    const content = await siteService.get();
    res.json(content);
  },

  async getAdmin(_req: AuthRequest, res: Response) {
    const content = await siteService.get();
    res.json(content);
  },

  async update(req: AuthRequest, res: Response) {
    const body = req.body as {
      brand?: { name?: string; tagline?: string; subtext?: string; cta?: string };
      processSteps?: Array<{ number: number; title: string; description: string }>;
      founder?: { name?: string; title?: string; story?: string; philosophy?: string[]; imagePlaceholder?: boolean };
    };
    const current = await siteService.get();
    const merged = {
      brand: { ...current.brand, ...body.brand },
      processSteps: body.processSteps ?? current.processSteps,
      founder: { ...current.founder, ...body.founder },
    };
    const updated = await siteService.update(merged);
    res.json(updated);
  },
};
