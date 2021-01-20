import React from 'react';
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";
import userEvent from "@testing-library/user-event";
import * as policyService from "../../../services/policyService";

const test = CreateSpecificationTestData();

describe("<CreateSpecification />", () => {
    describe("<CreateSpecification /> with successful scenario", () => {
        beforeEach(async () => {
            test.mockPolicyService();
            test.mockSpecificationService();
            test.mockProviderService();
            test.mockProviderVersionService();

            await test.renderCreateSpecificationPage();
        });

        afterEach(() => jest.clearAllMocks());

        describe("service call checks ", () => {
            it("it gets funding streams on page load", async () => {
                const {getFundingStreamsService} = require('../../../services/policyService');
                await waitFor(() => expect(getFundingStreamsService).toBeCalledTimes(1));
            });
        });

       describe("page render checks ", () => {
            it('the breadcrumbs are correct', async () => {
                expect((await screen.findAllByText(/Create specification/))[0]).toHaveClass("govuk-breadcrumbs__list-item");
            });

            it('will have the correct breadcrumbs', async () => {
                expect(await screen.findAllByTestId("breadcrumb")).toHaveLength(3);
            });

            it('will have the correct <H1 /> title', async () => {
                expect((await screen.findAllByText(/Create specification/))[1]).toHaveClass("govuk-fieldset__heading");
            });
        });
        describe("form submission checks ", () => {

            it("it displays correct errors given nothing entered before submitting", async () => {
                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.getByText(/Invalid specification name/)).toBeInTheDocument();
                expect(screen.getByText(/Missing funding stream/)).toBeInTheDocument();
                expect(screen.getByText(/Missing funding period/)).toBeInTheDocument();
                expect(screen.getByText(/Missing core provider version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given funding stream is not selected", async () => {
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing funding stream/)).toBeInTheDocument();
                expect(screen.getByText(/Missing funding period/)).toBeInTheDocument();
                expect(screen.getByText(/Missing core provider version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given funding period is not selected", async () => {
                const {getFundingStreamsService} = require('../../../services/policyService');
                await waitFor(() => expect(getFundingStreamsService).toBeCalledTimes(1));
                
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");
                
                const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
                userEvent.selectOptions(fundingStreamSelect, test.fundingStream.name);
                
                const {getFundingPeriodsByFundingStreamIdService} = require('../../../services/specificationService');
                await waitFor(() => expect(getFundingPeriodsByFundingStreamIdService).toBeCalledTimes(1));
                
                const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
                expect(fundingPeriodSelect).toHaveLength(2);

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing funding period/)).toBeInTheDocument();
                expect(screen.getByText(/Missing core provider version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given provider is not selected", async () => {
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
                
                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
                const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
                expect(templateVersionSelect).toHaveLength(2);
                
                expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding period/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing core provider version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given template version is not selected", async () => {
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

                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
                const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
                expect(templateVersionSelect).toHaveLength(2);
                
                await waitFor(() => expect(getProviderByFundingStreamIdService).toBeCalledTimes(1));
                const coreProviderSelect = await screen.findByTestId(`core-provider-dropdown`);
                expect(coreProviderSelect).toHaveLength(2);
                
                userEvent.selectOptions(coreProviderSelect, test.providerVersion.name);

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding period/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays error given description missing", async () => {
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

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding period/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing template version/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });
        });

        it("it submits create specification given all fields are provided", async () => {
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
        });
    });
});
