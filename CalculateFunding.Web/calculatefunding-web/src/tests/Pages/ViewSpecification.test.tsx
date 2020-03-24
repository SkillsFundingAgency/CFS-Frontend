import React from "react";
import {match} from "react-router";
import {Provider} from "react-redux";
import {IStoreState} from "../../reducers/rootReducer";
import {mount} from "enzyme";
import {ViewSpecification, ViewSpecificationRoute} from "../../pages/ViewSpecification";
import configureStore from 'redux-mock-store';
import {fakeHistory, fakeInitialState, fakeLocation} from "../fakes/fakes";

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
        results: [{
            id:"1",
            name: "123"
        }],
        currentPage: 0,
        endItemNumber: 0,
        facets: [],
        pagerState: {
            currentPage: 0,
            displayNumberOfPages: 0,
            lastPage: 0,
            nextPage: 0,
            pages: [],
            previousPage: 0
        },
        startItemNumber: 0,
        totalErrorResults: 0,
        totalResults: 0
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
    fundingLineStructureResult: [],
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
});
