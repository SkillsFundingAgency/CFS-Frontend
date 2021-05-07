import {screen, waitFor, within} from "@testing-library/react";
import {SpecificationTestData} from "./SpecificationTestData";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";

const test = SpecificationTestData();

describe("<EditSpecification /> ", () => {

    describe("<EditSpecification /> permissions tests", () => {
        describe("when user doesn't have edit spec permissions", () => {
            beforeEach(async () => {
                test.hasMissingPermissionToEdit();
                test.mockSpecificationService(test.specificationCfs);
                test.mockProviderService();
                test.mockProviderVersionService();
                test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);
                test.haveNoJobRunning();

                await test.renderEditSpecificationPage(test.specificationCfs.id);
            });

            afterEach(() => jest.clearAllMocks());

            it("renders default warning", async () => {
                const permissionsWarning = await screen.findByTestId("permission-alert-message");
                expect(within(permissionsWarning).getByText(/You do not have permissions to perform the following action/)).toBeInTheDocument();
                expect(within(permissionsWarning).getByText(/Can edit specifications/)).toBeInTheDocument();
            });
        });
    });
});

