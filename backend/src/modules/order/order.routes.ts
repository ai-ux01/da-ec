import { Router } from "express";
import { requireAdmin, requireCustomer } from "../../lib/middleware.js";
import { orderController } from "./order.controller.js";

export const orderRouter = Router();

// Checkout gate: login + address required (no guest checkout)
orderRouter.post("/order/create", requireCustomer, orderController.createFromCheckout.bind(orderController));
orderRouter.get("/orders/me", requireCustomer, orderController.myOrders.bind(orderController));

orderRouter.use(requireAdmin);
orderRouter.post("/orders", orderController.create.bind(orderController));
orderRouter.get("/orders/stats", orderController.getStats.bind(orderController));
orderRouter.get("/orders", orderController.listAdmin.bind(orderController));
orderRouter.get("/orders/:id", orderController.getById.bind(orderController));
orderRouter.patch("/orders/:id", orderController.update.bind(orderController));
