import React from 'react';
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";
import userEvent from "@testing-library/user-event";

const testData = CreateSpecificationTestData();

describe("<CreateSpecification />", () => {
    describe("<CreateSpecification /> with successful scenario", () => {
        beforeEach(async () => {
            testData.mockPolicyService();
            testData.mockSpecificationService();
            testData.mockProviderService();
            testData.mockProviderVersionService();

            await testData.renderCreateSpecificationPage();
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
                expect(await screen.queryAllByText(/Create specification/)[0]).toHaveClass("govuk-breadcrumbs__list-item");
            });

            it('will have the correct breadcrumbs', async () => {
                expect(await screen.queryAllByTestId("breadcrumb").length).toBe(3);
            });

            it('will have the correct <H1 /> title', async () => {
                expect(await screen.queryAllByText(/Create specification/)[1]).toHaveClass("govuk-fieldset__heading");
            });
        });
        describe("form submission checks ", () => {
            it("it does not displays error given all required fields are completed", async () => {
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
                    expect(screen.queryByText(/Form not valid/)).not.toBeVisible();
                });
            });

            it("it displays error given no specification", async () => {
                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });

            it("it displays error given funding stream is not selected", async () => {
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");

                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });

            it("it displays error given funding period is not selected", async () => {
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");
                const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
                userEvent.selectOptions(fundingStreamSelect, "test funding stream id");

                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });

            it("it displays error given provider is not selected", async () => {
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");
                const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
                userEvent.selectOptions(fundingStreamSelect, "test funding stream id");
                const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
                userEvent.selectOptions(fundingPeriodSelect, "test funding period id");

                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });

            it("it displays error given template version is not selected", async () => {
                const specificationField = await screen.findByTestId(`specification-name-input`) as HTMLInputElement;
                userEvent.type(specificationField, "test specification name");
                const fundingStreamSelect = await screen.findByTestId(`funding-stream-dropdown`);
                userEvent.selectOptions(fundingStreamSelect, "test funding stream id");
                const fundingPeriodSelect = await screen.findByTestId(`funding-period-dropdown`);
                userEvent.selectOptions(fundingPeriodSelect, "test funding period id");
                const coreProviderSelect = await screen.findByTestId(`core-provider-dropdown`);
                userEvent.selectOptions(coreProviderSelect, "test core provider id");

                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });

            it("it displays error given more details field is not completed", async () => {
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

                const buildButton = screen.getByRole("button", {name: /Save and continue/});
                userEvent.click(buildButton);

                waitFor(() => {
                    expect(screen.queryByText(/Form not valid/)).toBeVisible();
                });
            });
        });

        it("it submits create specification given all fields are provided", async () => {
            const {createSpecificationService} = require('../../../services/specificationService');
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

            await waitFor(() => expect(createSpecificationService).toBeCalledTimes(1));
        });
    });
});
