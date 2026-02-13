import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { jarService } from "./jar.service.js";
import type { JarSize } from "@prisma/client";

export const jarController = {
  async create(req: AuthRequest, res: Response) {
    const body = req.body as { batchId: string; size: JarSize; jarId?: string };
    if (!body.batchId || !body.size) {
      res.status(400).json({ error: "Missing required: batchId, size (SIZE_250ML | SIZE_500ML | SIZE_1L)" });
      return;
    }
    const validSizes: JarSize[] = ["SIZE_250ML", "SIZE_500ML", "SIZE_1L"];
    if (!validSizes.includes(body.size)) {
      res.status(400).json({ error: "Invalid size" });
      return;
    }
    try {
      const jar = await jarService.create({
        batchId: body.batchId,
        size: body.size,
        jarId: body.jarId,
      });
      res.status(201).json(jar);
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2002") {
        res.status(409).json({ error: "jarId already exists" });
        return;
      }
      if (err.code === "P2003") {
        res.status(400).json({ error: "Invalid batchId" });
        return;
      }
      throw e;
    }
  },

  async createMany(req: AuthRequest, res: Response) {
    const body = req.body as { batchId: string; size: JarSize; count: number };
    if (!body.batchId || !body.size || body.count == null || body.count < 1) {
      res.status(400).json({ error: "Missing or invalid: batchId, size, count (>= 1)" });
      return;
    }
    const validSizes: JarSize[] = ["SIZE_250ML", "SIZE_500ML", "SIZE_1L"];
    if (!validSizes.includes(body.size)) {
      res.status(400).json({ error: "Invalid size" });
      return;
    }
    try {
      const jars = await jarService.createMany(body.batchId, body.size, Math.min(body.count, 1000));
      res.status(201).json({ count: jars.length, jars });
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2003") {
        res.status(400).json({ error: "Invalid batchId" });
        return;
      }
      throw e;
    }
  },

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as { status?: string; customerId?: string | null };
    const data: { status?: "AVAILABLE" | "SOLD"; customerId?: string | null } = {};
    if (body.status !== undefined) data.status = body.status as "AVAILABLE" | "SOLD";
    if (body.customerId !== undefined) data.customerId = body.customerId;
    const jar = await jarService.update(id, data);
    res.json(jar);
  },

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const jar = await jarService.getById(id);
    if (!jar) {
      res.status(404).json({ error: "Jar not found" });
      return;
    }
    res.json(jar);
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const batchId = req.query.batchId as string | undefined;
    const status = req.query.status as "AVAILABLE" | "SOLD" | undefined;
    const size = req.query.size as JarSize | undefined;
    const list = await jarService.listAdmin({ batchId, status, size });
    res.json(list);
  },
};
