﻿import * as policyService from "../../services/policyService";
import * as publishService from "../../services/publishService";
import * as specificationService from "../../services/specificationService";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";
import { fakeAxiosResponse } from "./fakeAxios";
import { LatestPublishedDate } from "../../types/PublishedProvider/LatestPublishedDate";

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

export const mockApiService = {
  makeSpecificationSummarySpy,
  makeFundingStreamsSpy,
  makeFundingPeriodsSpy,
  makeFindSpecsWithResultsSpy,
  makeGetLatestPublishDateSpy,
};