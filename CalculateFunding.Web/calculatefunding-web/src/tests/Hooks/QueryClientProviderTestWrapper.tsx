import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export const QueryClientProviderTestWrapper: React.FC = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, cacheTime: 0, staleTime: 0 } },
  });
  queryClient.clear();
  const cache = queryClient.getQueryCache();
  cache.clear();
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
