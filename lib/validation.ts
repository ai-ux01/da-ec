/**
 * Validation helpers for forms and API inputs.
 */

/** Valid Indian mobile: 10 digits, optionally with +91 or 91 prefix. */
export function isValidIndianPhone(value: string): boolean {
  const digits = value.replace(/\D/g, "").trim();
  if (digits.length === 10) {
    return /^[6-9]\d{9}$/.test(digits);
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return /^91[6-9]\d{9}$/.test(digits);
  }
  return false;
}
