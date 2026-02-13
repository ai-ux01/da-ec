import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import { prisma } from "./prisma.js";
import { config } from "./config.js";

const JWT_SECRET = config.jwt.secret;
const EXPIRES_IN = config.jwt.expiresIn;
const MAGIC_LINK_EXPIRY_MS = config.magicLink.tokenExpiryMinutes * 60 * 1000;

export type JwtPayload = { adminId: string; email: string };

export type CustomerJwtPayload = { customerId: string; phone: string };

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function signCustomerToken(payload: CustomerJwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: config.customerJwt.expiresIn as jwt.SignOptions["expiresIn"],
  });
}

export function verifyCustomerToken(token: string): CustomerJwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as CustomerJwtPayload;
    return decoded;
  } catch {
    return null;
  }
}

export function generateMagicLinkToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createMagicLink(email: string): Promise<{ link: string; token: string }> {
  const token = generateMagicLinkToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MS);

  let admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!admin) {
    admin = await prisma.admin.create({
      data: {
        email: email.toLowerCase().trim(),
        magicLinkToken: token,
        magicLinkExpiresAt: expiresAt,
      },
    });
  } else {
    await prisma.admin.update({
      where: { id: admin.id },
      data: { magicLinkToken: token, magicLinkExpiresAt: expiresAt },
    });
  }

  const link = `${config.magicLink.baseUrl}?token=${token}`;
  return { link, token };
}

export async function verifyMagicLink(token: string): Promise<{ adminId: string; email: string } | null> {
  const admin = await prisma.admin.findFirst({
    where: {
      magicLinkToken: token,
      magicLinkExpiresAt: { gt: new Date() },
    },
  });
  if (!admin || !admin.magicLinkToken) return null;

  await prisma.admin.update({
    where: { id: admin.id },
    data: { magicLinkToken: null, magicLinkExpiresAt: null },
  });

  return { adminId: admin.id, email: admin.email };
}
