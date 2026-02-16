"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  fetchAdminOrders,
  fetchAdminCustomers,
  fetchAdminBatches,
  fetchAdminJars,
  fetchAdminCatalog,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminLabReports,
  uploadLabReport,
  deleteAdminLabReport,
  type AdminOrderApi,
  type AdminCustomerApi,
  type AdminBatchApi,
  type AdminJarApi,
  type AdminCatalogProductApi,
  type AdminLabReportApi,
  type CreateProductBody,
} from "@/lib/api";

type Tab = "orders" | "customers" | "batches" | "jars" | "products" | "lab";

export default function AdminDashboardPage() {
  const { token, logout } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<AdminOrderApi[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerApi[]>([]);
  const [batches, setBatches] = useState<AdminBatchApi[]>([]);
  const [jars, setJars] = useState<AdminJarApi[]>([]);
  const [products, setProducts] = useState<AdminCatalogProductApi[]>([]);
  const [labReports, setLabReports] = useState<AdminLabReportApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [o, c, b, j, p, l] = await Promise.all([
        fetchAdminOrders(token),
        fetchAdminCustomers(token),
        fetchAdminBatches(token),
        fetchAdminJars(token),
        fetchAdminCatalog(token, { noCache: true }),
        fetchAdminLabReports(token),
      ]);
      setOrders(o);
      setCustomers(c);
      setBatches(b);
      setJars(j);
      setProducts(p);
      setLabReports(l);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (!token) return;
    try {
      const [o, c, b, j, p, l] = await Promise.all([
        fetchAdminOrders(token),
        fetchAdminCustomers(token),
        fetchAdminBatches(token),
        fetchAdminJars(token),
        fetchAdminCatalog(token, { noCache: true }),
        fetchAdminLabReports(token),
      ]);
      setOrders(o);
      setCustomers(c);
      setBatches(b);
      setJars(j);
      setProducts(p);
      setLabReports(l);
    } catch {
      // keep existing data on error
    }
  };

  const refetchProducts = async () => {
    if (!token) return;
    try {
      const p = await fetchAdminCatalog(token, { noCache: true });
      setProducts([...p]);
    } catch {
      // keep existing products on error
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const tabs: { id: Tab; label: string }[] = [
    { id: "orders", label: "Sales" },
    { id: "customers", label: "Customers" },
    { id: "batches", label: "Batches" },
    { id: "jars", label: "Jars / Stock" },
    { id: "products", label: "Products" },
    { id: "lab", label: "Lab tests" },
  ];

  const handleTabChange = (newTab: Tab) => {
    setTab(newTab);
    if (token) {
      refreshAllData();
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-earth-500 bg-earth-600 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <h1 className="font-serif text-xl font-semibold text-cream-50">Admin</h1>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-sm text-cream-300 hover:text-cream-50">
              Site
            </Link>
            <button
              type="button"
              onClick={logout}
              className="text-sm text-cream-300 hover:text-cream-50"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-earth-500 bg-earth-600/80 px-6">
        <div className="max-w-6xl mx-auto flex gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`px-4 py-3 text-sm font-medium rounded-t transition-colors ${
                tab === t.id
                  ? "bg-earth-500 text-cream-50"
                  : "text-cream-300 hover:text-cream-50 hover:bg-earth-500/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-6 overflow-auto">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/30 text-red-200 text-sm">{error}</div>
        )}
        {loading ? (
          <p className="text-cream-200">Loading…</p>
        ) : (
          <>
            {tab === "orders" && <OrdersTable orders={orders} />}
            {tab === "customers" && <CustomersTable customers={customers} />}
            {tab === "batches" && <BatchesTable batches={batches} />}
            {tab === "jars" && <JarsTable jars={jars} />}
            {tab === "products" && (
              <ProductsSection products={products} token={token!} onSuccess={refetchProducts} />
            )}
            {tab === "lab" && (
              <LabSection
                labReports={labReports}
                batches={batches}
                token={token!}
                onSuccess={loadData}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

function OrdersTable({ orders }: { orders: AdminOrderApi[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-cream-50">Sales ({orders.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Order ID</th>
              <th className="px-4 py-2">Customer</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Payment</th>
              <th className="px-4 py-2">Delivery</th>
              <th className="px-4 py-2">Date</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream-400">
                  No orders yet
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2 font-mono">{o.orderId}</td>
                  <td className="px-4 py-2">
                    {o.customer?.name || o.customer?.phone || o.customerId}
                  </td>
                  <td className="px-4 py-2">{o.batch?.batchId ?? "—"}</td>
                  <td className="px-4 py-2">{o.jar?.size ?? "—"}</td>
                  <td className="px-4 py-2">{o.paymentStatus}</td>
                  <td className="px-4 py-2">{o.deliveryStatus}</td>
                  <td className="px-4 py-2">
                    {o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomersTable({ customers }: { customers: AdminCustomerApi[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-cream-50">Customers ({customers.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Phone</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Joined</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-cream-400">
                  No customers yet
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2">{c.phone ?? "—"}</td>
                  <td className="px-4 py-2">{c.name ?? "—"}</td>
                  <td className="px-4 py-2">{c.email ?? "—"}</td>
                  <td className="px-4 py-2">
                    {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BatchesTable({ batches }: { batches: AdminBatchApi[] }) {
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-cream-50">Batches ({batches.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Batch ID</th>
              <th className="px-4 py-2">Farm</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Milk (L)</th>
              <th className="px-4 py-2">Ghee (L)</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {batches.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-cream-400">
                  No batches yet
                </td>
              </tr>
            ) : (
              batches.map((b) => (
                <tr key={b.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2 font-mono">{b.batchId}</td>
                  <td className="px-4 py-2">{b.farm?.name ?? "—"}</td>
                  <td className="px-4 py-2">
                    {b.date ? new Date(b.date).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        b.status === "APPROVED"
                          ? "text-green-300"
                          : b.status === "REJECTED"
                            ? "text-red-300"
                            : "text-cream-300"
                      }
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">{b.milkLiters ?? "—"}</td>
                  <td className="px-4 py-2">{b.gheeOutputLiters ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JarsTable({ jars }: { jars: AdminJarApi[] }) {
  const available = jars.filter((j) => j.status === "AVAILABLE").length;
  const sold = jars.length - available;
  return (
    <div className="space-y-2">
      <h2 className="text-lg font-medium text-cream-50">
        Jars / Stock ({jars.length} total, <span className="text-green-300">{available} available</span>
        {sold > 0 && <>, <span className="text-cream-300">{sold} sold</span></>})
      </h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Jar ID</th>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Size</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Customer</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {jars.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-cream-400">
                  No jars yet
                </td>
              </tr>
            ) : (
              jars.map((j) => (
                <tr key={j.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2 font-mono text-xs">{j.jarId}</td>
                  <td className="px-4 py-2">{j.batch?.batchId ?? "—"}</td>
                  <td className="px-4 py-2">{j.size}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        j.status === "AVAILABLE" ? "text-green-300" : "text-cream-300"
                      }
                    >
                      {j.status}
                    </span>
                  </td>
                  <td className="px-4 py-2">
                    {j.customer?.name || j.customer?.phone || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Products tab: list + add product form ---

function ProductsSection({
  products,
  token,
  onSuccess,
}: {
  products: AdminCatalogProductApi[];
  token: string;
  onSuccess: () => void | Promise<void>;
}) {
  const [editingProduct, setEditingProduct] = useState<AdminCatalogProductApi | null>(null);
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sizesStr, setSizesStr] = useState("");
  const [defaultSizeId, setDefaultSizeId] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const formSectionRef = useRef<HTMLDivElement>(null);

  const handleDeleteProduct = async (id: string, productLabel: string) => {
    if (!confirm(`Delete product "${productLabel}"? This cannot be undone.`)) return;
    setFormError("");
    setDeletingId(id);
    try {
      await deleteAdminProduct(token, id);
      if (editingProduct?.id === id) setEditingProduct(null);
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete product");
    } finally {
      setDeletingId(null);
    }
  };

  // When editing, fill form from product and scroll form into view
  useEffect(() => {
    if (editingProduct) {
      setProductId(editingProduct.productId ?? "");
      setName(editingProduct.name ?? "");
      setDescription(editingProduct.description ?? "");
      const sizes = editingProduct.sizes;
      setSizesStr(
        Array.isArray(sizes)
          ? sizes.map((s) => `${s.id}, ${s.label}, ${s.price}`).join("\n")
          : ""
      );
      setDefaultSizeId(editingProduct.defaultSizeId ?? "");
      setSortOrder(editingProduct.sortOrder ?? 0);
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    } else {
      setProductId("");
      setName("");
      setDescription("");
      setSizesStr("");
      setDefaultSizeId("");
      setSortOrder(products.length);
    }
  }, [editingProduct, products.length]);

  const parseSizes = (): CreateProductBody["sizes"] | null => {
    const lines = sizesStr.trim().split(/\n/).map((l) => l.trim()).filter(Boolean);
    const sizes: CreateProductBody["sizes"] = [];
    for (const line of lines) {
      // Try comma/tab separated first: id, label, price
      const byComma = line.split(/[\t,]+/).map((p) => p.trim()).filter(Boolean);
      if (byComma.length >= 3) {
        const id = byComma[0];
        const label = byComma.slice(1, -1).join(" ");
        const price = Number(byComma[byComma.length - 1]);
        if (id && label && !Number.isNaN(price)) {
          sizes.push({ id, label, price, inr: `₹${price.toLocaleString("en-IN")}` });
          continue;
        }
      }
      // Else try space-separated: ...words... number (last token = price)
      const bySpace = line.split(/\s+/).filter(Boolean);
      if (bySpace.length >= 2) {
        const last = bySpace[bySpace.length - 1];
        const price = Number(last);
        if (!Number.isNaN(price)) {
          const id = bySpace[0];
          const label = bySpace.length > 2 ? bySpace.slice(1, -1).join(" ") : bySpace[0];
          sizes.push({ id, label, price, inr: `₹${price.toLocaleString("en-IN")}` });
          continue;
        }
      }
      return null;
    }
    return sizes.length ? sizes : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const missing: string[] = [];
    if (!productId.trim()) missing.push("product ID");
    if (!name.trim()) missing.push("name");
    if (!description.trim()) missing.push("description");
    const sizes = parseSizes();
    if (!sizes || sizes.length === 0) missing.push("sizes (one line per size: id, label, price)");
    if (!defaultSizeId.trim()) missing.push("default size ID");
    if (missing.length > 0) {
      setFormError("Missing: " + missing.join(", "));
      return;
    }
    if (!sizes || sizes.length === 0) return;
    if (!sizes.some((s) => s.id === defaultSizeId)) {
      setFormError("Default size ID must match one of the size ids: " + sizes.map((s) => s.id).join(", "));
      return;
    }
    setSubmitting(true);
    try {
      if (editingProduct) {
        await updateAdminProduct(token, editingProduct.id, {
          productId: productId.trim(),
          name: name.trim(),
          description: description.trim(),
          sizes,
          defaultSizeId: defaultSizeId.trim(),
          sortOrder,
        });
        setEditingProduct(null);
      } else {
        await createAdminProduct(token, {
          productId: productId.trim(),
          name: name.trim(),
          description: description.trim(),
          sizes,
          defaultSizeId: defaultSizeId.trim(),
          sortOrder,
        });
      }
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to save product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-cream-50">Products ({products.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Product ID</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Sizes</th>
              <th className="px-4 py-2">Sort</th>
              <th className="px-4 py-2 w-20">Actions</th>
            </tr>
          </thead>
          <tbody
            key={products.map((pr) => `${pr.id}-${pr.sortOrder}`).join(",")}
            className="text-cream-100 divide-y divide-earth-500/50"
          >
            {products.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-cream-400">
                  No products yet
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2 font-mono">{p.productId}</td>
                  <td className="px-4 py-2">{p.name}</td>
                  <td className="px-4 py-2">
                    {Array.isArray(p.sizes) ? p.sizes.map((s) => s.label).join(", ") : "—"}
                  </td>
                  <td className="px-4 py-2">{p.sortOrder}</td>
                  <td className="px-4 py-2">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setEditingProduct(p);
                        }}
                        className="text-cream-300 hover:text-cream-50 text-sm underline cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteProduct(p.id, p.name);
                        }}
                        disabled={deletingId === p.id}
                        className="text-red-300 hover:text-red-200 text-sm underline cursor-pointer disabled:opacity-50"
                      >
                        {deletingId === p.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div ref={formSectionRef} className="rounded-lg border border-earth-500 bg-earth-500/20 p-4 max-w-lg">
        <h3 className="text-cream-50 font-medium mb-3">
          {editingProduct ? "Edit product" : "Add product"}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-cream-200 mb-1">Product ID (e.g. a2-ghee)</label>
            <input
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Sizes — one line per size (id, label, price)</label>
            <textarea
              value={sizesStr}
              onChange={(e) => setSizesStr(e.target.value)}
              placeholder={"250ml, 250 ml, 899\n500ml, 500 ml, 1699"}
              rows={4}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50 font-mono text-xs"
            />
            <p className="mt-1 text-xs text-cream-400">Use commas or spaces. Last number on each line is the price.</p>
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Default size ID</label>
            <input
              value={defaultSizeId}
              onChange={(e) => setDefaultSizeId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Sort order</label>
            <input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          {formError && <p className="text-red-300">{formError}</p>}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 rounded bg-earth-500 text-cream-50 hover:bg-earth-400 disabled:opacity-50"
            >
              {submitting
                ? editingProduct
                  ? "Saving…"
                  : "Adding…"
                : editingProduct
                  ? "Save changes"
                  : "Add product"}
            </button>
            {editingProduct && (
              <button
                type="button"
                onClick={() => {
                  setEditingProduct(null);
                  setFormError("");
                }}
                className="px-4 py-2 rounded border border-earth-500 text-cream-200 hover:bg-earth-500/30"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

// --- Lab tests tab: list + upload form ---

function LabSection({
  labReports,
  batches,
  token,
  onSuccess,
}: {
  labReports: AdminLabReportApi[];
  batches: AdminBatchApi[];
  token: string;
  onSuccess: () => void;
}) {
  const [batchId, setBatchId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [fatPercent, setFatPercent] = useState("");
  const [moisture, setMoisture] = useState("");
  const [ffa, setFfa] = useState("");
  const [antibioticPass, setAntibioticPass] = useState(true);
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");

  const handleDeleteLabReport = async (id: string, batchLabel: string) => {
    if (!confirm(`Delete lab report for batch ${batchLabel}? This cannot be undone.`)) return;
    setFormError("");
    setDeletingId(id);
    try {
      await deleteAdminLabReport(token, id);
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to delete lab report");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const batch = batches.find((b) => b.batchId === batchId.trim().toUpperCase());
    if (!batch) {
      setFormError("Select a batch.");
      return;
    }
    if (!file || file.type !== "application/pdf") {
      setFormError("Upload a PDF file.");
      return;
    }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("batchId", batch.id);
      if (fatPercent !== "") formData.append("fatPercent", fatPercent);
      if (moisture !== "") formData.append("moisture", moisture);
      if (ffa !== "") formData.append("ffa", ffa);
      formData.append("antibioticPass", antibioticPass ? "true" : "false");
      if (remarks) formData.append("remarks", remarks);
      await uploadLabReport(token, formData);
      setBatchId("");
      setFile(null);
      setFatPercent("");
      setMoisture("");
      setFfa("");
      setRemarks("");
      onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to upload lab report");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-cream-50">Lab reports ({labReports.length})</h2>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2">Batch</th>
              <th className="px-4 py-2">Fat %</th>
              <th className="px-4 py-2">Moisture</th>
              <th className="px-4 py-2">FFA</th>
              <th className="px-4 py-2">Antibiotic</th>
              <th className="px-4 py-2">Date</th>
              <th className="px-4 py-2 w-20">Actions</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {labReports.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream-400">
                  No lab reports yet
                </td>
              </tr>
            ) : (
              labReports.map((r) => (
                <tr key={r.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2">{r.batch?.batchId ?? r.batchId}</td>
                  <td className="px-4 py-2">{r.fatPercent ?? "—"}</td>
                  <td className="px-4 py-2">{r.moisture ?? "—"}</td>
                  <td className="px-4 py-2">{r.ffa ?? "—"}</td>
                  <td className="px-4 py-2">{r.antibioticPass ? "Pass" : "Fail"}</td>
                  <td className="px-4 py-2">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleDeleteLabReport(r.id, r.batch?.batchId ?? r.batchId ?? "");
                      }}
                      disabled={deletingId === r.id}
                      className="text-red-300 hover:text-red-200 text-sm underline cursor-pointer disabled:opacity-50"
                    >
                      {deletingId === r.id ? "…" : "Delete"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="rounded-lg border border-earth-500 bg-earth-500/20 p-4 max-w-lg">
        <h3 className="text-cream-50 font-medium mb-3">Add lab report</h3>
        <form onSubmit={handleSubmit} className="space-y-3 text-sm">
          <div>
            <label className="block text-cream-200 mb-1">Batch</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>
                  {b.batchId} — {b.farm?.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cream-200 mb-1">PDF file</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-100"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-cream-200 mb-1">Fat %</label>
              <input
                type="number"
                step="0.01"
                value={fatPercent}
                onChange={(e) => setFatPercent(e.target.value)}
                className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
              />
            </div>
            <div>
              <label className="block text-cream-200 mb-1">Moisture</label>
              <input
                type="number"
                step="0.01"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
              />
            </div>
            <div>
              <label className="block text-cream-200 mb-1">FFA</label>
              <input
                type="number"
                step="0.01"
                value={ffa}
                onChange={(e) => setFfa(e.target.value)}
                className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="antibioticPass"
              checked={antibioticPass}
              onChange={(e) => setAntibioticPass(e.target.checked)}
              className="rounded border-earth-500"
            />
            <label htmlFor="antibioticPass" className="text-cream-200">
              Antibiotic pass
            </label>
          </div>
          <div>
            <label className="block text-cream-200 mb-1">Remarks</label>
            <input
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600 border border-earth-500 text-cream-50"
            />
          </div>
          {formError && <p className="text-red-300">{formError}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 rounded bg-earth-500 text-cream-50 hover:bg-earth-400 disabled:opacity-50"
          >
            {submitting ? "Uploading…" : "Upload lab report"}
          </button>
        </form>
      </div>
    </div>
  );
}
