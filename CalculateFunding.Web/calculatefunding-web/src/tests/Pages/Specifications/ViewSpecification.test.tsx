import React from "react";
import {match} from "react-router";
import {Provider} from "react-redux";
import {IStoreState} from "../../../reducers/rootReducer";
import {mount} from "enzyme";
import configureStore from 'redux-mock-store';
import {fakeHistory, fakeInitialState, fakeLocation} from "../../fakes/fakes";
import {ViewSpecification, ViewSpecificationRoute} from "../../../pages/Specifications/ViewSpecification";
import {FundingStructureType} from "../../../types/FundingStructureItem";

describe("Provider Funding Overview ", () => {
    const Adapter = require('enzyme-adapter-react-16');
    const enzyme = require('enzyme');
    enzyme.configure({adapter: new Adapter()});
    const specificationId = "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5";
    const match: match<ViewSpecificationRoute> = {
        params: {
            specificationId: specificationId,
        },
        isExact: true,
        path: "",
        url: ""
    };
    const mockViewSpecificationState = {
    additionalCalculations: {
        totalCount: 0,
        results: [{
            id:"1",
            name: "123",
            fundingStreamId: "",
            specificationId: "",
            specificationName: "",
            valueType: "",
            calculationType: "",
            namespace: "",
            wasTemplateCalculation: false,
            description: null,
            status: "",
            lastUpdatedDate: new Date(),
            lastUpdatedDateDisplay: ""
        }],
        totalResults: 0,
        totalErrorResults: 0,
        currentPage: 0,
        lastPage: 0,
        startItemNumber: 0,
        endItemNumber: 0,
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        facets: []
    },
    specification: {
        name: "",
        approvalStatus: "",
        description: "",
        fundingPeriod: {
            id: "",
            name: ""
        },
        fundingStreams: [{
            name: "",
            id: ""
        }],
        id: specificationId,
        isSelectedForFunding: false,
        providerVersionId: ""
    },
    datasets: {
        content: [],
        statusCode: 0
    },
    releaseTimetable: {
        navisionDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        },
        releaseDate: {
            day: "",
            month: "",
            year: "",
            time: ""
        }
    },
    fundingLineStructureResult: [
        {
            level: 1,
            name: "step 1 title",
            type: FundingStructureType.fundingLine,
            calculationId: "",
            calculationPublishStatus: "",
            fundingStructureItems:[
                {
                    level: 2,
                    name: "step 2 title",
                    type: FundingStructureType.calculation,
                    calculationId: "ABC",
                    calculationPublishStatus: "Draft",
                    fundingStructureItems:[]
                }
            ]
        }
    ],
    fundingLineStatusResult: "test fundingLineStatusResult"
    };
    fakeInitialState.viewSpecification = mockViewSpecificationState;
    const initialState: IStoreState = fakeInitialState;
    const mockStore = configureStore();
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    const mockViewSpecificationPage = <Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>;

    it("renders the page with 3 tabs", async () => {
        const wrapper = mount(mockViewSpecificationPage);

        expect(wrapper.find('.govuk-tabs__list').children().length).toBe(4);
    });

    it("dispatches to Redux the correct number of times", () => {
        mount(mockViewSpecificationPage);

        expect(store.dispatch).toHaveBeenCalledTimes(6);
    });

    it("shows approve status in funding line structure tab", () => {
        const wrapper = mount(mockViewSpecificationPage);
        let actual = wrapper.find("ApproveStatusButton");

        expect(actual.length).toBe(1);
        expect(actual.prop("status")).toBe(mockViewSpecificationState.fundingLineStatusResult);
    });

    it("renders collapsible steps", async () => {
        const wrapper = mount(mockViewSpecificationPage);

        expect(wrapper.find('.collapsible-steps').length).toBe(1);
    });

    it("renders correct number of collapsible steps", async () => {
        const wrapper = mount(mockViewSpecificationPage);

        expect(wrapper.find('CollapsibleSteps').length).toBe(2);
    });

    it("renders collapsible steps with calculation linked to edit calculation page", async () => {
        const wrapper = mount(mockViewSpecificationPage);

        expect(wrapper.find('.collapsible-step .collapsible-step-header-description a').length).toBe(1);
        expect(wrapper.find('.collapsible-step .collapsible-step-header-description a').prop("href"))
            .toBe("/calcs/editTemplateCalculation/"
                + mockViewSpecificationState.fundingLineStructureResult[0].fundingStructureItems[0].calculationId);
    });

    it("renders collapsible steps with calculation status", async () => {
        const wrapper = mount(mockViewSpecificationPage);

        expect(wrapper.find('.collapsible-step-header-status').at(1).text())
            .toBe(mockViewSpecificationState.fundingLineStructureResult[0].fundingStructureItems[0].calculationPublishStatus);
    });
});
