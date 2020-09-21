import React from "react";
import {ProviderFundingOverview, ProviderFundingOverviewRoute} from "../../pages/ProviderFundingOverview";
import {createBrowserHistory, createLocation} from "history";
import {match, MemoryRouter} from "react-router";
import {Provider} from "react-redux";
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {mount} from "enzyme";
import * as redux from "react-redux";
import {FeatureFlagsState} from "../../states/FeatureFlagsState";

const useSelectorSpy = jest.spyOn(redux, 'useSelector');

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
            providerVersionId: "XYZ-456",
            fundingStreamId: "A VALID FUNDING STREAM ID",
            fundingPeriodId: "A VALID FUNDING PERIOD ID"
        },
        isExact: true,
        path: "",
        url: ""
    };
    store.dispatch = jest.fn();

    it("renders the page", async () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider></MemoryRouter>);
        expect(wrapper.find('.govuk-caption-xl').first().text()).toBe('Provider name');
    });

    it("dispatches to Redux the correct number of times",()=>{
        mount(<MemoryRouter><Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider></MemoryRouter>);
        expect(store.dispatch).toHaveBeenCalledTimes(8);
    });

    it('has profiling tab in correct order', () => {
        const wrapper = mount(<MemoryRouter><Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider></MemoryRouter>);

        let actual = wrapper.find("Tab");

        expect(actual.length).toBe(2);
        expect(actual.at(1).text()).toBe("Profiling");
    });

    it("displays profiling tab containing profiling patterns given profilingPatternVisible is true in featureFlagsState", async () => {
        const featureFlagsState: FeatureFlagsState = { profilingPatternVisible: true, releaseTimetableVisible: false, templateBuilderVisible: false};
        useSelectorSpy.mockReturnValue(featureFlagsState);

        const wrapper = mount(<MemoryRouter><Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider></MemoryRouter>);
        let actual = wrapper.find("Panel");
        expect(actual.at(1).props().hidden).toBe(true);
        expect(actual.at(2).props().hidden).toBe(false);
    });

    it("hides profiling tab containing profiling patterns given profilingPatternVisible is false in featureFlagsState", async () => {
        const featureFlagsState: FeatureFlagsState = { profilingPatternVisible: false, releaseTimetableVisible: false, templateBuilderVisible: false};
        useSelectorSpy.mockReturnValue(featureFlagsState);

        const wrapper = mount(<MemoryRouter><Provider store={store}><ProviderFundingOverview history={history} location={location} match={match} /></Provider></MemoryRouter>);
        let actual = wrapper.find("Panel");
        expect(actual.at(1).props().hidden).toBe(false);
        expect(actual.at(2).props().hidden).toBe(true);
    });
});