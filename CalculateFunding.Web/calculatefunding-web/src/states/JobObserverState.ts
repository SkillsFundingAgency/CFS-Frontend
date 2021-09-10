import { JobMonitoringFilter } from "../types/Jobs/JobMonitoringFilter";

export interface JobObserverState {
  jobFilter: JobMonitoringFilter | undefined;
}
