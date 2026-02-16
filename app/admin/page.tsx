"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAdminAuth } from "@/context/AdminAuthContext";
import {
  fetchAdminOrders,
  fetchAdminOrdersStats,
  updateAdminOrder,
  fetchAdminCustomers,
  fetchAdminBatches,
  fetchAdminJars,
  createAdminJarsBulk,
  fetchAdminCatalog,
  fetchAdminFarms,
  createAdminBatch,
  approveAdminBatch,
  rejectAdminBatch,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  fetchAdminLabReports,
  uploadLabReport,
  deleteAdminLabReport,
  type AdminOrderApi,
  type AdminOrdersStatsApi,
  type AdminCustomerApi,
  type AdminBatchApi,
  type AdminJarApi,
  type AdminCatalogProductApi,
  type AdminLabReportApi,
  type AdminFarmApi,
  type CreateProductBody,
} from "@/lib/api";

type Tab = "dashboard" | "orders" | "customers" | "batches" | "jars" | "products" | "lab";

export default function AdminDashboardPage() {
  const { token, logout } = useAdminAuth();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [orders, setOrders] = useState<AdminOrderApi[]>([]);
  const [customers, setCustomers] = useState<AdminCustomerApi[]>([]);
  const [batches, setBatches] = useState<AdminBatchApi[]>([]);
  const [jars, setJars] = useState<AdminJarApi[]>([]);
  const [products, setProducts] = useState<AdminCatalogProductApi[]>([]);
  const [labReports, setLabReports] = useState<AdminLabReportApi[]>([]);
  const [stats, setStats] = useState<AdminOrdersStatsApi | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const [o, c, b, j, p, l, s] = await Promise.all([
        fetchAdminOrders(token),
        fetchAdminCustomers(token),
        fetchAdminBatches(token),
        fetchAdminJars(token),
        fetchAdminCatalog(token, { noCache: true }),
        fetchAdminLabReports(token),
        fetchAdminOrdersStats(token),
      ]);
      setOrders(o);
      setCustomers(c);
      setBatches(b);
      setJars(j);
      setProducts(p);
      setLabReports(l);
      setStats(s);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const refreshAllData = async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const [o, c, b, j, p, l, s] = await Promise.all([
        fetchAdminOrders(token),
        fetchAdminCustomers(token),
        fetchAdminBatches(token),
        fetchAdminJars(token),
        fetchAdminCatalog(token, { noCache: true }),
        fetchAdminLabReports(token),
        fetchAdminOrdersStats(token),
      ]);
      setOrders(o);
      setCustomers(c);
      setBatches(b);
      setJars(j);
      setProducts(p);
      setLabReports(l);
      setStats(s);
      setSuccessMessage("Data refreshed");
      setTimeout(() => setSuccessMessage(""), 2500);
    } catch {
      // keep existing data on error
    } finally {
      setRefreshing(false);
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
    { id: "dashboard", label: "Dashboard" },
    { id: "orders", label: "Sales" },
    { id: "customers", label: "Customers" },
    { id: "batches", label: "Batches" },
    { id: "jars", label: "Stock" },
    { id: "products", label: "Products" },
    { id: "lab", label: "Lab" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-earth-500 bg-earth-600 px-4 sm:px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <h1 className="font-serif text-lg sm:text-xl font-semibold text-cream-50 truncate">Admin</h1>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <button
              type="button"
              onClick={refreshAllData}
              disabled={refreshing || loading}
              className="px-3 py-1.5 text-sm rounded bg-earth-500/80 text-cream-100 hover:bg-earth-500 disabled:opacity-50 transition-colors"
              title="Refresh all data"
            >
              {refreshing ? "…" : "Refresh"}
            </button>
            <Link href="/" className="text-sm text-cream-300 hover:text-cream-50" target="_blank" rel="noopener noreferrer">
              View site
            </Link>
            <button type="button" onClick={logout} className="text-sm text-cream-300 hover:text-cream-50">
              Log out
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-earth-500 bg-earth-600/80 px-2 sm:px-6" aria-label="Sections">
        <div className="max-w-6xl mx-auto flex gap-0.5 overflow-x-auto scrollbar-thin">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={tab === t.id ? "page" : undefined}
              className={`px-3 sm:px-4 py-3 text-sm font-medium rounded-t whitespace-nowrap transition-colors ${
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

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 overflow-auto">
        {error && (
          <div className="mb-4 p-3 rounded bg-red-900/30 text-red-200 text-sm" role="alert">{error}</div>
        )}
        {successMessage && (
          <div className="mb-4 p-3 rounded bg-green-900/30 text-green-200 text-sm" role="status">{successMessage}</div>
        )}
        {loading ? (
          <div className="flex items-center gap-2 text-cream-200">
            <span className="inline-block w-5 h-5 border-2 border-cream-300 border-t-transparent rounded-full animate-spin" aria-hidden />
            <span>Loading…</span>
          </div>
        ) : (
          <>
            {tab === "dashboard" && (
              <DashboardOverview
                orders={orders}
                customers={customers}
                batches={batches}
                jars={jars}
                stats={stats}
                onGoToTab={setTab}
              />
            )}
            {tab === "orders" && (
              <OrdersTable orders={orders} token={token!} onSuccess={loadData} onSuccessMessage={(m) => { setSuccessMessage(m); setTimeout(() => setSuccessMessage(""), 3000); }} />
            )}
            {tab === "customers" && <CustomersTable customers={customers} />}
            {tab === "batches" && (
              <BatchesSection
                batches={batches}
                token={token!}
                onSuccess={loadData}
                onSuccessMessage={(msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 3000); }}
              />
            )}
            {tab === "jars" && (
              <JarsSection
                jars={jars}
                batches={batches}
                token={token!}
                onSuccess={loadData}
                onSuccessMessage={(msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(""), 3000); }}
              />
            )}
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

function DashboardOverview({
  orders,
  customers,
  batches,
  jars,
  stats,
  onGoToTab,
}: {
  orders: AdminOrderApi[];
  customers: AdminCustomerApi[];
  batches: AdminBatchApi[];
  jars: AdminJarApi[];
  stats: AdminOrdersStatsApi | null;
  onGoToTab: (tab: Tab) => void;
}) {
  const paidOrders = stats?.paidOrders ?? orders.filter((o) => o.paymentStatus === "PAID").length;
  const pendingOrders = stats?.pendingPaymentOrders ?? orders.filter((o) => o.paymentStatus === "PENDING").length;
  const refundedOrders = stats?.refundedOrders ?? orders.filter((o) => o.paymentStatus === "REFUNDED").length;
  const pendingDelivery = stats?.pendingDelivery ?? orders.filter((o) => o.deliveryStatus === "PENDING" && o.paymentStatus === "PAID").length;
  const shipped = stats?.shipped ?? orders.filter((o) => o.deliveryStatus === "SHIPPED").length;
  const delivered = stats?.delivered ?? orders.filter((o) => o.deliveryStatus === "DELIVERED").length;
  const totalRevenuePaise = stats?.totalRevenuePaise ?? 0;
  const revenueFormatted = totalRevenuePaise > 0
    ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(totalRevenuePaise / 100)
    : "—";
  const pendingBatches = batches.filter((b) => b.status === "PENDING").length;
  const approvedBatches = batches.filter((b) => b.status === "APPROVED").length;
  const availableJars = jars.filter((j) => j.status === "AVAILABLE").length;
  const soldJars = jars.filter((j) => j.status === "SOLD").length;

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-medium text-cream-50">Overview</h2>

      {/* Sales & revenue block */}
      <div className="rounded-lg border border-earth-500 bg-earth-500/10 p-4">
        <h3 className="text-cream-200 font-medium mb-3">Sales & revenue</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30">
            <p className="text-xl font-semibold text-cream-50">{stats?.totalOrders ?? orders.length}</p>
            <p className="text-xs text-cream-400">Total orders</p>
          </button>
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-green-500/40 bg-green-900/20 hover:bg-green-900/30">
            <p className="text-xl font-semibold text-green-200">{paidOrders}</p>
            <p className="text-xs text-cream-400">Paid (sales)</p>
          </button>
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30">
            <p className="text-xl font-semibold text-amber-200">{pendingOrders}</p>
            <p className="text-xs text-cream-400">Pending payment</p>
          </button>
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30">
            <p className="text-xl font-semibold text-cream-50">{pendingDelivery}</p>
            <p className="text-xs text-cream-400">To ship</p>
          </button>
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30">
            <p className="text-xl font-semibold text-cream-50">{delivered}</p>
            <p className="text-xs text-cream-400">Delivered</p>
          </button>
          <button type="button" onClick={() => onGoToTab("orders")} className="text-left p-3 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30">
            <p className="text-xl font-semibold text-cream-50">{revenueFormatted}</p>
            <p className="text-xs text-cream-400">Revenue</p>
          </button>
        </div>
        <div className="mt-2 flex flex-wrap gap-2 text-xs text-cream-500">
          <span>Shipped: {shipped}</span>
          {refundedOrders > 0 && <span>Refunded: {refundedOrders}</span>}
        </div>
      </div>

      {/* Profit */}
      <div className="rounded-lg border border-earth-500 bg-earth-500/10 p-4">
        <h3 className="text-cream-200 font-medium mb-2">Profit</h3>
        <p className="text-2xl font-semibold text-cream-50">—</p>
        <p className="text-xs text-cream-500 mt-1">Add cost per order in backend to show profit (revenue − cost).</p>
      </div>

      {/* Counts: Customers, Batches, Stock */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onGoToTab("customers")}
          className="text-left p-4 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-earth-400"
        >
          <p className="text-2xl font-semibold text-cream-50">{customers.length}</p>
          <p className="text-sm font-medium text-cream-200">Customers</p>
          <p className="text-xs text-earth-300 mt-2">View →</p>
        </button>
        <button
          type="button"
          onClick={() => onGoToTab("batches")}
          className="text-left p-4 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-earth-400"
        >
          <p className="text-2xl font-semibold text-cream-50">{batches.length}</p>
          <p className="text-sm font-medium text-cream-200">Batches</p>
          <p className="text-xs text-cream-400 mt-1">{approvedBatches} approved{pendingBatches > 0 ? `, ${pendingBatches} pending` : ""}</p>
          <p className="text-xs text-earth-300 mt-2">View →</p>
        </button>
        <button
          type="button"
          onClick={() => onGoToTab("jars")}
          className="text-left p-4 rounded-lg border border-earth-500 bg-earth-500/20 hover:bg-earth-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-earth-400"
        >
          <p className="text-2xl font-semibold text-cream-50">{jars.length}</p>
          <p className="text-sm font-medium text-cream-200">Stock (jars)</p>
          <p className="text-xs text-cream-400 mt-1"><span className="text-green-300">{availableJars} available</span>{soldJars > 0 ? <>, {soldJars} sold</> : null}</p>
          <p className="text-xs text-earth-300 mt-2">View →</p>
        </button>
      </div>

      <div className="rounded-lg border border-earth-500 bg-earth-500/10 p-4">
        <h3 className="text-cream-200 font-medium mb-2">Quick actions</h3>
        <ul className="flex flex-wrap gap-2 text-sm">
          <li><button type="button" onClick={() => onGoToTab("batches")} className="text-earth-300 hover:text-cream-50 underline">Create batch</button></li>
          <li><button type="button" onClick={() => onGoToTab("jars")} className="text-earth-300 hover:text-cream-50 underline">Add jars / stock</button></li>
          <li><button type="button" onClick={() => onGoToTab("products")} className="text-earth-300 hover:text-cream-50 underline">Edit products</button></li>
          <li><button type="button" onClick={() => onGoToTab("lab")} className="text-earth-300 hover:text-cream-50 underline">Upload lab report</button></li>
        </ul>
      </div>
    </div>
  );
}

function OrdersTable({
  orders,
  token,
  onSuccess,
  onSuccessMessage,
}: {
  orders: AdminOrderApi[];
  token: string;
  onSuccess: () => void | Promise<void>;
  onSuccessMessage?: (msg: string) => void;
}) {
  const [paymentFilter, setPaymentFilter] = useState<string>("all");
  const [deliveryFilter, setDeliveryFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<"all" | "7" | "30">("all");
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = orders.filter((o) => {
    if (paymentFilter !== "all" && o.paymentStatus !== paymentFilter) return false;
    if (deliveryFilter !== "all" && o.deliveryStatus !== deliveryFilter) return false;
    if (dateRange !== "all" && o.createdAt) {
      const d = new Date(o.createdAt).getTime();
      const now = Date.now();
      const days = dateRange === "7" ? 7 : 30;
      if (now - d > days * 24 * 60 * 60 * 1000) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    const tA = new Date(a.createdAt || 0).getTime();
    const tB = new Date(b.createdAt || 0).getTime();
    return sortNewestFirst ? tB - tA : tA - tB;
  });

  const handleUpdateDelivery = async (orderId: string, deliveryStatus: "SHIPPED" | "DELIVERED") => {
    setUpdatingId(orderId);
    try {
      await updateAdminOrder(token, orderId, { deliveryStatus });
      onSuccessMessage?.(deliveryStatus === "SHIPPED" ? "Marked as shipped" : "Marked as delivered");
      await onSuccess();
    } catch {
      // keep state
    } finally {
      setUpdatingId(null);
    }
  };

  const copyOrderId = (orderId: string) => {
    navigator.clipboard.writeText(orderId);
    setCopiedId(orderId);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const paymentBadge = (s: string) => {
    const c = s === "PAID" ? "bg-green-600/50 text-green-200" : s === "PENDING" ? "bg-amber-600/50 text-amber-200" : "bg-earth-500/50 text-cream-300";
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c}`}>{s}</span>;
  };
  const deliveryBadge = (s: string) => {
    const c = s === "DELIVERED" ? "bg-green-600/50 text-green-200" : s === "SHIPPED" ? "bg-blue-600/50 text-blue-200" : "bg-earth-500/50 text-cream-300";
    return <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${c}`}>{s}</span>;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-cream-50">Sales ({sorted.length}{sorted.length !== orders.length ? ` of ${orders.length}` : ""})</h2>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as "all" | "7" | "30")}
            className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            aria-label="Date range"
          >
            <option value="all">All time</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            aria-label="Filter by payment"
          >
            <option value="all">All payment</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <select
            value={deliveryFilter}
            onChange={(e) => setDeliveryFilter(e.target.value)}
            className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            aria-label="Filter by delivery"
          >
            <option value="all">All delivery</option>
            <option value="PENDING">Pending</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
          </select>
          <button
            type="button"
            onClick={() => setSortNewestFirst((v) => !v)}
            className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm hover:bg-earth-500/50"
            title={sortNewestFirst ? "Show oldest first" : "Show newest first"}
          >
            Date {sortNewestFirst ? "↓" : "↑"}
          </button>
        </div>
      </div>
      <div className="overflow-x-auto rounded-lg border border-earth-500">
        <table className="w-full text-sm text-left">
          <thead className="bg-earth-500/50 text-cream-200">
            <tr>
              <th className="px-4 py-2" scope="col">Order</th>
              <th className="px-4 py-2" scope="col">Customer</th>
              <th className="px-4 py-2" scope="col">Batch / Size</th>
              <th className="px-4 py-2" scope="col">Payment</th>
              <th className="px-4 py-2" scope="col">Delivery</th>
              <th className="px-4 py-2" scope="col">Date</th>
              <th className="px-4 py-2" scope="col">Actions</th>
            </tr>
          </thead>
          <tbody className="text-cream-100 divide-y divide-earth-500/50">
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-cream-400">
                  {orders.length === 0 ? "No orders yet. Sales will appear here." : "No orders match the filters."}
                </td>
              </tr>
            ) : (
              sorted.map((o) => (
                <tr key={o.id} className="hover:bg-earth-500/20">
                  <td className="px-4 py-2">
                    <span className="font-mono">{o.orderId}</span>
                    <button
                      type="button"
                      onClick={() => copyOrderId(o.orderId)}
                      className="ml-1.5 text-cream-400 hover:text-cream-50 text-xs"
                      title="Copy order ID"
                    >
                      {copiedId === o.orderId ? "Copied" : "Copy"}
                    </button>
                  </td>
                  <td className="px-4 py-2">{o.customer?.name || o.customer?.phone || o.customerId}</td>
                  <td className="px-4 py-2">{o.batch?.batchId ?? "—"} / {o.jar?.size ?? "—"}</td>
                  <td className="px-4 py-2">{paymentBadge(o.paymentStatus)}</td>
                  <td className="px-4 py-2">{deliveryBadge(o.deliveryStatus)}</td>
                  <td className="px-4 py-2">{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-2">
                    {o.deliveryStatus === "PENDING" && (
                      <span className="flex flex-wrap gap-1">
                        <button
                          type="button"
                          onClick={() => handleUpdateDelivery(o.id, "SHIPPED")}
                          disabled={updatingId !== null}
                          className="px-2 py-1 rounded bg-blue-600/60 text-blue-100 text-xs hover:bg-blue-500/60 disabled:opacity-50"
                        >
                          {updatingId === o.id ? "…" : "Ship"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDelivery(o.id, "DELIVERED")}
                          disabled={updatingId !== null}
                          className="px-2 py-1 rounded bg-green-600/60 text-green-100 text-xs hover:bg-green-500/60 disabled:opacity-50"
                        >
                          {updatingId === o.id ? "…" : "Deliver"}
                        </button>
                      </span>
                    )}
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
  const [search, setSearch] = useState("");
  const filtered = search.trim()
    ? customers.filter(
        (c) =>
          (c.phone ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
          (c.email ?? "").toLowerCase().includes(search.toLowerCase())
      )
    : customers;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-medium text-cream-50">Customers ({filtered.length}{filtered.length !== customers.length ? ` of ${customers.length}` : ""})</h2>
        <input
          type="search"
          placeholder="Search phone, name, email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm w-48 sm:w-56 placeholder-cream-500"
          aria-label="Search customers"
        />
      </div>
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
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-cream-400">
                  {customers.length === 0 ? "No customers yet. They will appear after signing in on the site." : "No customers match your search."}
                </td>
              </tr>
            ) : (
              filtered.map((c) => (
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

function BatchesSection({
  batches,
  token,
  onSuccess,
  onSuccessMessage,
}: {
  batches: AdminBatchApi[];
  token: string;
  onSuccess: () => void | Promise<void>;
  onSuccessMessage?: (msg: string) => void;
}) {
  const [farms, setFarms] = useState<AdminFarmApi[]>([]);
  const [batchId, setBatchId] = useState("");
  const [farmId, setFarmId] = useState("");
  const [date, setDate] = useState("");
  const [cowsCount, setCowsCount] = useState("");
  const [milkLiters, setMilkLiters] = useState("");
  const [gheeOutputLiters, setGheeOutputLiters] = useState("");
  const [processingNotes, setProcessingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchAdminFarms(token)
      .then((f) => { if (!cancelled) setFarms(f); })
      .catch(() => { if (!cancelled) setFarms([]); });
    return () => { cancelled = true; };
  }, [token]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const batchIdTrim = batchId.trim().toUpperCase();
    if (!batchIdTrim) {
      setFormError("Batch ID is required (e.g. AMR-002)");
      return;
    }
    if (!farmId) {
      setFormError("Select a farm");
      return;
    }
    if (!date) {
      setFormError("Date is required");
      return;
    }
    const cows = Number(cowsCount);
    const milk = Number(milkLiters);
    const ghee = Number(gheeOutputLiters);
    if (Number.isNaN(cows) || cows < 0 || Number.isNaN(milk) || milk < 0 || Number.isNaN(ghee) || ghee < 0) {
      setFormError("Cows, Milk (L), and Ghee (L) must be non-negative numbers");
      return;
    }
    setSubmitting(true);
    try {
      await createAdminBatch(token, {
        batchId: batchIdTrim,
        farmId,
        date,
        cowsCount: cows,
        milkLiters: milk,
        gheeOutputLiters: ghee,
        processingNotes: processingNotes.trim() || undefined,
      });
      setBatchId("");
      setFarmId("");
      setDate("");
      setCowsCount("");
      setMilkLiters("");
      setGheeOutputLiters("");
      setProcessingNotes("");
      onSuccessMessage?.("Batch created");
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to create batch");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    setActionId(id);
    setFormError("");
    try {
      await approveAdminBatch(token, id);
      onSuccessMessage?.("Batch approved");
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this batch? It will not appear on the public list.")) return;
    setActionId(id);
    setFormError("");
    try {
      await rejectAdminBatch(token, id);
      onSuccessMessage?.("Batch rejected");
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="space-y-6">
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
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="text-cream-100 divide-y divide-earth-500/50">
              {batches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-cream-400">
                    No batches yet. Create one below.
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
                    <td className="px-4 py-2">
                      {b.status === "PENDING" && (
                        <span className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(b.id)}
                            disabled={actionId !== null}
                            className="text-green-300 hover:text-green-200 text-xs disabled:opacity-50"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(b.id)}
                            disabled={actionId !== null}
                            className="text-red-300 hover:text-red-200 text-xs disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-lg border border-earth-500 bg-earth-500/10 p-4 space-y-3">
        <h3 className="text-cream-200 font-medium">Create new batch</h3>
        {formError && <p className="text-red-300 text-sm">{formError}</p>}
        <form onSubmit={handleCreateBatch} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div>
            <label className="block text-cream-300 text-xs mb-1">Batch ID</label>
            <input
              type="text"
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              placeholder="e.g. AMR-002"
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Farm</label>
            <select
              value={farmId}
              onChange={(e) => setFarmId(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            >
              <option value="">Select farm</option>
              {farms.map((f) => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Cows count</label>
            <input
              type="number"
              min={0}
              value={cowsCount}
              onChange={(e) => setCowsCount(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Milk (L)</label>
            <input
              type="number"
              min={0}
              step="any"
              value={milkLiters}
              onChange={(e) => setMilkLiters(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Ghee output (L)</label>
            <input
              type="number"
              min={0}
              step="any"
              value={gheeOutputLiters}
              onChange={(e) => setGheeOutputLiters(e.target.value)}
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-cream-300 text-xs mb-1">Processing notes (optional)</label>
            <input
              type="text"
              value={processingNotes}
              onChange={(e) => setProcessingNotes(e.target.value)}
              placeholder="Optional"
              className="w-full px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <div className="sm:col-span-2 flex items-end">
            <button
              type="submit"
              disabled={submitting || farms.length === 0}
              className="px-4 py-2 rounded bg-earth-600 hover:bg-earth-500 text-cream-100 text-sm font-medium disabled:opacity-50"
            >
              {submitting ? "Creating…" : "Create batch"}
            </button>
          </div>
        </form>
        {farms.length === 0 && (
          <p className="text-cream-400 text-xs">Create a farm first (via API or DB) to add batches.</p>
        )}
      </div>
    </div>
  );
}

const JAR_SIZES = [
  { value: "SIZE_250ML" as const, label: "250 ml" },
  { value: "SIZE_500ML" as const, label: "500 ml" },
  { value: "SIZE_1L" as const, label: "1 L" },
];

function JarsSection({
  jars,
  batches,
  token,
  onSuccess,
  onSuccessMessage,
}: {
  jars: AdminJarApi[];
  batches: AdminBatchApi[];
  token: string;
  onSuccess: () => void | Promise<void>;
  onSuccessMessage?: (msg: string) => void;
}) {
  const [batchId, setBatchId] = useState("");
  const [size, setSize] = useState<"SIZE_250ML" | "SIZE_500ML" | "SIZE_1L">("SIZE_500ML");
  const [count, setCount] = useState("10");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [batchFilter, setBatchFilter] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "summary">("summary");
  const [sortBy, setSortBy] = useState<"batch" | "size" | "status">("batch");
  const filteredJars = batchFilter
    ? jars.filter((j) => (j.batch?.batchId ?? "").toUpperCase() === batchFilter.toUpperCase())
    : jars;
  const sortedJars = [...filteredJars].sort((a, b) => {
    if (sortBy === "batch") return (a.batch?.batchId ?? "").localeCompare(b.batch?.batchId ?? "");
    if (sortBy === "size") return (a.size ?? "").localeCompare(b.size ?? "");
    return (a.status ?? "").localeCompare(b.status ?? "");
  });
  // Stock summary: by batch + size, available count
  const summaryMap = filteredJars.reduce<Record<string, { available: number; sold: number }>>((acc, j) => {
    const key = `${j.batch?.batchId ?? "?"}-${j.size}`;
    if (!acc[key]) acc[key] = { available: 0, sold: 0 };
    if (j.status === "AVAILABLE") acc[key].available++;
    else acc[key].sold++;
    return acc;
  }, {});
  const summaryEntries = Object.entries(summaryMap).sort(([a], [b]) => a.localeCompare(b));
  const lowStockThreshold = 3;

  const handleAddJars = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const batchIdTrim = batchId.trim().toUpperCase();
    if (!batchIdTrim) {
      setFormError("Select a batch");
      return;
    }
    const num = parseInt(count, 10);
    if (Number.isNaN(num) || num < 1 || num > 1000) {
      setFormError("Count must be between 1 and 1000");
      return;
    }
    setSubmitting(true);
    try {
      await createAdminJarsBulk(token, { batchId: batchIdTrim, size, count: num });
      setCount("10");
      onSuccessMessage?.(`${num} jar(s) added`);
      await onSuccess();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Failed to add jars");
    } finally {
      setSubmitting(false);
    }
  };

  const available = filteredJars.filter((j) => j.status === "AVAILABLE").length;
  const sold = filteredJars.length - available;
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-cream-50">
            Stock ({filteredJars.length}{filteredJars.length !== jars.length ? ` of ${jars.length}` : ""} total, <span className="text-green-300">{available} available</span>
            {sold > 0 && <>, <span className="text-cream-300">{sold} sold</span></>})
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
              className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
              aria-label="Filter by batch"
            >
              <option value="">All batches</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>{b.batchId}</option>
              ))}
            </select>
            <span className="flex rounded-lg border border-earth-500 overflow-hidden">
              <button
                type="button"
                onClick={() => setViewMode("summary")}
                className={`px-3 py-1.5 text-sm ${viewMode === "summary" ? "bg-earth-500 text-cream-50" : "bg-earth-600/50 text-cream-300 hover:text-cream-100"}`}
              >
                Summary
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 text-sm ${viewMode === "table" ? "bg-earth-500 text-cream-50" : "bg-earth-600/50 text-cream-300 hover:text-cream-100"}`}
              >
                Table
              </button>
            </span>
            {viewMode === "table" && (
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-2 py-1.5 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
                aria-label="Sort by"
              >
                <option value="batch">Sort by batch</option>
                <option value="size">Sort by size</option>
                <option value="status">Sort by status</option>
              </select>
            )}
          </div>
        </div>

        {viewMode === "summary" ? (
          <div className="rounded-lg border border-earth-500 overflow-hidden">
            <div className="bg-earth-500/50 px-4 py-2 text-cream-200 text-sm font-medium">Stock by batch & size</div>
            {summaryEntries.length === 0 ? (
              <div className="px-4 py-6 text-center text-cream-400 text-sm">
                {jars.length === 0 ? "No jars yet. Add jars below." : "No jars in this batch."}
              </div>
            ) : (
              <ul className="divide-y divide-earth-500/50">
                {summaryEntries.map(([key]) => {
                  const [batchIdPart, sizePart] = key.split("-");
                  const { available: av, sold: sd } = summaryMap[key];
                  const isLow = av > 0 && av <= lowStockThreshold;
                  return (
                    <li key={key} className="flex items-center justify-between px-4 py-3 text-sm hover:bg-earth-500/10">
                      <span className="font-mono text-cream-100">{batchIdPart}</span>
                      <span className="text-cream-300">{sizePart}</span>
                      <span className="flex items-center gap-2">
                        <span className="text-green-300">{av} available</span>
                        {sd > 0 && <span className="text-cream-400">{sd} sold</span>}
                        {isLow && (
                          <span className="px-2 py-0.5 rounded bg-amber-600/40 text-amber-200 text-xs">Low stock</span>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-earth-500">
            <table className="w-full text-sm text-left">
              <thead className="bg-earth-500/50 text-cream-200">
                <tr>
                  <th className="px-4 py-2" scope="col">Jar ID</th>
                  <th className="px-4 py-2" scope="col">Batch</th>
                  <th className="px-4 py-2" scope="col">Size</th>
                  <th className="px-4 py-2" scope="col">Status</th>
                  <th className="px-4 py-2" scope="col">Customer</th>
                </tr>
              </thead>
              <tbody className="text-cream-100 divide-y divide-earth-500/50">
                {sortedJars.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-cream-400">
                      {jars.length === 0 ? "No jars yet. Add jars for a batch below." : "No jars in this batch. Change filter or add jars."}
                    </td>
                  </tr>
                ) : (
                  sortedJars.map((j) => (
                    <tr key={j.id} className="hover:bg-earth-500/20">
                      <td className="px-4 py-2 font-mono text-xs">{j.jarId}</td>
                      <td className="px-4 py-2">{j.batch?.batchId ?? "—"}</td>
                      <td className="px-4 py-2">{j.size}</td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${
                            j.status === "AVAILABLE" ? "bg-green-600/50 text-green-200" : "bg-earth-500/50 text-cream-300"
                          }`}
                        >
                          {j.status}
                        </span>
                      </td>
                      <td className="px-4 py-2">{j.customer?.name || j.customer?.phone || "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-lg border border-earth-500 bg-earth-500/10 p-4 space-y-3">
        <h3 className="text-cream-200 font-medium">Add jars (stock) for a batch</h3>
        {formError && <p className="text-red-300 text-sm">{formError}</p>}
        <form onSubmit={handleAddJars} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-cream-300 text-xs mb-1">Batch</label>
            <select
              value={batchId}
              onChange={(e) => setBatchId(e.target.value)}
              className="px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm min-w-[120px]"
            >
              <option value="">Select batch</option>
              {batches.map((b) => (
                <option key={b.id} value={b.batchId}>{b.batchId}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value as typeof size)}
              className="px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            >
              {JAR_SIZES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-cream-300 text-xs mb-1">Count (max 1000)</label>
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(e) => setCount(e.target.value)}
              className="w-24 px-3 py-2 rounded bg-earth-600/50 border border-earth-500 text-cream-100 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || batches.length === 0}
            className="px-4 py-2 rounded bg-earth-600 hover:bg-earth-500 text-cream-100 text-sm font-medium disabled:opacity-50"
          >
            {submitting ? "Adding…" : "Add jars"}
          </button>
        </form>
        {batches.length === 0 && (
          <p className="text-cream-400 text-xs">Create and approve a batch first (Batches tab).</p>
        )}
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
