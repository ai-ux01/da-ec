import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { siteController } from "./site.controller.js";

export const siteRouter = Router();

siteRouter.get("/site", siteController.getPublic.bind(siteController));

siteRouter.use(requireAdmin);
siteRouter.get("/admin/site", siteController.getAdmin.bind(siteController));
siteRouter.put("/admin/site", siteController.update.bind(siteController));
