import React from "react";
import {match, MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {mount} from "enzyme";
import {ViewSpecificationRoute} from "../../../pages/Specifications/ViewSpecification";
import {ViewSpecificationResults} from "../../../pages/Specifications/ViewSpecificationResults";
import {createStore, Store} from "redux";
import {createBrowserHistory, createLocation} from "history";

describe("Provider Funding Overview ", () => {
    const specificationId = "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5";
    const match: match<ViewSpecificationRoute> = {
        params: {
            specificationId: specificationId,
        },
        isExact: true,
        path: "",
        url: ""
    };

    const store: Store<IStoreState> = createStore(
        rootReducer
    );

    store.dispatch = jest.fn();
    const fakeHistory = createBrowserHistory();

    const fakeLocation = createLocation("", "", "", {search:"", pathname:"", hash:"", key:"", state: ""});

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
