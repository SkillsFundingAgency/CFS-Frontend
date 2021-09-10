import * as React from "react";
import * as ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { Store,applyMiddleware,createStore } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import logger from "redux-logger";
import thunk, { ThunkMiddleware } from "redux-thunk";

import AppContainer from "./containers/AppContainer";
import * as Mirage from "./mirage";
import { IStoreState, rootReducer } from "./reducers/rootReducer";
import { initialiseAxios } from "./services/axiosInterceptor";

Mirage.interceptBrowserRequests();

initialiseAxios();

let middleware = [thunk as ThunkMiddleware<IStoreState>];

if (process.env.NODE_ENV === "development") {
  middleware = [...middleware, logger];
}

const store: Store<IStoreState> = createStore(
  rootReducer,
  composeWithDevTools(applyMiddleware(...middleware))
);

ReactDOM.render(
  <Provider store={store}>
    <AppContainer />
  </Provider>,
  document.getElementById("main-content") as HTMLElement
);
