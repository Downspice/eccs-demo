'use client';

import * as React from 'react';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Provider as JotaiProvider } from 'jotai';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  React.useEffect(() => {
    // Ensure dark mode is stripped from html root and local storage
    document.documentElement.classList.remove('dark');
    try {
      localStorage.removeItem('theme');
    } catch {
      // ignore
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <JotaiProvider>
        <TooltipProvider
          delayDuration={100}
          skipDelayDuration={300}
          disableHoverableContent
        >
          {children}
        </TooltipProvider>
      </JotaiProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
