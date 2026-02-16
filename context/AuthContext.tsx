"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { fetchAuthMe, type CustomerMe } from "@/lib/api";

const TOKEN_KEY = "amrytum_customer_token";

type AuthContextValue = {
  token: string | null;
  customer: CustomerMe | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setToken = useCallback((t: string | null) => {
    if (t) {
      try {
        localStorage.setItem(TOKEN_KEY, t);
      } catch {
        // ignore
      }
    } else {
      try {
        localStorage.removeItem(TOKEN_KEY);
      } catch {
        // ignore
      }
    }
    setTokenState(t);
    setCustomer(null);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    if (!stored) {
      setTokenState(null);
      setCustomer(null);
      setIsLoading(false);
      return;
    }
    setTokenState(stored);
    fetchAuthMe(stored)
      .then((me) => setCustomer(me))
      .catch(() => setToken(null))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (!token) {
      setCustomer(null);
      return;
    }
    fetchAuthMe(token)
      .then((me) => setCustomer(me))
      .catch(() => setToken(null));
  }, [token, setToken]);

  const value: AuthContextValue = {
    token,
    customer,
    setToken,
    logout,
    isLoading,
    isLoggedIn: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
