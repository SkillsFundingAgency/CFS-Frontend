import { screen } from "@testing-library/react";

import { ApprovalMode } from "../../../types/ApprovalMode";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { JobType } from "../../../types/jobType";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { jobSubscriptionTestHelper } from "../../reactTestingLibraryHelpers";
import { SpecificationTestData } from "./SpecificationTestData";

const {
  specificationCfs,
  hasEditPermissions,
  mockSpecificationService,
  mockProviderService,
  mockProviderVersionService,
  mockPolicyService,
  renderEditSpecificationPageWithJobRunning,
} = SpecificationTestData();
const { haveJobInProgressNotification, setupJobSpy } = jobSubscriptionTestHelper({});

describe("<EditSpecification />", () => {
  describe("<EditSpecification /> with specification jobs running", () => {
    beforeEach(async () => {
      haveJobInProgressNotification({ jobType: JobType.RunConverterDatasetMergeJob }, {});
      setupJobSpy();
      hasEditPermissions();
      mockSpecificationService(specificationCfs);
      mockProviderService();
      mockProviderVersionService();
      mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);

      await renderEditSpecificationPageWithJobRunning(specificationCfs.id);
    });

    afterEach(() => jest.clearAllMocks());

    it("displays specification job running", async () => {
      expect(screen.getByText(/Specification is being updated in the background/)).toBeInTheDocument();
    });

    it("does not display form", async () => {
      expect(screen.queryByTestId("edit-specification-form")).not.toBeInTheDocument();
    });
  });
});
