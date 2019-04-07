import {createSelector} from "reselect";
import {State}          from "../../types/State";

export const getState = (state: State) => state;
export const isConnecting = createSelector(
    getState,
    state=>state.app.status == 'connecting'
);

export const getSelectedTunnel = createSelector(
    getState,
    (state) => {
        return state.app.tunnels.find(t => t.id === state.app.selected);
    }
);

export const getSelectedRequests = createSelector(
    getState,
    (state) => {
        return state.requests.filter(r => r.tunnel.id === state.app.selected).sort(a=>-1* new Date(a.createdAt).getTime());
    }
);