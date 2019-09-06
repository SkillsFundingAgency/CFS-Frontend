import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Store, createStore, applyMiddleware } from 'redux';
import { logger } from 'redux-logger';
import { Provider } from 'react-redux';
import AppContainer from './containers/AppContainer';
import {IStoreState, rootReducer} from "./reducers/rootReducer";

const store: Store<IStoreState> = createStore(
    rootReducer,
    applyMiddleware( logger )
);

ReactDOM.render(
    <Provider store={store}>
        <AppContainer  />
    </Provider>,
    document.getElementById('root') as HTMLElement
);
