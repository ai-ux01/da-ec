import type { Response } from "express";
import type { Request } from "express";
import { createMagicLink, verifyMagicLink, signToken } from "../../lib/auth.js";

export const adminAuthController = {
  async requestLink(req: Request, res: Response) {
    const email = (req.body as { email?: string }).email;
    if (!email?.trim()) {
      res.status(400).json({ error: "Missing email" });
      return;
    }
    const { link } = await createMagicLink(email.trim());
    if (process.env.NODE_ENV !== "production") {
      res.json({ message: "Magic link generated", dev_link: link });
    } else {
      res.json({ message: "If this email is registered, you will receive a link shortly." });
    }
  },

  async verify(req: Request, res: Response) {
    const token = (req.query as { token?: string }).token;
    if (!token) {
      res.status(400).json({ error: "Missing token" });
      return;
    }
    const admin = await verifyMagicLink(token);
    if (!admin) {
      res.status(401).json({ error: "Invalid or expired link" });
      return;
    }
    const jwt = signToken({ adminId: admin.adminId, email: admin.email });
    res.json({ token: jwt });
  },
};
