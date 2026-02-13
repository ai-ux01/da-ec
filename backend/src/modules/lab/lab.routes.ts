import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../../lib/middleware.js";
import { labController } from "./lab.controller.js";
import { labService } from "./lab.service.js";

export const labUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF allowed"));
    }
  },
});

function serializeReport(r: { fatPercent?: unknown; moisture?: unknown; ffa?: unknown; [k: string]: unknown }) {
  const out = { ...r };
  if (out.fatPercent != null) out.fatPercent = Number(out.fatPercent);
  if (out.moisture != null) out.moisture = Number(out.moisture);
  if (out.ffa != null) out.ffa = Number(out.ffa);
  return out;
}

export const labRouter = Router();

// Public: list lab reports by batch_id (e.g. AMR-001)
labRouter.get("/batch/:batch_id/lab-reports", async (req, res) => {
  const batchIdHuman = req.params.batch_id as string;
  const list = await labService.listByBatchId(batchIdHuman);
  res.json(list.map(serializeReport));
});

labRouter.use(requireAdmin);

labRouter.post("/lab-reports/upload", labUpload.single("file"), labController.upload.bind(labController));
labRouter.get("/lab-reports", labController.listAdmin.bind(labController));
labRouter.get("/lab-reports/:id", labController.getById.bind(labController));
