import {createStore}            from 'redux'
import {applyMiddleware}        from 'redux'
import {combineReducers}        from 'redux'
import {compose}                from 'redux'
import {State}                  from "../types/State";
import app                      from "./reducers/app";
import requests                 from "./reducers/requests";
import {createSocketMiddleware} from "./middlewares/socket";

export const initialState: State = {
    app: {
        status: localStorage.getItem('auth')?'loading' :'unauthorized',
        session: null,
        tunnels: [],
        selected: null,
        loadingRequests: false,
        loadedRequests: false
    },
    requests: []
};

export function configureStore() {

    const reducers = combineReducers({ app, requests });
    const socketMiddleware = createSocketMiddleware();

    const composeEnhancers = (
        (process.env.NODE_ENV !== 'production' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) ?
            window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                name: 'MAMBLE-TUNNEL', actionsBlacklist: ['REDUX_STORAGE_SAVE']
            }) : compose
    );

    return createStore(
        reducers,
        composeEnhancers(
            applyMiddleware(socketMiddleware)
        )
    );
}