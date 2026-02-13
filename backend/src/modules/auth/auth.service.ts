import { randomInt } from "crypto";
import { prisma } from "../../lib/prisma.js";
import { config } from "../../lib/config.js";
import { signCustomerToken } from "../../lib/auth.js";
import { sendOtpSms } from "./sms.mock.js";

const OTP_EXPIRY_MS = config.otp.expiryMinutes * 60 * 1000;
const OTP_LENGTH = config.otp.length;
const MAX_ATTEMPTS = config.otp.maxAttemptsPerPhone;

/** In development, use this fixed OTP for local testing (e.g. "123456"). */
const DUMMY_OTP_DEV = "123456";

function allowDummyOtp(): boolean {
  if (process.env.ALLOW_DUMMY_OTP === "true" || process.env.ALLOW_DUMMY_OTP === "1") return true;
  return config.nodeEnv !== "production";
}

function generateOtpCode(): string {
  if (allowDummyOtp()) {
    return DUMMY_OTP_DEV;
  }
  const max = 10 ** OTP_LENGTH - 1;
  const min = 10 ** (OTP_LENGTH - 1);
  return String(randomInt(min, max + 1));
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, "").trim();
}

export const authService = {
  async requestOtp(phone: string): Promise<{ ok: true } | { error: string }> {
    const normalized = normalizePhone(phone);
    if (!normalized || normalized.length < 10) {
      return { error: "Invalid phone number" };
    }

    const since = new Date(Date.now() - OTP_EXPIRY_MS);
    const recentCount = await prisma.otp.count({
      where: {
        phone: normalized,
        createdAt: { gte: since },
        used: false,
      },
    });
    if (recentCount >= MAX_ATTEMPTS) {
      return { error: "Too many OTP requests. Try again later." };
    }

    const otpCode = generateOtpCode();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

    await prisma.otp.create({
      data: {
        phone: normalized,
        otpCode,
        expiresAt,
      },
    });

    await sendOtpSms(normalized, otpCode);
    return { ok: true };
  },

  async verifyOtp(phone: string, otpCode: string): Promise<{ token: string; customer: { id: string; phone: string; name: string | null } } | { error: string }> {
    const normalized = normalizePhone(phone);
    const code = otpCode?.trim();
    if (!normalized || !code) {
      return { error: "Invalid phone or OTP" };
    }

    const isDummyOtpInDev = allowDummyOtp() && code === DUMMY_OTP_DEV;

    let otp: { id: string } | null = null;
    if (!isDummyOtpInDev) {
      otp = await prisma.otp.findFirst({
        where: {
          phone: normalized,
          otpCode: code,
          expiresAt: { gt: new Date() },
          used: false,
        },
        orderBy: { createdAt: "desc" },
      });
      if (!otp) {
        return { error: "Invalid or expired OTP" };
      }
      await prisma.otp.update({
        where: { id: otp.id },
        data: { used: true },
      });
    }

    let customer = await prisma.customer.findUnique({
      where: { phone: normalized },
    });
    if (!customer) {
      customer = await prisma.customer.create({
        data: {
          phone: normalized,
          name: null,
          email: null,
        },
      });
    }

    const token = signCustomerToken({
      customerId: customer.id,
      phone: customer.phone!,
    });

    return {
      token,
      customer: {
        id: customer.id,
        phone: customer.phone!,
        name: customer.name,
      },
    };
  },

  async getMe(customerId: string) {
    return prisma.customer.findUnique({
      where: { id: customerId },
      select: {
        id: true,
        phone: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
  },
};
