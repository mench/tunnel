import {ActionType} from "./ActionType";

export const connect = ()=>({
    type:ActionType.SOCKET_CONNECT
});

export const error = (message:any)=>({
    type:ActionType.SOCKET_ERROR,
    payload:message
});

export const trigger = (message:any)=>({
    type:ActionType.SOCKET_MESSAGE,
    payload:message
});