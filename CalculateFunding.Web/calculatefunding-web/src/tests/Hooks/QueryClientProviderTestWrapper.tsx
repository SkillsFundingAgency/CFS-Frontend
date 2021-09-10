import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";

export const QueryClientProviderTestWrapper: React.FC = ({ children }) => {
  return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
};
