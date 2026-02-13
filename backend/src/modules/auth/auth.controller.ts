import type { Response } from "express";
import type { CustomerAuthRequest } from "../../lib/middleware.js";
import { authService } from "./auth.service.js";

export const authController = {
  async requestOtp(req: CustomerAuthRequest, res: Response) {
    const phone = (req.body as { phone?: string }).phone;
    if (!phone?.trim()) {
      res.status(400).json({ error: "Missing phone" });
      return;
    }
    const result = await authService.requestOtp(phone.trim());
    if ("error" in result) {
      const status = result.error.includes("Too many") ? 429 : 400;
      res.status(status).json({ error: result.error });
      return;
    }
    res.json({ ok: true });
  },

  async verifyOtp(req: CustomerAuthRequest, res: Response) {
    const body = (req.body ?? {}) as { phone?: string; otp?: string; otpCode?: string };
    const phone = body.phone?.trim();
    const otp = (body.otp ?? body.otpCode)?.trim();
    if (!phone || !otp) {
      res.status(400).json({
        error: !req.body ? "Invalid request (no body). Send JSON with phone and otp." : "Missing phone or otp",
      });
      return;
    }
    const result = await authService.verifyOtp(phone, otp);
    if ("error" in result) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.json({ token: result.token, customer: result.customer });
  },

  async me(req: CustomerAuthRequest, res: Response) {
    if (!req.customer?.customerId) {
      res.status(401).json({ error: "Not authenticated" });
      return;
    }
    const customer = await authService.getMe(req.customer.customerId);
    if (!customer) {
      res.status(404).json({ error: "Customer not found" });
      return;
    }
    res.json(customer);
  },
};
