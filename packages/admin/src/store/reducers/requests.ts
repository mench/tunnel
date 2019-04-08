import {ActionType}   from "../actions/ActionType";
import {initialState} from "../index";


export default (state = initialState.requests, action) => {
    switch (action.type) {
        case ActionType.LOGOUT:
            return initialState.requests;
        case ActionType.REMOVE_TUNNEL:
            return [];
        case ActionType.REQUESTS:
            return [...action.payload];
        case ActionType.CLEAR:
            return action.payload;
        case ActionType.REQUEST:
            return [
                action.payload,
                ...state
            ];
        default:
            return state
    }
}