import React from "react";
import {MemoryRouter, Route, Switch} from "react-router";
import {act, cleanup, fireEvent, render, waitFor} from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect';
import {getDatasetBySpecificationIdService} from "../../../services/datasetService";

const renderFundingLineResults = () => {
    const {FundingLineResults} = require('../../../components/fundingLineStructure/FundingLineResults');
    return render(<MemoryRouter initialEntries={['/FundingLineResults/SPEC123/FS1/FP1/Completed']}>
        <Switch>
            <Route path="/FundingLineResults/:specificationId/:fundingStreamId/:fundingPeriodId/:publishStatus" component={FundingLineResults}/>
        </Switch>
    </MemoryRouter>)
}

beforeAll(() => {
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

    jest.mock('../../../services/fundingStructuresService', () => mockFundingLineStructureService());
})

afterEach(cleanup);

describe("<FundingLineResults service checks />  ", () => {
    it("calls getFundingLineStructureService from the fundingStructuresService", async () => {
        const {getFundingLineStructureService} = require('../../../services/fundingStructuresService');
        renderFundingLineResults();
        await waitFor(() => expect(getFundingLineStructureService).toBeCalled())
    });

});

describe('<FundingLineResults /> page render checks ', () => {
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