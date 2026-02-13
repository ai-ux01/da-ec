import { Router } from "express";
import { requireCustomer } from "../../lib/middleware.js";
import { authController } from "./auth.controller.js";

export const authRouter = Router();

// POST /auth/request-otp and POST /auth/verify-otp are registered on the main api router (routes/index.ts) so they stay public

authRouter.get("/auth/me", requireCustomer, authController.me.bind(authController));
