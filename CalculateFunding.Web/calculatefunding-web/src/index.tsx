import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {Store, createStore, applyMiddleware} from 'redux';
import {Provider} from 'react-redux';
import AppContainer from './containers/AppContainer';
import {IStoreState, rootReducer} from "./reducers/rootReducer";
import {composeWithDevTools} from "redux-devtools-extension";
import logger from "redux-logger";
import thunk, {ThunkMiddleware} from "redux-thunk";
import {initialiseAxios} from './services/axiosInterceptor';
import * as Mirage from "./mirage";

Mirage.interceptBrowserRequests();

initialiseAxios();

let middleware = [thunk as ThunkMiddleware<IStoreState>];

if (process.env.NODE_ENV === 'development') {
    middleware = [...middleware, logger];
}

const store: Store<IStoreState> = createStore(
    rootReducer,
    composeWithDevTools(applyMiddleware(...middleware))
);

ReactDOM.render(
    <Provider store={store}>
        <AppContainer/>
    </Provider>,
    document.getElementById('main-content') as HTMLElement
);

