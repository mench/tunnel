import {ActionType} from "./ActionType";

export const open = () => ({
    type: ActionType.SOCKET_OPEN
});

export const connect = ({ username, password }) => ({
    type: ActionType.SOCKET_CONNECT,
    payload: { username, password }
});

export const connecting = () => ({
    type: ActionType.SOCKET_CONNECTING
});


export const close = () => ({
    type: ActionType.SOCKET_CLOSE
});

export const error = (message: any) => ({
    type: ActionType.SOCKET_ERROR,
    payload: message
});

export const trigger = (message: any) => ({
    type: ActionType.SOCKET_MESSAGE,
    payload: message
});