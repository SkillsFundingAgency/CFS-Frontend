import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export const QueryClientProviderTestWrapper: React.FC = ({ children }) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
