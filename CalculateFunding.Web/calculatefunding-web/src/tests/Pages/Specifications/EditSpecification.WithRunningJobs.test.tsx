import { act, screen, waitFor } from "@testing-library/react";

import { ApprovalMode } from "../../../types/ApprovalMode";
import { ProviderSource } from "../../../types/CoreProviderSummary";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";
import { SpecificationTestData } from "./SpecificationTestData";

const test = SpecificationTestData();

describe("<EditSpecification /> ", () => {
  describe("<EditSpecification /> with specification jobs running", () => {
    beforeEach(async () => {
      test.hasEditPermissions();
      test.mockSpecificationService(test.specificationCfs);
      test.mockProviderService();
      test.mockProviderVersionService();
      test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);
      test.haveRunningSpecificationMonitorJob();

      await test.renderEditSpecificationPageWithJobRunning(test.specificationCfs.id);
    });

    afterEach(() => jest.clearAllMocks());

    it("displays loading specification job", async () => {
      expect(screen.getByText("Loading specification jobs")).toBeInTheDocument();
    });

    it("does not display form", async () => {
      expect(screen.queryByTestId("edit-specification-form")).not.toBeInTheDocument();
    });
  });
});
