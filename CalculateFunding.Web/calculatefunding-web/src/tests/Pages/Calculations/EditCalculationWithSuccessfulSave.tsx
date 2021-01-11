import {act, fireEvent, screen, waitFor} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {EditCalculationTestData} from "./EditCalculationTestData";

const testData = EditCalculationTestData();


describe("<EditCalculation> tests with successful update of calculation", () => {
    beforeEach(async () => {
        testData.mockOutMonacoEditor();
        testData.mockWithFullPermissions();
        testData.mockSpecification();
        testData.mockNoCircularRefErrors();
        testData.mockSuccessfulBuildAndSave();

        await testData.renderEditCalculation();

        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        const textbox = screen.getByTestId('providerId');
        fireEvent.change(textbox, {target: {value: '123456'}});

        act(() => userEvent.click(buildButton));

        await waitFor(() => expect(screen.queryByText(/Build output/)).toBeInTheDocument());
    });

    afterEach(() => jest.clearAllMocks());

    it("enables save button after successful build", async () => {
        const saveButton = screen.getByRole("button", {name: /Save and continue/});
        expect(saveButton).toBeEnabled();
    });

    it("renders confirmation banner after successful save", async () => {
        const saveButton = screen.getByRole("button", {name: /Save and continue/});

        act(() => userEvent.click(saveButton));

        expect(await screen.findByRole("heading", {name: "Save successful"})).toBeInTheDocument();
    });

    it("renders updated calculation after successful save", async () => {
        const saveButton = screen.getByRole("button", {name: /Save and continue/});

        act(() => userEvent.click(saveButton));

        expect(await screen.findByText(testData.savedCalcData.name)).toBeInTheDocument();
        expect(screen.getByText(testData.savedCalcData.publishStatus)).toBeInTheDocument();
    });
});
