import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { batchController } from "./batch.controller.js";

export const batchRouter = Router();

// Public (read-only): get batch by batch_id for transparency
batchRouter.get("/batch/:batch_id", batchController.getByBatchId.bind(batchController));
// Public: list approved batches with lab reports (for frontend lab reports page)
batchRouter.get("/batches/public", batchController.listPublic.bind(batchController));

// Admin-only
batchRouter.use(requireAdmin);

batchRouter.post("/batches", batchController.create.bind(batchController));
batchRouter.get("/batches", batchController.listAdmin.bind(batchController));
batchRouter.patch("/batches/:id", batchController.update.bind(batchController));
batchRouter.post("/batches/:id/approve", batchController.approve.bind(batchController));
batchRouter.post("/batches/:id/reject", batchController.reject.bind(batchController));
