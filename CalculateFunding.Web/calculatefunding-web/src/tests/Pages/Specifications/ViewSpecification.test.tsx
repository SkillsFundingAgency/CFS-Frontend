import {MemoryRouter, Route, Switch} from "react-router";
import React from "react";
import {render, screen, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import '@testing-library/jest-dom/extend-expect';
import * as hooks from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {LatestSpecificationJobWithMonitoringResult} from "../../../hooks/Jobs/useLatestSpecificationJobWithMonitoring";
import {SpecificationSummary} from "../../../types/SpecificationSummary";
import userEvent from "@testing-library/user-event";
import * as specPermsHook from "../../../hooks/useSpecificationPermissions";
import {SpecificationPermissionsResult} from "../../../hooks/useSpecificationPermissions";
import {QueryClient, QueryClientProvider} from "react-query";
import {PublishStatus} from "../../../types/PublishStatusModel";

const noJob: LatestSpecificationJobWithMonitoringResult = {
    hasJob: false,
    isCheckingForJob: false,
    latestJob: undefined,
    isFetched: true,
    isFetching: false,
    isMonitoring: true,
};
jest.spyOn(hooks, 'useLatestSpecificationJobWithMonitoring').mockImplementation(() => (noJob));

jest.mock("react-redux", () => ({
    ...jest.requireActual("react-redux"),
    useSelector: jest.fn(() => ({
        releaseTimetableVisible: false
    }))
}));

const renderViewSpecificationPage = async () => {
    const {ViewSpecification} = require('../../../pages/Specifications/ViewSpecification');
    const component = render(<MemoryRouter initialEntries={['/ViewSpecification/SPEC123']}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
            <Route path="/ViewSpecification/:specificationId" component={ViewSpecification} />
        </Switch>
        </QueryClientProvider>
    </MemoryRouter>);
    await waitFor(() => {
        expect(screen.getByText(/View funding/i)).toBeInTheDocument();
    });
    return component;
};
const testSpec: SpecificationSummary = {
    name: "A Test Spec Name",
    id: "SPEC123",
    approvalStatus: PublishStatus.Draft,
    isSelectedForFunding: true,
    description: "Test Description",
    providerVersionId: "PROVID123",
    fundingStreams: [{id: "fundingStreamId", name: "PSG"}],
    fundingPeriod: {
        id: "fp123",
        name: "fp 123"
    },
    templateIds: {},
    dataDefinitionRelationshipIds: [],
};

describe('<ViewSpecification /> ', () => {

    beforeAll(() => {
        mockSpecificationPermissions();
        jest.mock('../../../services/specificationService', () => mockSpecificationService());
        jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
        jest.mock('../../../services/datasetService', () => mockDatasetBySpecificationIdService());
        jest.mock('../../../services/calculationService', () => mockCalculationService());
    });

    afterEach(() => jest.clearAllMocks());

    describe("Service call checks ", () => {
        it("it calls the specificationService", async () => {
            const {getSpecificationSummaryService} = require('../../../services/specificationService');
            await renderViewSpecificationPage();
            await waitFor(() => expect(getSpecificationSummaryService).toBeCalledTimes(1));
        });
    });

    describe('page render checks ', () => {
        it('the breadcrumbs are correct', async () => {
            const {queryAllByText} = await renderViewSpecificationPage();
            await waitFor(() => expect(queryAllByText('A Test Spec Name')[0]).toHaveClass("govuk-breadcrumbs__list-item"));
        });

        it('the page header is correct', async () => {
            const {queryAllByText} = await renderViewSpecificationPage();
            await waitFor(() => expect(queryAllByText('A Test Spec Name')[1]).toHaveClass("govuk-heading-xl"));
        });

        it('shows approve status in funding line structure tab', async () => {
            const {queryAllByText} = await renderViewSpecificationPage();
            await waitFor(() => expect(queryAllByText('Draft')[0]).toHaveClass("govuk-tag"));
        });

        it('expected number of tabs', async () => {
            const {container} = await renderViewSpecificationPage();
            await waitFor(() => expect(container.querySelectorAll('.govuk-tabs__list-item')).toHaveLength(5))
        });

        it('renders the edit specification link correctly', async () => {
            await renderViewSpecificationPage();

            const button = await screen.findByRole("link", {name: /Edit specification/}) as HTMLAnchorElement;
            expect(button).toBeInTheDocument();
            expect(button.getAttribute("href")).toBe("/Specifications/EditSpecification/" + testSpec.id);
        });

        it('renders the create calculation link correctly', async () => {
            await renderViewSpecificationPage();

            const button = await screen.findByRole("link", {name: /Create additional calculation/}) as HTMLAnchorElement;
            expect(button).toBeInTheDocument();
            expect(button.getAttribute("href")).toBe("/Specifications/CreateAdditionalCalculation/" + testSpec.id);
        });

        it('renders the create dataset link correctly', async () => {
            await renderViewSpecificationPage();

            const button = await screen.findByRole("link", {name: /Create dataset/}) as HTMLAnchorElement;
            expect(button).toBeInTheDocument();
            expect(button.getAttribute("href")).toBe("/Datasets/CreateDataset/" + testSpec.id);
        });

        it('shows Variation Management tab given specification is not chosen for funding', async () => {
            const {queryAllByText} = await renderViewSpecificationPage();
            await waitFor(() => {
                expect(queryAllByText('Variation Management')[0]).toHaveClass("govuk-tabs__tab");
                expect(queryAllByText('Variation Management')[0]).toBeVisible();
            });
        });

        it('renders collapsible steps', async () => {
            const {container} = await renderViewSpecificationPage();
            await waitFor(() => expect(container.querySelectorAll('.collapsible-steps')).toHaveLength(1));
        });

        it('shows search box with an autocomplete input in funding line structure tab', async () => {
            const {container} = await renderViewSpecificationPage();
            await waitFor(() => {
                expect(container.querySelectorAll('#fundingline-structure .search-container')).toHaveLength(1);
                expect(container.querySelectorAll('#fundingline-structure .search-container #input-auto-complete')).toHaveLength(1);
            });
        });
    });

    describe("with ApproveAllCalculations permission ", () => {
        it("it calls correct services given approve all calculations button is clicked", async () => {
            const {getCalculationSummaryBySpecificationId} = require("../../../services/calculationService");

            const {queryAllByText} = await renderViewSpecificationPage();
            const approveAllCalcsButton = queryAllByText('Approve all calculations')[0] as HTMLButtonElement;
            userEvent.click(approveAllCalcsButton);

            await waitFor(() => expect(getCalculationSummaryBySpecificationId).toBeCalled());
        });
    });

    describe("without ApproveAllCalculations permission ", () => {
        beforeEach(() => {
            const permission: SpecificationPermissionsResult = {
                canApproveFunding: true,
                canCreateSpecification: true,
                canEditCalculation: true,
                canEditSpecification: true,
                canMapDatasets: true,
                canRefreshFunding: true,
                canReleaseFunding: true,
                canApproveCalculation: true,
                canApproveAllCalculations: false,
                canChooseFunding: true,
                hasMissingPermissions: true,
                isCheckingForPermissions: true,
                isPermissionsFetched: true,
                missingPermissions: [],
                canCreateAdditionalCalculation: true
            }
            mockSpecificationPermissions(permission);
        });

        it("shows permission message when approve all calculations button is clicked", async () => {
            const {queryAllByText} = await renderViewSpecificationPage();
            const approveAllCalcsButton = queryAllByText('Approve all calculations')[0] as HTMLButtonElement;
            userEvent.click(approveAllCalcsButton);

            await waitFor(() => expect(screen.getByText("You don't have permission to approve calculations")).toBeInTheDocument());
        });
    });

});

const specWithAllPermissions: SpecificationPermissionsResult = {
    canApproveFunding: true,
    canCreateSpecification: true,
    canEditCalculation: true,
    canEditSpecification: true,
    canMapDatasets: true,
    canRefreshFunding: true,
    canReleaseFunding: true,
    canApproveCalculation: true,
    canApproveAllCalculations: true,
    canChooseFunding: true,
    hasMissingPermissions: true,
    isCheckingForPermissions: true,
    isPermissionsFetched: true,
    missingPermissions: [],
    canCreateAdditionalCalculation: true
}

function mockSpecificationPermissions(expectedSpecificationPermissionsResult?: SpecificationPermissionsResult) {
    jest.spyOn(specPermsHook, 'useSpecificationPermissions')
        .mockImplementation(() => (expectedSpecificationPermissionsResult ? expectedSpecificationPermissionsResult : specWithAllPermissions));
}

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

function mockCalculationService() {
    const calculationService = jest.requireActual('../../../services/calculationService');
    return {
        ...calculationService,
        getCalculationSummaryBySpecificationId: jest.fn(() => Promise.resolve({
            data: []
        })),
        getCalculationCircularDependencies: jest.fn(() => Promise.resolve({
            data: []
        }))
    }
}