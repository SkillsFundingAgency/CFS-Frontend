﻿import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AxiosError } from "axios";
import { createLocation, createMemoryHistory } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as ReactQuery from "react-query";
import { UseQueryResult } from "react-query/types/react/types";
import { Provider } from "react-redux";
import { match, MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import { AppContextWrapper } from "../../../context/AppContextWrapper";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { CreateDatasetRouteProps } from "../../../pages/Datasets/Create/SelectDatasetTypeToCreate";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { EligibleSpecificationReferenceModel } from "../../../types/Datasets/EligibleSpecificationReferenceModel";
import { Permission } from "../../../types/Permission";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";

const mockHistoryBlock = jest.fn();
const mockHistoryPush = jest.fn();
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
    block: mockHistoryBlock,
  }),
}));
const history = createMemoryHistory();
const fundingStream1: FundingStream = {
  name: "WIZZ1",
  id: "Wizard Training Scheme",
};
const fundingStream2: FundingStream = {
  name: "DRK1",
  id: "Dark Arts Programme",
};
const fundingPeriod1: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
};
const fundingPeriod2: FundingPeriod = {
  id: "FP124",
  name: "2020-21",
};
const fundingPeriod3: FundingPeriod = {
  id: "FP125",
  name: "2021-22",
};
const testSpec1: SpecificationSummary = {
  name: "Wizard Training",
  approvalStatus: "",
  description: "",
  fundingPeriod: fundingPeriod1,
  fundingStreams: [fundingStream1],
  id: "ABC123",
  isSelectedForFunding: true,
  providerVersionId: "",
  dataDefinitionRelationshipIds: [],
  templateIds: {},
  coreProviderVersionUpdates: undefined,
  providerSnapshotId: 34,
};

const mockRoute: match<CreateDatasetRouteProps> = {
  params: {
    forSpecId: testSpec1.id,
  },
  url: "",
  path: "",
  isExact: true,
};
const renderPage = () => {
  const {
    SelectReferenceSpecification,
  } = require("../../../pages/Datasets/Create/SelectReferenceSpecification");
  store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <AppContextWrapper>
            <SelectReferenceSpecification location={location} history={history} match={mockRoute} />
          </AppContextWrapper>
        </Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("<SelectReferenceSpecification />", () => {
  describe("<SelectReferenceSpecification /> when no options available", () => {
    beforeEach(() => {
      hasPermissions();
      hasSpecification();
      hasNoOptions();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Create data set/ })).toBeInTheDocument();
    });

    it("does not render Permissions banner", async () => {
      const banner = await screen.queryByLabelText(/Permissions/);
      expect(banner).not.toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have permissions to perform the following/)
      ).not.toBeInTheDocument();
    });

    it("renders the no-options message", async () => {
      const text = await screen.getByText(
        /There are no funding streams to select. There is either no data sharing enabled with the funding stream of the current specification or there are no enabled funding streams with released data./
      );
      expect(text).toBeInTheDocument();
    });

    it("does not render Continue button", async () => {
      const button = screen.queryByRole("button", { name: /Continue/ });
      expect(button).not.toBeInTheDocument();
    });

    it("does not render Cancel button", async () => {
      const button = screen.queryByRole("button", { name: /Cancel/ });
      expect(button).not.toBeInTheDocument();
    });

    it("renders Back button as enabled", async () => {
      const button = screen.getByRole("link", { name: /Back/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });
  });

  describe("<SelectReferenceSpecification /> when options are available", () => {
    beforeEach(() => {
      hasPermissions();
      hasSpecification();
      hasValidOptions();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Create data set/ })).toBeInTheDocument();
    });

    it("does not render Permissions banner", async () => {
      const banner = await screen.queryByLabelText(/Permissions/);
      expect(banner).not.toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have permissions to perform the following/)
      ).not.toBeInTheDocument();
    });

    it("renders the funding stream selection list", async () => {
      const combobox = screen.getByRole("combobox", { name: /Select funding stream/ });
      expect(combobox).toBeInTheDocument();
      expect(within(combobox).getByRole("option", { name: fundingStream1.name })).toBeInTheDocument();
      expect(within(combobox).getByRole("option", { name: fundingStream2.name })).toBeInTheDocument();
    });

    it("does not render Continue button", async () => {
      const button = screen.queryByRole("button", { name: /Continue/ });
      expect(button).not.toBeInTheDocument();
    });

    it("renders Cancel button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Cancel/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    describe("and when user selects Funding Stream", () => {
      beforeEach(async () => {
        const combobox = screen.getByRole("combobox", { name: /Select funding stream/ });

        await userEvent.selectOptions(combobox, fundingStream2.id);
      });

      it("renders the applicable funding periods", async () => {
        const combobox = screen.getByRole("combobox", { name: /Select funding period/ });
        expect(combobox).toBeInTheDocument();
        expect(within(combobox).getByRole("option", { name: fundingPeriod2.name })).toBeInTheDocument();
        expect(within(combobox).getByRole("option", { name: fundingPeriod3.name })).toBeInTheDocument();
        expect(within(combobox).queryByRole("option", { name: fundingPeriod1.name })).not.toBeInTheDocument();
      });

      describe("and when user selects Funding Period", () => {
        beforeEach(async () => {
          const combobox = screen.getByRole("combobox", { name: /Select funding period/ });
          expect(within(combobox).getByRole("option", { name: fundingPeriod2.name })).toBeInTheDocument();

          await userEvent.selectOptions(combobox, fundingPeriod2.id);
        });

        it("renders the associated specification name", async () => {
          const item = screen.getByRole("definition", { name: /Specification/ });
          expect(within(item).getByText(/spec B/)).toBeInTheDocument();
        });
      });
    });
  });

  describe("<SelectReferenceSpecification /> when user doesn't have permission", () => {
    beforeEach(async () => {
      hasMissingPermissions();
      hasSpecification();
      hasValidOptions();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Create data set/ })).toBeInTheDocument();
    });

    it("renders Permissions banner", async () => {
      const banner = await screen.getByLabelText(/Permissions/);
      expect(banner).toBeInTheDocument();
      expect(
        within(banner).getByText(/You do not have permissions to perform the following/)
      ).toBeInTheDocument();
      expect(within(banner).getByText(/edit specification/i)).toBeInTheDocument();
    });

    it("does not render Continue button", async () => {
      const button = screen.queryByRole("button", { name: /Continue/ });
      expect(button).not.toBeInTheDocument();
    });

    it("renders Cancel button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Cancel/ }) as HTMLInputElement;
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();

      userEvent.click(button);

      expect(mockHistoryPush).toBeCalledWith("/Datasets/Create/SelectDatasetTypeToCreate/ABC123");
    });
  });
});

const hasSpecification = () =>
  jest.spyOn(specHook, "useSpecificationSummary").mockImplementation(() => ({
    specification: testSpec1,
    isLoadingSpecification: false,
    errorCheckingForSpecification: null,
    haveErrorCheckingForSpecification: false,
    isFetchingSpecification: false,
    isSpecificationFetched: true,
    clearSpecificationFromCache: () => Promise.resolve(),
  }));

const withoutPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => false,
  hasMissingPermissions: true,
  isPermissionsFetched: true,
  permissionsEnabled: [],
  permissionsDisabled: [Permission.CanEditSpecification],
  missingPermissions: [Permission.CanEditSpecification],
};
const withPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => true,
  hasMissingPermissions: false,
  isPermissionsFetched: true,
  permissionsEnabled: [Permission.CanEditSpecification],
  permissionsDisabled: [],
  missingPermissions: [],
};
const hasMissingPermissions = () => {
  jest
    .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
    .mockImplementation(() => withoutPermissions);
};

const hasPermissions = () => {
  jest
    .spyOn(useSpecificationPermissionsHook, "useSpecificationPermissions")
    .mockImplementation(() => withPermissions);
};

const mockNoOptions: EligibleSpecificationReferenceModel[] = [];
const mockValidOptions: EligibleSpecificationReferenceModel[] = [
  {
    specificationId: "specA",
    specificationName: "spec A",
    fundingStreamId: fundingStream1.id,
    fundingStreamName: fundingStream1.name,
    fundingPeriodId: fundingPeriod1.id,
    fundingPeriodName: fundingPeriod1.name,
  },
  {
    specificationId: "specB",
    specificationName: "spec B",
    fundingStreamId: fundingStream2.id,
    fundingStreamName: fundingStream2.name,
    fundingPeriodId: fundingPeriod2.id,
    fundingPeriodName: fundingPeriod2.name,
  },
  {
    specificationId: "specC",
    specificationName: "spec C",
    fundingStreamId: fundingStream2.id,
    fundingStreamName: fundingStream2.name,
    fundingPeriodId: fundingPeriod3.id,
    fundingPeriodName: fundingPeriod3.name,
  },
];
const useQuerySpy = jest.spyOn(ReactQuery, "useQuery");

const hasValidOptions = () => {
  useQuerySpy.mockReturnValue({
    data: mockValidOptions,
    status: "success",
    isSuccess: true,
    isFetched: true,
  } as UseQueryResult<EligibleSpecificationReferenceModel[], AxiosError>);
};

const hasNoOptions = () => {
  useQuerySpy.mockReturnValueOnce({
    data: mockNoOptions,
    status: "success",
    isSuccess: true,
    isFetched: true,
  } as UseQueryResult<EligibleSpecificationReferenceModel[], AxiosError>);
};
