import React from 'react';
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../../reducers/rootReducer";
import {Provider} from 'react-redux';
import {mount} from "enzyme";
import {createBrowserHistory, createLocation} from "history";
import {match} from "react-router";
import {
    CalculationVersionHistory,
    CalculationVersionHistoryRoute
} from "../../../pages/Calculations/CalculationVersionHistory";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const store: Store<IStoreState> = createStore(
    rootReducer
);

const history = createBrowserHistory();
const location = createLocation("", "", "", {search: "", pathname: "", hash: "", key: "", state: ""});
const calculationVersionHistoryRoutePropsMatch: match<CalculationVersionHistoryRoute> = {
    params: {
        calculationId: "24b4ebbd-9aa5-43c1-91b2-76f83e070b49",
    },
    isExact: true,
    path: "",
    url: ""
};

store.dispatch = jest.fn();

describe("<CalculationVersionHistory />", () => {
    it('will have the correct breadcrumbs', () => {

        const wrapper = mount(<Provider store={store}><CalculationVersionHistory match={calculationVersionHistoryRoutePropsMatch} history={history} location={location} />></Provider>);
        expect(wrapper.find(".govuk-breadcrumbs__list").children().length).toBe(5);
    });
});

describe("<CalculationVersionHistory />", () => {
    it('will have a disabled compare button', () => {

        const wrapper = mount(<Provider store={store}><CalculationVersionHistory match={calculationVersionHistoryRoutePropsMatch} history={history} location={location} />></Provider>);
        expect(wrapper.find("#compare-button").prop('disabled')).toBeTruthy();
    });
});
