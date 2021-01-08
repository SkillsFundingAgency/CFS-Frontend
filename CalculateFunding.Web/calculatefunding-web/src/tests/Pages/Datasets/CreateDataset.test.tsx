import {render, screen} from "@testing-library/react";
import {MemoryRouter, Route, Switch} from "react-router";
import '@testing-library/jest-dom/extend-expect';
import React from "react";
import {FundingConfiguration} from "../../../types/FundingConfiguration";
import * as specHook from "../../../hooks/useSpecificationSummary";
import * as fundingConfigurationHook from "../../../hooks/useFundingConfiguration";
import {FundingPeriod, FundingStream} from "../../../types/viewFundingTypes";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import {ApprovalMode} from "../../../types/ApprovalMode";
import {ProviderSource} from "../../../types/CoreProviderSummary";
import {DataschemaDetailsViewModel} from "../../../types/Datasets/DataschemaDetailsViewModel";
import {FundingConfigurationQueryResult} from "../../../hooks/useFundingConfiguration";
import {QueryClient, QueryClientProvider} from "react-query";


describe("<CreateDataset />", () => {

    describe("when page loads for FDZ provider source", () => {
        beforeEach(() => {
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
            expect(await screen.findByLabelText(/Dataset name/)).toBeInTheDocument();
        });
        
        it('renders dataset description input', async () => {
            expect(await screen.findByLabelText(/Description/)).toBeInTheDocument();
        });
    });

    describe("when page loads for CFS provider source", () => {
        beforeEach(() => {
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
            expect(await screen.findByLabelText(/Dataset name/)).toBeInTheDocument();
        });
        
        it('renders dataset description input', async () => {
            expect(await screen.findByLabelText(/Description/)).toBeInTheDocument();
        });
    });
});

const createDatasetTestSetup = () => {
    const fundingStream: FundingStream = {
        name: "FS123",
        id: "Wizard Training Scheme"
    };
    const fundingPeriod: FundingPeriod = {
        id: "FP123",
        name: "2019-20"
    };
    const mockCfsFundingConfiguration: FundingConfiguration = {
        approvalMode: ApprovalMode.All,
        providerSource: ProviderSource.CFS,
        defaultTemplateVersion: "1.1",
        fundingPeriodId: fundingPeriod.id,
        fundingStreamId: fundingStream.id
    }
    const mockFdzFundingConfiguration: FundingConfiguration = {
        approvalMode: ApprovalMode.All,
        providerSource: ProviderSource.FDZ,
        defaultTemplateVersion: "1.1",
        fundingPeriodId: fundingPeriod.id,
        fundingStreamId: fundingStream.id
    }
    const testSpec: SpecificationSummary = {
        name: "test spec name",
        id: "3567357",
        approvalStatus: "Cal",
        isSelectedForFunding: true,
        description: "sgdsg",
        providerVersionId: "sgds",
        fundingStreams: [fundingStream],
        fundingPeriod: fundingPeriod,
        dataDefinitionRelationshipIds: [],
        templateIds: {}
    };
    const mockSpecificationHook = () => jest.spyOn(specHook, 'useSpecificationSummary')
        .mockImplementation(() => ({
            specification: testSpec,
            isLoadingSpecification: false,
            errorCheckingForSpecification: null,
            haveErrorCheckingForSpecification: false,
            isFetchingSpecification: false,
            isSpecificationFetched: true
        }));

    const mockFundingConfigurationQueryResult = (config: FundingConfiguration): FundingConfigurationQueryResult => {
        return {
            fundingConfiguration: config,
            isLoadingFundingConfiguration: false,
            errorLoadingFundingConfiguration: "",
            isErrorLoadingFundingConfiguration: false
        };
    }
    const mockFundingConfigurationHook = (result: FundingConfigurationQueryResult) => jest.spyOn(fundingConfigurationHook, 'useFundingConfiguration')
        .mockImplementation(() => result);

    const mockStreamDataset1: DataschemaDetailsViewModel = {id: "1490999", name: "PE and Sport Grant", description: "PE and Sport Grant"};
    const mockStreamDataset2: DataschemaDetailsViewModel = {id: "1221999", name: "PE and Sport Grant e2e", description: "PE and Sport Grant e2e"};
    const mockDatasetApi = () => {
        const service = jest.requireActual("../../../services/datasetService");
        return {
            ...service,
            getDatasetsForFundingStreamService: jest.fn(() => Promise.resolve({
                data: [mockStreamDataset1, mockStreamDataset2],
                status: 200
            }))
        }
    };
    
    const mockPolicyApi = (config: FundingConfiguration) => {
        const service = jest.requireActual('../../../services/policyService');
        return {
            ...service,
            getFundingConfiguration: jest.fn(() => Promise.resolve({
                data: config,
                status: 200
            }))
        }
    };

    function renderCreateDatasetPage() {
        const {CreateDataset} = require('../../../pages/Datasets/CreateDataset');
        return render(<MemoryRouter initialEntries={['/Datasets/CreateDataset/' + testSpec.id]}>
            <QueryClientProvider client={new QueryClient()}>
                <Switch>
                <Route path="/Datasets/CreateDataset/:specificationId" component={CreateDataset}/>
            </Switch>
            </QueryClientProvider>
        </MemoryRouter>)
    }

    return {
        fundingStream,
        fundingPeriod,
        mockStreamDataset1,
        mockStreamDataset2,
        mockDatasetApi,
        mockFundingConfigurationService: mockPolicyApi,
        mockSpecificationHook,
        mockFundingConfigurationHook,
        mockFundingConfigurationQueryResult,
        mockCfsFundingConfiguration,
        mockFdzFundingConfiguration,
        testSpec,
        renderCreateDatasetPage
    }
}

const testing = createDatasetTestSetup();

