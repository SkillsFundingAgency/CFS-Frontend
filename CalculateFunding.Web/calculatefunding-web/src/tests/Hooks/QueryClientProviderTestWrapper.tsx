import {QueryClient, QueryClientProvider} from "react-query";
import React from "react";

export const QueryClientProviderTestWrapper: React.FC = ({children}) => {
    return <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>;
};