import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {act, fireEvent, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {FundingLineResults} from "../../../components/fundingLineStructure/FundingLineResults";
import {PublishStatus} from "../../../types/PublishStatusModel";
import {
    getFundingLineStructureByProviderService,
    getFundingLineStructureService
} from "../../../services/fundingStructuresService";
import {FundingStructureType, IFundingStructureItem} from "../../../types/FundingStructureItem";
import {getPublishedProviderFundingStructureService} from "../../../services/publishedProviderFundingLineService";

const renderFundingLineResults = () => {
    const {FundingLineResults} = require('../../../components/fundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <Switch>
            <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus"  >
                <FundingLineResults
                    approvalStatus={PublishStatus.Approved}
                    fundingPeriodId={"test fundingPeriodId"}
                    fundingStreamId={"test fundingStreamId"}
                    specificationId={"test spec id"} />
            </Route>
        </Switch>
    </MemoryRouter>)
}

const renderFundingLineResultsWithProviderId = () => {
    const {FundingLineResults} = require('../../../components/fundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <Switch>
            <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus"  >
                <FundingLineResults
                    approvalStatus={PublishStatus.Approved}
                    fundingPeriodId={"test fundingPeriodId"}
                    fundingStreamId={"test fundingStreamId"}
                    specificationId={"test spec id"}
                    providerId = {"test provider id"} />
            </Route>
        </Switch>
    </MemoryRouter>)
}

const renderFundingLineResultsWithProviderVersionId = () => {
    const {FundingLineResults} = require('../../../components/fundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <Switch>
            <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus"  >
                <FundingLineResults
                    approvalStatus={PublishStatus.Approved}
                    fundingPeriodId={"test fundingPeriodId"}
                    fundingStreamId={"test fundingStreamId"}
                    specificationId={"test spec id"}
                    providerVersionId = {"test provider version id"} />
            </Route>
        </Switch>
    </MemoryRouter>)
}


const mockFundingLineStructureService = () => {
        const fundingLineStructureService = jest.requireActual('../../../services/fundingStructuresService');
        const mockedFundingStructureItems: IFundingStructureItem[] = [{
            level: 1,
            name: "",
            calculationId: "",
            calculationPublishStatus: "",
            type: FundingStructureType.Calculation,
            fundingStructureItems: [],
            parentName: "",
            expanded: false
        }];
        return {
            ...fundingLineStructureService,
            getFundingLineStructureService: jest.fn(() => Promise.resolve({
                data: mockedFundingStructureItems
            })),
            getFundingLineStructureByProviderService: jest.fn(() => Promise.resolve({
                data: mockedFundingStructureItems
            }))
        }
    }

const mockPublishedProviderFundingLineService = () => {
    const publishedProviderFundingLineService = jest.requireActual('../../../services/publishedProviderFundingLineService');
    return {
        ...publishedProviderFundingLineService,
        getPublishedProviderFundingStructureService: jest.fn(() => Promise.resolve({
            data: {
                items: [{
                    level : 1,
                    name : "",
                    calculationId : "",
                    type : FundingStructureType.Calculation,
                    value: "",
                    calculationType: "",
                    fundingStructureItems: null
                }],
                PublishedProviderVersion: 0
            }
        }))
    }
}


//afterEach(cleanup);

describe("<FundingLineResults service checks />  ", () => {
    beforeEach(() => {
        jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
        jest.mock('../../../services/publishedProviderFundingLineService', () => mockPublishedProviderFundingLineService());
    });

    afterEach(() => jest.clearAllMocks());

    it("calls getFundingLineStructureService from the fundingStructuresService", async () => {
        const {getFundingLineStructureService} = require('../../../services/fundingStructuresService');
        const {getFundingLineStructureByProviderService} = require('../../../services/fundingStructuresService');
        const {getPublishedProviderFundingStructureService} = require('../../../services/publishedProviderFundingLineService');

        renderFundingLineResults();

        await waitFor(() => expect(getFundingLineStructureService).toBeCalledTimes(1))
        await waitFor(() => expect(getFundingLineStructureByProviderService).toBeCalledTimes(0))
        await waitFor(() => expect(getPublishedProviderFundingStructureService).toBeCalledTimes(0))
    });

    it("calls getFundingLineStructureByProviderService from the fundingStructuresService", async () => {
        const {getFundingLineStructureService} = require('../../../services/fundingStructuresService');
        const {getFundingLineStructureByProviderService} = require('../../../services/fundingStructuresService');
        const {getPublishedProviderFundingStructureService} = require('../../../services/publishedProviderFundingLineService');

        renderFundingLineResultsWithProviderId();

        await waitFor(() => expect(getFundingLineStructureService).toBeCalledTimes(0))
        await waitFor(() => expect(getFundingLineStructureByProviderService).toBeCalledTimes(1))
        await waitFor(() => expect(getPublishedProviderFundingStructureService).toBeCalledTimes(0))
    });

    it("calls getPublishedProviderFundingStructureService from the fundingStructuresService", async () => {
        const {getFundingLineStructureService} = require('../../../services/fundingStructuresService');
        const {getFundingLineStructureByProviderService} = require('../../../services/fundingStructuresService');
        const {getPublishedProviderFundingStructureService} = require('../../../services/publishedProviderFundingLineService');

        renderFundingLineResultsWithProviderVersionId();

        await waitFor(() => expect(getFundingLineStructureService).toBeCalledTimes(0))
        await waitFor(() => expect(getFundingLineStructureByProviderService).toBeCalledTimes(0))
        await waitFor(() => expect(getPublishedProviderFundingStructureService).toBeCalledTimes(1))
    });
});

describe('<FundingLineResults /> page render checks ', () => {
    beforeEach(() => {
        jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
        jest.mock('../../../services/publishedProviderFundingLineService', () => mockPublishedProviderFundingLineService());
    });

    afterEach(() => jest.clearAllMocks());

    it('shows approve status in funding line structure tab', async () => {
        const {queryAllByText} = renderFundingLineResults();
        await waitFor(() => expect(queryAllByText('Draft')[0]).toHaveClass("govuk-tag"));
    });

    it('renders collapsible steps', async () => {
        const {container} = renderFundingLineResults();
        await waitFor(() => expect(container.querySelectorAll('.collapsible-steps')).toHaveLength(1))
    });

    it('shows search box with an autocomplete input in funding line structure tab', async () => {
        const {container} = renderFundingLineResults();
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container')).toHaveLength(1))
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .search-container #input-auto-complete')).toHaveLength(1))
    });

    it('shows open-close all buttons correctly', async () => {
        const {container} = renderFundingLineResults();
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).toBeVisible());
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).not.toBeVisible());

        act(() => {
            fireEvent.click(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0])
        });

        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[0]).not.toBeVisible());
        await waitFor(() => expect(container.querySelectorAll('#fundingline-structure .govuk-accordion__open-all')[1]).toBeVisible());
    });
});
