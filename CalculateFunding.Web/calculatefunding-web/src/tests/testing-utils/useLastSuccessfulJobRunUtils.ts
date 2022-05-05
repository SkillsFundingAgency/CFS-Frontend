import * as hook from "../../hooks/FundingApproval/useLastSuccessfulJobRun";
import { UseLastSuccessfulJobRunResult } from "../../hooks/FundingApproval/useLastSuccessfulJobRun";
import { JobType } from "../../types/jobType";
import { fakery } from "../fakes/fakery";

const createResult = (jobType?: JobType, overrides: Partial<UseLastSuccessfulJobRunResult> = {}) => {
  return {
    lastSuccessfulJobRun: jobType ? fakery.makeSuccessfulJob({ jobType: jobType }) : undefined,
    isLoadingFundingStreams: false,
    refetchLastSuccessfulJobRun: jest.fn(),
    ...overrides,
  } as UseLastSuccessfulJobRunResult;
};

const spy: jest.SpyInstance = jest.spyOn(hook, "useLastSuccessfulJobRun");

const hasNeverHadSuccessfulJobResult = () => spy.mockImplementation(() => createResult());

const hasLastSuccessfulJobResult = (
  jobType: JobType,
  overrides: Partial<UseLastSuccessfulJobRunResult> = {}
) => spy.mockImplementation(() => createResult(jobType, overrides));

export const useLastSuccessfulJobRunUtils = {
  spy,
  hasLastSuccessfulJobResult,
  hasNeverHadSuccessfulJobResult,
};
