import React from "react";
import {act, screen} from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from "@testing-library/user-event";
import {EditCalculationTestData} from "./EditCalculationTestData";

const testData = EditCalculationTestData();

describe("<EditCalculation> tests with successful build source code", () => {
    beforeEach(() => {
        testData.mockOutMonacoEditor();
        testData.mockWithFullPermissions();
        testData.mockSpecification();
        testData.mockCalculation();
        testData.mockNoCircularRefErrors();
        testData.mockSuccessfulBuild();

        testData.renderEditCalculation();
    });
    afterEach(() => jest.clearAllMocks());

    it("renders the UKPRN optional field", async () => {
        expect(screen.getByText("Optional: Enter a UKPRN to view calculation results for this provider")).toBeInTheDocument();
    });

    it("renders code compiled successfully message", async () => {
        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        if (buildButton != undefined) {
            act(() => userEvent.click(buildButton));

            expect(await screen.findByText(/Code compiled successfully/)).toBeInTheDocument();
        }
    });

    it("does not render no provider found message when a provider is returned for the given provider Id", async () => {

        const buildButton = screen.getByRole("button", {name: /Build calculation/});
        const textbox = screen.getByTestId('providerId') as HTMLInputElement;

        await userEvent.type(textbox, "123456");
        act(() => userEvent.click(buildButton));

        expect(await screen.queryByText(/No provider found. Try a different UKPRN./)).not.toBeInTheDocument();

    });
});