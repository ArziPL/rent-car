"use client";

/**
 * Per-request Zustand auth store — safe for Next.js App Router SSR.
 *
 * The module-level `create()` pattern produces a Node.js singleton that leaks
 * state across requests. Instead we export a factory (`createAuthStore`) and a
 * React context (`AuthStoreContext`) so that `Providers` can create one store
 * per request (via useRef) and supply it via context.  All consumers call the
 * `useAuthStore` hook which reads from that context.
 */

import { createStore } from "zustand/vanilla";
import { useStore } from "zustand";
import { createContext, useContext } from "react";

export interface AuthState {
  email: string | null;
  role: "USER" | "ADMIN" | null;
  setUser: (email: string, role: "USER" | "ADMIN") => void;
  logout: () => void;
}

export type AuthStore = ReturnType<typeof createAuthStore>;

export function createAuthStore(initial?: {
  email: string | null;
  role: "USER" | "ADMIN" | null;
}) {
  return createStore<AuthState>((set) => ({
    email: initial?.email ?? null,
    role: initial?.role ?? null,
    setUser: (email, role) => set({ email, role }),
    logout: () => set({ email: null, role: null }),
  }));
}

export const AuthStoreContext = createContext<AuthStore | null>(null);

export function useAuthStore<T>(selector: (state: AuthState) => T): T {
  const store = useContext(AuthStoreContext);
  if (!store) {
    throw new Error("useAuthStore must be used inside <Providers>");
  }
  return useStore(store, selector);
}
