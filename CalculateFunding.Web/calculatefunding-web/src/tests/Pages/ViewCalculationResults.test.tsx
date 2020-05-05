import React from 'react';
import {
    ViewCalculationResults,
    ViewCalculationResultsProps,
    ViewCalculationResultsRoute
} from "../../pages/ViewCalculationResults";
import {createLocation, createMemoryHistory} from "history";
import {match, MemoryRouter, RouteComponentProps, StaticContext} from "react-router";
import {applyMiddleware, createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import { Provider } from 'react-redux';
import {configure, mount} from "enzyme";
import createMockStore from "redux-mock-store";

const Adapter = require('enzyme-adapter-react-16');
const enzyme = require('enzyme');
enzyme.configure({adapter: new Adapter()});
const {shallow} = enzyme;
const store: Store<IStoreState> = createStore(
    rootReducer
);

const history = createMemoryHistory();
const location = createLocation("","","");
const matchMock : match<ViewCalculationResultsRoute> = {
    url: "",
    path:"",
    isExact: true,
    params: {
        calculationId: "ABC123"
    }
};

store.dispatch = jest.fn();

describe("<ViewCalculationResults />", () => {
    it('will call dispatch 2 times', () => {

        mount(<MemoryRouter><Provider store={store}><ViewCalculationResults history={history} location={location} match={matchMock}/>></Provider></MemoryRouter>);

        expect(store.dispatch).toHaveBeenCalledTimes(2);
    });
});