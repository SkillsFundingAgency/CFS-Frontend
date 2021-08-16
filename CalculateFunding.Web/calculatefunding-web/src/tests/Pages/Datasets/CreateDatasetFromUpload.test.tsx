import {screen} from "@testing-library/react";
import React from "react";
import {createDatasetTestSetup} from "./CreateDatasetTestData";

describe("<CreateDatasetFromUpload />", () => {

    describe("when page loads for FDZ provider source", () => {
        const testing = createDatasetTestSetup();
        beforeEach(() => {
            jest.clearAllMocks();
            testing.mockSpecificationHook();
            testing.mockFundingConfigurationHook(testing.mockFundingConfigurationQueryResult(testing.mockFdzFundingConfiguration));

            function mockDatasetService() {
                const service = jest.requireActual('../../../services/datasetService');
                return {
                    ...service,
                    getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                        data: [testing.mockStreamDataset1, testing.mockStreamDataset2],
                        status: 200
                    }))
                }
            }

            jest.mock('../../../services/datasetService', () => mockDatasetService);

            testing.renderCreateDatasetPage();
        });
        it('renders Specification name in breadcrumbs', async () => {
            expect(await screen.findByRole("link", {name: testing.testSpec.name})).toHaveClass("govuk-breadcrumbs__link");
        });

        it('does not render loading spinner', async () => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });

        it('renders Specification name in the form heading', async () => {
            expect(await screen.findByRole("heading", {name: testing.testSpec.name})).toBeInTheDocument();
        });

        it('does not render Set as provider data for FDZ', async () => {
            expect(await screen.queryByRole("heading", {name: /Set as provider data/})).not.toBeInTheDocument();
        });

        it('renders data schema selections', async () => {
            expect(await screen.findByText(/Select data schema/)).toBeInTheDocument();
        });

        it('renders dataset name input', async () => {
            expect(await screen.findByText(/Data set name/)).toBeInTheDocument();
        });

        it('renders dataset description input', async () => {
            expect(await screen.findByText(/Description/)).toBeInTheDocument();
        });
    });

    describe("when page loads for CFS provider source", () => {
        const testing = createDatasetTestSetup();

        beforeEach(() => {
            jest.clearAllMocks();
            
            testing.mockSpecificationHook();
            testing.mockFundingConfigurationHook(testing.mockFundingConfigurationQueryResult(testing.mockCfsFundingConfiguration));

            function mockDatasetService() {
                const service = jest.requireActual('../../../services/datasetService');
                return {
                    ...service,
                    getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                        data: [testing.mockStreamDataset1, testing.mockStreamDataset2],
                        status: 200
                    }))
                }
            }

            jest.mock('../../../services/datasetService', () => mockDatasetService);

            testing.renderCreateDatasetPage();
        });
        it('renders Specification name in breadcrumbs', async () => {
            expect(await screen.findByRole("link", {name: testing.testSpec.name})).toHaveClass("govuk-breadcrumbs__link");
        });

        it('does not render loading spinner', async () => {
            expect(screen.queryByTestId("loader")).not.toBeInTheDocument();
        });

        it('renders Specification name in the form heading', async () => {
            expect(await screen.findByRole("heading", {name: testing.testSpec.name})).toBeInTheDocument();
        });

        it('renders Set as provider data', async () => {
            expect(await screen.findByRole("heading", {name: /Set as provider data/})).toBeInTheDocument();
        });

        it('renders data schema selections', async () => {
            expect(await screen.findByText(/Select data schema/)).toBeInTheDocument();
        });

        it('renders dataset name input', async () => {
            expect(await screen.findByText(/Data set name/)).toBeInTheDocument();
        });

        it('renders dataset description input', async () => {
            expect(await screen.findByText(/Description/)).toBeInTheDocument();
        });
    });
});
