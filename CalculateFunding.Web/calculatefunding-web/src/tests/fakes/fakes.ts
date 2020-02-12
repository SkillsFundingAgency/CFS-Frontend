import {createBrowserHistory, createLocation, createMemoryHistory} from 'history'
import {createStore, Store} from "redux";
import {IStoreState, rootReducer} from "../../reducers/rootReducer";
import {ProviderFundingOverviewRoute} from "../../pages/ProviderFundingOverview";
require('./jsdom');

export const store: Store<IStoreState> = createStore(
    rootReducer
);

export const history = createBrowserHistory();

export const location = createLocation("", "", "", {search:"", pathname:"", hash:"", key:"", state: ""});
