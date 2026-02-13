import { Router } from "express";
import { requireCustomer } from "../../lib/middleware.js";
import { addressController } from "./address.controller.js";

export const addressRouter = Router();

addressRouter.use(requireCustomer);

addressRouter.post("/address", addressController.create.bind(addressController));
addressRouter.get("/address", addressController.list.bind(addressController));
addressRouter.put("/address/:id", addressController.update.bind(addressController));
addressRouter.delete("/address/:id", addressController.delete.bind(addressController));
