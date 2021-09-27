import { render, screen } from "@testing-library/react";
import { createLocation, createMemoryHistory } from "history";
import { DateTime } from "luxon";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { match, MemoryRouter } from "react-router";

import * as jobSubscription from "../../../hooks/Jobs/useJobSubscription";
import { AddJobSubscription } from "../../../hooks/Jobs/useJobSubscription";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useRelationshipDataHook from "../../../hooks/useRelationshipData";
import { RelationshipDataQueryResult } from "../../../hooks/useRelationshipData";
import * as useSpecificationSummaryHook from "../../../hooks/useSpecificationSummary";
import { SpecificationSummaryQueryResult } from "../../../hooks/useSpecificationSummary";
import { SelectDataSource, SelectDataSourceRouteProps } from "../../../pages/Datasets/Map/SelectDataSource";
import { JobNotification, JobSubscription } from "../../../types/Jobs/JobSubscriptionModels";
import { Permission } from "../../../types/Permission";
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
