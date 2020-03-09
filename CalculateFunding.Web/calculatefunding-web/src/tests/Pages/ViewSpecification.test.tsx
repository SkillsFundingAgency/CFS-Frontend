import React from "react";
import {createBrowserHistory, createLocation} from "history";
import {match} from "react-router";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {mount} from "enzyme";
import {ViewSpecification, ViewSpecificationRoute} from "../../pages/ViewSpecification";

describe("Provider Funding Overview ", () => {
    const Adapter = require('enzyme-adapter-react-16');
    const enzyme = require('enzyme');
    enzyme.configure({adapter: new Adapter()});
    const store: Store<IStoreState> = createStore(
        rootReducer
    );

    const history = createBrowserHistory();
    const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});
    const match: match<ViewSpecificationRoute> = {
        params: {
            specificationId: "056fcfcd-fb12-45ed-8a1b-079a0e2fc8c5",
        },
        isExact: true,
        path: "",
        url: ""
    };
    store.dispatch = jest.fn();

    it("renders the page with 3 tabs", async () => {
        const wrapper = mount(<Provider store={store}><ViewSpecification history={history} location={location} match={match}/></Provider>);

        expect(wrapper.find('.govuk-tabs__list').children().length).toBe(4);
    });

    it("dispatches to Redux the correct number of times", () => {
        mount(<Provider store={store}><ViewSpecification history={history} location={location} match={match}/></Provider>);

        expect(store.dispatch).toHaveBeenCalledTimes(10);
    });
});