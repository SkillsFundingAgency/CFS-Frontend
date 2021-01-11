import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {EditCalculationTestData} from "./EditCalculationTestData";

const testData = EditCalculationTestData();

describe("<EditCalculation> tests with successful build source code", () => {
    beforeEach(async () => {
        testData.mockOutMonacoEditor();
        testData.mockWithFullPermissions();
        testData.mockSpecification();
        testData.mockNoCircularRefErrors();
        testData.mockSuccessfulBuild();

        await testData.renderEditCalculation();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders the UKPRN optional field", async () => {
        expect(screen.getByText("Optional: Enter a UKPRN to view calculation results for this provider")).toBeInTheDocument();
    });
    
    it("renders the save button disabled before successful compilation", async () => {
        const saveButton = screen.getByRole("button", {name: /Save and continue/});
        expect(saveButton).toBeDisabled();
    });

    it("renders code compiled successfully message", async () => {
        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        userEvent.click(buildButton);
        expect(await screen.findByText(/Code compiled successfully/)).toBeInTheDocument();
    });

    it("renders provider name for given provider id", async () => {
        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        userEvent.click(buildButton);
        expect(await screen.findByText(/test provider name/)).toBeInTheDocument();
    });

    it("does not render no provider found message when a provider is returned for the given provider Id", async () => {
        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        const textbox = screen.getByTestId('providerId');
        fireEvent.change(textbox, {target: {value: '123456'}});

        act(() => userEvent.click(buildButton));
        
        expect(await screen.findByText(/Build output/)).toBeInTheDocument();

        expect(screen.queryByText(/No provider found. Try a different UKPRN./)).not.toBeInTheDocument();
    });
});
