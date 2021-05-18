import React from 'react';
import {screen, waitFor, within} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {SpecificationTestData} from "./SpecificationTestData";
import userEvent from "@testing-library/user-event";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {CreateSpecificationModel} from "../../../types/Specifications/CreateSpecificationModel";
import {ProviderDataTrackingMode} from "../../../types/Specifications/ProviderDataTrackingMode";
import { UpdateCoreProviderVersion } from '../../../types/Provider/UpdateCoreProviderVersion';

const test = SpecificationTestData();

describe("<CreateSpecification />", () => {
    describe("<CreateSpecification /> with FDZ provider source", () => {
        beforeEach(async () => {
            test.hasReduxState({
                permissions: test.withCreatePermissions,
                jobMonitorFilter: undefined
            });
            test.mockPolicyService(ProviderSource.FDZ, ApprovalMode.All, UpdateCoreProviderVersion.ToLatest);
            test.mockSpecificationService();
            test.mockProviderService();
            test.mockProviderVersionService();
            test.haveNoJobRunning();

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
                expect(screen.queryByText(/Please select whether you want to track latest core provider data/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
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
                expect(screen.queryByText(/Please select whether you want to track latest core provider data/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
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
                expect(screen.queryByText(/Please select whether you want to track latest core provider data/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given provider is not selected", async () => {
                const {getFundingStreamsService, getFundingConfiguration, getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
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

                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
                const trackingSelect = screen.getByRole("radiogroup", {name: /Track latest core provider data?/}) as HTMLInputElement;
                const optionYes = within(trackingSelect).getByRole("radio", {name: /Yes/}) as HTMLInputElement;
                userEvent.click(optionYes);

                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
                const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
                expect(templateVersionSelect).toHaveLength(3);
                expect(within(templateVersionSelect).getByRole("option", {name: /Select template version/}));
                const templateVersionOptions = screen.getAllByTestId("templateVersion-option");
                expect((templateVersionOptions[0] as HTMLOptionElement).value).toEqual("3.2");
                expect((templateVersionOptions[1] as HTMLOptionElement).value).toEqual("9.9");

                expect(screen.queryByTestId("error-summary")).not.toBeInTheDocument();

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding period/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays correct errors given template version is not selected", async () => {
                const {getFundingStreamsService, getFundingConfiguration, getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
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
                expect(templateVersionSelect).toHaveLength(3);

                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
                const trackingSelect = screen.getByRole("radiogroup", {name: /Track latest core provider data?/}) as HTMLInputElement;
                const optionYes = within(trackingSelect).getByRole("radio", {name: /Yes/}) as HTMLInputElement;
                expect(optionYes).not.toBeChecked();
                const optionNo = within(trackingSelect).getByRole("radio", {name: /No/}) as HTMLInputElement;
                expect(optionNo).not.toBeChecked();
                userEvent.click(optionYes);

                const button = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(button);

                expect(await screen.findByTestId("error-summary")).toBeInTheDocument();
                expect(screen.queryByText(/Invalid specification name/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding stream/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing funding period/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Please select whether you want to track latest core provider data/)).not.toBeInTheDocument();
                expect(screen.queryByText(/Missing core provider version/)).not.toBeInTheDocument();
                expect(screen.getByText(/Missing template version/)).toBeInTheDocument();
                expect(screen.getByText(/Missing description/)).toBeInTheDocument();
            });

            it("it displays error given description missing", async () => {
                const {getFundingStreamsService, getFundingConfiguration, getPublishedTemplatesByStreamAndPeriod} = require('../../../services/policyService');
                const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
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

                await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
                const trackingSelect = screen.getByRole("radiogroup", {name: /Track latest core provider data?/}) as HTMLInputElement;
                const optionYes = within(trackingSelect).getByRole("radio", {name: /Yes/}) as HTMLInputElement;
                userEvent.click(optionYes);

                await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
                const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
                expect(templateVersionSelect).toHaveLength(3);
                userEvent.selectOptions(templateVersionSelect, test.template2.templateVersion);

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
            const {getProviderSnapshotsByFundingStream} = require('../../../services/providerService');
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

            await waitFor(() => expect(getProviderSnapshotsByFundingStream).toBeCalledTimes(1));
            const trackingSelect = screen.getByRole("radiogroup", {name: /Track latest core provider data?/}) as HTMLInputElement;
            const optionYes = within(trackingSelect).getByRole("radio", {name: /Yes/}) as HTMLInputElement;
            userEvent.click(optionYes);

            await waitFor(() => expect(getPublishedTemplatesByStreamAndPeriod).toBeCalledTimes(1));
            const templateVersionSelect = await screen.findByTestId(`template-version-dropdown`);
            expect(templateVersionSelect).toHaveLength(3);
            userEvent.selectOptions(templateVersionSelect, test.template1.templateVersion);

            const descriptionTextArea = await screen.findByTestId(`description-textarea`);
            userEvent.clear(descriptionTextArea);
            userEvent.type(descriptionTextArea, "test description");
            expect(screen.queryByText("error-summary")).not.toBeInTheDocument();

            const button = screen.getByRole("button", {name: /Save and continue/});
            userEvent.click(button);

            const expectedSaveModel: CreateSpecificationModel = {
                name: "test specification name",
                assignedTemplateIds: {"stream-547": test.template1.templateVersion},
                description: "test description",
                fundingPeriodId: test.fundingPeriod.id,
                fundingStreamId: test.fundingStream.id,
                providerVersionId: undefined,
                coreProviderVersionUpdates: ProviderDataTrackingMode.UseLatest,
                providerSnapshotId: undefined
            };
            await waitFor(() => expect(createSpecificationService).toHaveBeenCalledWith(expectedSaveModel));

            expect(screen.queryByText("error-summary")).not.toBeInTheDocument();
        });
    });
});
