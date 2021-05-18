import {ProviderSource} from "../../../types/CoreProviderSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {screen} from "@testing-library/react";
import {SpecificationTestData} from "./SpecificationTestData";
import { UpdateCoreProviderVersion } from "../../../types/Provider/UpdateCoreProviderVersion";

const test = SpecificationTestData();

describe("<CreateSpecification />", () => {

    describe("<CreateSpecification /> permissions tests", () => {
        describe("when no permissions defined at all", () => {
            beforeEach(async () => {
                test.hasReduxState({
                    permissions: test.withNoPermissions,
                    jobMonitorFilter: undefined
                });
                test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);
                test.mockSpecificationService();
                test.mockProviderService();
                test.mockProviderVersionService();
                test.haveNoJobRunning();

                await test.renderCreateSpecificationPage();
            });

            afterEach(() => jest.clearAllMocks());

            it("renders default warning", async () => {
                expect(screen.getByTestId("permission-alert-message")).toBeInTheDocument();
                expect(screen.getByText(/You do not have permissions to perform the following action: Can create specification/)).toBeInTheDocument();
            });
        });

        describe("when user has permissions to create specification", () => {
            beforeEach(async () => {
                test.hasReduxState({
                    permissions: test.withCreatePermissions,
                    jobMonitorFilter: undefined
                });
                test.mockPolicyService(ProviderSource.CFS, ApprovalMode.All, UpdateCoreProviderVersion.Manual);
                test.mockSpecificationService();
                test.mockProviderService();
                test.mockProviderVersionService();
                test.haveNoJobRunning();

                await test.renderCreateSpecificationPage();
            });

            afterEach(() => jest.clearAllMocks());

            it("does not render default warning", async () => {
                expect(screen.queryByTestId("permission-alert-message")).not.toBeInTheDocument();
                expect(screen.queryByText(/You do not have permissions to perform the following action: Can create specification/)).not.toBeInTheDocument();
            });
        });
    });
});
