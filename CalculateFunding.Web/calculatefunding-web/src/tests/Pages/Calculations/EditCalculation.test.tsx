import {cleanup, screen, waitFor, within} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {EditCalculationTestData} from "./EditCalculationTestData";

const testData = EditCalculationTestData();

describe("<EditCalculation> tests ", () => {
    describe("<EditCalculation> when user builds invalid source code", () => {
        beforeEach(async () => {
            testData.mockOutMonacoEditor();
            testData.mockWithFullPermissions();
            testData.mockSpecification();
            testData.mockCalculation();
            testData.mockNoCircularRefErrors();
            testData.mockFailedBuild();

            await testData.renderEditCalculation();

        });
        afterEach(() => {
            cleanup();
            jest.clearAllMocks()
        });

        it("renders the error message", async () => {
            const buildButton = screen.getByRole("button", {name: /Build calculation/});

            userEvent.click(buildButton);

            await waitFor(async () => {
                expect(await screen.findByText(/There was a compilation error/)).toBeInTheDocument();
                expect(await screen.findByText(/Typo error/)).toBeInTheDocument();
                expect(screen.queryByText(/Build successful/)).not.toBeInTheDocument();
            });
        });
    });

    describe("<EditCalculation> with no circular ref errors", () => {
        beforeEach(async () => {
            testData.mockOutMonacoEditor();
            testData.mockWithFullPermissions();
            testData.mockSpecification();
            testData.mockCalculation();
            testData.mockNoCircularRefErrors();

            await testData.renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("does not render any errors", async () => {
            expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();
        });

        it("renders the specification name", async () => {
            expect(screen.getByText(testData.testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation name", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testData.testCalc.name)).toBeInTheDocument();
        });

        it("renders the calculation status", async () => {
            expect(screen.getByText("Calculation status")).toBeInTheDocument();
            expect(screen.getByText(testData.testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders the calculation type", async () => {
            expect(screen.getByText("Value type")).toBeInTheDocument();
            expect(screen.getAllByText(testData.testCalc.valueType)[0]).toBeInTheDocument();
        });

        it("does not render CircularReferenceErrors when there are no circular reference errors", async () => {
            expect(screen.queryByText("Calculations are not able to run due to the following problem")).not.toBeInTheDocument();
        });

        it('disables save button given user has not edited the calculation', async () => {
            const saveButton = screen.getByRole("button", {name: /Save and continue/});
            expect(saveButton).toBeDisabled();
        });

        it('enables approve button given user is allowed to approve calculation', async () => {
            const approveButton = screen.getByRole("button", {name: /Approve/});
            expect(approveButton).toBeEnabled();
        });
    });
    describe("<EditCalculation> with no permissions", () => {
        beforeEach(async () => {
            testData.mockOutMonacoEditor();
            testData.mockWithNoPermissions();
            testData.mockSpecification();
            testData.mockCalculation();
            testData.mockNoCircularRefErrors();

            await testData.renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders permissions warning", async () => {
            const permissionsWarning = await screen.findByTestId("permission-alert-message");
            expect(within(permissionsWarning).getByText(/You do not have permissions to perform the following actions:/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Approve Calculations/)).toBeInTheDocument();
            expect(within(permissionsWarning).getByText(/Edit Calculations/)).toBeInTheDocument();

            expect(screen.getByText(testData.testSpec.name)).toBeInTheDocument();
        });

        it('disables approve button given user is not allowed to approve calculation', async () => {
            const approveButton = screen.getByRole("button", {name: /Approve/});
            expect(approveButton).toBeDisabled();
        });
    });

    describe("<EditCalculation> when loading circular ref errors", () => {
        beforeEach(async () => {
            testData.mockOutMonacoEditor();
            testData.mockSpecification();
            testData.mockCalculation();
            testData.mockCircularRefErrorsLoading();

            await testData.renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders the specification", async () => {
            expect(screen.getByText(testData.testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testData.testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders CircularReferenceErrors loading", async () => {
            expect(await screen.findByText(/Checking for circular reference errors/)).toBeInTheDocument();
        });
    });

    describe("<EditCalculation> with a circular ref error", () => {
        beforeEach(async () => {
            testData.mockOutMonacoEditor();
            testData.mockSpecification();
            testData.mockCalculation();
            testData.mockCircularRefErrors();

            await testData.renderEditCalculation();
        });
        afterEach(() => jest.clearAllMocks());

        it("renders the specification", async () => {
            expect(screen.getByText(testData.testSpec.name)).toBeInTheDocument();
        });

        it("renders the calculation", async () => {
            expect(screen.getByText("Calculation name")).toBeInTheDocument();
            expect(screen.getByText(testData.testCalc.publishStatus)).toBeInTheDocument();
        });

        it("renders CircularReferenceErrors when there are circular reference errors", async () => {
            expect(screen.getByText("Calculations are not able to run due to the following problem")).toBeInTheDocument();
        });
    });
});