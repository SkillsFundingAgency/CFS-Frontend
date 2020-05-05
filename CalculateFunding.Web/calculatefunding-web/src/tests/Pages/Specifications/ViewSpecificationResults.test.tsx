import React from "react";
import {match, MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import {IStoreState} from "../../../reducers/rootReducer";
import {mount} from "enzyme";
import configureStore from 'redux-mock-store';
import {fakeHistory, fakeInitialState, fakeLocation} from "../../fakes/fakes";
import {ViewSpecification, ViewSpecificationRoute} from "../../../pages/Specifications/ViewSpecification";
import {FundingStructureType} from "../../../types/FundingStructureItem";
import {ViewSpecificationResults} from "../../../pages/Specifications/ViewSpecificationResults";

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
    const initialState: IStoreState = fakeInitialState;
    const mockStore = configureStore();
    const store = mockStore(initialState);
    store.dispatch = jest.fn();

    it("renders the page with 3 tabs", async () => {
        const wrapper = mount(<MemoryRouter><Provider store={store} ><ViewSpecificationResults history={fakeHistory} location={fakeLocation} match={match} /></Provider></MemoryRouter>);

        expect(wrapper.find('.govuk-tabs__list').children().length).toBe(3);
    });

    it("dispatches to Redux the correct number of times", () => {
        mount(<MemoryRouter><Provider store={store} ><ViewSpecificationResults history={fakeHistory} location={fakeLocation} match={match} /></Provider></MemoryRouter>);
        expect(store.dispatch).toHaveBeenCalledTimes(6);
    });

    it("has a downloadable reports tab", () => {
        const wrapper = mount(<MemoryRouter><Provider store={store} ><ViewSpecificationResults history={fakeHistory} location={fakeLocation} match={match} /></Provider></MemoryRouter>);

        expect(wrapper.find("#downloadable-reports")).toBeTruthy();
    })


});
