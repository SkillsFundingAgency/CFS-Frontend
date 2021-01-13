import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {act, fireEvent, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {PublishStatus} from "../../../types/PublishStatusModel";
import {FundingStructureItemViewModel, FundingStructureType} from "../../../types/FundingStructureItem";
import {QueryClient, QueryClientProvider} from "react-query";

jest.mock('../../../services/calculationService', () => ({
    getCalculationSummaryBySpecificationId: jest.fn(() => Promise.resolve({
        data: {},
        status: 200
    }))
}));

const renderViewSpecificationFundingLineResults = () => {
    const {FundingLineResults} = require('../../../components/FundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
                <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus">
                    <FundingLineResults
                        status={PublishStatus.Approved}
                        fundingPeriodId={"test fundingPeriodId"}
                        fundingStreamId={"test fundingStreamId"}
                        specificationId={"test spec id"}
                        addError={jest.fn()}
                        clearErrorMessages={jest.fn()} 
                        showApproveButton={true}
                        />
                </Route>
            </Switch>
        </QueryClientProvider>
    </MemoryRouter>)
}

const renderProviderFundingLineResults = () => {
    const {FundingLineResults} = require('../../../components/FundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <QueryClientProvider client={new QueryClient()}>
            <Switch>
                <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus">
                    <FundingLineResults
                        status={undefined}
                        fundingPeriodId={"test fundingPeriodId"}
                        fundingStreamId={"test fundingStreamId"}
                        specificationId={"test spec id"}
                        providerId={"test provider id"}
                        addError={jest.fn()}
                        clearErrorMessages={jest.fn()} />
                </Route>
            </Switch>
        </QueryClientProvider>
    </MemoryRouter>)
}

describe("<FundingLineResults/> tests", () => {
    beforeAll(() => {
        jest.mock('../../../services/providerService', () => mockProviderService());
    });

    describe("<FundingLineResults service checks />  ", () => {
        beforeEach(() => {
            jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
            jest.mock('../../../services/publishedProviderFundingLineService', () => mockCurrentPublishedProviderFundingStructureService());
        });

        afterEach(() => jest.clearAllMocks());

        it("calls getFundingLineStructureService from the fundingStructuresService", async () => {
            const {getFundingLineStructureService} = require('../../../services/fundingStructuresService');

            renderViewSpecificationFundingLineResults();

            await waitFor(() => expect(getFundingLineStructureService).toBeCalledTimes(1));
        });
    });

    describe('<FundingLineResults /> page render checks ', () => {
        beforeEach(() => {
            jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
            jest.mock('../../../services/publishedProviderFundingLineService', () => mockCurrentPublishedProviderFundingStructureService());
        });

        afterEach(() => jest.clearAllMocks());

        it('shows approve status in funding line structure tab', async () => {
            const {queryAllByText} = renderViewSpecificationFundingLineResults();
            await waitFor(() => expect(queryAllByText('Draft')[0]).toHaveClass("govuk-tag"));
        });

        it('renders collapsible steps', async () => {
            const {container} = renderViewSpecificationFundingLineResults();
            await waitFor(() => expect(container.querySelectorAll('.collapsible-steps')).toHaveLength(1))
        });

        it('shows search box with an autocomplete input in funding line structure tab', async () => {
            const {container} = renderViewSpecificationFundingLineResults();
            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container')).toHaveLength(1))
            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container #input-auto-complete')).toHaveLength(1))
        });

        it('shows open-close all buttons correctly', async () => {
            const {container} = renderViewSpecificationFundingLineResults();
            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).toBeVisible());
            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).not.toBeVisible());

            act(() => {
                fireEvent.click(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0])
            });

            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).not.toBeVisible());
            await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).toBeVisible());
        });
    });
});


const mockFundingLineStructureService = () => {
    const fundingLineStructureService = jest.requireActual('../../../services/fundingStructuresService');
    const mockedFundingStructureItems: FundingStructureItemViewModel[] = [{
        level: 1,
        name: "",
        calculationId: "",
        fundingLineCode: "XXX-1",
        value: "",
        calculationType: "",
        templateId: 1,
        calculationPublishStatus: PublishStatus.Draft,
        type: FundingStructureType.Calculation,
        fundingStructureItems: [],
        expanded: false
    }];
    return {
        ...fundingLineStructureService,
        getFundingLineStructureService: jest.fn(() => Promise.resolve({
            data: mockedFundingStructureItems
        }))
    }
}

const mockCurrentPublishedProviderFundingStructureService = () => {
    const publishedProviderFundingLineService = jest.requireActual('../../../services/publishedProviderFundingLineService');
    return {
        ...publishedProviderFundingLineService,
        getCurrentPublishedProviderFundingStructureService: jest.fn(() => Promise.resolve({
            data: {
                items: [{
                    level: 1,
                    name: "",
                    calculationId: "",
                    type: FundingStructureType.Calculation,
                    value: "",
                    calculationType: "",
                    fundingStructureItems: null
                }],
                PublishedProviderVersion: 0
            }
        }))
    }
}

const mockProviderService = () => {
    const providerService = jest.requireActual('../../../services/providerService');
    return {
        ...providerService,
        getProviderFundingLineErrors: jest.fn(() => Promise.resolve({
            data: []
        })),
        getFundingStructureResultsForProviderAndSpecification: jest.fn(() => Promise.resolve({
            data: {},
            status: 200
        }))
    }
};
