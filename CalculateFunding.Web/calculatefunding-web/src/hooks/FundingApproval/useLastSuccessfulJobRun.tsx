import { AxiosError } from "axios";
import { useQuery, UseQueryOptions } from "react-query";

import { getJobDetailsFromJobResponse } from "../../helpers/jobDetailsHelper";
import { getLatestSuccessfulJob } from "../../services/jobService";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";

export interface UseLastSuccessfulJobRunResult {
  lastSuccessfulJobRun: JobDetails | undefined;
  refetchLastSuccessfulJobRun: () => void;
  isLoadingLastSuccessfulJobRun: boolean;
}

export const useLastSuccessfulJobRun = ({
  specificationId,
  jobType,
  options = {},
}: {
  specificationId: string;
  jobType: JobType;
  options: Partial<UseQueryOptions<JobDetails | undefined, AxiosError>>;
}): UseLastSuccessfulJobRunResult => {
  const { data, refetch, isLoading } = useQuery<JobDetails | undefined, AxiosError>(
    ["last-spec-refresh", specificationId, jobType],
    async () => getJobDetailsFromJobResponse((await getLatestSuccessfulJob(specificationId, jobType)).data),
    {
      cacheTime: 0,
      refetchOnWindowFocus: false,
      enabled: !!specificationId?.length,
      ...options,
    }
  );

  return {
    lastSuccessfulJobRun: data,
    refetchLastSuccessfulJobRun: refetch,
    isLoadingLastSuccessfulJobRun: isLoading,
  };
};
