import {screen, waitFor} from "@testing-library/react";
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
    });
});

