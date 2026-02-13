import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { jarController } from "./jar.controller.js";

export const jarRouter = Router();

jarRouter.use(requireAdmin);

jarRouter.post("/jars", jarController.create.bind(jarController));
jarRouter.post("/jars/bulk", jarController.createMany.bind(jarController));
jarRouter.get("/jars", jarController.listAdmin.bind(jarController));
jarRouter.get("/jars/:id", jarController.getById.bind(jarController));
jarRouter.patch("/jars/:id", jarController.update.bind(jarController));
