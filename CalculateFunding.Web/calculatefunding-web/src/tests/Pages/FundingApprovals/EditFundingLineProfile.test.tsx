import "@testing-library/jest-dom";

import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createLocation, createMemoryHistory } from "history";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import * as redux from "react-redux";
import { match, MemoryRouter } from "react-router";

import { ConfirmationModal } from "../../../components/ConfirmationModal";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import { ViewEditFundingLineProfileProps } from "../../../pages/FundingApprovals/ViewEditFundingLineProfile";
import { Permission } from "../../../types/Permission";
import { hasSpecPermissions } from "../../fakes/testFactories";

describe("<ViewEditFundingLineProfile in EDIT mode />", () => {
  afterEach(async () => {
    mockHistoryPush.mockClear();
    mockApplyCustomProfile.mockClear();
  });

  afterAll(() => {
    mockGetFundingLinePublishedProviderDetails.mockClear();
    useSelectorSpy.mockClear();
  });

  describe("rendering checks", () => {
    beforeEach(async () => {
      useSelectorSpy.mockReturnValue([
        {
          fundingStreamId: "fundingStreamId",
          canApplyCustomProfilePattern: true,
        },
      ]);
      mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
        data: {
          fundingLineProfile: testFundingLineProfile,
          enableUserEditableCustomProfiles: true,
          enableUserEditableRuleBasedProfiles: true,
          contractedProvider: true,
        },
      });
      hasSpecPermissions(withPermissions);

      await renderPage();
    });

    it("does not show a permissions message", async () => {
      expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
    });

    it("edit historical payments link is rendered", async () => {
      expect(await screen.findByRole("button", { name: /Edit historic instalments/ })).toBeInTheDocument();
    });

    it("edit profile button is not rendered", async () => {
      expect(await screen.queryByRole("button", { name: /Edit profile/ })).not.toBeInTheDocument();
    });

    it("paid records are in readonly view", async () => {
      expect(screen.queryByTestId("value-1")).not.toBeInTheDocument();
    });

    it("unpaid records are in edit view", async () => {
      await waitFor(() => {
        expect(screen.getByTestId("value-2")).toBeInTheDocument();
        expect(screen.getAllByRole("textbox")).toHaveLength(2);
      });
    });

    it("renders the funding line heading", async () => {
      expect(await screen.findByRole("heading", { name: /Profile for My Funding Line/ }));
    });

    it("renders the provider name", async () => {
      expect(await screen.findByRole("heading", { name: /Methods Primary School/ }));
    });

    it("renders the last updated info", async () => {
      expect(await screen.findByTestId("last-updated-by")).toHaveTextContent(
        "Last updated by test user on 10 September 1907"
      );
    });

    it("renders the UKPRN", async () => {
      const dd = await screen.findByRole("definition", { name: /UKPRN/ });
      expect(within(dd).getByText(testFundingLineProfile.ukprn)).toBeInTheDocument();
    });

    it("renders the total allocation", async () => {
      const dd = await screen.findByRole("definition", { name: /Total allocation/ });
      expect(within(dd).getByText(/£100.00/)).toBeInTheDocument();
    });

    it("renders the amount already paid", async () => {
      const amountAlreadyPaidEl = await screen.findByRole("definition", { name: /Instalments paid value/ });
      expect(within(amountAlreadyPaidEl).getByText(/£40.00/)).toBeInTheDocument();
    });

    it("renders the balance available", async () => {
      const balanceAvailableEl = await screen.findByRole("definition", {
        name: /Balance available for profiling/,
      });
      expect(within(balanceAvailableEl).getByText(/£60.00/)).toBeInTheDocument();
    });

    it("redirects user to view mode when user clicks cancel button", async () => {
      const button = await screen.findByRole("button", { name: /Cancel/ });

      userEvent.click(button);

      expect(mockHistoryPush).toBeCalledWith(
        "/Approvals/ProviderFundingOverview/specId/providerId/providerVersionId/fundingStreamId/fundingPeriodId/fundingLineId/view"
      );
    });

    it("blocks user from navigating when user has edited something", async () => {
      const profileInput = screen.getByTestId("value-2");

      userEvent.clear(profileInput);
      userEvent.type(profileInput, "11");
      userEvent.tab();

      const cancelButton = await screen.findByRole("button", { name: /Cancel/ });
      userEvent.click(cancelButton);

      expect(mockHistoryBlock).toBeCalled();
    });

    describe("when user clicks on edit historic payments", () => {
      it("allows editing of paid profile totals ", async () => {
        const button = await screen.findByRole("button", { name: /Edit historic instalments/ });
        expect(button).toBeInTheDocument();

        userEvent.click(button);

        await waitFor(() => {
          expect(screen.queryByRole("button", { name: /Edit historic instalments/ })).not.toBeInTheDocument();
          expect(screen.getByTestId("value-1")).toBeInTheDocument();
          expect(screen.getByTestId("value-2")).toBeInTheDocument();
          expect(screen.getAllByRole("textbox")).toHaveLength(4);
          expect(screen.getByText(/You are editing historic instalments/)).toBeInTheDocument();
        });
      });
    });

    it("posts custom profile to api when apply profile button clicked", async () => {
      const saveButton = await screen.findByRole("button", { name: /Apply profile/ });
      userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApplyCustomProfile).toHaveBeenCalledTimes(1);
        expect(mockApplyCustomProfile).toHaveBeenCalledWith({
          carryOver: null,
          customProfileName: "providerId-fundingStreamId-fundingPeriodId-fundingLineId",
          fundingLineCode: "fundingLineId",
          fundingPeriodId: "fundingPeriodId",
          fundingStreamId: "fundingStreamId",
          profilePeriods: [
            {
              distributionPeriodId: "period",
              occurrence: 1,
              profiledValue: 40,
              type: "CalendarMonth",
              typeValue: "April",
              year: 2020,
            },
            {
              distributionPeriodId: "period",
              occurrence: 1,
              profiledValue: 60,
              type: "CalendarMonth",
              typeValue: "May",
              year: 2020,
            },
          ],
          providerId: "providerId",
        });
      });
    });

    it("posts correct custom profile to api when carry over applies", async () => {
      const profileInput = screen.getByTestId("value-2");
      const profilePercent = screen.getByTestId("percent-2") as HTMLInputElement;

      userEvent.clear(profileInput);
      userEvent.type(profileInput, "25");
      userEvent.tab();

      await waitFor(() => {
        expect(profilePercent.value).toBe("41.6666667");
      });

      const saveButton = await screen.findByRole("button", { name: /Apply profile/ });
      userEvent.click(saveButton);

      await waitFor(() => {
        expect(mockApplyCustomProfile).toHaveBeenCalledTimes(1);
        expect(mockApplyCustomProfile).toHaveBeenCalledWith({
          carryOver: 35,
          customProfileName: "providerId-fundingStreamId-fundingPeriodId-fundingLineId",
          fundingLineCode: "fundingLineId",
          fundingPeriodId: "fundingPeriodId",
          fundingStreamId: "fundingStreamId",
          profilePeriods: [
            {
              distributionPeriodId: "period",
              occurrence: 1,
              profiledValue: 40,
              type: "CalendarMonth",
              typeValue: "April",
              year: 2020,
            },
            {
              distributionPeriodId: "period",
              occurrence: 1,
              profiledValue: 25,
              type: "CalendarMonth",
              typeValue: "May",
              year: 2020,
            },
          ],
          providerId: "providerId",
        });
      });
    });
  });

  describe("when user does not have canApplyCustomProfilePattern permission", () => {
    beforeAll(() => {
      mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
        data: {
          fundingLineProfile: testFundingLineProfile,
          enableUserEditableCustomProfiles: true,
          enableUserEditableRuleBasedProfiles: true,
        },
      });
      hasSpecPermissions(withoutPermissions);
    });

    afterAll(() => {
      mockGetFundingLinePublishedProviderDetails.mockClear();
    });

    it("shows a permissions message", async () => {
      await renderPage();

      expect(await screen.findByTestId("permission-alert-message")).toBeInTheDocument();
    });

    it("apply profile button is disabled", async () => {
      await renderPage();

      expect(await screen.findByRole("button", { name: /Apply profile/ })).toBeDisabled();
    });

    it("fields initially load in read (not edit) view", async () => {
      await waitFor(() => {
        expect(screen.queryAllByRole("textbox")).toHaveLength(0);
      });
    });
  });

  describe("when funding stream is restricted", () => {
    beforeAll(() => {
      useSelectorSpy.mockReturnValue([
        {
          fundingStreamId: "fundingStreamId",
          canApplyCustomProfilePattern: true,
        },
      ]);
    });

    it("does not show edit profile button when enableUserEditableCustomProfiles is false", async () => {
      mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
        data: {
          fundingLineProfile: testFundingLineProfile,
          enableUserEditableCustomProfiles: false,
          enableUserEditableRuleBasedProfiles: true,
        },
      });

      await renderPage();
      await waitFor(() => {
        expect(screen.queryByTestId("edit-profile-btn")).not.toBeInTheDocument();
      });
    });

    it("does not show change to rule based profile button when enableUserEditableRuleBasedProfiles is false", async () => {
      mockGetFundingLinePublishedProviderDetails.mockResolvedValue({
        data: {
          fundingLineProfile: testFundingLineProfile,
          enableUserEditableCustomProfiles: true,
          enableUserEditableRuleBasedProfiles: false,
        },
      });

      await renderPage();
      await waitFor(() => {
        expect(screen.queryByText(/Change to rule based profile/i)).not.toBeInTheDocument();
      });
    });
  });
});

// Setup mocks and spies
const useSelectorSpy = jest.spyOn(redux, "useSelector");
const mockHistoryPush = jest.fn();
const mockHistoryBlock = jest.fn();
const mockApplyCustomProfile = jest.fn();
const mockGetFundingLinePublishedProviderDetails = jest.fn();

jest.mock("../../../services/fundingLineDetailsService", () => ({
  getPreviousProfileExistsForSpecificationForProviderForFundingLine: jest.fn(() =>
    Promise.resolve({
      data: {},
    })
  ),
}));

jest.mock("react-router", () => ({
  ...jest.requireActual("react-router"),
  useHistory: () => ({
    push: mockHistoryPush,
    block: mockHistoryBlock,
  }),
}));

const renderPage = async () => {
  const {
    ViewEditFundingLineProfile,
  } = require("../../../pages/FundingApprovals/ViewEditFundingLineProfile");
  const page = render(
    <MemoryRouter
      getUserConfirmation={(message, callback) =>
        ConfirmationModal(message, callback, "Leave this page", "Stay on this page")
      }
    >
      <QueryClientProvider client={new QueryClient()}>
        <ViewEditFundingLineProfile match={matchMock} location={location} history={history} />
      </QueryClientProvider>
    </MemoryRouter>
  );

  await waitFor(() => expect(screen.queryByTestId("loader")).not.toBeInTheDocument());

  return page;
};

const history = createMemoryHistory();
const location = createLocation("", "", "");
const matchMock: match<ViewEditFundingLineProfileProps> = {
  params: {
    specificationId: "specId",
    providerId: "providerId",
    specCoreProviderVersionId: "providerVersionId",
    fundingLineId: "fundingLineId",
    fundingPeriodId: "fundingPeriodId",
    fundingStreamId: "fundingStreamId",
    editMode: "edit",
  },
  path: "",
  isExact: true,
  url: "",
};

jest.mock("../../../services/publishedProviderFundingLineService", () => ({
  getFundingLinePublishedProviderDetails: mockGetFundingLinePublishedProviderDetails,
  applyCustomProfile: mockApplyCustomProfile,
}));

const withoutPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => false,
  hasMissingPermissions: true,
  isPermissionsFetched: true,
  permissionsEnabled: [],
  permissionsDisabled: [Permission.CanApplyCustomProfilePattern],
  missingPermissions: [Permission.CanApplyCustomProfilePattern],
};
const withPermissions: SpecificationPermissionsResult = {
  userId: "3456",
  isCheckingForPermissions: false,
  hasPermission: () => true,
  hasMissingPermissions: false,
  isPermissionsFetched: true,
  permissionsEnabled: [Permission.CanApplyCustomProfilePattern],
  permissionsDisabled: [],
  missingPermissions: [],
};
const testFundingLineProfile = {
  fundingLineCode: "fl123",
  fundingLineName: "My Funding Line",
  ukprn: "12345",
  fundingLineAmount: 100,
  amountAlreadyPaid: 40,
  remainingAmount: 60,
  carryOverAmount: 0,
  providerName: "Methods Primary School",
  profilePatternKey: "key",
  profilePatternName: "pattern",
  profilePatternDescription: "description",
  lastUpdatedUser: {
    id: "1",
    name: "test user",
  },
  lastUpdatedDate: new Date(Date.UTC(2, 2, 2020)),
  profileTotalAmount: 100,
  profileTotals: [
    {
      year: 2020,
      typeValue: "April",
      occurrence: 1,
      value: 40,
      periodType: "CalendarMonth",
      isPaid: true,
      installmentNumber: 1,
      profileRemainingPercentage: null,
      distributionPeriodId: "period",
      actualDate: new Date(1, 1, 2020),
    },
    {
      year: 2020,
      typeValue: "May",
      occurrence: 1,
      value: 60,
      periodType: "CalendarMonth",
      isPaid: false,
      installmentNumber: 2,
      profileRemainingPercentage: 100,
      distributionPeriodId: "period",
      actualDate: new Date(Date.UTC(2, 1, 2020)),
    },
  ],
};
