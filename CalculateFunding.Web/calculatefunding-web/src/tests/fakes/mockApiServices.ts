import { FundingStreamPeriodProfilePattern } from "types/ProviderProfileTotalsForStreamAndPeriod";

import * as calculationService from "../../services/calculationService";
import * as policyService from "../../services/policyService";
import * as profilingService from "../../services/profilingService";
import * as publishService from "../../services/publishService";
import * as specificationService from "../../services/specificationService";
import { LatestPublishedDate } from "../../types/PublishedProvider/LatestPublishedDate";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";
import { fakeAxiosResponse } from "./fakeAxios";

export type JestSpy = jest.SpyInstance<Promise<unknown>>;

const makeSpecificationSummarySpy = (spec: SpecificationSummary): JestSpy => {
  const getSpecificationSummaryServiceSpy = jest.spyOn(
    specificationService,
    "getSpecificationSummaryService"
  );
  getSpecificationSummaryServiceSpy.mockResolvedValue(
    fakeAxiosResponse.success<SpecificationSummary>({ data: spec })
  );
  return getSpecificationSummaryServiceSpy;
};

const makeFundingStreamsSpy = (fundingStreams: FundingStream[]): JestSpy => {
  const getFundingStreamsServiceSpy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    policyService,
    "getFundingStreamsService"
  );
  getFundingStreamsServiceSpy.mockResolvedValue(fakeAxiosResponse.success({ data: fundingStreams }));

  return getFundingStreamsServiceSpy;
};

const makeFundingPeriodsSpy = (fundingPeriods: FundingPeriod[]): JestSpy => {
  const getFundingPeriodsServiceSpy = jest.spyOn(
    specificationService,
    "getFundingPeriodsByFundingStreamIdService"
  );
  getFundingPeriodsServiceSpy.mockResolvedValue(
    fakeAxiosResponse.success({
      data: fundingPeriods,
    })
  );

  return getFundingPeriodsServiceSpy;
};

const makeFindSpecsWithResultsSpy = (specs: SpecificationSummary[]): JestSpy => {
  const findMatchingSpecsServiceSpy = jest.spyOn(specificationService, "getSpecificationsWithResultsService");
  findMatchingSpecsServiceSpy.mockResolvedValue(
    fakeAxiosResponse.success({
      data: specs,
    })
  );

  return findMatchingSpecsServiceSpy;
};

const makeGetLatestPublishDateSpy = (lastPublishDate: LatestPublishedDate): JestSpy => {
  const getLatestPublishedDateSpy = jest.spyOn(publishService, "getLatestPublishedDate");
  getLatestPublishedDateSpy.mockResolvedValue(
    fakeAxiosResponse.success({
      data: lastPublishDate,
    })
  );

  return getLatestPublishedDateSpy;
};

const makeProfilePatternsSpy = (
  fundingStreamPeriodProfilePatterns: FundingStreamPeriodProfilePattern[]
): JestSpy => {
  const getAllProfilePatternsSpy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    profilingService,
    "getAllProfilePatterns"
  );
  getAllProfilePatternsSpy.mockResolvedValue(
    fakeAxiosResponse.success({ data: fundingStreamPeriodProfilePatterns })
  );

  return getAllProfilePatternsSpy;
};

const makeRefreshSpecSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    publishService,
    "refreshSpecificationFundingService"
  );
  spy.mockResolvedValue(fakeAxiosResponse.successWithoutResult());

  return spy;
};

const makeCalcProviderSearchSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    calculationService,
    "searchCalculationProviders"
  );
  spy.mockResolvedValue(fakeAxiosResponse.successWithoutResult());

  return spy;
};

const makeUpdateSpecSpy = (): JestSpy => {
  const updateSpecSpy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    specificationService,
    "updateSpecificationService"
  );
  updateSpecSpy.mockResolvedValue(fakeAxiosResponse.successWithoutResult());

  return updateSpecSpy;
};

const makeApproveAllCalcsSpy = (): JestSpy => {
  const updateSpecSpy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    calculationService,
    "approveAllCalculationsService"
  );
  updateSpecSpy.mockResolvedValue(fakeAxiosResponse.successWithoutResult());

  return updateSpecSpy;
};

export const mockApiService = {
  makeSpecificationSummarySpy,
  makeFundingStreamsSpy,
  makeFundingPeriodsSpy,
  makeFindSpecsWithResultsSpy,
  makeGetLatestPublishDateSpy,
  makeProfilePatternsSpy,
  makeUpdateSpecSpy,
  makeRefreshSpecSpy,
  makeCalcProviderSearchSpy,
  makeApproveAllCalcsSpy,
};
