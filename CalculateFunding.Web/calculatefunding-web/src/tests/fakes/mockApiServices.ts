import { FundingStreamPeriodProfilePattern } from "types/ProviderProfileTotalsForStreamAndPeriod";

import * as calculationService from "../../services/calculationService";
import * as policyService from "../../services/policyService";
import * as profilingService from "../../services/profilingService";
import * as publishService from "../../services/publishService";
import * as specificationService from "../../services/specificationService";
import { ValidationErrors } from "../../types/ErrorMessage";
import { JobCreatedResponse } from "../../types/JobCreatedResponse";
import { LatestPublishedDate } from "../../types/PublishedProvider/LatestPublishedDate";
import { PublishProviderDataDownload } from "../../types/PublishedProvider/PublishProviderDataDownload";
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

const makeApproveSpecificationFundingServiceSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    publishService,
    "approveSpecificationFundingService"
  );
  spy.mockResolvedValue(
    fakeAxiosResponse.success<JobCreatedResponse>({
      data: {
        jobId: "346143",
      },
    })
  );

  return spy;
};

const makeGenerateCsvForApprovalBatchSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(publishService, "generateCsvForApprovalBatch");
  spy.mockResolvedValue(
    fakeAxiosResponse.success<PublishProviderDataDownload>({
      data: {
        url: "http://generateCsvForApprovalBatch",
      },
    })
  );

  return spy;
};
const makeGenerateCsvForApprovalAllSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(publishService, "generateCsvForApprovalAll");
  spy.mockResolvedValue(
    fakeAxiosResponse.success<PublishProviderDataDownload>({
      data: {
        url: "http://generateCsvForApprovalAll",
      },
    })
  );

  return spy;
};
const makeGenerateCsvForReleaseBatchSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(publishService, "generateCsvForReleaseBatch");
  spy.mockResolvedValue(
    fakeAxiosResponse.success<PublishProviderDataDownload>({
      data: {
        url: "http://generateCsvForReleaseBatch",
      },
    })
  );

  return spy;
};
const makeGenerateCsvForReleaseAllSpy = (): JestSpy => {
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(publishService, "generateCsvForReleaseAll");
  spy.mockResolvedValue(
    fakeAxiosResponse.success<PublishProviderDataDownload>({
      data: {
        url: "http://generateCsvForReleaseAll",
      },
    })
  );

  return spy;
};

const makeSuccessfulPreValidateForRefreshFundingSpy = (): JestSpy => {
  const preValidateForRefreshFundingSpy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    publishService,
    "preValidateForRefreshFundingService"
  );
  preValidateForRefreshFundingSpy.mockResolvedValue(fakeAxiosResponse.successWithoutResult());

  return preValidateForRefreshFundingSpy;
};

const makeFailedPreValidateForRefreshFundingSpy = (
  mockValidationErrors: ValidationErrors = {
    "error-message": ["stack overflow", "divide by zero"],
    "": ["hello error"],
  }
): { spy: JestSpy; mockValidationError: jest.Mock } => {
  const mockValidationError = jest.fn().mockRejectedValue(fakeAxiosResponse.error(mockValidationErrors, 400));
  const spy: jest.SpyInstance<Promise<unknown>> = jest.spyOn(
    publishService,
    "preValidateForRefreshFundingService"
  );
  spy.mockRejectedValue(mockValidationError);

  return { spy, mockValidationError };
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
  makeSuccessfulPreValidateForRefreshFundingSpy,
  makeFailedPreValidateForRefreshFundingSpy,
  makeApproveSpecificationFundingServiceSpy,
  makeGenerateCsvForApprovalBatchSpy,
  makeGenerateCsvForApprovalAllSpy,
  makeGenerateCsvForReleaseBatchSpy,
  makeGenerateCsvForReleaseAllSpy,
  makeRefreshSpecSpy,
  makeCalcProviderSearchSpy,
  makeApproveAllCalcsSpy,
};
