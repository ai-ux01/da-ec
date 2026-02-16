"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const CART_STORAGE_KEY = "amrytum_cart";

export type CartItem = {
  productId: string;
  productName: string;
  sizeId: string;
  label: string;
  price: number;
  inr: string;
  quantity: number;
};

type CartContextValue = {
  cart: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity: number) => void;
  removeItem: (productId: string, sizeId: string) => void;
  updateQuantity: (productId: string, sizeId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

function loadCartFromStorage(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (i): i is CartItem =>
        typeof i === "object" &&
        i !== null &&
        typeof (i as CartItem).productId === "string" &&
        typeof (i as CartItem).productName === "string" &&
        typeof (i as CartItem).sizeId === "string" &&
        typeof (i as CartItem).label === "string" &&
        typeof (i as CartItem).price === "number" &&
        typeof (i as CartItem).inr === "string" &&
        typeof (i as CartItem).quantity === "number"
    );
  } catch {
    return [];
  }
}

function saveCartToStorage(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  try {
    if (cart.length === 0) {
      localStorage.removeItem(CART_STORAGE_KEY);
    } else {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  } catch {
    // ignore
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(loadCartFromStorage());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    saveCartToStorage(cart);
  }, [hydrated, cart]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity: number) => {
      setCart((prev) => {
        const existing = prev.find(
          (i) => i.productId === item.productId && i.sizeId === item.sizeId
        );
        if (existing) {
          return prev.map((i) =>
            i.productId === item.productId && i.sizeId === item.sizeId
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, sizeId: string) => {
    setCart((prev) =>
      prev.filter((i) => !(i.productId === productId && i.sizeId === sizeId))
    );
  }, []);

  const updateQuantity = useCallback((productId: string, sizeId: string, quantity: number) => {
    setCart((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => !(i.productId === productId && i.sizeId === sizeId));
      }
      return prev.map((i) =>
        i.productId === productId && i.sizeId === sizeId ? { ...i, quantity } : i
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, removeItem, updateQuantity, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
