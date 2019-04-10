import {ActionType}   from "../actions/ActionType";
import {initialState} from "../index";


export default (state = initialState.app, action) => {
    switch (action.type) {
        case ActionType.LOGOUT:
            return {
                ...initialState.app
            };
        case ActionType.SOCKET_CONNECTING :
            return {
                ...state,
                status:'connecting'
            };
        case ActionType.SOCKET_CLOSE :
            if( state.status !== 'loaded' ){
                return {
                    ...state,
                    status:'unauthorized'
                };
            }else{
                return state;
            }
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
        case ActionType.UPDATE_USER:
            return {
                ...state,
               users:action.payload
            };
        case ActionType.TOGGLE_USERS:
            return {
                ...state,
                openUsers:action.payload
            };
        case ActionType.LOAD_REQUESTS:
            return {
                ...state,
                loadingMore:true
            };
        case ActionType.LOADED_REQUESTS:
            return {
                ...state,
                loadingMore:false
            };
        default:
            return state
    }
}