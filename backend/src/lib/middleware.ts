import type { Request, Response, NextFunction } from "express";
import { verifyToken, verifyCustomerToken, type JwtPayload, type CustomerJwtPayload } from "./auth.js";

export type AuthRequest = Request & { admin?: JwtPayload };

export type CustomerAuthRequest = Request & { customer?: CustomerJwtPayload };

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing or invalid authorization" });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.admin = payload;
  next();
}

export function requireCustomer(req: CustomerAuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    res.status(401).json({ error: "Missing or invalid authorization" });
    return;
  }

  const payload = verifyCustomerToken(token);
  if (!payload) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  req.customer = payload;
  next();
}
