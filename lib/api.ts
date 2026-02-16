/**
 * Frontend API client for AMRYTUM backend.
 * Base URL: NEXT_PUBLIC_API_URL (validated in production via lib/env).
 */

const DEFAULT_TIMEOUT_MS = 20000;

function getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_API_URL ?? "";
  }
  if (process.env.NODE_ENV === "production") {
    const url = process.env.NEXT_PUBLIC_API_URL ?? "";
    if (!url || url.includes("localhost") || url.startsWith("http://127.0.0.1")) {
      throw new Error("NEXT_PUBLIC_API_URL must be set and not localhost in production.");
    }
    return url;
  }
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export type ApiFetchOptions = RequestInit & { token?: string | null; timeoutMs?: number };

export async function apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T> {
  const base = getBaseUrl();
  if (!base) {
    throw new ApiError("NEXT_PUBLIC_API_URL is not set");
  }
  const url = path.startsWith("http") ? path : `${base.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
  const { token, timeoutMs = DEFAULT_TIMEOUT_MS, ...rest } = options ?? {};
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(rest.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...rest,
      signal: controller.signal,
      mode: "cors",
      referrerPolicy: "no-referrer",
      headers,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      throw new ApiError(
        (err as { error?: string }).error ?? res.statusText,
        res.status,
        (err as { code?: string }).code
      );
    }
    return res.json() as Promise<T>;
  } catch (e) {
    clearTimeout(timeoutId);
    if (e instanceof ApiError) throw e;
    if (e instanceof Error) {
      if (e.name === "AbortError") throw new ApiError("Request timed out. Please try again.");
      throw new ApiError(e.message || "Network error. Please check your connection.");
    }
    throw new ApiError("Something went wrong. Please try again.");
  }
}

// --- Public batch & lab reports ---

export type LabReportApi = {
  id: string;
  batchId: string;
  reportUrl: string;
  fatPercent: number | null;
  moisture: number | null;
  ffa: number | null;
  antibioticPass: boolean;
  remarks: string | null;
  createdAt: string;
};

export type BatchPublicApi = {
  id: string;
  batchId: string;
  date: string;
  status: string;
  farm: { id: string; name: string };
  labReports: LabReportApi[];
};

export async function fetchBatchesPublic(): Promise<BatchPublicApi[]> {
  return apiFetch<BatchPublicApi[]>("batches/public");
}

export async function fetchBatchByBatchId(batchId: string): Promise<BatchPublicApi> {
  return apiFetch<BatchPublicApi>(`batch/${encodeURIComponent(batchId)}`);
}

export async function fetchLabReportsForBatch(batchId: string): Promise<LabReportApi[]> {
  return apiFetch<LabReportApi[]>(`batch/${encodeURIComponent(batchId)}/lab-reports`);
}

// --- Catalog (products for Buy page) ---

export type ProductSizeApi = {
  id: string;
  label: string;
  price: number;
  inr: string;
};

export type ProductApi = {
  id: string;
  name: string;
  description: string;
  sizes: ProductSizeApi[];
  defaultSizeId: string;
};

export type CatalogApi = {
  products: ProductApi[];
};

export async function fetchCatalog(options?: { noCache?: boolean }): Promise<CatalogApi> {
  const path = options?.noCache ? `catalog?_=${Date.now()}` : "catalog";
  return apiFetch<CatalogApi>(path);
}

/** Available jar count per size (first approved batch). Keys: SIZE_250ML, SIZE_500ML, SIZE_1L. */
export type StockAvailabilityApi = Record<"SIZE_250ML" | "SIZE_500ML" | "SIZE_1L", number>;

export async function fetchStockAvailability(): Promise<StockAvailabilityApi> {
  return apiFetch<StockAvailabilityApi>("stock/availability");
}

// --- Customer auth (OTP) ---

export async function requestOtp(phone: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>("auth/request-otp", {
    method: "POST",
    body: JSON.stringify({ phone }),
  });
}

export async function verifyOtp(
  phone: string,
  otp: string
): Promise<{ token: string; customer: { id: string; phone: string; name: string | null } }> {
  return apiFetch<{ token: string; customer: { id: string; phone: string; name: string | null } }>(
    "auth/verify-otp",
    {
      method: "POST",
      body: JSON.stringify({ phone, otp }),
    }
  );
}

export type CustomerMe = {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
};

export async function fetchAuthMe(token: string): Promise<CustomerMe> {
  return apiFetch<CustomerMe>("auth/me", { token });
}

// --- Addresses (require token) ---

export type AddressApi = {
  id: string;
  customerId: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function fetchAddresses(token: string): Promise<AddressApi[]> {
  return apiFetch<AddressApi[]>("address", { token });
}

export async function createAddress(
  token: string,
  body: {
    name: string;
    phone: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    state: string;
    pincode: string;
    is_default?: boolean;
  }
): Promise<AddressApi> {
  return apiFetch<AddressApi>("address", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

// --- Checkout: create order (require token) ---

export type CreateOrderBody = {
  address_id?: string;
  jar_id?: string;
  batch_id?: string;
  size?: "SIZE_250ML" | "SIZE_500ML" | "SIZE_1L";
};

export async function createOrder(token: string, body: CreateOrderBody): Promise<unknown> {
  return apiFetch("order/create", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

// --- My orders (customer) ---

export type MyOrderApi = {
  id: string;
  orderId: string;
  paymentStatus: string;
  deliveryStatus: string;
  address: string;
  createdAt: string;
  jar: { id: string; jarId: string; size: string; status: string };
  batch: { id: string; batchId: string; date: string; status: string };
};

export async function fetchMyOrders(token: string): Promise<MyOrderApi[]> {
  return apiFetch<MyOrderApi[]>("orders/me", { token });
}

// --- Razorpay (Option B: pay first, then create orders) ---

export type CreatePaymentOrderBody = {
  address_id: string;
  batch_id: string;
  amount_paise: number;
  items: Array<{ size: "SIZE_250ML" | "SIZE_500ML" | "SIZE_1L"; quantity: number }>;
};

export type CreatePaymentOrderResponse = {
  razorpayOrderId: string;
  keyId: string;
  amount: number;
  currency: string;
};

export async function createPaymentOrder(
  token: string,
  body: CreatePaymentOrderBody
): Promise<CreatePaymentOrderResponse> {
  return apiFetch<CreatePaymentOrderResponse>("payment/create-order", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

/** Create order(s) as Cash on Delivery (no online payment). Same body as createPaymentOrder. */
export async function createOrderCod(
  token: string,
  body: CreatePaymentOrderBody
): Promise<{ orders: OrderInResponse[] }> {
  return apiFetch<{ orders: OrderInResponse[] }>("payment/create-order-cod", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export type VerifyPaymentBody = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

export type OrderInResponse = {
  orderId: string;
  id: string;
  paymentStatus: string;
  address: string;
  createdAt: string;
};

export type VerifyPaymentResponse = {
  orders: OrderInResponse[];
};

export async function verifyPayment(token: string, body: VerifyPaymentBody): Promise<VerifyPaymentResponse> {
  return apiFetch<VerifyPaymentResponse>("payment/verify", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

// --- Health (optional) ---

export async function fetchHealth(): Promise<{ status: string }> {
  const base = getBaseUrl().replace(/\/api\/?$/, "");
  const res = await fetch(`${base}/health`);
  if (!res.ok) throw new Error("Backend health check failed");
  return res.json();
}

// --- Admin auth (magic link) ---

export async function requestAdminMagicLink(email: string): Promise<{ message: string; dev_link?: string }> {
  return apiFetch<{ message: string; dev_link?: string }>("admin/auth/request-link", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifyAdminMagicLink(token: string): Promise<{ token: string }> {
  const base = getBaseUrl();
  const url = `${base.replace(/\/$/, "")}/admin/auth/verify?token=${encodeURIComponent(token)}`;
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Invalid or expired link");
  }
  return res.json() as Promise<{ token: string }>;
}

// --- Admin: orders (sales) ---

export type AdminOrderApi = {
  id: string;
  orderId: string;
  customerId: string;
  customer: { id: string; phone: string | null; name: string | null; email: string | null };
  jar: { id: string; jarId: string; size: string; status: string };
  batch: { id: string; batchId: string; date: string; status: string };
  paymentStatus: string;
  deliveryStatus: string;
  address: string;
  amountPaise: number | null;
  createdAt: string;
};

export type AdminOrdersStatsApi = {
  totalOrders: number;
  paidOrders: number;
  pendingPaymentOrders: number;
  refundedOrders: number;
  pendingDelivery: number;
  shipped: number;
  delivered: number;
  totalRevenuePaise: number;
};

export async function fetchAdminOrders(
  token: string,
  params?: { customerId?: string; paymentStatus?: string; deliveryStatus?: string }
): Promise<AdminOrderApi[]> {
  const q = new URLSearchParams();
  if (params?.customerId) q.set("customerId", params.customerId);
  if (params?.paymentStatus) q.set("paymentStatus", params.paymentStatus);
  if (params?.deliveryStatus) q.set("deliveryStatus", params.deliveryStatus);
  const query = q.toString();
  return apiFetch<AdminOrderApi[]>(`orders${query ? `?${query}` : ""}`, { token });
}

export async function updateAdminOrder(
  token: string,
  orderId: string,
  body: { paymentStatus?: string; deliveryStatus?: string }
): Promise<AdminOrderApi> {
  return apiFetch<AdminOrderApi>(`orders/${orderId}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(body),
  });
}

export async function fetchAdminOrdersStats(token: string): Promise<AdminOrdersStatsApi> {
  return apiFetch<AdminOrdersStatsApi>("orders/stats", { token });
}

// --- Admin: customers ---

export type AdminCustomerApi = {
  id: string;
  phone: string | null;
  name: string | null;
  email: string | null;
  createdAt: string;
};

export async function fetchAdminCustomers(token: string, search?: string): Promise<AdminCustomerApi[]> {
  return apiFetch<AdminCustomerApi[]>(`customers${search ? `?search=${encodeURIComponent(search)}` : ""}`, { token });
}

// --- Admin: batches ---

export type AdminBatchApi = {
  id: string;
  batchId: string;
  farmId: string;
  date: string;
  status: string;
  milkLiters: number;
  gheeOutputLiters: number;
  cowsCount: number;
  farm: { id: string; name: string };
};

export async function fetchAdminBatches(
  token: string,
  params?: { status?: string; farmId?: string }
): Promise<AdminBatchApi[]> {
  const q = new URLSearchParams();
  if (params?.status) q.set("status", params.status);
  if (params?.farmId) q.set("farmId", params.farmId);
  const query = q.toString();
  return apiFetch<AdminBatchApi[]>(`batches${query ? `?${query}` : ""}`, { token });
}

export type CreateBatchBody = {
  batchId: string;
  farmId: string;
  date: string;
  cowsCount: number;
  milkLiters: number;
  gheeOutputLiters: number;
  processingNotes?: string;
};

export async function createAdminBatch(token: string, body: CreateBatchBody): Promise<AdminBatchApi> {
  return apiFetch<AdminBatchApi>("batches", { method: "POST", token, body: JSON.stringify(body) });
}

export async function approveAdminBatch(token: string, batchIdUuid: string): Promise<AdminBatchApi> {
  return apiFetch<AdminBatchApi>(`batches/${batchIdUuid}/approve`, { method: "POST", token });
}

export async function rejectAdminBatch(token: string, batchIdUuid: string): Promise<AdminBatchApi> {
  return apiFetch<AdminBatchApi>(`batches/${batchIdUuid}/reject`, { method: "POST", token });
}

// --- Admin: farms (for batch create dropdown) ---

export type AdminFarmApi = { id: string; name: string };

export async function fetchAdminFarms(token: string): Promise<AdminFarmApi[]> {
  return apiFetch<AdminFarmApi[]>("farms", { token });
}

// --- Admin: jars (product/stock status) ---

export type AdminJarApi = {
  id: string;
  jarId: string;
  batchId: string;
  size: string;
  status: string;
  batch: { id: string; batchId: string };
  customer: { id: string; phone: string | null; name: string | null } | null;
};

export async function fetchAdminJars(
  token: string,
  params?: { batchId?: string; status?: string; size?: string }
): Promise<AdminJarApi[]> {
  const q = new URLSearchParams();
  if (params?.batchId) q.set("batchId", params.batchId);
  if (params?.status) q.set("status", params.status);
  if (params?.size) q.set("size", params.size);
  const query = q.toString();
  return apiFetch<AdminJarApi[]>(`jars${query ? `?${query}` : ""}`, { token });
}

export type CreateJarsBulkBody = {
  batchId: string;
  size: "SIZE_250ML" | "SIZE_500ML" | "SIZE_1L";
  count: number;
};

export async function createAdminJarsBulk(
  token: string,
  body: CreateJarsBulkBody
): Promise<{ count: number; jars: AdminJarApi[] }> {
  return apiFetch<{ count: number; jars: AdminJarApi[] }>("jars/bulk", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

// --- Admin: catalog (products) ---

export type AdminCatalogProductApi = {
  id: string;
  productId: string;
  name: string;
  description: string;
  sizes: Array<{ id: string; label: string; price: number; inr: string }>;
  defaultSizeId: string;
  sortOrder: number;
};

export async function fetchAdminCatalog(token: string, options?: { noCache?: boolean }): Promise<AdminCatalogProductApi[]> {
  const path = options?.noCache ? `admin/catalog?_=${Date.now()}` : "admin/catalog";
  return apiFetch<AdminCatalogProductApi[]>(path, { token });
}

export type CreateProductBody = {
  productId: string;
  name: string;
  description: string;
  sizes: Array<{ id: string; label: string; price: number; inr: string }>;
  defaultSizeId: string;
  sortOrder?: number;
};

export async function createAdminProduct(
  token: string,
  body: CreateProductBody
): Promise<AdminCatalogProductApi> {
  return apiFetch<AdminCatalogProductApi>("admin/catalog/products", {
    method: "POST",
    token,
    body: JSON.stringify(body),
  });
}

export type UpdateProductBody = Partial<CreateProductBody>;

export async function updateAdminProduct(
  token: string,
  id: string,
  body: UpdateProductBody
): Promise<AdminCatalogProductApi> {
  return apiFetch<AdminCatalogProductApi>(`admin/catalog/products/${encodeURIComponent(id)}`, {
    method: "PUT",
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteAdminProduct(token: string, id: string): Promise<void> {
  const base = getBaseUrl();
  const url = `${base.replace(/\/$/, "")}/admin/catalog/products/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, mode: "cors" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Failed to delete product");
  }
}

// --- Admin: lab reports ---

export type AdminLabReportApi = {
  id: string;
  batchId: string;
  reportUrl: string;
  fatPercent: number | null;
  moisture: number | null;
  ffa: number | null;
  antibioticPass: boolean;
  remarks: string | null;
  createdAt: string;
  batch: { id: string; batchId: string };
};

export async function fetchAdminLabReports(token: string): Promise<AdminLabReportApi[]> {
  return apiFetch<AdminLabReportApi[]>("lab-reports", { token });
}

export async function uploadLabReport(
  token: string,
  formData: FormData
): Promise<AdminLabReportApi> {
  const base = getBaseUrl();
  if (!base) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const url = `${base.replace(/\/$/, "")}/lab-reports/upload`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
    mode: "cors",
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  return res.json() as Promise<AdminLabReportApi>;
}

export async function deleteAdminLabReport(token: string, id: string): Promise<void> {
  const base = getBaseUrl();
  const url = `${base.replace(/\/$/, "")}/lab-reports/${encodeURIComponent(id)}`;
  const res = await fetch(url, { method: "DELETE", headers: { Authorization: `Bearer ${token}` }, mode: "cors" });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error((err as { error?: string }).error ?? "Failed to delete lab report");
  }
}
