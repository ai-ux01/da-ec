import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { batchService } from "./batch.service.js";
import { jarService } from "../jar/jar.service.js";
import type { BatchStatus } from "@prisma/client";

function serializeLabReport(r: { fatPercent?: unknown; moisture?: unknown; ffa?: unknown; [k: string]: unknown }) {
  const out = { ...r };
  if (out.fatPercent != null) out.fatPercent = Number(out.fatPercent);
  if (out.moisture != null) out.moisture = Number(out.moisture);
  if (out.ffa != null) out.ffa = Number(out.ffa);
  return out;
}

function serializeBatch(b: { milkLiters?: unknown; gheeOutputLiters?: unknown; labReports?: unknown[]; [k: string]: unknown }) {
  const out = { ...b };
  if (out.milkLiters != null) out.milkLiters = Number(out.milkLiters);
  if (out.gheeOutputLiters != null) out.gheeOutputLiters = Number(out.gheeOutputLiters);
  if (Array.isArray(out.labReports)) {
    out.labReports = out.labReports.map((r) => serializeLabReport(r as Record<string, unknown>));
  }
  return out;
}

export const batchController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const body = req.body as {
        batchId: string;
        farmId: string;
        date: string;
        cowsCount: number;
        milkLiters: number;
        gheeOutputLiters: number;
        processingNotes?: string;
      };
      if (!body.batchId || !body.farmId || !body.date || body.cowsCount == null || body.milkLiters == null || body.gheeOutputLiters == null) {
        res.status(400).json({ error: "Missing required fields: batchId, farmId, date, cowsCount, milkLiters, gheeOutputLiters" });
        return;
      }
      const batch = await batchService.create({
        batchId: body.batchId,
        farmId: body.farmId,
        date: new Date(body.date),
        cowsCount: Number(body.cowsCount),
        milkLiters: Number(body.milkLiters),
        gheeOutputLiters: Number(body.gheeOutputLiters),
        processingNotes: body.processingNotes,
      });
      res.status(201).json(serializeBatch(batch));
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2002") {
        res.status(409).json({ error: "Batch ID already exists" });
        return;
      }
      if (err.code === "P2003") {
        res.status(400).json({ error: "Invalid farmId" });
        return;
      }
      throw e;
    }
  },

  async update(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const body = req.body as Record<string, unknown>;
    const allowed = ["farmId", "date", "cowsCount", "milkLiters", "gheeOutputLiters", "processingNotes", "status"];
    const data: Record<string, unknown> = {};
    for (const k of allowed) {
      if (body[k] !== undefined) data[k] = body[k];
    }
    if (body.date) data.date = new Date(body.date as string);
    try {
      const batch = await batchService.update(id, data as Parameters<typeof batchService.update>[1]);
      res.json(serializeBatch(batch));
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Batch not found" });
        return;
      }
      throw e;
    }
  },

  async approve(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    try {
      const batch = await batchService.approve(id);
      res.json(serializeBatch(batch));
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Batch not found" });
        return;
      }
      throw e;
    }
  },

  async reject(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    try {
      const batch = await batchService.reject(id);
      res.json(serializeBatch(batch));
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Batch not found" });
        return;
      }
      throw e;
    }
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const status = req.query.status as BatchStatus | undefined;
    const farmId = req.query.farmId as string | undefined;
    const list = await batchService.listAdmin({ status, farmId });
    res.json(list.map(serializeBatch));
  },

  async getByBatchId(req: AuthRequest, res: Response) {
    const batchId = req.params.batch_id as string;
    const batch = await batchService.getByBatchId(batchId);
    if (!batch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }
    res.json(serializeBatch(batch));
  },

  async listPublic(_req: AuthRequest, res: Response) {
    const list = await batchService.listPublic();
    res.json(list.map(serializeBatch));
  },

  /** Public: available jar counts by size for first approved batch (for buy page). */
  async getStockAvailability(_req: AuthRequest, res: Response) {
    const list = await batchService.listPublic();
    const batch = list[0];
    if (!batch) {
      return res.json({ SIZE_250ML: 0, SIZE_500ML: 0, SIZE_1L: 0 });
    }
    const counts = await jarService.getAvailableCountsBySize(batch.id);
    res.json(counts);
  },
};
