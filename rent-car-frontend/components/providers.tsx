"use client";

import { useRef, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createAuthStore,
  AuthStoreContext,
  type AuthStore,
} from "@/lib/store/auth";

interface ProvidersProps {
  children: React.ReactNode;
  initialEmail: string | null;
  initialRole: "USER" | "ADMIN" | null;
}

/**
 * Application providers.
 *
 * Creates one Zustand auth store per component instance (i.e. per request in
 * RSC / SSR) and exposes it via AuthStoreContext so that `useAuthStore` in any
 * child component always reads the store that belongs to the current request —
 * never a module-level singleton shared across all concurrent requests.
 */
export function Providers({ children, initialEmail, initialRole }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      })
  );

  // Initialise the store exactly once per Providers instance (per request).
  // useRef guarantees the factory is not re-run on re-renders and, because this
  // is a client component, the ref is isolated to the component tree — not
  // shared between concurrent SSR requests on the server.
  const storeRef = useRef<AuthStore | null>(null);
  if (!storeRef.current) {
    storeRef.current = createAuthStore({ email: initialEmail, role: initialRole });
  }

  return (
    <AuthStoreContext.Provider value={storeRef.current}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </AuthStoreContext.Provider>
  );
}
