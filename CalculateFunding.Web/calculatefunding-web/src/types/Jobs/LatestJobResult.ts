import { JobDetails } from "../jobDetails";

export type LatestJobResult = {
  lastJob: JobDetails | undefined;
  isCheckingForJob: boolean;
  errorCheckingForJob: string;
  haveErrorCheckingForJob: boolean;
  isFetching: boolean;
  isFetched: boolean;
};
