import { Router } from "express";
import { authController as customerAuthController } from "../modules/auth/auth.controller.js";
import { authRouter as customerAuthRouter } from "../modules/auth/auth.routes.js";
import { addressRouter } from "../modules/address/address.routes.js";
import { adminAuthController } from "../modules/admin/auth.controller.js";
import { authRouter } from "../modules/admin/auth.routes.js";
import { batchController } from "../modules/batch/batch.controller.js";
import { batchRouter } from "../modules/batch/batch.routes.js";
import { catalogController } from "../modules/catalog/catalog.controller.js";
import { catalogRouter } from "../modules/catalog/catalog.routes.js";
import { siteRouter } from "../modules/site/site.routes.js";
import { farmRouter } from "../modules/farm/farm.routes.js";
import { jarRouter } from "../modules/jar/jar.routes.js";
import { requireAdmin } from "../lib/middleware.js";
import { labController } from "../modules/lab/lab.controller.js";
import { labRouter, labUpload } from "../modules/lab/lab.routes.js";
import { orderRouter } from "../modules/order/order.routes.js";
import { paymentRouter } from "../modules/payment/payment.routes.js";
import { customerRouter } from "../modules/customer/customer.routes.js";
import { config } from "../lib/config.js";

const api = Router();

// Public catalog — first route so GET /api/catalog never hits requireAdmin
const catalogHandler = catalogController.getPublic.bind(catalogController);
api.get("/catalog", catalogHandler);
api.get("/catalog/", catalogHandler);

// Public auth (OTP) — no auth required; register first so never hits requireCustomer
api.post("/auth/request-otp", customerAuthController.requestOtp.bind(customerAuthController));
api.post("/auth/verify-otp", customerAuthController.verifyOtp.bind(customerAuthController));

// Public batch routes — register before routers that use global requireCustomer (e.g. addressRouter)
api.get("/batches/public", batchController.listPublic.bind(batchController));
api.get("/batch/:batch_id", batchController.getByBatchId.bind(batchController));
// Public stock availability (for buy page quantity limits)
api.get("/stock/availability", batchController.getStockAvailability.bind(batchController));

// Public admin auth (magic link) — no auth required; register before addressRouter (requireCustomer)
api.post("/admin/auth/request-link", adminAuthController.requestLink.bind(adminAuthController));
api.get("/admin/auth/verify", adminAuthController.verify.bind(adminAuthController));

// Admin lab routes — register before addressRouter (requireCustomer) so admin token is used
api.post("/lab-reports/upload", requireAdmin, labUpload.single("file"), labController.upload.bind(labController));
api.get("/lab-reports", requireAdmin, labController.listAdmin.bind(labController));
api.delete("/lab-reports/:id", requireAdmin, labController.delete.bind(labController));

// Admin catalog routes — register before addressRouter so admin token is used (not requireCustomer)
api.get("/admin/catalog", requireAdmin, catalogController.listAdmin.bind(catalogController));
api.post("/admin/catalog/products", requireAdmin, catalogController.create.bind(catalogController));
api.put("/admin/catalog/products/:id", requireAdmin, catalogController.update.bind(catalogController));
api.delete("/admin/catalog/products/:id", requireAdmin, catalogController.delete.bind(catalogController));

api.use(customerAuthRouter);
api.use(addressRouter);
api.use(authRouter);
api.use(batchRouter);
api.use(labRouter);
api.use(catalogRouter);
api.use(siteRouter);
api.use(farmRouter);
api.use(jarRouter);
api.use(orderRouter);
api.use(paymentRouter);
api.use(customerRouter);

export function mountRoutes(root: Router) {
  root.use(config.apiPrefix, api);
}
