import {ActionType}   from "../actions/ActionType";
import {initialState} from "../index";


export default (state = initialState.requests, action) => {
    switch (action.type) {
        case ActionType.REMOVE_TUNNEL:
        case ActionType.LOGOUT:
            return initialState.requests;
        case ActionType.REQUESTS:
            return {
                ...state,
                ...action.payload
            };
        case ActionType.LOADED_REQUESTS:
            return {
                ...state,
                data:[
                    ...state.data,
                    ...action.payload.data,
                ],
                page: action.payload.page,
                total:action.payload.total
            };
        case ActionType.CLEAR:
            return action.payload;
        case ActionType.REQUEST:
            return {
                ...state,
                data:[
                    action.payload,
                    ...state.data
                ]
            };
        default:
            return state
    }
}