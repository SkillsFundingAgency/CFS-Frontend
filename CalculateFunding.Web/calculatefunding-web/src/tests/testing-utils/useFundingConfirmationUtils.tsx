import { UseFundingConfirmationResult } from "../../hooks/FundingApproval/useFundingConfirmation";
import * as hook from "../../hooks/FundingApproval/useFundingConfirmation";
import { PublishedProviderFundingCount } from "../../types/PublishedProvider/PublishedProviderFundingCount";
import { fakery } from "../fakes/fakery";

const fundingSummaryData: PublishedProviderFundingCount = {
  fundingStreamsFundings: [{ fundingStreamId: "DSK", totalFunding: 536 }],
  localAuthorities: [],
  count: 2,
  indicativeProviderTotalFunding: 4565,
  indicativeProviderCount: 1,
  paidProviderCount: 1,
  paidProvidersTotalFunding: 4362,
  localAuthoritiesCount: 0,
  providerTypesCount: 0,
  providerTypes: [],
  totalFunding: 89432,
};

const createResult = (overrides: Partial<UseFundingConfirmationResult> = {}) =>
  ({
    specification: fakery.makeSpecificationSummary({}),
    isLoadingSpecification: false,
    fundingConfiguration: fakery.makeFundingConfiguration({}),
    isLoadingFundingConfiguration: false,
    fundingSummary: fundingSummaryData,
    clearFundingSearchSelection: jest.fn(),
    latestJob: undefined,
    isWaitingForJob: false,
    isPermissionsFetched: true,
    hasPermissionToApprove: true,
    hasPermissionToRelease: true,
    hasPermissionToReleaseForStatement: true,
    hasPermissionToReleaseForContractorPayments: true,
    selectedProviderIds: [],
    notifications: [],
    specificationLastUpdatedDate: undefined,
    ...overrides,
  } as UseFundingConfirmationResult);

const spy: jest.SpyInstance = jest.spyOn(hook, "useFundingConfirmation");

const withFundingConfirmationResult = (overrides: Partial<UseFundingConfirmationResult> = {}) =>
  spy.mockImplementation(() => createResult(overrides));

export const useFundingConfirmationUtils = {
  spy,
  withFundingConfirmationResult,
};
