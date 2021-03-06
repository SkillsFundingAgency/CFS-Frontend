import React from 'react';
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";
import userEvent from "@testing-library/user-event";

const test = CreateSpecificationTestData();

describe("<CreateSpecification /> with duplicated specification name", () => {
    beforeEach(async () => {
        test.mockPolicyService();
        test.mockSpecificationServiceWithDuplicateNameResponse();
        test.mockProviderService();
        test.mockProviderVersionService();

        await test.renderCreateSpecificationPage();
    });

    afterEach(() => jest.clearAllMocks());

    it("displays error response", async () => {
        const {createSpecificationService} = require('../../../services/specificationService');

        const {getFundingStreamsService, getFundingConfiguration, getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
        const {getProviderByFundingStreamIdService} = require('../../../services/providerVersionService');
        expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

        const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
        userEvent.type(specificationField, "test specification name");

        await waitFor(() => expect(getFundingStreamsService).toBeCalledTimes(1));
        const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
        expect(fundingStreamSelect).toHaveLength(2);
        userEvent.selectOptions(fundingStreamSelect, test.fundingStream.name);

        const {getFundingPeriodsByFundingStreamIdService} = require('../../../services/specificationService');
        await waitFor(() => expect(getFundingPeriodsByFundingStreamIdService).toBeCalledTimes(1));
        expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

        const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
        expect(fundingPeriodSelect).toHaveLength(2);
        userEvent.selectOptions(fundingPeriodSelect, test.fundingPeriod.name);

        await waitFor(() => expect(getFundingConfiguration).toBeCalledTimes(1));

        await waitFor(() => expect(getProviderByFundingStreamIdService).toBeCalledTimes(1));
        const coreProviderSelect = await screen.findByTestId(`core-provider-dropdown`);
        expect(coreProviderSelect).toHaveLength(2);

        userEvent.selectOptions(coreProviderSelect, test.providerVersion.name);

        await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
        const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
        expect(templateVersionSelect).toHaveLength(2);
        userEvent.selectOptions(templateVersionSelect, test.template.templateVersion);

        const moreDetailField = await screen.findByTestId(`description-textarea`);
        userEvent.type(moreDetailField, "test description");
        expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

        const button = screen.getByRole("button", {name: /Save and continue/});
        userEvent.click(button);

        await waitFor(() => expect(createSpecificationService).toBeCalledTimes(1));
        expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
        
        /*const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
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
        userEvent.type(moreDetailField, "test value");*/

        const buildButton = screen.getByRole("button", {name: /Save and continue/});
        userEvent.click(buildButton);

        waitFor(() => {
            expect(screen.queryByText(/unique name error/)).toBeInTheDocument();
        });
    });
});
