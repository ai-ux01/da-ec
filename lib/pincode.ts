/**
 * Indian pincode lookup (city/state) via public API.
 * Uses api.postalpincode.in — no API key required.
 */

export type PincodeDetails = { city: string; state: string };

const API_BASE = "https://api.postalpincode.in/pincode";

export async function fetchPincodeDetails(pincode: string): Promise<PincodeDetails | null> {
  const digits = pincode.replace(/\D/g, "").trim();
  if (digits.length !== 6) return null;
  try {
    const res = await fetch(`${API_BASE}/${digits}`);
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{
      Status?: string;
      PostOffice?: Array<{ District?: string; State?: string }>;
    }>;
    const first = data?.[0];
    if (first?.Status !== "Success" || !first.PostOffice?.length) return null;
    const po = first.PostOffice[0];
    const city = po.District?.trim() ?? "";
    const state = po.State?.trim() ?? "";
    if (!city || !state) return null;
    return { city, state };
  } catch {
    return null;
  }
}
