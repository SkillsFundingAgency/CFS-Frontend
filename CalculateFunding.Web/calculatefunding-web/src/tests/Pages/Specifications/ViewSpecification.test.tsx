import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {act, cleanup, fireEvent, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {ViewSpecification} from "../../../pages/Specifications/ViewSpecification";
const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
import '@testing-library/jest-dom/extend-expect';
import * as hooks from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";

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
    jobInProgressMessage: "",
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

beforeAll(() => {
    function mockSpecificationService() {
        const specificationService = jest.requireActual('../../../services/specificationService');
        return {
            ...specificationService,
            getSpecificationSummaryService: jest.fn(() => Promise.resolve({
                data: {
                    name: "A Test Spec Name",
                    id: "SPEC123",
                    approvalStatus: "Draft",
                    isSelectedForFunding: true,
                    description: "Test Description",
                    providerVersionId: "PROVID123",
                    fundingStreams: ["PSG"],
                    fundingPeriod: {
                        id: "fp123",
                        name: "fp 123"
                    }
                }
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


afterEach(cleanup);
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

    it('shows Variation Management tab given specification is not chosen for funding', async () => {
        const {queryAllByText} = renderViewSpecificationPage();
        await waitFor(() => expect(queryAllByText('Variation Management')[0]).toHaveClass("govuk-tabs__tab"));
        await waitFor(() => expect(queryAllByText('Variation Management')[0]).toBeVisible());
    });

    it('renders collapsible steps', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('.collapsible-steps')).toHaveLength(1))
    });

    it('shows open-close all buttons correctly', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).toBeVisible());
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).not.toBeVisible());

        act(() => {
            fireEvent.click(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0])
        });

        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).not.toBeVisible());
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).toBeVisible());
    });

    it('shows search box with an autocomplete input in funding line structure tab', async () => {
        const {container} = renderViewSpecificationPage();
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container')).toHaveLength(1))
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container #input-auto-complete')).toHaveLength(1))
    });
});