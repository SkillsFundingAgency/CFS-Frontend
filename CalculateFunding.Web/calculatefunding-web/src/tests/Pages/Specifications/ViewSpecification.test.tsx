import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/extend-expect';
import * as hooks from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {SpecificationSummary} from "../../../types/SpecificationSummary";

const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    hasFailedJob: false,
    hasActiveJob: false,
    jobError: "",
    latestJob: undefined,
    hasJobError: false,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
    jobDisplayInfo: {
        isActive: false,
        isComplete: false,
        isFailed: false,
        isSuccessful: false,
        jobDescription: "",
        statusDescription: ""
    },
};
jest.spyOn(hooks, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
        releaseTimetableVisible: false
    }))
}));

const renderViewSpecificationPage = () => {
    const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
    return render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
        <Switch>
            <Route path="/ViewSpecification/:specificationId" component={ViewSpecification}/>
        </Switch>
    </MemoryRouter>)
};
const testSpec: SpecificationSummary = {
    name: "A Test Spec Name",
    id: "SPEC123",
    approvalStatus: "Draft",
    isSelectedForFunding: true,
    description: "Test Description",
    providerVersionId: "PROVID123",
    fundingStreams: [{id: "", name: "PSG"}],
    fundingPeriod: {
        id: "fp123",
        name: "fp 123"
    },
    templateIds: {},
    dataDefinitionRelationshipIds: [],
};
beforeAll(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: testSpec
            })),
            getProfileVariationPointersService: jest.fn(() => Promise.resolve({
                data: [{
                    fundingStreamId: "test",
                    fundingLineId: "test",
                    periodType: "test",
                    typeValue: "test",
                    year: 1,
                    occurrence: 1,
                }]
            }))
        }
    }

    function mockFundingLineStructureService() {
        const fundingLineStructureService = jest.requireActual('../../../services/fundingStructuresService');
        return {
            ...fundingLineStructureService,
            getFundingLineStructureService: jest.fn(() => Promise.resolve({
                data: [{
                    level: 1,
                    name: "",
                    calculationId: "",
                    calculationPublishStatus: "",
                    type: undefined,
                    fundingStructureItems: [],
                    parentName: "",
                    expanded: false
                }]
            }))
        }
    }

    function mockDatasetBySpecificationIdService() {
        const datasetBySpecificationIdService = jest.requireActual('../../../services/datasetService');
        return {
            ...datasetBySpecificationIdService,
            getDatasetBySpecificationIdService: jest.fn(() => Promise.resolve({
                data: {
                    statusCode: 1,
                    content: [{
                        definition: {
                            description: "",
                            id: "",
                            name: ""
                        },
                        relationshipDescription: "",
                        isProviderData: false,
                        id: "",
                        name: ""
                    }]
                }
            }))
        }
    }

    jest.mock('../../../services/specificationService', () => mockSpecificationService());
    jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
    jest.mock('../../../services/datasetService', () => mockDatasetBySpecificationIdService());
});


afterEach(() => jest.clearAllMocks());

describe("<ViewSpecification /> service call checks ", () => {
    it("it calls the specificationService", async () => {
        const {getSpecificationSummaryService} = require('../../../services/specificationService');
        renderViewSpecificationPage();
        await waitFor(() => expect(getSpecificationSummaryService).toBeCalled())
    });
});

describe('<ViewSpecification /> page render checks ', () => {
    it('the breadcrumbs are correct', async () => {
        const {queryAllByText} = renderViewSpecificationPage();
        await waitFor(() => expect(queryAllByText('A Test Spec Name')[0]).toHaveClass("govuk-breadcrumbs__list-item"));
    });

    it('the page header is correct', async () => {
        const {queryAllByText} = renderViewSpecificationPage();
        await waitFor(() => expect(queryAllByText('A Test Spec Name')[1]).toHaveClass("govuk-heading-l"));
    });

    it('shows approve status in funding line structure tab', async () => {
        const {queryAllByText} = renderViewSpecificationPage();
        await waitFor(() => expect(queryAllByText('Draft')[0]).toHaveClass("govuk-tag"));
    });

    it('expected number of tabs', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('.govuk-tabs__list-item')).toHaveLength(5))
    });
    
    it('renders the edit specification link correctly', async () => {
        renderViewSpecificationPage();

        const button = await screen.findByRole("link", {name: /Edit specification/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Specifications/EditSpecification/" + testSpec.id);
    });
    
    it('renders the create calculation link correctly', async () => {
        renderViewSpecificationPage();

        const button = await screen.findByRole("link", {name: /Create additional calculation/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Specifications/CreateAdditionalCalculation/" + testSpec.id);
    });
    
    it('renders the create dataset link correctly', async () => {
        renderViewSpecificationPage();
        
        const button = await screen.findByRole("link", {name: /Create dataset/}) as HTMLAnchorElement;
        expect(button).toBeInTheDocument();
        expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/" + testSpec.id);
    });

    it('shows Variation Management tab given specification is not chosen for funding', async () => {
        const {queryAllByText} = renderViewSpecificationPage();
        await waitFor(() => expect(queryAllByText('Variation Management')[0]).toHaveClass("govuk-tabs__tab"));
        await waitFor(() => expect(queryAllByText('Variation Management')[0]).toBeVisible());
    });

    it('renders collapsible steps', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('.collapsible-steps')).toHaveLength(1))
    });



    it('shows search box with an autocomplete input in funding line structure tab', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container')).toHaveLength(1))
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container #input-auto-complete')).toHaveLength(1))
    });
});