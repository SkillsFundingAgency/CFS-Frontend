import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createLocation } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Provider } from "react-redux";
import { match, MemoryRouter } from "react-router";
import { createStore, Store } from "redux";

import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import * as useSpecificationPermissionsHook from "../../../hooks/Permissions/useSpecificationPermissions";
import * as specHook from "../../../hooks/useSpecificationSummary";
import { CreateDatasetRouteProps } from "../../../pages/Datasets/Create/SelectDatasetTypeToCreate";
import { IStoreState, rootReducer } from "../../../reducers/rootReducer";
import { Permission } from "../../../types/Permission";
import { SpecificationSummary } from "../../../types/SpecificationSummary";
import { FundingPeriod, FundingStream } from "../../../types/viewFundingTypes";

const mockHistory = { push: jest.fn() };
const location = createLocation("", "", "");
const store: Store<IStoreState> = createStore(rootReducer);

const fundingStream1: FundingStream = {
  name: "WIZZ1",
  id: "Wizard Training Scheme",
};
const fundingPeriod1: FundingPeriod = {
  id: "FP123",
  name: "2019-20",
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
  const { SelectDatasetTypeToCreate } = require("../../../pages/Datasets/Create/SelectDatasetTypeToCreate");
  store.dispatch = jest.fn();
  return render(
    <MemoryRouter>
      <QueryClientProvider client={new QueryClient()}>
        <Provider store={store}>
          <SelectDatasetTypeToCreate location={location} history={mockHistory} match={mockRoute} />
        </Provider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

describe("<SelectDatasetTypeToCreate />", () => {
  describe("<SelectDatasetTypeToCreate /> when loading normally", () => {
    beforeEach(() => {
      hasPermissions();
      hasSpecification();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Which data set type?/ })).toBeInTheDocument();
    });

    it("does not render  Permissions banner", async () => {
      const banner = await screen.queryByLabelText(/Permissions/);
      expect(banner).not.toBeInTheDocument();
      expect(
        screen.queryByText(/You do not have permissions to perform the following/)
      ).not.toBeInTheDocument();
    });

    it("renders Released data option as enabled", async () => {
      const input = await screen.getByRole("radio", { name: /Released data/ });
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });

    it("renders Uploaded data option as enabled", async () => {
      const input = await screen.getByRole("radio", { name: /Uploaded data/ });
      expect(input).toBeInTheDocument();
      expect(input).toBeEnabled();
    });

    it("renders Continue button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Continue/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    it("renders Cancel button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Cancel/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
    });

    describe("and when user tries to continue without making any selection", () => {
      beforeEach(async () => {
        const button = screen.getByRole("button", { name: /Continue/ });
        await userEvent.click(button);
      });

      it("renders error summary", async () => {
        expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
        expect(await screen.findByText("There is a problem")).toBeInTheDocument();
      });

      it("renders error message", async () => {
        const alerts = await screen.findAllByRole("alert");
        alerts.some((alert) => within(alert).getByText(/Select released data or uploaded data/));
      });
    });

    describe("and when user selects Released option", () => {
      beforeEach(async () => {
        const input = await screen.getByRole("radio", { name: /Released data/ });

        await userEvent.click(input);

        const button = screen.getByRole("button", { name: /Continue/ });
        await userEvent.click(button);
      });

      it("redirects to correct page", async () => {
        expect(mockHistoryPush).toBeCalledWith(
          "/Datasets/Create/SelectReferenceSpecification/" + testSpec1.id
        );
      });
    });

    describe("and when user selects Uploaded option", () => {
      beforeEach(async () => {
        const input = await screen.getByRole("radio", { name: /Uploaded data/ });

        await userEvent.click(input);

        const button = screen.getByRole("button", { name: /Continue/ });
        await userEvent.click(button);
      });

      it("redirects to correct page", async () => {
        expect(mockHistoryPush).toBeCalledWith("/Datasets/CreateDataset/" + testSpec1.id);
      });
    });
  });

  describe("<SelectDatasetTypeToCreate /> when user doesn't have permission", () => {
    beforeEach(async () => {
      hasMissingPermissions();
      hasSpecification();
      renderPage();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders correct heading", async () => {
      expect(screen.getByRole("heading", { name: /Which data set type?/ })).toBeInTheDocument();
    });

    it("renders Permissions banner", async () => {
      const banner = await screen.getByLabelText(/Permissions/);
      expect(banner).toBeInTheDocument();
      expect(
        within(banner).getByText(/You do not have permissions to perform the following/)
      ).toBeInTheDocument();
      expect(within(banner).getByText(/edit specification/i)).toBeInTheDocument();
    });

    it("renders Released data option as disabled", async () => {
      const input = await screen.getByLabelText(/Released data/);
      expect(input).toBeInTheDocument();
      expect(input).toBeDisabled();
    });

    it("renders Uploaded data option as disabled", async () => {
      const input = await screen.getByLabelText(/Uploaded data/);
      expect(input).toBeInTheDocument();
      expect(input).toBeDisabled();
    });

    it("renders Continue button as disabled", async () => {
      const button = screen.getByRole("button", { name: /Continue/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });

    it("renders Cancel button as enabled", async () => {
      const button = screen.getByRole("button", { name: /Cancel/ });
      expect(button).toBeInTheDocument();
      expect(button).toBeEnabled();
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

const mockHistoryPush = jest.fn();

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
  }),
}));
