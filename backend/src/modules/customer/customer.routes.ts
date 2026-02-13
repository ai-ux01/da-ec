import { Router } from "express";
import { requireAdmin } from "../../lib/middleware.js";
import { customerController } from "./customer.controller.js";

export const customerRouter = Router();

customerRouter.use(requireAdmin);

customerRouter.post("/customers", customerController.create.bind(customerController));
customerRouter.get("/customers", customerController.listAdmin.bind(customerController));
customerRouter.get("/customers/:id", customerController.getById.bind(customerController));
customerRouter.patch("/customers/:id", customerController.update.bind(customerController));
