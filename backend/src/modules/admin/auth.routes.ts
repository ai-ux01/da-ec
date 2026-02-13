import { Router } from "express";
import { adminAuthController } from "./auth.controller.js";

export const authRouter = Router();

authRouter.post("/admin/auth/request-link", adminAuthController.requestLink.bind(adminAuthController));
authRouter.get("/admin/auth/verify", adminAuthController.verify.bind(adminAuthController));
