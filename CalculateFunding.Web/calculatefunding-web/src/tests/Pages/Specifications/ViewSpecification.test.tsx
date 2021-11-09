import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import { Permission } from "../../../types/Permission";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const {
  mockSpec,
  mockSpecificationService,
  mockSpecificationPermissions,
  fundingConfigurationSpy,
  mockFundingLineStructureService,
  mockDatasetBySpecificationIdService,
  mockCalculationService,
  mockPublishService,
  hasNoCalcErrors,
  renderViewSpecificationPage,
} = ViewSpecificationTestData();
const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({
  mockSpecId: mockSpec.id,
});

describe("<ViewSpecification /> ", () => {
  async function setup() {
    haveNoJobNotification();
    setupJobSpy();

    mockSpecificationPermissions();
    mockSpecificationService();
    mockFundingLineStructureService();
    mockDatasetBySpecificationIdService();
    mockCalculationService();
    mockPublishService();
    fundingConfigurationSpy();
    hasNoCalcErrors();

    await renderViewSpecificationPage();
  }

  describe("initial page load ", () => {
    describe("Service call checks ", () => {
      it("it calls the specificationService", async () => {
        await setup();
        const { getSpecificationSummaryService } = require("../../../services/specificationService");
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
      });
    });

    describe("page render checks ", () => {
      it("shows correct status in funding line structure tab", async () => {
        await setup();
        expect(screen.getByText("Draft")).toBeInTheDocument();
      });

      it("renders the edit specification link correctly", async () => {
        await setup();
        const link = (await screen.findByRole("link", { name: /Edit specification/ })) as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(`/Specifications/EditSpecification/${mockSpec.id}`);
      });

      it.skip("shows Variations tab given specification is not chosen for funding", async () => {
        await setup();
        expect(await screen.findByText(/Variations/)).toBeInTheDocument();
      });

      it.skip("shows that the specification is converter wizard enabled", async () => {
        await setup();
        expect(await screen.findByText(/In year opener enabled/)).toBeInTheDocument();
      });

      it.skip("does not render the link to the specification results page", async () => {
        await setup();
        const link = (await screen.queryByRole("link", {
          name: /View specification results/,
        })) as HTMLAnchorElement;
        expect(link).not.toBeInTheDocument();
      });
    });
  });

  describe("with ApproveAllCalculations permission ", () => {
    it.skip("it calls correct services given approve all calculations button is clicked", async () => {
      await setup();

      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() => expect(getCalculationSummaryBySpecificationId).toBeCalled());
    });
  });

  describe("without ApproveAllCalculations permission ", () => {
    it.skip("shows permission message when approve all calculations button is clicked", async () => {
      const withoutPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: () => false,
        hasMissingPermissions: true,
        isPermissionsFetched: true,
        permissionsEnabled: [],
        permissionsDisabled: [Permission.CanApproveAllCalculations],
        missingPermissions: [Permission.CanApproveAllCalculations],
      };
      await setup();
      mockSpecificationPermissions(withoutPermissions);

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() =>
        expect(screen.getByText("You don't have permission to approve calculations")).toBeInTheDocument()
      );
    });
  });
});
