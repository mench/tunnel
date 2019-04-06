import {ActionType}   from "../actions/ActionType";
import {initialState} from "../index";


export default (state = initialState.app, action) => {
    switch (action.type) {
        case ActionType.INIT :
            return {
                ...state,
                status:'loading'
            };
        case ActionType.WELCOME :
            return {
                ...state,
                ...action.payload,
                status:'loaded'
            };
        case ActionType.CREATE_TUNNEL:
            return {
                ...state,
                tunnels:[
                    ...state.tunnels,
                    action.payload
                ]
            };
        case ActionType.REMOVE_TUNNEL:
            return {
                ...state,
                tunnels:[
                    ...state.tunnels.filter(tun=>tun.id !== action.payload.id)
                ]
            };
        case ActionType.SELECT:
            return {
                ...state,
                selected:action.payload,
                loadedRequests:false,
                loadingRequests:true
            };
        case ActionType.REQUESTS:
            return {
                ...state,
                loadedRequests:true,
                loadingRequests:false
            };
        default:
            return state
    }
}