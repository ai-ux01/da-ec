import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { catalogController } from "./catalog.controller.js";

export const catalogRouter = Router();

// Public: must be before use(requireAdmin) so GET /api/catalog is never protected
const getPublic = catalogController.getPublic.bind(catalogController);
catalogRouter.get("/catalog", getPublic);
catalogRouter.get("/catalog/", getPublic);

catalogRouter.use(requireAdmin);
catalogRouter.get("/admin/catalog", catalogController.listAdmin.bind(catalogController));
catalogRouter.post("/admin/catalog/products", catalogController.create.bind(catalogController));
catalogRouter.put("/admin/catalog/products/:id", catalogController.update.bind(catalogController));
catalogRouter.delete("/admin/catalog/products/:id", catalogController.delete.bind(catalogController));
