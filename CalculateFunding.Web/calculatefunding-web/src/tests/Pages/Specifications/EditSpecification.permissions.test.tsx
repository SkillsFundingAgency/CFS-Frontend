import {screen} from "@testing-library/react";
import {SpecificationTestData} from "./SpecificationTestData";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";

const test = SpecificationTestData();

describe("<EditSpecification /> ", () => {

    describe("<EditSpecification /> permissions tests", () => {
        describe("when user doesn't have edit spec permissions", () => {
            beforeEach(async () => {
                test.hasMissingPermissionToEdit();
                test.mockSpecificationService(test.specificationCfs);
                test.mockProviderService();
                test.mockProviderVersionService();
                test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All);
                test.haveNoJobRunning();

                await test.renderEditSpecificationPage(test.specificationCfs.id);
            });

            afterEach(() => jest.clearAllMocks());

            it("renders default warning", async () => {
                expect(screen.getByTestId("permission-alert-message")).toBeInTheDocument();
                expect(screen.getByText(/You do not have permissions to perform the following action: Edit/)).toBeInTheDocument();
            });
        });
        
        describe("when user has permissions to edit specification", () => {
            beforeEach(async () => {
                test.hasEditPermissions();
                test.mockSpecificationService(test.specificationCfs);
                test.mockProviderService();
                test.mockProviderVersionService();
                test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All);
                test.haveNoJobRunning();

                await test.renderEditSpecificationPage(test.specificationCfs.id);
            });

            afterEach(() => jest.clearAllMocks());

            it("does not render default warning", async () => {
                expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
                expect(screen.queryByText(/You do not have permissions to perform the following action: Can edit specification/)).not.toBeInTheDocument();
            });
        });
    });
});

