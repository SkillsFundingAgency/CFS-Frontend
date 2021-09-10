import "@testing-library/jest-dom/extend-expect";

import { render, screen, waitFor } from "@testing-library/react";
import { createLocation, createMemoryHistory } from "history";
import { DateTime } from "luxon";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { MemoryRouter,match } from "react-router";

import { getJobDetailsFromJobResponse } from "../../../helpers/jobDetailsHelper";
import * as jobSubscription from "../../../hooks/Jobs/useJobSubscription";
import { AddJobSubscription, JobNotification, JobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useRelationshipDataHook from "../../../hooks/useRelationshipData";
import { RelationshipDataQueryResult } from "../../../hooks/useRelationshipData";
import * as useSpecificationSummaryHook from "../../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../../hooks/useSpecificationSummary";
import { SelectDataSource, SelectDataSourceRouteProps } from "../../../pages/Datasets/Map/SelectDataSource";
import { DatasetRelationshipType } from "../../../types/Datasets/DatasetRelationshipType";
import { DataSourceRelationshipResponseViewModel } from "../../../types/Datasets/DataSourceRelationshipResponseViewModel";
import { JobType } from "../../../types/jobType";
import { Permission } from "../../../types/Permission";
import { RunningStatus } from "../../../types/RunningStatus";
import { ProviderDataTrackingMode } from "../../../types/Specifications/ProviderDataTrackingMode";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";

jest.spyOn(global.console, "info").mockImplementation(() => jest.fn());
jest.mock("../../../components/AdminNav");

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<SelectDataSourceRouteProps> = {
  params: {
    datasetRelationshipId: "123",
  },
  path: "",
  isExact: true,
  url: "",
};
const mockRelationshipData: DataSourceRelationshipResponseViewModel = {
  relationshipType: DatasetRelationshipType.Uploaded,
  sourceSpecificationId: "",
  sourceSpecificationName: "",
  specificationId: "asdfga",
  datasets: [],
  definitionId: "asdfa",
  definitionName: "Definition name",
  relationshipId: "34524",
  relationshipName: "relationship name",
  specificationName: "Spec Name",
};
const fundingStream: FundingStream = {
  name: "FS123",
  id: "Wizard Training Scheme",
};
const fundingPeriod: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
};
const mockSpecification: SpecificationSummary = {
  coreProviderVersionUpdates: ProviderDataTrackingMode.Manual,
  id: "asdfga",
  name: "Wizard Spec",
  approvalStatus: "",
  description: "",
  fundingPeriod: fundingPeriod,
  fundingStreams: [fundingStream],
  isSelectedForFunding: false,
  providerVersionId: "",
  templateIds: {},
  dataDefinitionRelationshipIds: [],
};
const specificationResult: SpecificationSummaryQueryResult = {
  clearSpecificationFromCache(): Promise<void> {
    return Promise.resolve(undefined);
  },
  specification: mockSpecification,
  isLoadingSpecification: false,
  errorCheckingForSpecification: null,
  haveErrorCheckingForSpecification: false,
  isFetchingSpecification: false,
  isSpecificationFetched: false,
};
const relationshipResult: RelationshipDataQueryResult = {
  relationshipData: mockRelationshipData,
  errorLoadingRelationshipData: "",
  isErrorLoadingRelationshipData: false,
  isLoadingRelationshipData: false,
};
let notification: JobNotification | undefined;
let subscription: JobSubscription | undefined = {
  fetchPriorNotifications: false,
  isEnabled: false,
  lastUpdate: undefined,
  monitorFallback: undefined,
  monitorMode: undefined,
  onDisconnect: undefined,
  filterBy: {
    jobTypes: [],
  },
  id: "abc",
  onError: () => null,
  startDate: DateTime.now(),
};

const haveNoJobNotification = () => {
  notification = undefined;
};
const haveDataMapJobInProgressNotification = () => {
  notification = {
    subscription: subscription as JobSubscription,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
      jobType: JobType.MapDatasetJob,
      specificationId: mockSpecification.id,
      outcome: "",
      runningStatus: RunningStatus.InProgress,
      completionStatus: undefined,
      invokerUserId: "testid",
      invokerUserDisplayName: "test user",
      parentJobId: "",
      lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
      created: new Date("2020-11-23T14:36:16.3435836+00:00"),
    }),
  };
};
const haveConverterWizardJobInProgressNotification = () => {
  notification = {
    subscription: subscription as JobSubscription,
    latestJob: getJobDetailsFromJobResponse({
      jobId: "b1dbd087-e404-4861-a2bd-edfdddc8e76d",
      jobType: JobType.RunConverterDatasetMergeJob,
      specificationId: mockSpecification.id,
      outcome: "",
      runningStatus: RunningStatus.InProgress,
      completionStatus: undefined,
      invokerUserId: "testid",
      invokerUserDisplayName: "test user",
      parentJobId: "",
      lastUpdated: new Date("2020-11-24T14:36:34.324284+00:00"),
      created: new Date("2020-11-23T14:36:16.3435836+00:00"),
    }),
  };
};

const jobSubscriptionSpy = jest.spyOn(jobSubscription, "useJobSubscription");
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
jobSubscriptionSpy.mockImplementation(() => {
  return {
    addSub: (request: AddJobSubscription) => {
      const sub: JobSubscription = {
        isEnabled: false,
        filterBy: request.filterBy,
        id: "sertdhw4e5t",
        onError: () => null,
        startDate: DateTime.now(),
      };
      subscription = sub;
      return Promise.resolve(sub as JobSubscription);
    },
    replaceSubs: undefined,
    removeSub: undefined,
    removeAllSubs: undefined,
    subs: [subscription] as JobSubscription[],
    results: notification ? [notification] : [],
  };
});

const withoutPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => false,
  hasMissingPermissions: true,
  isPermissionsFetched: true,
  permissionsEnabled: [],
  permissionsDisabled: [Permission.CanMapDatasets],
  missingPermissions: [Permission.CanMapDatasets],
};
const withPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => true,
  hasMissingPermissions: false,
  isPermissionsFetched: true,
  permissionsEnabled: [Permission.CanMapDatasets],
  permissionsDisabled: [],
  missingPermissions: [],
};

const renderPage = () => {
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <SelectDataSource match={matchMock} location={location} history={history} />
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("<SelectDataSource/>", () => {
  describe("when specification summary loaded", () => {
    beforeEach(() => {
      jest
        .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
        .mockImplementation(() => withPermissions);
      jest
        .spyOn(useSpecificationSummaryHook, "useSpecificationSummary")
        .mockImplementation(() => specificationResult);
      jest.spyOn(useRelationshipDataHook, "useRelationshipData").mockImplementation(
        () =>
          ({
            isLoadingRelationshipData: false,
            isErrorLoadingRelationshipData: false,
            relationshipData: {},
          } as RelationshipDataQueryResult)
      );
      renderPage();
    });

    it("renders correct specification name", () => {
      expect(screen.getAllByText(mockSpecification.name)).toHaveLength(2);
    });

    it("renders correct funding period", () => {
      expect(screen.getByText(mockSpecification.fundingPeriod.name)).toBeInTheDocument();
    });
  });
});
