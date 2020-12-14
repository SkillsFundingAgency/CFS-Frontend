import React from 'react';
import {screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {CreateSpecificationTestData} from "./CreateSpecificationTestData";

const testData = CreateSpecificationTestData();

describe("<CreateSpecification />", () => {
    describe("<CreateSpecification /> with successful scenario", () => {
        beforeEach(() => {
            testData.mockPolicyService();
            testData.mockSpecificationService();
            testData.mockProviderService();
            testData.mockProviderVersionService();

            testData.renderCreateSpecificationPage();
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
                await testData.setupSpecificationNameEntered();
                await testData.setupFundingStreamSelected();
                await testData.setupFundingPeriodSelected();
                await testData.setupCoreProviderSelected();
                await testData.setupTemplateVersionIdSelected();
                await testData.setupMoreDetailEntered();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).not.toBeVisible();
            });

            it("it displays error given no specification", async () => {
                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });

            it("it displays error given funding stream is not selected", async () => {
                await testData.setupSpecificationNameEntered();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });

            it("it displays error given funding period is not selected", async () => {
                await testData.setupSpecificationNameEntered();
                await testData.setupFundingStreamSelected();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });

            it("it displays error given provider is not selected", async () => {
                await testData.setupSpecificationNameEntered();
                await testData.setupFundingStreamSelected();
                await testData.setupFundingPeriodSelected();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });

            it("it displays error given template version is not selected", async () => {
                await testData.setupSpecificationNameEntered();
                await testData.setupFundingStreamSelected();
                await testData.setupFundingPeriodSelected();
                await testData.setupCoreProviderSelected();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });

            it("it displays error given more details field is not completed", async () => {
                await testData.setupSpecificationNameEntered();
                await testData.setupFundingStreamSelected();
                await testData.setupFundingPeriodSelected();
                await testData.setupCoreProviderSelected();
                await testData.setupTemplateVersionIdSelected();

                await testData.setupSaveButtonAct();

                expect(await screen.queryByText(/Form not valid/)).toBeVisible();
            });
        });

        it("it submits create specification given all fields are provided", async () => {
            const {createSpecificationService} = require('../../../services/specificationService');
            await testData.setupSpecificationNameEntered();
            await testData.setupFundingStreamSelected();
            await testData.setupFundingPeriodSelected();
            await testData.setupCoreProviderSelected();
            await testData.setupTemplateVersionIdSelected();
            await testData.setupMoreDetailEntered();

            await testData.setupSaveButtonAct();

            await waitFor(() => expect(createSpecificationService).toBeCalledTimes(1));
        });
    });
});
