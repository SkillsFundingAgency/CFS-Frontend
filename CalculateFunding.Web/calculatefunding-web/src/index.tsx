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
import {Server, createServer, Response } from "miragejs"

// @ts-ignore
if (window.Cypress) {
    // If your app makes requests to domains other than / (the current domain), add them
    // here so that they are also proxied from your app to the handleFromCypress function.
    // For example: let otherDomains = ["https://my-backend.herokuapp.com/"]
    // let otherDomains = []
    let methods = ["get", "put", "patch", "post", "delete"]

    createServer({
        environment: "test",
        routes() {
            for (const domain of ["/api/"]) {
                for (const method of methods) {
                    // @ts-ignore
                    this[method](`${domain}*`, async (schema, request) => {
                        // @ts-ignore
                        let [status, headers, body] = await window.handleFromCypress(
                            request
                        )
                        return new Response(status, headers, body)
                    })
                }
            }

            // If your central server has any calls to passthrough(), you'll need to duplicate them here
            // this.passthrough('https://analytics.google.com')
        },
    })
}
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
