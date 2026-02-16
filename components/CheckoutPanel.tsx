"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  requestOtp,
  verifyOtp,
  fetchAddresses,
  createAddress,
  createPaymentOrder,
  createOrderCod,
  verifyPayment,
  fetchBatchesPublic,
  fetchStockAvailability,
  type AddressApi,
  type CreatePaymentOrderBody,
  type OrderInResponse,
  type StockAvailabilityApi,
} from "@/lib/api";
import { isRazorpayConfigured, getRazorpayKey } from "@/lib/env";
import { fetchPincodeDetails } from "@/lib/pincode";
import { isValidIndianPhone } from "@/lib/validation";

const inputClass =
  "w-full px-4 py-2 rounded-lg border border-earth-300 text-earth-600 placeholder-earth-400 text-sm focus:outline-none focus:ring-2 focus:ring-earth-400/50 focus:border-earth-500";

function labelToJarSize(label: string): CreatePaymentOrderBody["items"][number]["size"] {
  const lower = label.toLowerCase();
  if (lower.includes("250") || lower.includes("250ml")) return "SIZE_250ML";
  if (lower.includes("500") || lower.includes("500ml")) return "SIZE_500ML";
  if (lower.includes("1l") || lower.includes("1 l") || lower.includes("1000")) return "SIZE_1L";
  return "SIZE_500ML";
}

type CheckoutStep = "login" | "address" | "place";

export type CheckoutPanelProps = {
  onClose: () => void;
  onDone?: () => void;
  /** When true, use tighter layout for cart popup */
  compact?: boolean;
};

export function CheckoutPanel({ onClose, onDone, compact }: CheckoutPanelProps) {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const { token, setToken, isLoggedIn, isLoading: authLoading } = useAuth();
  const hasApi = !!process.env.NEXT_PUBLIC_API_URL;

  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>("login");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [addresses, setAddresses] = useState<AddressApi[]>([]);
  const [addressesLoading, setAddressesLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);
  const [placeOrderError, setPlaceOrderError] = useState("");
  const [placeOrderSuccess, setPlaceOrderSuccess] = useState(false);
  const [placedOrderIds, setPlacedOrderIds] = useState<string[]>([]);
  const [addressForm, setAddressForm] = useState({
    name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: "", is_default: true,
  });
  const [addressSubmitLoading, setAddressSubmitLoading] = useState(false);
  const [addressSubmitError, setAddressSubmitError] = useState("");
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [availability, setAvailability] = useState<StockAvailabilityApi | null>(null);
  const [stockWarning, setStockWarning] = useState("");

  const loadAddresses = useCallback(async () => {
    if (!token) return;
    setAddressesLoading(true);
    try {
      const list = await fetchAddresses(token);
      setAddresses(list);
      const defaultAddr = list.find((a) => a.isDefault) ?? list[0];
      setSelectedAddressId(defaultAddr?.id ?? null);
    } catch {
      setAddresses([]);
    } finally {
      setAddressesLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadAddresses();
  }, [token, loadAddresses]);

  useEffect(() => {
    if (!hasApi) setCheckoutStep("place");
    else if (!isLoggedIn) setCheckoutStep("login");
    else setCheckoutStep("address");
  }, [hasApi, isLoggedIn]);

  useEffect(() => {
    if (!hasApi || cart.length === 0) return;
    let cancelled = false;
    setStockWarning("");
    fetchStockAvailability()
      .then((data) => {
        if (!cancelled) setAvailability(data);
      })
      .catch(() => { if (!cancelled) setAvailability(null); });
    return () => { cancelled = true; };
  }, [hasApi, cart.length]);

  useEffect(() => {
    if (!availability || cart.length === 0) return;
    const warnings: string[] = [];
    cart.forEach((item) => {
      const sizeKey = labelToJarSize(item.label);
      if (!sizeKey) return;
      const available = availability[sizeKey] ?? 0;
      if (item.quantity > available && available > 0) {
        updateQuantity(item.productId, item.sizeId, available);
        warnings.push(`${item.productName} (${item.label}) reduced to ${available} (available).`);
      } else if (item.quantity > available && available === 0) {
        removeItem(item.productId, item.sizeId);
        warnings.push(`${item.productName} (${item.label}) removed (out of stock).`);
      }
    });
    if (warnings.length > 0) setStockWarning(warnings.join(" "));
  }, [availability]);

  const hasRazorpay = isRazorpayConfigured();

  const handlePlaceOrder = useCallback(async () => {
    setPlaceOrderError("");
    setPlaceOrderLoading(true);
    if (!hasApi) {
      setPlaceOrderError("API not configured.");
      setPlaceOrderLoading(false);
      return;
    }
    if (!token) {
      setPlaceOrderError("Please log in again.");
      setPlaceOrderLoading(false);
      return;
    }
    if (!selectedAddressId || addresses.length === 0) {
      setPlaceOrderError("Select a shipping address");
      setPlaceOrderLoading(false);
      return;
    }
    if (cart.length === 0) {
      setPlaceOrderError("Your cart is empty. Add items from the shop first.");
      setPlaceOrderLoading(false);
      return;
    }
    try {
      const batches = await fetchBatchesPublic();
      const approved = batches.filter((b: { status: string }) => b.status === "APPROVED");
      const batchId = approved[0]?.batchId;
      if (!batchId) {
        setPlaceOrderError("No batches available. Try again later.");
        setPlaceOrderLoading(false);
        return;
      }
      const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
      const amountPaise = Math.round(cartTotal * 100);

      if (hasRazorpay && amountPaise >= 100) {
        const items = cart.map((item) => ({
          size: labelToJarSize(item.label) ?? "SIZE_500ML",
          quantity: item.quantity,
        }));
        const paymentOrder = await createPaymentOrder(token, {
          address_id: selectedAddressId,
          batch_id: batchId,
          amount_paise: amountPaise,
          items,
        });
        const keyId = getRazorpayKey();
        const loadScript = (): Promise<void> =>
          new Promise((resolve, reject) => {
            if (typeof window !== "undefined" && (window as unknown as { Razorpay?: unknown }).Razorpay) {
              resolve();
              return;
            }
            const script = document.createElement("script");
            script.src = "https://checkout.razorpay.com/v1/checkout.js";
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error("Failed to load payment"));
            document.body.appendChild(script);
          });
        await loadScript();
        const RazorpayConstructor = (window as unknown as { Razorpay: new (o: unknown) => { open: () => void } }).Razorpay;
        const rzp = new RazorpayConstructor({
          key: keyId,
          amount: paymentOrder.amount,
          currency: paymentOrder.currency,
          order_id: paymentOrder.razorpayOrderId,
          name: "AMRYTUM",
          description: "A2 Desi Cow Ghee",
          handler: async (res: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
            try {
              const verified = await verifyPayment(token, {
                razorpay_order_id: res.razorpay_order_id,
                razorpay_payment_id: res.razorpay_payment_id,
                razorpay_signature: res.razorpay_signature,
              });
              const ids = (verified.orders as OrderInResponse[]).map((o) => o.orderId);
              setPlacedOrderIds(ids);
              clearCart();
              setPlaceOrderSuccess(true);
            } catch (err) {
              setPlaceOrderError(err instanceof Error ? err.message : "Payment verification failed.");
            } finally {
              setPlaceOrderLoading(false);
            }
          },
          modal: { ondismiss: () => setPlaceOrderLoading(false) },
        });
        rzp.open();
        return;
      }

      // Cash on Delivery when Razorpay is not configured
      const items = cart.map((item) => ({
        size: labelToJarSize(item.label) ?? "SIZE_500ML",
        quantity: item.quantity,
      }));
      const codPayload = {
        address_id: selectedAddressId,
        batch_id: batchId,
        amount_paise: amountPaise,
        items,
      };
      const { orders } = await createOrderCod(token, codPayload);
      const ids = (orders as OrderInResponse[]).map((o) => o.orderId);
      setPlacedOrderIds(ids);
      clearCart();
      setPlaceOrderSuccess(true);
    } catch (e) {
      const message = e instanceof Error ? e.message : typeof e === "string" ? e : "Failed to place order";
      setPlaceOrderError(message);
    } finally {
      setPlaceOrderLoading(false);
    }
  }, [hasApi, hasRazorpay, token, selectedAddressId, addresses.length, cart, clearCart]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartTotalFormatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(cartTotal);
  const isEmpty = cart.length === 0;

  const handleDone = useCallback(() => {
    onDone?.();
    onClose();
  }, [onDone, onClose]);

  if (placeOrderSuccess) {
    const goToConfirmation = () => {
      onDone?.();
      onClose();
      if (placedOrderIds.length > 0) {
        const q = new URLSearchParams({ orderIds: placedOrderIds.join(",") });
        window.location.href = `/orders/confirmation?${q.toString()}`;
      } else {
        window.location.href = "/orders";
      }
    };
    return (
      <div className={`space-y-4 text-center ${compact ? "p-3" : "p-4 sm:p-6"}`} role="status" aria-live="polite">
        <p className="font-medium text-earth-600">Order placed successfully.</p>
        {placedOrderIds.length > 0 && (
          <p className="text-xs text-earth-500 font-mono">
            Order {placedOrderIds.length === 1 ? "ID" : "IDs"}: {placedOrderIds.join(", ")}
          </p>
        )}
        <p className="text-sm text-earth-500">Thank you for your order.</p>
        <div className="flex flex-col gap-2">
          <Button variant="primary" size="md" className="w-full" onClick={goToConfirmation}>
            {placedOrderIds.length > 0 ? "View confirmation" : "Done"}
          </Button>
          {hasApi && placedOrderIds.length > 0 && (
            <Button variant="outline" size="md" className="w-full" onClick={handleDone}>
              Done
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className={compact ? "p-3" : "p-4 sm:p-6"}>
        <p className="text-earth-400 text-sm">Cart is empty.</p>
      </div>
    );
  }

  const steps = hasApi
    ? [
        { id: "cart", label: "Cart" },
        { id: "login", label: "Login" },
        { id: "address", label: "Address" },
        { id: "place", label: hasRazorpay ? "Pay" : "Place order" },
      ]
    : [{ id: "place", label: "Cart & Pay" }];
  const currentStepId = hasApi ? checkoutStep : "place";
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  const cartSection = (
    <div className={compact ? "mb-3" : "mb-6"}>
      {hasApi && steps.length > 1 && (
        <nav aria-label="Checkout steps" className="mb-4">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-earth-500">
            {steps.map((s, i) => (
              <li key={s.id} className="flex items-center gap-1.5">
                <span
                  className={
                    currentIndex === i
                      ? "font-medium text-earth-600"
                      : "text-earth-400"
                  }
                >
                  {i + 1}. {s.label}
                </span>
                {i < steps.length - 1 && (
                  <span className="text-earth-300" aria-hidden="true">
                    →
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
      {stockWarning && (
        <p className="text-amber-600 text-sm mb-2" role="alert" aria-live="polite">
          {stockWarning}
        </p>
      )}
      <p className="text-sm font-medium text-earth-600 mb-2">Your cart</p>
      <ul className={`space-y-3 mb-3 ${compact ? "space-y-2" : ""}`}>
        {cart.map((item) => (
          <li
            key={`${item.productId}-${item.sizeId}`}
            className="flex items-center justify-between gap-2 text-sm border-b border-earth-200/40 pb-3 last:border-0 last:pb-0"
          >
            <div className="min-w-0 flex-1">
              <p className="text-earth-600 font-medium truncate">{item.productName}</p>
              <p className="text-earth-400 text-xs">{item.label} — {item.inr} each</p>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity - 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-earth-300 text-earth-500 hover:bg-earth-200/50 transition-colors"
                aria-label="Decrease quantity"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-7 text-center text-earth-600 tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => updateQuantity(item.productId, item.sizeId, item.quantity + 1)}
                className="w-8 h-8 flex items-center justify-center rounded border border-earth-300 text-earth-500 hover:bg-earth-200/50 transition-colors"
                aria-label="Increase quantity"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => removeItem(item.productId, item.sizeId)}
                className="p-1.5 text-earth-400 hover:text-red-500 hover:bg-earth-200/30 rounded transition-colors"
                aria-label="Remove"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <span className="text-earth-600 font-medium w-16 text-right tabular-nums">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(
                item.price * item.quantity
              )}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex justify-between text-earth-600 border-t border-earth-200/50 pt-2 mt-2">
        <span className="font-medium">Total</span>
        <span className="font-serif text-lg">{cartTotalFormatted}</span>
      </div>
    </div>
  );

  // Login step
  if (hasApi && checkoutStep === "login") {
    const handleRequestOtp = async () => {
      setOtpError("");
      if (!phone.trim()) {
        setOtpError("Enter your phone number");
        return;
      }
      if (!isValidIndianPhone(phone.trim())) {
        setOtpError("Enter a valid 10-digit Indian mobile number");
        return;
      }
      setOtpLoading(true);
      try {
        await requestOtp(phone.trim());
        setOtpSent(true);
        setOtpCode("");
      } catch (e) {
        setOtpError(e instanceof Error ? e.message : "Failed to send OTP");
      } finally {
        setOtpLoading(false);
      }
    };
    const handleVerifyOtp = async () => {
      setOtpError("");
      if (!otpCode.trim() || otpCode.length !== 6) {
        setOtpError("Enter the 6-digit OTP");
        return;
      }
      setOtpLoading(true);
      try {
        const res = await verifyOtp(phone.trim(), otpCode.trim());
        setToken(res.token);
        setCheckoutStep("address");
      } catch (e) {
        setOtpError(e instanceof Error ? e.message : "Invalid OTP");
      } finally {
        setOtpLoading(false);
      }
    };
    return (
      <div className={compact ? "p-3" : "p-4 sm:p-6 space-y-6"}>
        {cartSection}
        <div className="space-y-4">
          <p className="text-sm font-medium text-earth-600">Login with phone</p>
          {!otpSent ? (
            <>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                className={inputClass + " py-2.5"}
                aria-describedby={otpError ? "login-error" : undefined}
              />
              <Button variant="primary" size="md" className="w-full" onClick={handleRequestOtp} disabled={otpLoading}>
                {otpLoading ? "Sending…" : "Send OTP"}
              </Button>
            </>
          ) : (
            <>
              <p className="text-sm text-earth-500">OTP sent to {phone}.</p>
              <input
                type="text"
                inputMode="numeric"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                className={inputClass + " py-2.5"}
                aria-describedby={otpError ? "login-error" : undefined}
              />
              <div className="flex gap-2">
                <Button variant="secondary" size="md" className="flex-1" onClick={() => { setOtpSent(false); setOtpCode(""); setOtpError(""); }}>
                  Change number
                </Button>
                <Button variant="primary" size="md" className="flex-1" onClick={handleVerifyOtp} disabled={otpLoading}>
                  {otpLoading ? "Verifying…" : "Verify"}
                </Button>
              </div>
            </>
          )}
          {otpError && (
            <p id="login-error" className="text-sm text-red-600" role="alert" aria-live="polite">
              {otpError}
            </p>
          )}
        </div>
      </div>
    );
  }

  // Address step
  if (hasApi && checkoutStep === "address" && token) {
    if (addressesLoading) {
      return (
        <div className={compact ? "p-3" : "p-4 sm:p-6"}>
          {cartSection}
          <p className="text-sm text-earth-400">Loading addresses…</p>
        </div>
      );
    }

    if (showAddAddress) {
      const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        setAddressSubmitError("");
        if (!addressForm.name.trim() || !addressForm.phone.trim() || !addressForm.address_line1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.pincode.trim()) {
          setAddressSubmitError("Fill all required fields");
          return;
        }
        setAddressSubmitLoading(true);
        try {
          await createAddress(token, {
            name: addressForm.name.trim(), phone: addressForm.phone.trim(), address_line1: addressForm.address_line1.trim(),
            address_line2: addressForm.address_line2.trim() || undefined, city: addressForm.city.trim(), state: addressForm.state.trim(),
            pincode: addressForm.pincode.trim(), is_default: addressForm.is_default,
          });
          setAddressForm({ name: "", phone: "", address_line1: "", address_line2: "", city: "", state: "", pincode: "", is_default: true });
          setShowAddAddress(false);
          loadAddresses();
        } catch (e) {
          setAddressSubmitError(e instanceof Error ? e.message : "Failed to add address");
        } finally {
          setAddressSubmitLoading(false);
        }
      };
      return (
        <div className={compact ? "p-3 space-y-4" : "p-4 sm:p-6 space-y-6"}>
          {cartSection}
          <div className="space-y-4">
            <p className="text-sm font-medium text-earth-600">Add shipping address</p>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <input required placeholder="Name" value={addressForm.name} onChange={(e) => setAddressForm((f) => ({ ...f, name: e.target.value }))} className={inputClass} />
              <input required type="tel" placeholder="Phone" value={addressForm.phone} onChange={(e) => setAddressForm((f) => ({ ...f, phone: e.target.value }))} className={inputClass} />
              <input required placeholder="Address line 1" value={addressForm.address_line1} onChange={(e) => setAddressForm((f) => ({ ...f, address_line1: e.target.value }))} className={inputClass} />
              <input placeholder="Address line 2 (optional)" value={addressForm.address_line2} onChange={(e) => setAddressForm((f) => ({ ...f, address_line2: e.target.value }))} className={inputClass} />
              <div>
                <input
                  required
                  placeholder="Pincode (6 digits)"
                  value={addressForm.pincode}
                  onChange={(e) => setAddressForm((f) => ({ ...f, pincode: e.target.value.replace(/\D/g, "").slice(0, 6) }))}
                  onBlur={async () => {
                    if (addressForm.pincode.length !== 6) return;
                    setPincodeLoading(true);
                    try {
                      const details = await fetchPincodeDetails(addressForm.pincode);
                      if (details) setAddressForm((f) => ({ ...f, city: details.city, state: details.state }));
                    } finally {
                      setPincodeLoading(false);
                    }
                  }}
                  className={inputClass}
                />
                {pincodeLoading && <p className="text-earth-400 text-xs mt-1">Looking up city/state…</p>}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input required placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm((f) => ({ ...f, city: e.target.value }))} className={inputClass} />
                <input required placeholder="State" value={addressForm.state} onChange={(e) => setAddressForm((f) => ({ ...f, state: e.target.value }))} className={inputClass} />
              </div>
              <label className="flex items-center gap-2 text-sm text-earth-600">
                <input type="checkbox" checked={addressForm.is_default} onChange={(e) => setAddressForm((f) => ({ ...f, is_default: e.target.checked }))} className="rounded border-earth-300 focus:ring-2 focus:ring-earth-400/50" />
                Set as default
              </label>
              {addressSubmitError && <p className="text-sm text-red-600">{addressSubmitError}</p>}
              <div className="flex gap-2">
                <Button type="button" variant="secondary" size="md" onClick={() => setShowAddAddress(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="md" disabled={addressSubmitLoading}>{addressSubmitLoading ? "Saving…" : "Save address"}</Button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    if (addresses.length === 0) {
      return (
        <div className={compact ? "p-3 space-y-4" : "p-4 sm:p-6 space-y-6"}>
          {cartSection}
          <div className="space-y-4">
            <p className="text-sm font-medium text-earth-600">Shipping address</p>
            <p className="text-sm text-earth-500">Add an address to deliver your order.</p>
            <Button variant="primary" size="md" className="w-full" onClick={() => setShowAddAddress(true)}>Add address</Button>
          </div>
        </div>
      );
    }

    return (
      <div className={compact ? "p-3 space-y-4" : "p-4 sm:p-6 space-y-6"}>
        {cartSection}
        <div className="space-y-4">
          <p className="text-sm font-medium text-earth-600">Select address</p>
          <ul className="space-y-2">
            {addresses.map((addr) => (
              <li key={addr.id}>
                <label className={`flex gap-3 p-3 rounded-lg border cursor-pointer ${selectedAddressId === addr.id ? "border-earth-600 bg-earth-200/10" : "border-earth-200/60"}`}>
                  <input type="radio" name="address" checked={selectedAddressId === addr.id} onChange={() => setSelectedAddressId(addr.id)} className="mt-1 focus:ring-2 focus:ring-earth-400/50" />
                  <div className="text-sm text-earth-600">
                    <p className="font-medium">{addr.name}, {addr.phone}</p>
                    <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                    <p>{addr.city}, {addr.state} — {addr.pincode}</p>
                  </div>
                </label>
              </li>
            ))}
          </ul>
          <Button type="button" variant="secondary" size="md" className="w-full" onClick={() => setShowAddAddress(true)}>Add new address</Button>
          <Button type="button" variant="primary" size="md" className="w-full" onClick={() => setCheckoutStep("place")}>Continue to place order</Button>
        </div>
      </div>
    );
  }

  // Place order step: show whenever we're on "place" and API is configured (validation runs on click)
  if (hasApi && checkoutStep === "place") {
    const selectedAddr = addresses.find((a) => a.id === selectedAddressId);
    return (
      <div className={compact ? "p-3 space-y-4" : "p-4 sm:p-6 space-y-6"}>
        {cartSection}
        <div className="space-y-4">
          <p className="text-sm font-medium text-earth-600">{hasRazorpay ? "Place order" : "Place order (Cash on Delivery)"}</p>
          {!hasRazorpay && (
            <p className="text-sm text-earth-600 bg-earth-100/50 border border-earth-200 rounded-lg px-3 py-2" role="status">
              Pay when your order is delivered. Click below to place your order.
            </p>
          )}
          {!token && !authLoading && <p className="text-sm text-amber-600">Log in first, then select an address and place order.</p>}
          {selectedAddr && (
            <div className="p-3 rounded-lg border border-earth-200/60 text-sm text-earth-600 bg-cream-100/30">
              <p className="font-medium">{selectedAddr.name}, {selectedAddr.phone}</p>
              <p>{selectedAddr.addressLine1}{selectedAddr.addressLine2 ? `, ${selectedAddr.addressLine2}` : ""}</p>
              <p>{selectedAddr.city}, {selectedAddr.state} — {selectedAddr.pincode}</p>
            </div>
          )}
          {placeOrderError && (
            <p className="text-sm text-red-600" role="alert" aria-live="polite">
              {placeOrderError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" size="md" className="flex-1" onClick={() => setCheckoutStep("address")}>Back</Button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handlePlaceOrder();
              }}
              disabled={placeOrderLoading}
              className="inline-flex flex-1 items-center justify-center rounded-lg border border-earth-600 bg-earth-600 px-6 py-3 text-sm font-medium tracking-wide text-cream-50 transition-all duration-300 hover:bg-earth-500 focus:outline-none focus:ring-2 focus:ring-earth-400 focus:ring-offset-2 focus:ring-offset-cream-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {placeOrderLoading ? "Placing order…" : hasRazorpay ? "Place order" : "Place order (Cash on Delivery)"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No API or fallback: just cart + message
  return (
    <div className={compact ? "p-3" : "p-4 sm:p-6 space-y-6"}>
      {cartSection}
      {!hasApi && (
        <p className="text-sm text-earth-400">
          Set <code className="bg-earth-200/20 px-1 rounded">NEXT_PUBLIC_API_URL</code> to enable login and place order.
        </p>
      )}
      {hasApi && checkoutStep === "place" && !isLoggedIn && authLoading && <p className="text-sm text-earth-500">Loading…</p>}
      {hasApi && checkoutStep === "place" && !isLoggedIn && !authLoading && <p className="text-sm text-earth-500">Log in to place order.</p>}
    </div>
  );
}
