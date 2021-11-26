import React from "react";

import { JobSubscriptionResult, useJobSubscription } from "../hooks/Jobs/useJobSubscription";

export const JobContext = React.createContext<JobSubscriptionResult | undefined>(undefined);

export const JobContextWrapper = ({ children }: { children: React.ReactNode }) => {
  const jobSubscriptionHandler = useJobSubscription({ onError: (err) => console.log(err) });
  return <JobContext.Provider value={jobSubscriptionHandler}>{children}</JobContext.Provider>;
};

export const useJobContext = () => {
  const context = React.useContext(JobContext);
  if (context === undefined) {
    throw new Error("useJobContext must be used within an JobContext Provider");
  }

  return { ...context };
};
