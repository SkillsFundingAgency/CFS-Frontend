import * as fundingStreamsHook from "../../hooks/useFundingStreams";
import { FundingStreamsQueryResult } from "../../hooks/useFundingStreams";
import { FundingStream } from "../../types/viewFundingTypes";

const createFundingStreamsResult = (
  fundingStreams: FundingStream[],
  overrides: Partial<FundingStreamsQueryResult> = {}
) => {
  return {
    fundingStreams,
    isLoadingFundingStreams: false,
    ...overrides,
  };
};

const spy: jest.SpyInstance = jest.spyOn(fundingStreamsHook, "useFundingStreams");

const hasFundingStreamsResult = (
  fundingStreams: FundingStream[],
  overrides: Partial<FundingStreamsQueryResult> = {}
) => spy.mockImplementation(() => createFundingStreamsResult(fundingStreams, overrides));

export const useFundingStreamsUtils = {
  spy,
  hasFundingStreamsResult,
};
