import { match } from "react-router";

import { ApprovalMode } from "../../types/ApprovalMode";
import { CalculationSummary, CalculationValueType } from "../../types/CalculationDetails";
import {
  CalculationProviderResult,
  CalculationProviderSearchResponse,
} from "../../types/CalculationProviderResult";
import { CalculationType } from "../../types/CalculationSearchResponse";
import { CompletionStatus } from "../../types/CompletionStatus";
import { CoreProviderSummary, ProviderSnapshot, ProviderSource } from "../../types/CoreProviderSummary";
import { FundingConfiguration } from "../../types/FundingConfiguration";
import { JobDetails } from "../../types/jobDetails";
import { JobType } from "../../types/jobType";
import { UpdateCoreProviderVersion } from "../../types/Provider/UpdateCoreProviderVersion";
import { FundingStreamPeriodProfilePattern } from "../../types/ProviderProfileTotalsForStreamAndPeriod";
import { ProviderSummary, ProviderTransactionSummary } from "../../types/ProviderSummary";
import { PublishedProviderResult } from "../../types/PublishedProvider/PublishedProviderSearchResults";
import { PublishStatus } from "../../types/PublishStatusModel";
import { RunningStatus } from "../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../types/SpecificationSummary";
import {
  PublishedFundingTemplate,
  TemplateSearchResponse,
  TemplateSearchResult,
  TemplateStatus
} from "../../types/TemplateBuilderDefinitions";
import { FundingPeriod, FundingStream } from "../../types/viewFundingTypes";

const makeSpecificationSummary = (overrides: Partial<SpecificationSummary> = {}): SpecificationSummary => {
  return {
    id: "WIZ111",
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "Wizard Training",
    approvalStatus: "Draft",
    description: "Training in potions, spells, dark arts, card tricks and Quidditch",
    fundingPeriod: {
      id: "FP-111",
      name: "2019-20",
    },
    fundingStreams: [
      {
        name: "FS-111",
        id: "Wizard Training Scheme",
      },
    ],
    isSelectedForFunding: true,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: [],
    ...overrides,
  };
};
const makeSpecificationSummaryNotChosen = (
  overrides: Partial<SpecificationSummary> = {}
): SpecificationSummary => {
  return {
    id: "WIZ111",
    coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
    name: "Wizard Training",
    approvalStatus: "Draft",
    description: "Training in potions, spells, dark arts, card tricks and Quidditch",
    fundingPeriod: {
      id: "FP-111",
      name: "2019-20",
    },
    fundingStreams: [
      {
        name: "FS-111",
        id: "Wizard Training Scheme",
      },
    ],
    isSelectedForFunding: false,
    providerVersionId: "",
    templateIds: {},
    dataDefinitionRelationshipIds: [],
    ...overrides,
  };
};
const makeCoreProviderSummary = (overrides: Partial<CoreProviderSummary> = {}): CoreProviderSummary => {
  return {
    providerVersionId: "provider-version-4162",
    versionType: "",
    name: "CORE Provider",
    description: "",
    version: 11,
    targetDate: new Date(),
    fundingStream: "WOOF-123",
    created: new Date(),
    ...overrides,
  };
};
const makeProviderSnapshot = (overrides: Partial<ProviderSnapshot> = {}): ProviderSnapshot => {
  return {
    providerSnapshotId: 2354,
    name: "Provider Snapshot Name 2354",
    description: "Provider Snapshot Description 2354",
    version: 14,
    targetDate: new Date(),
    created: new Date(),
    fundingStreamCode: "WOOF-123",
    fundingStreamName: "Pet Training Scheme",
    ...overrides,
  };
};

const makeFundingStream = (overrides: Partial<FundingStream> = {}): FundingStream => {
  return {
    id: "Stream-111",
    name: "Wizard Training Scheme",
    ...overrides,
  };
};

const makeFundingPeriod = (overrides: Partial<FundingPeriod> = {}): FundingPeriod => {
  return {
    id: "2020-2047",
    name: "Period-111",
    ...overrides,
  };
};

const makeCalculationSummary = (overrides: Partial<CalculationSummary> = {}): CalculationSummary => {
  return {
    id: "calc-1",
    calculationType: CalculationType.Template,
    name: "Calc 1",
    calculationValueType: CalculationValueType.Currency,
    status: PublishStatus.Draft,
    version: 0,
    ...overrides,
  };
};

const makeFundingConfiguration = (overrides: Partial<FundingConfiguration> = {}): FundingConfiguration => {
  return {
    approvalMode: ApprovalMode.All,
    providerSource: ProviderSource.CFS,
    defaultTemplateVersion: "1.1",
    fundingPeriodId: makeFundingPeriod().id,
    fundingStreamId: makeFundingStream().id,
    enableConverterDataMerge: false,
    updateCoreProviderVersion: UpdateCoreProviderVersion.Manual,
    releaseChannels: [],
    enableCarryForward: false,
    ...overrides,
  };
};

const makeSuccessfulJob = (overrides: Partial<JobDetails>): JobDetails => {
  return {
    jobId: "successful-job-id",
    jobType: JobType.RunConverterDatasetMergeJob,
    statusDescription: "Create Specification job completed successfully",
    jobDescription: "Create Specification Job",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Succeeded,
    lastUpdated: new Date(),
    failures: [],
    isComplete: true,
    isSuccessful: true,
    isFailed: false,
    isActive: false,
    outcome: "Job succeeded",
    ...overrides,
  };
};
const makeFailedJob = (overrides: Partial<JobDetails>): JobDetails => {
  return {
    jobId: "failed-job-id",
    jobType: JobType.RunConverterDatasetMergeJob,
    statusDescription: "Job description",
    jobDescription: "",
    runningStatus: RunningStatus.Completed,
    completionStatus: CompletionStatus.Failed,
    failures: [],
    isSuccessful: false,
    isFailed: true,
    isActive: false,
    isComplete: true,
    outcome: "Job failed",
    ...overrides,
  };
};

const makeFundingStreamPeriodProfilePattern = (
  overrides: Partial<FundingStreamPeriodProfilePattern>
): FundingStreamPeriodProfilePattern => {
  return {
    id: "Period-111-Stream-111-Line-111-Key-111",
    fundingPeriodId: "Period-111",
    fundingStreamId: "Stream-111",
    fundingLineId: "Line-111",
    profilePatternKey: "Key-111",
    profilePatternDisplayName: "Period-111 funding",
    profilePatternDescription: "description-111",
    roundingStrategy: "rounding",
    fundingStreamPeriodStartDate: new Date(),
    fundingStreamPeriodEndDate: new Date(),
    profilePattern: [],
    providerTypeSubTypes: [],
    reProfilePastPeriods: false,
    calculateBalancingPayment: false,
    allowUserToEditProfilePattern: false,
    ...overrides,
  };
};

const makeProviderTransactionSummary = (
  overrides: Partial<ProviderTransactionSummary>
): ProviderTransactionSummary => {
  return {
    status: 2,
    results: [
      {
        providerId: "provider-id",
        status: "Approved",
        majorVersion: 0,
        minorVersion: 1,
        totalFunding: "123",
        channelCode: "",
        channelName: "Channel",
        dateChanged: new Date().toLocaleDateString(),
        author: "author",
        variationReasons: ["variation-reason-1"],
      },
    ],
    fundingTotal: "123,000",
    latestStatus: "Approved",
    ...overrides,
  };
};

const makePublishedFundingTemplate = (
  overrides: Partial<PublishedFundingTemplate>
): PublishedFundingTemplate => {
  return {
    authorId: "2000",
    authorName: "Bill Gates",
    publishDate: new Date(),
    publishNote: "another publish note",
    schemaVersion: "1.1",
    templateVersion: "3.2",
    ...overrides,
  } as PublishedFundingTemplate;
};
const makeCalcProviderSearchResult = (
  overrides?: Partial<CalculationProviderResult>
): CalculationProviderResult => {
  return {
    id: "68f64680-4675-4179-904f-4d59ba13853a_10056716",
    providerId: "10056716",
    providerName: "ACE Schools Plymouth",
    specificationId: "68f64680-4675-4179-904f-4d59ba13853a",
    specificationName: "GAG test spec1",
    lastUpdatedDate: "2020-09-30T13:49:11.948+01:00",
    localAuthority: "Plymouth",
    providerType: "Academies",
    providerSubType: "Academy alternative provision converter",
    ukprn: "10056716",
    urn: "142835",
    upin: "",
    openDate: "2016-06-01T00:00:00+00:00",
    establishmentNumber: "1106",
    calculationId: "6797ed27-cd7f-4001-9e5c-95ea41a205f4",
    calculationName: "Primary Basic Entitlement Rate",
    calculationResult: null,
    calculationExceptionType: "",
    calculationExceptionMessage: "",
    lastUpdatedDateDisplay: "30 September 01:49 pm",
    dateOpenedDisplay: "01 June 12:00 am",
    calculationResultDisplay: "Excluded",
    isIndicativeProvider: "true",
    ...overrides,
  } as CalculationProviderResult;
};

const makePublishedProviderResult = (
  overrides: Partial<PublishedProviderResult>
): PublishedProviderResult => {
  return {
    isIndicative: false,
    errors: [],
    fundingPeriodId: "Period-111",
    fundingStatus: PublishStatus.Updated,
    fundingStreamId: "Stream-111",
    fundingValue: 3456.43,
    hasErrors: false,
    localAuthority: "East London LA",
    providerName: "East London School",
    providerSubType: "What sup?",
    providerType: "whatever",
    publishedProviderVersionId: "aa123",
    specificationId: "spec1111",
    ukprn: "23932035",
    upin: "43634",
    urn: "851305",
    majorVersion: 1,
    minorVersion: 1,
    releaseChannels: [],
    ...overrides,
  } as PublishedProviderResult;
};

const makeCalcProviderSearchResponse = (
  results: CalculationProviderResult[],
  overrides?: Partial<CalculationProviderSearchResponse>
): CalculationProviderSearchResponse => {
  return {
    calculationProviderResults: results,
    totalResults: results.length,
    totalErrorResults: 0,
    currentPage: 1,
    startItemNumber: 1,
    endItemNumber: 10,
    pagerState: {
      currentPage: 1,
      lastPage: 2,
      nextPage: 2,
      pages: 2,
      displayNumberOfPages: 2,
      previousPage: 0,
    },
    facets: [{ name: "facet", facetValues: [] }],
    ...overrides,
  } as CalculationProviderSearchResponse;
};

const makeTemplateSearchResponse = (overrides: Partial<TemplateSearchResponse>): TemplateSearchResponse => ({
  endItemNumber: overrides?.results?.length ?? 0,
  pagerState: undefined,
  startItemNumber: 0,
  totalCount: overrides?.results?.length ?? 0,
  totalErrorCount: 0,
  facets: [],
  results: [],
  ...overrides
});

const makeTemplateSearchResult = (overrides: Partial<TemplateSearchResult>): TemplateSearchResult => ({
  id: "1111111",
  name: "template name",
  fundingStreamId: "DSG",
  fundingPeriodId: "1920",
  currentMajorVersion: 0,
  currentMinorVersion: 1,
  status: TemplateStatus.Draft,
  version: 1,
  lastUpdatedAuthorName: "testUser",
  lastUpdatedDate: new Date(),
  fundingStreamName: "Magical Arts Grant",
  fundingPeriodName: "2019-2020",
  hasReleasedVersion: false,
  publishedMajorVersion: 0,
  publishedMinorVersion: 0,
  ...overrides
});

const makeProviderSummary = (overrides: Partial<ProviderSummary>): ProviderSummary => {
  return {
    authority: "",
    countryCode: "",
    countryName: "",
    crmAccountId: "",
    dfeEstablishmentNumber: "",
    establishmentNumber: "establishmentNumberTest",
    furtherEducationTypeCode: "",
    furtherEducationTypeName: "",
    id: "Hog-1",
    laCode: "",
    legalName: "",
    name: "Hogwarts School of Witchcraft and Wizardry",
    navVendorNo: "",
    phaseOfEducation: "",
    postcode: "",
    providerId: "Hog",
    providerProfileIdType: "",
    providerSubType: "",
    providerType: "",
    providerVersionId: "",
    reasonEstablishmentClosedCode: "",
    reasonEstablishmentOpenedCode: "",
    rscRegionCode: "SC",
    rscRegionName: "South Central",
    status: "",
    successor: "",
    town: "",
    trustCode: "",
    trustName: "",
    trustStatus: "",
    ukprn: "ukprn test",
    upin: "",
    urn: "",
    paymentOrganisationIdentifier: "",
    paymentOrganisationName: "",
    censusWardCode: "",
    censusWardName: "",
    companiesHouseNumber: "",
    dateClosed: "",
    dateOpened: "",
    districtCode: "",
    districtName: "",
    governmentOfficeRegionCode: "LDN",
    governmentOfficeRegionName: "London",
    groupIdNumber: "",
    localAuthorityName: "",
    localGovernmentGroupTypeCode: "",
    localGovernmentGroupTypeName: "",
    middleSuperOutputAreaCode: "",
    middleSuperOutputAreaName: "",
    officialSixthFormCode: "",
    officialSixthFormName: "",
    parliamentaryConstituencyCode: "",
    parliamentaryConstituencyName: "",
    paymentOrganisationCompanyHouseNumber: "",
    paymentOrganisationLaCode: "",
    paymentOrganisationTrustCode: "",
    paymentOrganisationType: "",
    paymentOrganisationUkprn: "",
    paymentOrganisationUpin: "",
    paymentOrganisationUrn: "",
    phaseOfEducationCode: "",
    previousEstablishmentNumber: "",
    previousLaCode: "",
    previousLaName: "",
    providerSubTypeCode: "",
    providerTypeCode: "",
    statusCode: "",
    statutoryHighAge: "",
    statutoryLowAge: "",
    wardCode: "",
    wardName: "",
    londonRegionName: "Camden",
    londonRegionCode: "CDN",
    predecessors: ["predecessors1", "predecessors2"],
    successors: ["successors1", "successors2"],
    ...overrides,
  };
};

function makeMatch<T>(params: T, overrides: Partial<match<T>> = {}): match<T> {
  return {
    params,
    url: "",
    path: "",
    isExact: true,
    ...overrides,
  };
}

export const fakery = {
  makeSpecificationSummary,
  makeSpecificationSummaryNotChosen,
  makeCoreProviderSummary,
  makeProviderSnapshot,
  makeFundingStream,
  makeFundingPeriod,
  makeFundingConfiguration,
  makeCalculationSummary,
  makeSuccessfulJob,
  makeFailedJob,
  makeCalcProviderSearchResult,
  makeCalcProviderSearchResponse,
  makeFundingStreamPeriodProfilePattern,
  makeProviderTransactionSummary,
  makeProviderSummary,
  makePublishedFundingTemplate,
  makePublishedProviderResult,
  makeMatch,
  makeTemplateSearchResponse,
  makeTemplateSearchResult,
};
