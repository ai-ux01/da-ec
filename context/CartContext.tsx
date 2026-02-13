"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";

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
  totalItems: number;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

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

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, addItem, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
