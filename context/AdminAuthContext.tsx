"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

const TOKEN_KEY = "amrytum_admin_token";

type AdminAuthContextValue = {
  token: string | null;
  setToken: (t: string | null) => void;
  logout: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
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
  }, []);

  const logout = useCallback(() => {
    setToken(null);
  }, [setToken]);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
    setTokenState(stored);
    setIsLoading(false);
  }, []);

  const value: AdminAuthContextValue = {
    token,
    setToken,
    logout,
    isLoading,
    isLoggedIn: !!token,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}
