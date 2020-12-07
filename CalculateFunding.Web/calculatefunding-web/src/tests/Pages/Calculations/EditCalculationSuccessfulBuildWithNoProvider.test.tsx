import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {EditCalculationTestData} from "./EditCalculationTestData";

const testData = EditCalculationTestData();

describe("<EditCalculation> tests with successful build source code but no provider match", () => {
    beforeEach(async () => {
        testData.mockOutMonacoEditor();
        testData.mockWithFullPermissions();
        testData.mockSpecification();
        testData.mockCalculation();
        testData.mockNoCircularRefErrors();
        testData.mockSuccessfulBuildWithNoProvider();

        await testData.renderEditCalculation();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders no provider found message when no provider name is returned in for the given provider Id", async () => {
        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        const textbox = screen.getByTestId('providerId');

        fireEvent.change(textbox, {target: {value: '123456'}});
        userEvent.click(buildButton);

        await waitFor(() => {
            expect(screen.getByText(/No provider found. Try a different UKPRN./)).toBeInTheDocument();
        });
    });
});
