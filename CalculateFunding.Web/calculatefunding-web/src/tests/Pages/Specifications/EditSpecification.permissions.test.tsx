import { screen, within } from "@testing-library/react";

import { ApprovalMode } from "../../../types/ApprovalMode";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { SpecificationTestData } from "./SpecificationTestData";

const {
  specificationCfs,
  hasMissingPermissionToEdit,
  mockSpecificationService,
  mockProviderService,
  mockProviderVersionService,
  mockPolicyService,
  renderEditSpecificationPage,
} = SpecificationTestData();
const { haveNoJobNotification, setupJobSpy } = jobSubscriptionTestHelper({});

describe("<EditSpecification /> ", () => {
  describe("<EditSpecification /> permissions tests", () => {
    describe("when user doesn't have edit spec permissions", () => {
      beforeEach(async () => {
        haveNoJobNotification();
        setupJobSpy();
        hasMissingPermissionToEdit();
        mockSpecificationService(specificationCfs);
        mockProviderService();
        mockProviderVersionService();
        mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);

        await renderEditSpecificationPage(specificationCfs.id);
      });

      afterEach(() => jest.clearAllMocks());

      it("renders default warning", async () => {
        const permissionsWarning = await screen.findByTestId("permission-alert-message");
        expect(
          within(permissionsWarning).getByText(/You do not have permissions to perform the following action/)
        ).toBeInTheDocument();
        expect(within(permissionsWarning).getByText(/Can edit specifications/)).toBeInTheDocument();
      });
    });
  });
});
