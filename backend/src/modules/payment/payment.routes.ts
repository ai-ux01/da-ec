import { Router } from "express";
import { requireCustomer } from "../../lib/middleware.js";
import { paymentController } from "./payment.controller.js";

export const paymentRouter = Router();

paymentRouter.post("/payment/create-order", requireCustomer, paymentController.createOrder.bind(paymentController));
paymentRouter.post("/payment/create-order-cod", requireCustomer, paymentController.createOrderCod.bind(paymentController));
paymentRouter.post("/payment/verify", requireCustomer, paymentController.verify.bind(paymentController));
// Webhook is mounted in server.ts with raw body parser
