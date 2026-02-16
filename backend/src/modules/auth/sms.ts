/**
 * SMS provider for OTP. Uses Twilio when env is set; otherwise mock (log only).
 * Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER for production.
 */

import { sendOtpSms as sendOtpSmsMock } from "./sms.mock.js";

function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_PHONE_NUMBER
  );
}

/** Normalize to E.164 for Twilio: Indian numbers get +91 prefix. */
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "").trim();
  if (digits.length === 10) {
    return "+91" + digits;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return "+" + digits;
  }
  return "+91" + digits.slice(-10);
}

export async function sendOtpSms(phone: string, otpCode: string): Promise<void> {
  if (!isTwilioConfigured()) {
    await sendOtpSmsMock(phone, otpCode);
    return;
  }
  const twilio = await import("twilio");
  const client = twilio.default(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const from = process.env.TWILIO_PHONE_NUMBER!;
  const to = toE164(phone);
  const body = `Your AMRYTUM verification code is ${otpCode}. Valid for 5 minutes.`;
  await client.messages.create({ from, to, body });
}
