"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";

// アプリ全体でTanStack Queryを使うための共通プロバイダです。
export function Providers({ children }: { children: ReactNode }) {
  // QueryClientは再レンダリングのたびに作り直さないよう、useStateで1回だけ生成します。
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
