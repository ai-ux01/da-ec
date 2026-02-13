import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { farmController } from "./farm.controller.js";

export const farmRouter = Router();

farmRouter.use(requireAdmin);

farmRouter.post("/farms", farmController.create.bind(farmController));
farmRouter.get("/farms", farmController.list.bind(farmController));
farmRouter.get("/farms/:id", farmController.getById.bind(farmController));
