import type { Response } from "express";
import type { AuthRequest } from "../../lib/middleware.js";
import { labService } from "./lab.service.js";
import { uploadToS3 } from "../../lib/s3.js";

function serializeReport(r: { fatPercent?: unknown; moisture?: unknown; ffa?: unknown; [k: string]: unknown }) {
  const out = { ...r };
  if (out.fatPercent != null) out.fatPercent = Number(out.fatPercent);
  if (out.moisture != null) out.moisture = Number(out.moisture);
  if (out.ffa != null) out.ffa = Number(out.ffa);
  return out;
}

export const labController = {
  async upload(req: AuthRequest, res: Response) {
    const file = (req as unknown as { file?: Express.Multer.File }).file;
    if (!file?.buffer) {
      res.status(400).json({ error: "No PDF file uploaded" });
      return;
    }
    const body = req.body as {
      batchId: string;
      fatPercent?: number;
      moisture?: number;
      ffa?: number;
      antibioticPass: string;
      remarks?: string;
    };
    if (!body.batchId) {
      res.status(400).json({ error: "Missing batchId" });
      return;
    }
    const key = `lab-reports/${body.batchId}/${Date.now()}-${file.originalname || "report.pdf"}`.replace(/\s+/g, "-");
    const reportUrl = await uploadToS3(key, file.buffer, file.mimetype || "application/pdf");
    const report = await labService.create({
      batchId: body.batchId,
      reportUrl,
      fatPercent: body.fatPercent != null ? Number(body.fatPercent) : null,
      moisture: body.moisture != null ? Number(body.moisture) : null,
      ffa: body.ffa != null ? Number(body.ffa) : null,
      antibioticPass: body.antibioticPass === "true" || body.antibioticPass === "1",
      remarks: body.remarks ?? null,
    });
    res.status(201).json(serializeReport(report));
  },

  async listByBatch(req: AuthRequest, res: Response) {
    const batchId = req.params.batchId as string;
    const list = await labService.listByBatch(batchId);
    res.json(list.map(serializeReport));
  },

  async listAdmin(req: AuthRequest, res: Response) {
    const list = await labService.listAdmin();
    res.json(list.map(serializeReport));
  },

  async getById(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    const report = await labService.getById(id);
    if (!report) {
      res.status(404).json({ error: "Lab report not found" });
      return;
    }
    res.json(serializeReport(report));
  },

  async delete(req: AuthRequest, res: Response) {
    const id = req.params.id as string;
    try {
      await labService.delete(id);
      res.status(204).send();
    } catch (e) {
      const err = e as { code?: string };
      if (err.code === "P2025") {
        res.status(404).json({ error: "Lab report not found" });
        return;
      }
      throw e;
    }
  },
};
