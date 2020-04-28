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
            parentName: "",
            fundingStructureItems:[
                {
                    level: 2,
                    name: "step 2 title",
                    type: FundingStructureType.calculation,
                    calculationId: "ABC",
                    calculationPublishStatus: "Draft",
                    fundingStructureItems:[],
                    parentName: "",
                }
            ]
        }
    ],
    fundingLineStatusResult: "test fundingLineStatusResult",
    profileVariationPointerResult: [
        {
            fundingStreamId: "testFundingStreamId",
            fundingLineId: "testFundingLineId",
            periodType: "testPeriodType",
            typeValue: "testTypeValue",
            year: 2022,
            occurrence: 55,
        }
    ]
    };
    fakeInitialState.viewSpecification = mockViewSpecificationState;
    const initialState: IStoreState = fakeInitialState;
    const mockStore = configureStore();
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    it("renders the page with the expected number of tabs", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('.govuk-tabs__list').children().length).toBe(4);
    });

    it("dispatches to Redux the correct number of times", () => {
        mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(store.dispatch).toHaveBeenCalledTimes(8);
    });

    it("shows approve status in funding line structure tab", () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);
        let actual = wrapper.find("ApproveStatusButton");

        expect(actual.length).toBe(1);
        expect(actual.prop("status")).toBe(mockViewSpecificationState.fundingLineStatusResult);
    });

    it("renders collapsible steps", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('.collapsible-steps').length).toBe(1);
    });

    it("renders correct number of collapsible steps", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('CollapsibleSteps').length).toBe(2);
    });

    it("renders collapsible steps with calculation linked to edit calculation page", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('.collapsible-step .collapsible-step-header-description a').length).toBe(1);
        expect(wrapper.find('.collapsible-step .collapsible-step-header-description a').prop("href"))
            .toBe(`/app/Specifications/EditTemplateCalculation/${mockViewSpecificationState.fundingLineStructureResult[0].fundingStructureItems[0].calculationId}/${mockViewSpecificationState.fundingLineStructureResult[0].fundingStructureItems[0].name}`);
    });

    it("renders collapsible steps with calculation status", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('.collapsible-step-header-status').at(1).text())
            .toBe(mockViewSpecificationState.fundingLineStructureResult[0].fundingStructureItems[0].calculationPublishStatus);
    });

    it("renders back to top link within funding line structure tab", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('#fundingline-structure .app-back-to-top__link').prop("href"))
            .toBe("#fundingline-structure");
    });

    it("renders open all button within funding line structure tab with correct values on initial load", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);
        const openAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);

        expect(openAllButton.prop("hidden")).toBe(false);
        expect(openAllButton.text()).toBe("Open all sections");
    });

    it("renders close all button within funding line structure tab with correct values on initial load", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);
        const closeAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(1);

        expect(closeAllButton.prop("hidden")).toBe(true);
        expect(closeAllButton.text()).toBe("Close all sections");
    });

    it("display close all button within funding line structure tab given open all button is clicked", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);
        const openAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);

        openAllButton.simulate('click');

        const openAllButtonAfterClick = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);
        expect(openAllButtonAfterClick.prop("hidden")).toBe(true);
        const closeAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(1);
        expect(closeAllButton.prop("hidden")).toBe(false);
    });

    it("display open all button within funding line structure tab given close all button is clicked", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        const openAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);
        openAllButton.simulate('click');
        const closeAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(1);
        closeAllButton.simulate('click');

        const closeAllButtonAfterClick = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(1);
        expect(closeAllButtonAfterClick.prop("hidden")).toBe(true);
        const openAllButtonAfterClick = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);
        expect(openAllButtonAfterClick.prop("hidden")).toBe(false);
    });

    it("renders all funding lines closed on initial load", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        expect(wrapper.find('CollapsibleSteps').at(0).prop("expanded")).toBe(false);
        expect(wrapper.find('CollapsibleSteps').at(1).prop("expanded")).toBe(false);
    });

    it("expand all funding lines given open all button is clicked", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);
        const openAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);

        openAllButton.simulate('click');

        expect(wrapper.find('CollapsibleSteps').at(0).prop("expanded")).toBe(true);
        expect(wrapper.find('CollapsibleSteps').at(1).prop("expanded")).toBe(true);
    });

    it("collapse all funding lines given close all button is clicked", async () => {
        const wrapper = mount(<Provider store={store} ><ViewSpecification history={fakeHistory} location={fakeLocation} match={match} /></Provider>);

        const openAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(0);
        openAllButton.simulate('click');
        const closeAllButton = wrapper.find('#fundingline-structure .govuk-accordion__open-all').at(1);
        closeAllButton.simulate('click');

        expect(wrapper.find('CollapsibleSteps').at(0).prop("expanded")).toBe(false);
        expect(wrapper.find('CollapsibleSteps').at(1).prop("expanded")).toBe(false);
    });
});
