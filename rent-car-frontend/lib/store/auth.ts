"use client";

import { create } from "zustand";

interface AuthState {
  email: string | null;
  role: "USER" | "ADMIN" | null;
  setUser: (email: string, role: "USER" | "ADMIN") => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  email: null,
  role: null,
  setUser: (email, role) => set({ email, role }),
  logout: () => set({ email: null, role: null }),
}));
