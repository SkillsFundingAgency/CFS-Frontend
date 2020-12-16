import React from 'react';
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";
import userEvent from "@testing-library/user-event";

const testData = CreateSpecificationTestData();

describe("<CreateSpecification /> with duplicated specification name", () => {
    beforeEach(async () => {
        testData.mockPolicyService();
        testData.mockSpecificationServiceWithDuplicateNameResponse();
        testData.mockProviderService();
        testData.mockProviderVersionService();

        await testData.renderCreateSpecificationPage();
    });

    afterEach(() => jest.clearAllMocks());

    it("displays error response", async () => {
        const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
        userEvent.type(specificationField, "test specification name");
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        userEvent.selectOptions(fundingStreamSelect, "test funding stream id");
        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        userEvent.selectOptions(fundingPeriodSelect, "test funding period id");
        const coreProviderSelect = await screen.findByTestId(`core-provider-dropdown`);
        userEvent.selectOptions(coreProviderSelect, "test core provider id");
        const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
        userEvent.selectOptions(templateVersionSelect, "test template version id");
        const moreDetailField = await screen.findByTestId(`more-detail-textarea`);
        userEvent.type(moreDetailField, "test value");

        const buildButton = screen.getByRole("button", {name: /Save and continue/});
        userEvent.click(buildButton);

        waitFor(() => {
            expect(screen.queryByText(/unique name error/)).toBeInTheDocument();
        });
    });
});
