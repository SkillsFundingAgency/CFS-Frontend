import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";

import { JobNotification } from "../../../hooks/Jobs/useJobSubscription";
import { SpecificationPermissionsResult } from "../../../hooks/Permissions/useSpecificationPermissions";
import { Permission } from "../../../types/Permission";
import { fakeSpecification } from "../../fakes/getSpecification.fake";
import { ViewSpecificationTestData } from "./ViewSpecificationTestData";

const testData = ViewSpecificationTestData();

describe("<ViewSpecification /> ", () => {
  describe("initial page load ", () => {
    beforeEach(async () => {
      testData.mockSpecificationPermissions();
      testData.mockSpecificationService();
      testData.mockFundingLineStructureService();
      testData.mockDatasetBySpecificationIdService();
      testData.mockCalculationService();
      testData.mockPublishService();
      testData.fundingConfigurationSpy();
      testData.haveNoJobNotification();
      testData.hasNoCalcErrors();
      testData.hasNoLatestJob();
      await testData.renderViewSpecificationPage();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    describe("Service call checks ", () => {
      it("it calls the specificationService", async () => {
        const { getSpecificationSummaryService } = require("../../../services/specificationService");
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
      });
    });

    describe("page render checks ", () => {
      it("shows correct status in funding line structure tab", async () => {
        await waitFor(() => expect(screen.getByText("Draft")).toBeInTheDocument());
      });

      it("renders the edit specification link correctly", async () => {
        const link = (await screen.findByRole("link", { name: /Edit specification/ })) as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(`/Specifications/EditSpecification/${testData.mockSpec.id}`);
      });

      it("shows Variations tab given specification is not chosen for funding", async () => {
        expect(await screen.findByText(/Variations/)).toBeInTheDocument();
      });

      it("shows that the specification is converter wizard enabled", async () => {
        expect(await screen.findByText(/In year opener enabled/)).toBeInTheDocument();
      });

      it("renders the link to the specification results page", async () => {
        const link = (await screen.findByRole("link", {
          name: /View specification results/,
        })) as HTMLAnchorElement;
        expect(link).toBeInTheDocument();
        expect(link.getAttribute("href")).toBe(`/ViewSpecificationResults/${testData.mockSpec.id}`);
      });
    });
  });

  describe("with ApproveAllCalculations permission ", () => {
    it("it calls correct services given approve all calculations button is clicked", async () => {
      testData.mockSpecificationPermissions();
      testData.mockSpecificationService();
      testData.mockFundingLineStructureService();
      testData.mockDatasetBySpecificationIdService();
      testData.mockCalculationService();
      testData.mockPublishService();
      testData.hasNoCalcErrors();
      testData.hasNoLatestJob();
      await testData.renderViewSpecificationPage();
      const { getCalculationSummaryBySpecificationId } = require("../../../services/calculationService");

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() => expect(getCalculationSummaryBySpecificationId).toBeCalled());
    });
  });

  describe("without ApproveAllCalculations permission ", () => {
    it("shows permission message when approve all calculations button is clicked", async () => {
      const withoutPermissions: SpecificationPermissionsResult = {
        userId: "3456",
        isCheckingForPermissions: false,
        hasPermission: (perm: Permission) => false,
        hasMissingPermissions: true,
        isPermissionsFetched: true,
        permissionsEnabled: [],
        permissionsDisabled: [Permission.CanApproveAllCalculations],
        missingPermissions: [Permission.CanApproveAllCalculations],
      };
      testData.mockSpecificationPermissions(withoutPermissions);
      testData.mockSpecificationService();
      testData.mockFundingLineStructureService();
      testData.mockDatasetBySpecificationIdService();
      testData.mockCalculationService();
      testData.mockPublishService();
      testData.hasNoCalcErrors();
      testData.hasNoLatestJob();
      await testData.renderViewSpecificationPage();

      const approveAllCalcsButton = await screen.findByTestId("approve-calculations");
      userEvent.click(approveAllCalcsButton);

      await waitFor(() =>
        expect(screen.getByText("You don't have permission to approve calculations")).toBeInTheDocument()
      );
    });
  });
});
