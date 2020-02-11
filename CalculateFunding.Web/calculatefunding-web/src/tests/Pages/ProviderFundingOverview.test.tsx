import React from "react";
import {ProviderFundingOverview, ProviderFundingOverviewRoute} from "../../pages/ProviderFundingOverview";
import {createBrowserHistory, createLocation} from "history";
import {match} from "react-router";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {mount} from "enzyme";

describe("Provider Funding Overview ", () => {
    const Adapter = require('enzyme-adapter-react-16');
    const enzyme = require('enzyme');
    enzyme.configure({adapter: new Adapter()});
    const store: Store<IStoreState> = createStore(
        rootReducer
    );

    const history = createBrowserHistory();
    const location = createLocation("", "", "", {search:"", pathname:"", hash:"", key:"", state: ""});
    const match :match<ProviderFundingOverviewRoute>= {
        params: {
            providerId: "ABC123",
            specificationId: "ABC-123",
            providerVersionId: "XYZ-456"
        },
        isExact: true,
        path: "",
        url: ""
    };
    store.dispatch = jest.fn();

    it("renders the page", async () => {

        const wrapper = mount(<Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider>);
        expect(wrapper.find('.govuk-caption-xl').first().text()).toBe('Provider name');
    });

    it("dispatches to Redux the correct number of times",()=>{

        mount(<Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider>);

        expect(store.dispatch).toHaveBeenCalledTimes(6);
    });
});