"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store/auth";

interface ProvidersProps {
  children: React.ReactNode;
  initialEmail: string | null;
  initialRole: "USER" | "ADMIN" | null;
}

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

  // Hydrate Zustand store from server-read cookies (runs synchronously on first render)
  const setUser = useAuthStore((s) => s.setUser);
  const storeEmail = useAuthStore((s) => s.email);

  if (initialEmail && initialRole && !storeEmail) {
    setUser(initialEmail, initialRole);
  }

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
