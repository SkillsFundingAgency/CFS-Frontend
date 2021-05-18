import { JobMonitoringFilter } from '../hooks/Jobs/useJobMonitor';

export interface JobObserverState {
  jobFilter: JobMonitoringFilter | undefined,
}