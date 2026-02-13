/**
 * Mock SMS provider for OTP in development.
 * Replace with real SMS API (Twilio, MSG91, etc.) in production.
 */

export async function sendOtpSms(phone: string, otpCode: string): Promise<void> {
  // In development, log to console instead of sending SMS
  if (process.env.NODE_ENV !== "production") {
    console.log(`[SMS Mock] OTP for ${phone}: ${otpCode}`);
    return;
  }
  // Production: call your SMS API here
  // await smsClient.send({ to: phone, body: `Your AMRYTUM code is ${otpCode}. Valid for 5 minutes.` });
  console.log(`[SMS Mock] OTP for ${phone}: ${otpCode}`);
}
