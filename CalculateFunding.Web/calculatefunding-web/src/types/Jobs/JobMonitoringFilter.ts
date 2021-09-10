import { JobType } from "../jobType";

export interface JobMonitoringFilter {
  jobTypes?: JobType[];
  jobId?: string | undefined;
  triggerByEntityId?: string | undefined;
  includeChildJobs?: boolean | undefined;
  specificationId?: string | undefined;
}
